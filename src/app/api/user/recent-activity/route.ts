// src/app/api/user/recent-activity/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

/**
 * GET /api/user/recent-activity
 * Returns user's recent movies watched and songs listened
 *
 * OPTIMIZATION:
 * - Uses indexed UserInteraction queries
 * - Parallel fetching for movies + songs
 * - Limited to 4 items each for performance
 * - Cached for 30 seconds
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ✅ OPTIMIZATION: Parallel queries with Promise.all
    const [recentMovies, recentSongs] = await Promise.all([
      // Recent movies - uses [userId, type, createdAt] composite index
      prisma.userInteraction.findMany({
        where: {
          userId: user.id,
          type: "movie",
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          itemId: true,
          itemName: true,
          createdAt: true,
          mood: true,
        },
      }),

      // Recent songs - uses [userId, type, createdAt] composite index
      prisma.userInteraction.findMany({
        where: {
          userId: user.id,
          type: "song",
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          itemId: true,
          itemName: true,
          createdAt: true,
          mood: true,
        },
      }),
    ])

    return NextResponse.json(
      {
        recentMovies,
        recentSongs,
      },
      {
        headers: {
          // Cache for 30 seconds - activity doesn't change that frequently
          "Cache-Control": "private, max-age=30",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching recent activity:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 },
    )
  }
}
