import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { unstable_cache } from "next/cache"

export async function getOptimizedUser(email: string) {
  const weekStart = getWeekStart(new Date())

  return prisma.user.findUnique({
    where: { email },
    select: {
      // Basic fields
      id: true,
      email: true,
      anonymousName: true,
      mood: true,
      note: true,
      currentTheme: true,
      points: true,
      isAdmin: true,
      isBanned: true,
      createdAt: true,
      lastLoginAt: true,
      loginStreak: true,

      // Current avatar - uses new currentAvatarId index
      currentAvatarId: true,
      currentAvatar: {
        select: {
          id: true,
          name: true,
          imagePath: true,
        },
      },

      // Unlocked avatars - uses new composite indexes
      // Only fetch what we need (not full avatar objects)
      unlockedAvatars: {
        select: {
          avatarId: true,
          unlockedAt: true,
          avatar: {
            select: {
              id: true,
              name: true,
              imagePath: true,
            },
          },
        },
        orderBy: {
          unlockedAt: "desc", // Uses new [userId, unlockedAt] index
        },
      },

      // Weekly progress - uses new unique constraint
      weeklyActvities: {
        where: {
          weekStart: weekStart,
        },
        select: {
          moviesWatched: true,
          songsListened: true,
          bonusClaimed: true,
        },
        take: 1, // Only need current week
      },
    },
  })
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(d.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

export async function getUserBasic(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      anonymousName: true,
      mood: true,
      currentTheme: true,
      points: true,
      isAdmin: true,
      isBanned: true,
      currentAvatarId: true,
    },
  })
}

export const getLoginStreak = unstable_cache(
  async (userId?: string) => {
    if (!userId || userId === "") {
      const session = auth()
      userId = session?.user?.id
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { loginStreak: true },
    })

    return user?.loginStreak ?? 0
  },
  ["loginStreak"],
  {
    revalidate: 60 * 60 * 12, // 12 hours
    tags: ["loginStreak"],
  },
)

