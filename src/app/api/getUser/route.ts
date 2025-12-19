// src/app/api/getUser/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { getOptimizedUser } from "@/lib/queries/user"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not Logged in" }, { status: 401 })
  }

  try {
    const user = await getOptimizedUser(session.user.email)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Transform unlocked avatars to simpler format
    // (Extract avatar from junction table)
    const cleanedUser = {
      ...user,
      unlockedAvatars: user.unlockedAvatars.map((ua) => ua.avatar),
      weeklyActivities: user.weeklyActvities[0] || null, // Return single object or null
    }

    return NextResponse.json(cleanedUser, {
      headers: {
        // Cache user data for 30 seconds
        // Reduces API calls when user navigates between pages
        "Cache-Control": "private, max-age=30",
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
