import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma" // ✅ Use singleton
import { getWeekStart } from "@/lib/queries/user"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    const weekStart = getWeekStart(new Date())

    // Use new unique constraint for instant lookup
    let weeklyActivity = await prisma.weeklyActivity.findUnique({
      where: {
        userId_weekStart: {
          userId: user.id,
          weekStart: weekStart,
        },
      },
    })

    if (!weeklyActivity) {
      weeklyActivity = await prisma.weeklyActivity.create({
        data: {
          userId: user.id,
          weekStart,
          moviesWatched: 0,
          songsListened: 0,
          bonusClaimed: false,
        },
      })
    }

    return NextResponse.json(
      {
        weeklyProgress: {
          moviesWatched: weeklyActivity.moviesWatched,
          songsListened: weeklyActivity.songsListened,
          bonusClaimed: weeklyActivity.bonusClaimed,
          weekStart: weekStart.toISOString(),
        },
      },
      {
        headers: {
          // Cache weekly progress for 30 seconds
          "Cache-Control": "private, max-age=30",
        },
      },
    )
  } catch (error) {
    console.error("GET weekly-activity error:", error)
    return NextResponse.json(
      { error: "Failed to get weekly progress" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.email)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 })

    const body = await req.json()
    const { action, mediaType } = body

    if (!action || !mediaType)
      return NextResponse.json(
        { error: "Missing action or mediaType" },
        { status: 400 },
      )

    if (!["watch", "listen", "favorite"].includes(action))
      return NextResponse.json(
        { error: "Invalid action type" },
        { status: 400 },
      )

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, points: true },
    })

    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 })

    let pointsToAdd = 0
    if (action === "watch" || action === "listen") pointsToAdd = 10
    else if (action === "favorite") pointsToAdd = 5

    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: pointsToAdd } },
    })

    await prisma.pointHistory.create({
      data: {
        userId: user.id,
        points: pointsToAdd,
        reason: `${action}_${mediaType}`,
      },
    })

    let weeklyBonus = null
    if (
      (action === "watch" || action === "listen") &&
      (mediaType === "movie" || mediaType === "song")
    ) {
      const weekStart = getWeekStart(new Date())

      const weeklyActivity = await prisma.weeklyActivity.upsert({
        where: {
          userId_weekStart: {
            userId: user.id,
            weekStart: weekStart,
          },
        },
        create: {
          userId: user.id,
          weekStart,
          moviesWatched: action === "watch" && mediaType === "movie" ? 1 : 0,
          songsListened: action === "listen" && mediaType === "song" ? 1 : 0,
          bonusClaimed: false,
        },
        update: {
          moviesWatched:
            action === "watch" && mediaType === "movie"
              ? { increment: 1 }
              : undefined,
          songsListened:
            action === "listen" && mediaType === "song"
              ? { increment: 1 }
              : undefined,
        },
      })

      if (
        !weeklyActivity.bonusClaimed &&
        weeklyActivity.moviesWatched >= 3 &&
        weeklyActivity.songsListened >= 3
      ) {
        const bonusPoints = 50

        await prisma.user.update({
          where: { id: user.id },
          data: { points: { increment: bonusPoints } },
        })

        await prisma.weeklyActivity.update({
          where: { id: weeklyActivity.id },
          data: { bonusClaimed: true },
        })

        await prisma.pointHistory.create({
          data: {
            userId: user.id,
            points: bonusPoints,
            reason: "weekly_activity_bonus",
          },
        })

        weeklyBonus = {
          awarded: true,
          points: bonusPoints,
          message: "Weekly challenge complete! +50 bonus points!",
        }
      }
    }

    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
      weeklyBonus,
    })
  } catch (error) {
    console.error("POST weekly-activity error:", error)
    return NextResponse.json({ error: "Failed to add points" }, { status: 500 })
  }
}
