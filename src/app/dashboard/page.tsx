import { auth } from "@/auth"
import { Suspense } from "react"
import CustomAudioPlayer from "@/components/CustomAudioPlayer"
import DashboardComponent from "@/components/DashboardComponent"
import DashboardSkeleton from "@/components/DashboardSkeleton"
import MobileDashboard from "@/components/MobileDashboard"
import { fetchPoster, fetchRecommendations } from "@/lib/fetchRecommendations"
import { getUserMood } from "@/lib/userActions"
import { redirect } from "next/navigation"

// Separate async component that fetches data INSIDE Suspense boundary
async function DashboardContent() {
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

const page = async () => {
  const mood = await getUserMood()
  console.log("Mood", mood)

  if (!mood) {
    redirect("/firstmoodselection")
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}

export default page
