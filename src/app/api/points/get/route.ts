import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

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
      select: { points: true }
    });

    return NextResponse.json({
      points: user?.points || 0
    });

  } catch (error) {
    console.error("Error getting points:", error);
    return NextResponse.json(
      { error: "Failed to get points" },
      { status: 500 }
    );
  }
}