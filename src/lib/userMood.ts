"use server"
import prisma from "@/lib/prisma"

import { auth } from "@/auth"

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
