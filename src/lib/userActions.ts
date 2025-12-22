"use server"
import prisma from "@/lib/prisma"

import { auth } from "@/auth"
export interface User {
  id: string
  email: string
  anonymousName: string
  mood?: string
  note?: string
  isAdmin: boolean
  isBanned?: boolean
  currentTheme?: string
  unlockedThemes?: string
  points?: number
  currentAvatarId?: string | null
  currentAvatar?: {
    imagePath: string
    name: string
  }
  unlockedAvatars?: {
    name?: string
    imagePath?: string
  }
  weeklyActvities: {
    id: string
    weekStart: Date
    moviesWatched: number
    songsListened: number
    bonusClaimed: Boolean
    createdAt: Date
    updatedAt: Date
  }
}

export async function getUserMood() {
  const session = await auth()

  if (session) {
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! },
      select: { mood: true },
    })
    return user?.mood
  }
  return null
}

export async function setUserMood(mood: string) {
  const session = await auth()

  if (session) {
    const user = await prisma.user.update({
      where: { email: session?.user?.email! },
      data: { mood: mood },
    })
    return user?.mood
  }
  return null
}

export async function fetchUserData() {}

export async function setUserTheme(theme: string) {
  const session = await auth()
  if (session) {
    const user = await prisma.user.update({
      where: { email: session?.user?.email! },
      data: { currentTheme: theme },
    })
    return user?.currentTheme
  }
  return null
}
