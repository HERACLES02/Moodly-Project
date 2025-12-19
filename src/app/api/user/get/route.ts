import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma" // ✅ Use singleton

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
        points: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(
      {
        currentTheme: user.currentTheme,
        mood: user.mood,
        points: user.points,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
  // ✅ NO $disconnect()
}
