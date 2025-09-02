import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const { newPoints, reason, pointsDeducted } = await req.json()

    // Import prisma dynamically to avoid import issues
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

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

      await prisma.$disconnect()

      return NextResponse.json({
        success: true,
        newPoints: updatedUser.points
      })

    } catch (dbError) {
      await prisma.$disconnect()
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