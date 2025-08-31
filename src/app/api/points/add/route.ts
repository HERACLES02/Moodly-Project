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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be logged in to earn points" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, mediaId, mediaType } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, points: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let pointsToAdd = 0;
    if (action === "watch" || action === "listen") {
      pointsToAdd = 10;
    } else if (action === "favorite") {
      pointsToAdd = 5;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        points: { increment: pointsToAdd }
      }
    });

    await prisma.pointHistory.create({
      data: {
        userId: user.id,
        points: pointsToAdd,
        reason: `${action}_${mediaType || 'content'}`
      }
    });

    let weeklyBonus = null;
    if (action === "watch" || action === "listen") {
      const weekStart = getWeekStart(new Date());

      let weeklyActivity = await prisma.weeklyActivity.findFirst({
        where: {
          userId: user.id,
          weekStart: weekStart
        }
      });

      if (!weeklyActivity) {
        weeklyActivity = await prisma.weeklyActivity.create({
          data: {
            userId: user.id,
            weekStart: weekStart,
            moviesWatched: 0,
            songsListened: 0,
            bonusClaimed: false
          }
        });
      }

      let updateData: any = {};
      if (action === "watch" && mediaType === "movie") {
        updateData.moviesWatched = { increment: 1 };
      } else if (action === "listen" && mediaType === "song") {
        updateData.songsListened = { increment: 1 };
      }

      const updatedActivity = await prisma.weeklyActivity.update({
        where: { id: weeklyActivity.id },
        data: updateData
      });

      if (!updatedActivity.bonusClaimed) {
        if (updatedActivity.moviesWatched >= 3 || updatedActivity.songsListened >= 3) {
          const bonusPoints = 50;
          

          await prisma.user.update({
            where: { id: user.id },
            data: { points: { increment: bonusPoints } }
          });

          await prisma.weeklyActivity.update({
            where: { id: weeklyActivity.id },
            data: { bonusClaimed: true }
          });

          await prisma.pointHistory.create({
            data: {
              userId: user.id,
              points: bonusPoints,
              reason: 'weekly_activity_bonus'
            }
          });

          weeklyBonus = {
            awarded: true,
            points: bonusPoints,
            message: " Weekly challenge complete! +50 bonus points!"
          };
        }
      }
    }

    const response: any = {
      success: true,
      pointsAdded: pointsToAdd,
      totalPoints: updatedUser.points + (weeklyBonus?.points || 0),
      message: `You earned ${pointsToAdd} points!`
    };

    if (weeklyBonus) {
      response.weeklyBonus = weeklyBonus;
      response.totalPoints = updatedUser.points + weeklyBonus.points;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error adding points:", error);
    return NextResponse.json(
      { error: "Failed to add points" },
      { status: 500 }
    );
  }
}