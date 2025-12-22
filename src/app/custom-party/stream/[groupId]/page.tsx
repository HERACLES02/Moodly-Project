import { headers } from "next/headers"
import CustomWatchPage from "./CustomWatchPage"

interface PageProps {
  params: Promise<{ groupId: string }>
}

const mood = async ({ params }: PageProps) => {
  const { groupId } = await params
  const headerList = await headers()
  const userAgent = headerList.get("user-agent") || ""
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent)

  return <CustomWatchPage groupId={groupId} isMobile={isMobile} />
}

export default mood
