import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { avatarId, action } = await req.json()

    if (!avatarId || !action) {
      return NextResponse.json(
        { error: "Avatar ID and action required" },
        { status: 400 },
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        points: true,
        currentAvatarId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Find the avatar by ID or name
    // Find the avatar by ID or name - FIXED for SQLite
    const avatar = await prisma.avatar.findFirst({
      where: {
        OR: [
          { id: avatarId },
          { name: avatarId }, // Direct match
          { name: avatarId.charAt(0).toUpperCase() + avatarId.slice(1) }, // Capitalize first letter
          { name: avatarId.toLowerCase() }, // Lowercase
          { name: avatarId.toUpperCase() }, // Uppercase
          { name: avatarId.replace(/([A-Z])/g, " $1").trim() }, // "coolCat" -> "Cool Cat"
        ],
      },
    })

    if (!avatar) {
      return NextResponse.json({ error: "Avatar not found" }, { status: 404 })
    }

    if (action === "redeem") {
      // Check if user already owns this avatar
      const existingUnlock = await prisma.userAvatar.findUnique({
        where: {
          userId_avatarId: {
            userId: user.id,
            avatarId: avatar.id,
          },
        },
      })

      if (existingUnlock) {
        return NextResponse.json(
          { error: "You already own this avatar!" },
          { status: 400 },
        )
      }

      // Check if user has enough points
      if (user.points < avatar.pointsCost) {
        return NextResponse.json(
          {
            error: `Not enough points. Need ${avatar.pointsCost}, have ${user.points}`,
          },
          { status: 400 },
        )
      }

      // Perform the purchase transaction
      await prisma.$transaction(async (tx) => {
        // Deduct points
        await tx.user.update({
          where: { id: user.id },
          data: {
            points: { decrement: avatar.pointsCost },
            currentAvatarId: avatar.id, // Automatically apply the new avatar
          },
        })

        // Add to unlocked avatars
        await tx.userAvatar.create({
          data: {
            userId: user.id,
            avatarId: avatar.id,
          },
        })

        // Record point history
        await tx.pointHistory.create({
          data: {
            userId: user.id,
            points: -avatar.pointsCost,
            reason: `avatar_unlock_${avatar.name.toLowerCase().replace(/\s+/g, "_")}`,
          },
        })
      })

      return NextResponse.json({
        success: true,
        message: `${avatar.name} avatar unlocked and applied!`,
        avatarId: avatar.id,
        newPoints: user.points - avatar.pointsCost,
      })
    } else if (action === "apply") {
      // Check if user owns this avatar
      const userAvatar = await prisma.userAvatar.findUnique({
        where: {
          userId_avatarId: {
            userId: user.id,
            avatarId: avatar.id,
          },
        },
      })

      if (!userAvatar) {
        return NextResponse.json(
          { error: "You do not own this avatar" },
          { status: 400 },
        )
      }

      // Apply the avatar
      await prisma.user.update({
        where: { id: user.id },
        data: { currentAvatarId: avatar.id },
      })

      return NextResponse.json({
        success: true,
        message: `${avatar.name} avatar applied!`,
        avatarId: avatar.id,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Avatar API error:", error)
    return NextResponse.json(
      { error: "Failed to process avatar request" },
      { status: 500 },
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        currentAvatarId: true,
        points: true,
        currentAvatar: true,
      },
    })

    return NextResponse.json(
      {
        currentAvatarId: user?.currentAvatarId || null,
        currentAvatar: user?.currentAvatar || null,
        points: user?.points || 0,
      },
      {
        headers: {
          "Cache-Control": "private, max-age=30", // ✅ ADD THIS
        },
      },
    )
  } catch (error) {
    console.error("Error fetching avatar:", error)
    return NextResponse.json(
      { error: "Failed to fetch avatar" },
      { status: 500 },
    )
  }
}
