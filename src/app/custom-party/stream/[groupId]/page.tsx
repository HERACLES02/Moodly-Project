import CustomWatchPage from "./CustomWatchPage"

interface PageProps {
  params: Promise<{ groupId: string }>
}

const mood = async ({ params }: PageProps) => {
  const { groupId } = await params

  return <CustomWatchPage groupId={groupId} />
}

export default mood
