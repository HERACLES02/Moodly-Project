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
        { error: "Not logged in" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, mediaType } = body; 

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

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
    let activityMessage = "";
    
    if (action === "watch" && mediaType === "movie") {
      updateData.moviesWatched = { increment: 1 };
      activityMessage = `Movies watched this week: ${weeklyActivity.moviesWatched + 1}/3`;
      
    } else if (action === "listen" && mediaType === "song") {
      updateData.songsListened = { increment: 1 };
      activityMessage = `Songs listened this week: ${weeklyActivity.songsListened + 1}/3`;
    }

    const updatedActivity = await prisma.weeklyActivity.update({
      where: { id: weeklyActivity.id },
      data: updateData
    });

    let bonusAwarded = false;
    let bonusPoints = 0;
    
    if (!updatedActivity.bonusClaimed) {
      if (updatedActivity.moviesWatched >= 3 || updatedActivity.songsListened >= 3) {
        bonusPoints = 50;
        bonusAwarded = true;
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            points: { increment: bonusPoints }
          }
        });

        await prisma.weeklyActivity.update({
          where: { id: weeklyActivity.id },
          data: { bonusClaimed: true }
        });

        await prisma.pointHistory.create({
          data: {
            userId: user.id,
            points: bonusPoints,
            reason: weekly_activity_bonus
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      weeklyProgress: {
        moviesWatched: updatedActivity.moviesWatched,
        songsListened: updatedActivity.songsListened,
        bonusClaimed: updatedActivity.bonusClaimed || bonusAwarded
      },
      message: bonusAwarded 
        ?  `Weekly challenge complete! You earned ${bonusPoints} bonus points!`
        : activityMessage,
      bonusAwarded,
      bonusPoints
    });

  } catch (error) {
    console.error("Error tracking weekly activity:", error);
    return NextResponse.json(
      { error: "Failed to track weekly activity" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not logged in" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const weekStart = getWeekStart(new Date());

    const weeklyActivity = await prisma.weeklyActivity.findFirst({
      where: {
        userId: user.id,
        weekStart: weekStart
      }
    });

    return NextResponse.json({
      weeklyProgress: {
        moviesWatched: weeklyActivity?.moviesWatched || 0,
        songsListened: weeklyActivity?.songsListened || 0,
        bonusClaimed: weeklyActivity?.bonusClaimed || false,
        weekStart: weekStart.toISOString()
      }
    });

  } catch (error) {
    console.error("Error getting weekly progress:", error);
    return NextResponse.json(
      { error: "Failed to get weekly progress" },
      { status: 500 }
    );
  }
}