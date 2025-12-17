import { auth } from "@/auth"
import CustomAudioPlayer from "@/components/CustomAudioPlayer"
import DashboardComponent from "@/components/DashboardComponent"
import MobileDashboard from "@/components/MobileDashboard"
import { fetchRecommendations } from "@/lib/fetchRecommendations"
import { getUserMood } from "@/lib/userActions"
import { redirect } from "next/navigation"

const page = async () => {
  const mood = await getUserMood()
  console.log("Mood", mood)

  if (!mood) {
    redirect("/firstmoodselection")
  }
  const { movies, songs } = await fetchRecommendations()
  if (!movies) {
    return <div>no fetch</div>
  }

  // console.log("movie page", movies)

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

      <main className="flex-1 flex px-10 pb-10 gap-10 min-h-0">
        <div className="flex-[2.5] min-h-0">
          <CustomAudioPlayer
            audioUrl={`https://pub-5028b4904eef4a52961fb036dec5fe6d.r2.dev/music/LEVEL%20FIVE%20-%20TUMI.mp3`}
            livetime={0}
          />
        </div>
        ...
      </main>
    </>
  )
}

export default page
