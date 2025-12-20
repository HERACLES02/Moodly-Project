import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { inngest } from "@/inngest/client"
import prisma from "@/lib/prisma" // ✅ CORRECT
import { revalidateTag } from "next/cache"

/**
 * POST /api/points/login
 * Awards login bonus points and tracks login streak
 *
 * OPTIMIZATION: Point history logging is deferred to Inngest (async)
 * User sees points updated immediately, history is logged in background
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        lastLoginAt: true,
        loginStreak: true,
        points: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date()
    let pointsToAdd = 0
    let newStreak = user.loginStreak || 0
    let message = ""

    if (!user.lastLoginAt) {
      newStreak = 1
    } else {
      const lastLogin = new Date(user.lastLoginAt)
      const hoursSinceLastLogin =
        (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60)

      if (hoursSinceLastLogin < 1) {
        return NextResponse.json({
          success: false,
          message:
            "You've already claimed your login bonus recently. Come back later!",
          totalPoints: user.points,
        })
      }

      if (hoursSinceLastLogin >= 24 && hoursSinceLastLogin <= 48) {
        newStreak = user.loginStreak + 1
        pointsToAdd = 10 + Math.min(newStreak, 7) * 2
        message = `Daily login streak: ${newStreak} days! You earned ${pointsToAdd} points! `
      } else if (hoursSinceLastLogin > 48) {
        newStreak = 1
        pointsToAdd = 10
        message =
          "Your streak was broken, but you still earned 10 points for logging in!"
      }
    }

    if (pointsToAdd > 0) {
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          points: { increment: pointsToAdd },
          lastLoginAt: now,
          loginStreak: newStreak,
        },
      })

      revalidateTag("loginStreak")

      // ✅ NEW: Queue point history logging to Inngest (ASYNC)
      // User gets response immediately, history is logged in background
      inngest.send({
        name: "log-point-history-trigger",
        data: {
          userId: user.id,
          points: pointsToAdd,
          reason: `login_bonus_streak_${newStreak}`,
        },
      })

      return NextResponse.json({
        success: true,
        pointsAdded: pointsToAdd,
        totalPoints: updatedUser.points,
        loginStreak: newStreak,
        message,
      })
    }

    return NextResponse.json({
      success: false,
      message: "No points to claim right now",
      totalPoints: user.points,
      loginStreak: newStreak,
    })
  } catch (error) {
    console.error("Error processing login points:", error)
    return NextResponse.json(
      { error: "Failed to process login points" },
      { status: 500 },
    )
  }
}
