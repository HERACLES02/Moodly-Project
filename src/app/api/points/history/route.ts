import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Step 1: Check if user is logged in
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    // Step 2: Find the user in database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Step 3: Get all point history for this user, ordered by newest first
    const pointHistory = await prisma.pointHistory.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 entries to keep it manageable
    })

    return NextResponse.json({
      success: true,
      history: pointHistory
    })

  } catch (error) {
    console.error("Error fetching point history:", error)
    return NextResponse.json(
      { error: "Failed to fetch point history" },
      { status: 500 }
    )
  }
}