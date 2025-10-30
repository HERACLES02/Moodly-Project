import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const { newPoints, reason, pointsDeducted } = await req.json()

    try {
      // Update user points
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: { points: newPoints }
      })

      // Add to point history
      await prisma.pointHistory.create({
        data: {
          userId: updatedUser.id,
          points: -pointsDeducted,
          reason: reason
        }
      })

      return NextResponse.json({
        success: true,
        newPoints: updatedUser.points
      })

    } catch (dbError) {
      throw dbError
    }

  } catch (error) {
    console.error("Error updating points:", error)
    return NextResponse.json(
      { error: "Failed to update points" },
      { status: 500 }
    )
  }
}