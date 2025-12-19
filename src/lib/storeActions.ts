"use server"
import { Avatar, UserAvatar } from ".prisma/client/client"
import { auth } from "@/auth"
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache"
import prisma from "@/lib/prisma"

import { User } from "@/contexts/UserContext"
import { getWeekStart } from "./queries/user"

export interface StoreObject {
  name: string
  id: string
  createdAt: Date
  imagePath: string
  pointsCost: number
  isRedeemed?: boolean
}

export interface Store {
  items: StoreObject[]
  user: User
}

// 🚀 CACHED FUNCTION: Store items are static and never change
// Cache for 24 hours (86400 seconds)
const getCachedStoreItems = unstable_cache(
  async () => {
    return await prisma.avatar.findMany()
  },
  ["store-items"], // cache key
  { tags: ["store-items"], revalidate: 86400 }, // 24 hours
)

export async function getStore() {
  const session = await auth()

  if (!session?.user) {
    return
  }

  try {
    const [avatars, user] = await Promise.all([
      getCachedStoreItems(), // ✅ This is CACHED for 24 hours
      prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          currentAvatar: true, // This includes the avatar relation
          unlockedAvatars: {
            include: {
              avatar: {
                select: {
                  id: true,
                  name: true,
                  imagePath: true,
                },
              },
            },
          },
          weeklyActvities: {
            where: {
              weekStart: getWeekStart(new Date()),
            },
          },
        },
      }),
    ])

    const unlockedSet = new Set(
      user?.unlockedAvatars?.map((u) => u.avatarId) || [],
    )

    const items = avatars.map((a) => ({
      ...a,
      isRedeemed: unlockedSet.has(a.id),
    }))

    return {
      items: items,
      user: user,
    }
  } catch (error) {
    console.error(error)
    throw new Error("Failed to fetch store")
  }
}

export async function redeemItem(
  userId: string,
  itemId: string,
  type: "avatar" | "theme",
  cost: number,
) {
  console.log("here")
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Deduct points ONLY if user has enough (Atomic check)
      const updatedUser = await tx.user.update({
        where: {
          id: userId,
          points: { gte: cost }, // ONLY update if points >= cost
        },
        data: {
          points: { decrement: cost },
          // If it's a theme, we append it to the string right here
          ...(type === "theme" && {
            unlockedThemes: { set: `${itemId}` }, // Simplified for this example
          }),
        },
      })

      // 2. If it's an avatar, create the junction record
      if (type === "avatar") {
        await tx.userAvatar.create({
          data: { userId, avatarId: itemId },
        })
      }

      // 3. Log it
      await tx.pointHistory.create({
        data: {
          userId,
          points: -cost,
          reason: `Redeemed ${type}: ${itemId}`,
        },
      })
    })

    // ✅ Invalidate cache so user sees updated unlocked items
    revalidateTag("store-items")
    revalidatePath("/store")

    return { success: true }
  } catch (error: any) {
    // If the points check failed, Prisma throws a P2025 error
    if (error.code === "P2025") {
      return { success: false, error: "Insufficient points or user not found" }
    }
    return {
      success: false,
      error: "Transaction failed: Item might already be owned",
    }
  }
}

export async function applySelection(
  userId: string,
  itemId: string,
  type: "avatar" | "theme",
) {
  try {
    if (type === "theme") {
      await prisma.user.update({
        where: { id: userId },
        data: { currentTheme: itemId },
      })
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { currentAvatarId: itemId },
      })
    }

    // ✅ Invalidate cache when user applies selection
    revalidateTag("store-items")
    revalidatePath("/store")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to apply selection" }
  }
}
