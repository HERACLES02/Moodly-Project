import WatchMovies from "./WatchMovie"

type PageProps = {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return <WatchMovies movieId={params.id} />
}
