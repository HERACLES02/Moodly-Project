import { getLoginStreak } from "@/lib/queries/user"

export async function fetchLoginStreak(userId: string) {
  return await getLoginStreak(userId)
}
