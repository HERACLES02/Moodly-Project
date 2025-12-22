// src/app/userpage/page.tsx
import { getLoginStreak } from "@/lib/queries/user"
import UserPageRevamped from "./UserPageRevamped"
import { auth } from "@/auth"

export default async function page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const param = await searchParams
  const session = await auth()
  
  // Get userId from URL param or from session
  const userId = (param.id as string) || session?.user?.id || ""
  
  // Pass userId explicitly to avoid auth() call inside cached function
  const streak = userId ? await getLoginStreak(userId) : null

  return <UserPageRevamped streak={streak} />
}