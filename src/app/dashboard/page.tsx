import DashboardComponent from "@/components/DashboardComponent"
import MobileDashboard from "@/components/MobileDashboard"
import { fetchRecommendations } from "@/lib/fetchRecommendations"

const page = async () => {
  const { movies, songs } = await fetchRecommendations()

  if (!movies) {
    return <div>no fetch</div>
  }

  return (
    <>
      {/* Desktop Dashboard - Hidden on mobile */}
      <div className="hidden md:block">
        <DashboardComponent movies={movies} songs={songs} />
      </div>

      {/* Mobile Dashboard - Visible only on mobile */}
      <div className="block md:hidden">
        <MobileDashboard movies={movies} songs={songs} />
      </div>
    </>
  )
}

export default page
