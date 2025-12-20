// src/app/api/user/activity-log/route.ts
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

/**
 * GET /api/user/activity-log
 * Returns combined activity log (points + interactions)
 *
 * OPTIMIZATION:
 * - Parallel queries for points + interactions
 * - Limited to 50 most recent items
 * - Uses optimized indexes
 * - Cached for 60 seconds
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

    // ✅ OPTIMIZATION: Parallel queries
    const [pointHistory, interactions] = await Promise.all([
      // Uses [userId, createdAt] index with DESC sort
      prisma.pointHistory.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          points: true,
          reason: true,
          createdAt: true,
        },
      }),

      // Uses [userId, createdAt] composite index
      prisma.userInteraction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          type: true,
          itemId: true,
          itemName: true,
          mood: true,
          createdAt: true,
        },
      }),
    ])

    // Combine and sort by date
    const combined = [
      ...pointHistory.map((p) => ({
        id: p.id,
        type: "point" as const,
        points: p.points,
        reason: p.reason,
        createdAt: p.createdAt,
      })),
      ...interactions.map((i) => ({
        id: i.id,
        type: "interaction" as const,
        itemType: i.type,
        itemId: i.itemId,
        itemName: i.itemName,
        mood: i.mood,
        createdAt: i.createdAt,
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json(
      {
        activities: combined.slice(0, 50), // Limit to 50 total
      },
      {
        headers: {
          // Cache for 60 seconds
          "Cache-Control": "private, max-age=60",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching activity log:", error)
    return NextResponse.json(
      { error: "Failed to fetch activity log" },
      { status: 500 },
    )
  }
}
