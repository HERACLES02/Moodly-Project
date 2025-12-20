import React from "react"
import CustomRadioPage from "./CustomRadioPage"

interface PageProps {
  params: Promise<{ groupId: string }>
}

const page = async ({ params }: PageProps) => {
  const { groupId } = await params

  return <CustomRadioPage groupId={groupId} />
}

export default page
