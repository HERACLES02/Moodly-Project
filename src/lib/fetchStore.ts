import { Avatar, UserAvatar } from "./../../node_modules/.prisma/client/index.d"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

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
  user: {
    id: string
    currentAvatar: Avatar
    unlockedThemes: string
    unlockedAvatars: UserAvatar[]
  }
}

export async function getStore() {
  const session = await auth()

  if (!session?.user) {
    return
  }

  try {
    const [avatars, user] = await Promise.all([
      prisma?.avatar.findMany(),
      prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          currentAvatar: true,
          unlockedThemes: true,
          unlockedAvatars: true,
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
