import ListenSong from "./ListenSong"

type PageProps = {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return <ListenSong songId={params.id} />
}
