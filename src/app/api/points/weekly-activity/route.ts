import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient(); 

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const weekStart = getWeekStart(new Date());

    let weeklyActivity = await prisma.weeklyActivity.findFirst({
      where: { userId: user.id, weekStart },
    });

    if (!weeklyActivity) {
      weeklyActivity = await prisma.weeklyActivity.create({
        data: {
          userId: user.id,
          weekStart,
          moviesWatched: 0,
          songsListened: 0,
          bonusClaimed: false,
        },
      });
    }

    return NextResponse.json({
      weeklyProgress: {
        moviesWatched: weeklyActivity.moviesWatched,
        songsListened: weeklyActivity.songsListened,
        bonusClaimed: weeklyActivity.bonusClaimed,
        weekStart: weekStart.toISOString(),
      },
    });
  } catch (error) {
    console.error("GET weekly-activity error:", error);
    return NextResponse.json(
      { error: "Failed to get weekly progress" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    // Parse JSON safely
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { action, mediaType } = body;
    if (!action || !mediaType)
      return NextResponse.json({ error: "Missing action or mediaType" }, { status: 400 });

    if (!["watch", "listen", "favorite"].includes(action))
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, points: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    let pointsToAdd = 0;
    if (action === "watch" || action === "listen") pointsToAdd = 10;
    else if (action === "favorite") pointsToAdd = 5;

    await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: pointsToAdd } },
    });

    await prisma.pointHistory.create({
      data: {
        userId: user.id,
        points: pointsToAdd,
        reason: `${action}_${mediaType}`,
      },
    });

    let weeklyBonus = null;
    if ((action === "watch" || action === "listen") && (mediaType === "movie" || mediaType === "song")) {
      const weekStart = getWeekStart(new Date());

      let weeklyActivity = await prisma.weeklyActivity.findFirst({
        where: { userId: user.id, weekStart },
      });

      if (!weeklyActivity) {
        weeklyActivity = await prisma.weeklyActivity.create({
          data: {
            userId: user.id,
            weekStart,
            moviesWatched: 0,
            songsListened: 0,
            bonusClaimed: false,
          },
        });
      }

      const updateData: any = {};
      if (action === "watch" && mediaType === "movie") updateData.moviesWatched = { increment: 1 };
      if (action === "listen" && mediaType === "song") updateData.songsListened = { increment: 1 };

      let updatedActivity = weeklyActivity;
      if (Object.keys(updateData).length > 0) {
        updatedActivity = await prisma.weeklyActivity.update({
          where: { id: weeklyActivity.id },
          data: updateData,
        });
      }

      if (
        !updatedActivity.bonusClaimed &&
        updatedActivity.moviesWatched >= 3 &&
        updatedActivity.songsListened >= 3
      ) {
        const bonusPoints = 50;

        await prisma.user.update({
          where: { id: user.id },
          data: { points: { increment: bonusPoints } },
        });

        await prisma.weeklyActivity.update({
          where: { id: weeklyActivity.id },
          data: { bonusClaimed: true },
        });

        await prisma.pointHistory.create({
          data: { userId: user.id, points: bonusPoints, reason: "weekly_activity_bonus" },
        });

        weeklyBonus = { awarded: true, points: bonusPoints, message: "Weekly challenge complete! +50 bonus points!" };
      }
    }

    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
      weeklyBonus,
    });
  } catch (error) {
    console.error("POST weekly-activity error:", error);
    return NextResponse.json({ error: "Failed to add points" }, { status: 500 });
  }
}