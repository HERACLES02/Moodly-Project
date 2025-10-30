// src/app/api/points/add/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma"; // singleton PrismaClient
import { auth } from "@/auth";

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    // Safely parse JSON body
    let body: any;
    try {
      body = await req.json();
    } catch (err) {
      console.error("JSON parse error:", err);
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { action, mediaType, mediaId } = body;

    if (!action || !mediaType) {
      return NextResponse.json({ error: "Missing action or mediaType" }, { status: 400 });
    }

    if (!["watch", "listen", "favorite"].includes(action)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, points: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Determine points
    let pointsToAdd = action === "favorite" ? 5 : 10;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { points: { increment: pointsToAdd } }
    });

    await prisma.pointHistory.create({
      data: {
        userId: user.id,
        points: pointsToAdd,
        reason: `${action}_${mediaType || "content"}`
      }
    });

    // Weekly activity logic
    let weeklyBonus: { awarded: boolean; points: number; message: string } | null = null;

    if ((action === "watch" || action === "listen") && ["movie", "song"].includes(mediaType)) {
      const weekStart = getWeekStart(new Date());

      let weeklyActivity = await prisma.weeklyActivity.findFirst({
        where: { userId: user.id, weekStart }
      });

      if (!weeklyActivity) {
        weeklyActivity = await prisma.weeklyActivity.create({
          data: {
            userId: user.id,
            weekStart,
            moviesWatched: 0,
            songsListened: 0,
            bonusClaimed: false
          }
        });
      }

      const updateData: any = {};
      if (action === "watch" && mediaType === "movie") updateData.moviesWatched = { increment: 1 };
      if (action === "listen" && mediaType === "song") updateData.songsListened = { increment: 1 };

      const updatedActivity = Object.keys(updateData).length > 0
        ? await prisma.weeklyActivity.update({ where: { id: weeklyActivity.id }, data: updateData })
        : weeklyActivity;

      // Award weekly bonus if criteria met
      if (!updatedActivity.bonusClaimed && updatedActivity.moviesWatched >= 3 && updatedActivity.songsListened >= 3) {
        const bonusPoints = 50;

        await prisma.user.update({ where: { id: user.id }, data: { points: { increment: bonusPoints } } });
        await prisma.weeklyActivity.update({ where: { id: weeklyActivity.id }, data: { bonusClaimed: true } });
        await prisma.pointHistory.create({ data: { userId: user.id, points: bonusPoints, reason: "weekly_activity_bonus" } });

        weeklyBonus = {
          awarded: true,
          points: bonusPoints,
          message: "Weekly challenge complete! +50 bonus points!"
        };
      }
    }

    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
      totalPoints: updatedUser.points + (weeklyBonus?.points || 0),
      ...(weeklyBonus && { weeklyBonus })
    });

  } catch (error) {
    console.error("Error adding points:", error);
    return NextResponse.json({ error: "Failed to add points" }, { status: 500 });
  }
}