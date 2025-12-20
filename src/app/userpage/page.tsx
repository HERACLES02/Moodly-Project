import { getLoginStreak } from "@/lib/queries/user"
import UserPage from "./UserPageComponent"

export default async function page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const param = await searchParams
  const userId = (param.id as string) || ""
  const streak = await getLoginStreak(userId)

  return <UserPage streak={streak} />
}
