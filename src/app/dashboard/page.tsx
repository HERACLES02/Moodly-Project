import Dashboard from "@/components/DashboardComponent"

import { fetchRecommendations } from "@/lib/fetchRecommendations"

const page = async () => {
  const { movies, songs } = await fetchRecommendations()

  if (!movies) {
    return <div> no fetch</div>
  }
  return (
    <div>
      <Dashboard movies={movies} songs={songs} />
    </div>
  )
}

export default page
