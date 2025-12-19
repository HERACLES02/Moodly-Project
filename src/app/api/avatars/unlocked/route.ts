import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Find user and their unlocked avatars
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        unlockedAvatars: {
          include: {
            avatar: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Extract avatar IDs from unlocked avatars
    const unlockedAvatarIds = user.unlockedAvatars.map((ua) => ua.avatarId)

    return NextResponse.json(
      {
        unlockedAvatars: unlockedAvatarIds,
        avatarDetails: user.unlockedAvatars.map((ua) => ({
          id: ua.avatar.id,
          name: ua.avatar.name,
          imagePath: ua.avatar.imagePath,
          unlockedAt: ua.unlockedAt,
        })),
      },
      {
        headers: {
          "Cache-Control": "private, max-age=60", // ✅ ADD THIS - avatars don't change often
        },
      },
    )
  } catch (error) {
    console.error("Error fetching unlocked avatars:", error)
    return NextResponse.json(
      { error: "Failed to fetch unlocked avatars" },
      { status: 500 },
    )
  }
}
