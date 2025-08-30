import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

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
    

    let pointsToAdd = 0;
    if (action === "watch" || action === "listen") {
      pointsToAdd = 10; 
    } else if (action === "favorite") {
      pointsToAdd = 5; 
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        points: {
          increment: pointsToAdd
        }
      }
    });


    return NextResponse.json({
      success: true,
      pointsAdded: pointsToAdd,
      totalPoints: updatedUser.points,
      message: `You earned ${pointsToAdd} points! 🎉`
    });

  } catch (error) {
    console.error("Error adding points:", error);
    return NextResponse.json(
      { error: "Failed to add points" },
      { status: 500 }
    );
  }
}