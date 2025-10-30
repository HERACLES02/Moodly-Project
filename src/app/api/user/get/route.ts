import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        currentTheme: true,
        mood: true,
        points: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      currentTheme: user.currentTheme,
      mood: user.mood,
      points: user.points
    })

  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}