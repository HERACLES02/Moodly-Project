import WatchPage from "./WatchPage"

interface PageProps {
  params: Promise<{ mood: string }>
}

const mood = async ({ params }: PageProps) => {
  const { mood } = await params

  return <WatchPage mood={mood} />
}

export default mood
