import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const { action, mediaId, mediaType } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Determine points to deduct based on action
    let pointsToDeduct = 0
    let reason = ""

    switch (action) {
      case "unfavorite":
        pointsToDeduct = 5
        reason = `Removed ${mediaType} from favorites`
        break
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    // Make sure user has enough points to deduct
    if (user.points < pointsToDeduct) {
      pointsToDeduct = user.points // Deduct only what they have
    }

    // Update user points
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { points: { decrement: pointsToDeduct } }
    })

    // Record the point deduction in history
    await prisma.pointHistory.create({
      data: {
        userId: user.id,
        points: -pointsToDeduct,
        reason: reason
      }
    })

    return NextResponse.json({
      success: true,
      pointsDeducted: pointsToDeduct,
      totalPoints: updatedUser.points,
      message: `${pointsToDeduct} points deducted`
    })

  } catch (error) {
    console.error("Error deducting points:", error)
    return NextResponse.json(
      { error: "Failed to deduct points" },
      { status: 500 }
    )
  }
}