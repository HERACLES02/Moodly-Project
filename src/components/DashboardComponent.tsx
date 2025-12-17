"use client"

import { useState, useEffect } from "react"
import NavbarComponent from "@/components/NavbarComponent"
import MoodMovies, { Movie } from "@/components/MoodMovies/MoodMovies"
import MoodMusic, { Track } from "@/components/MoodMusic/MoodMusicComponent"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { useUser } from "@/contexts/UserContext"
import "./dashboard.css"
import { setUserMood } from "@/lib/userActions"
import { fetchRecommendations } from "@/lib/fetchRecommendations"
import { Ring2 } from "ldrs/react"
import "ldrs/react/Ring2.css"
import Image from "next/image"

// Import the new mobile component
import MobileDashboard from "@/components/MobileDashboard/MobileDashboard"
import { Play } from "lucide-react"

const movieCache = new Map<string, Movie[]>()
const songCache = new Map<string, Track[]>()

interface DashboardProps {
  movies: Movie[]
  songs: Track[]
}

export default function Dashboard({ movies, songs }: DashboardProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"movies" | "songs">("movies")
  const { user, updateUserMood } = useUser()
  const router = useRouter()
  const { setTheme } = useTheme()
  const [moviesState, setMoviesState] = useState<Movie[]>(movies)
  const [songState, setSongState] = useState<Track[]>(songs)
  const [featuredItem, setFeaturedItem] = useState<Movie | Track | null>(null)

  // Add mobile detection
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    async function refetchUserInfo(moodName: string) {
      try {
        await setUserMood(moodName)
        const data = await fetchRecommendations(moodName)
        setMoviesState(data.movies)
        setSongState(data.songs)
      } catch (error) {
        throw error
      } finally {
        setLoading(false)
      }
    }

    if (user?.mood) {
      setLoading(true)
      setCurrentMood(user.mood)
      refetchUserInfo(user.mood)

      if (user?.currentTheme != "default") {
        setTheme(user?.currentTheme?.toLowerCase())
      } else {
        setTheme(user.mood.toLowerCase())
      }
    }
  }, [user?.mood])

  // Set random featured item when movies/songs change or tab switches
  useEffect(() => {
    if (activeTab === "movies" && moviesState.length > 0) {
      const randomMovie =
        moviesState[Math.floor(Math.random() * moviesState.length)]
      setFeaturedItem(randomMovie)
    } else if (activeTab === "songs" && songState.length > 0) {
      const randomSong = songState[Math.floor(Math.random() * songState.length)]
      setFeaturedItem(randomSong)
    }
  }, [activeTab, moviesState, songState])

  useEffect(() => {
    setIsMounted(true)

    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleAutoSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  if (user?.isBanned) {
    return (
      <div
        className="flex items-center justify-center h-screen w-screen scale-200 cursor-pointer"
        onClick={handleAutoSignOut}
      >
        <div className="theme-btn inline-flex font-black items-center justify-center">
          <button>You are banned. Click to sign out.</button>
        </div>
      </div>
    )
  }

  const handleMoodSelected = (mood: string) => {
    if (mood) updateUserMood(mood)
  }

  const handleMovieClick = (movieId: number) => {
    router.push(`/movie/watch/${movieId}`)
  }

  const handleSongClick = (songId: string) => {
    router.push(`/song/listen/${songId}`)
  }

  // Get high quality hero image
  const getHeroImage = () => {
    if (!featuredItem) return "/images/placeholder.jpg"

    // Try to get backdrop first (landscape), fallback to poster
    const rawPath =
      activeTab === "movies"
        ? (featuredItem as any).backdrop_path ||
          (featuredItem as any).backdrop ||
          (featuredItem as Movie).poster
        : (featuredItem as Track).albumArt

    // Ensure we are using the high-quality TMDB path
    if (rawPath?.startsWith("/")) {
      return `https://image.tmdb.org/t/p/original${rawPath}`
    }

    return rawPath?.includes("w500")
      ? rawPath.replace("w500", "original")
      : rawPath
  }

  const supportedMoods = ["happy", "sad"]
  const normalizedMood = user?.mood?.toLowerCase()
  const showRecommendations =
    normalizedMood && supportedMoods.includes(normalizedMood)

  if (!isMounted) return null

  // Render mobile layout for screens < 768px
  if (isMobile) {
    return (
      <>
        {/* Mobile doesn't need the full navbar - it has bottom nav */}
        <div className="mobile-top-bar">
          <div
            className="mobile-logo"
            onClick={() => router.push("/dashboard")}
          >
            <img
              src="/images/moodly-logo.gif"
              alt="Moodly"
              style={{ height: "40px", width: "auto" }}
            />
          </div>
        </div>
        <MobileDashboard movies={moviesState} songs={songState} />
      </>
    )
  }

  // Desktop layout with hero poster
  return (
    <div className="min-h-screen">
      {!normalizedMood ? (
        <div></div>
      ) : (
        <div className="min-h-screen flex flex-col">
          <main className="magazine-layout">
            {showRecommendations ? (
              <div className="magazine-content">
                <section className="magazine-hero-wrapper">
                  {/* Background Image with Gradient Overlay */}
                  <div className="magazine-hero-background">
                    <Image
                      src={
                        featuredItem?.backdrop_path || featuredItem?.poster_path
                      }
                      alt="Featured"
                      fill
                      className="magazine-hero-image"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                    <div className="magazine-hero-overlay" />
                  </div>

                  {/* Hero Content Grid */}
                  <div className="magazine-hero">
                    <div className="magazine-hero-left">
                      <div
                        className="magazine-toggle"
                        onClick={() =>
                          setActiveTab(
                            activeTab === "movies" ? "songs" : "movies",
                          )
                        }
                      >
                        <p className="magazine-label">Curated for you</p>
                        <h2
                          className={`magazine-title ${activeTab === "movies" ? "active" : "inactive"}`}
                        >
                          Movies
                        </h2>
                        <h2
                          className={`magazine-title ${activeTab === "songs" ? "active" : "inactive"}`}
                        >
                          Songs
                        </h2>
                        <div className="magazine-indicators">
                          <span
                            className={`indicator ${activeTab === "movies" ? "active" : ""}`}
                          ></span>
                          <span
                            className={`indicator ${activeTab === "songs" ? "active" : ""}`}
                          ></span>
                        </div>
                      </div>
                    </div>

                    <div className="magazine-hero-right">
                      <div className={`magazine-featured ${activeTab}`}>
                        <button
                          onClick={() =>
                            router.push(
                              activeTab === "movies"
                                ? `/stream/${normalizedMood}`
                                : `/radio/${normalizedMood}`,
                            )
                          }
                          className="theme-button-variant-1 flex gap-2 items-center text-center"
                        >
                          <Play
                            color="var(--foreground)"
                            fill="var(--foreground)"
                          />
                          {activeTab === "movies"
                            ? "Join Live TV"
                            : "Join Radio Station"}
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="magazine-rows">
                  {activeTab === "movies" ? (
                    <MoodMovies
                      movies={moviesState}
                      mood={normalizedMood!}
                      onMovieClick={handleMovieClick}
                      loading={loading}
                    />
                  ) : (
                    <MoodMusic
                      tracks={songState}
                      mood={normalizedMood!}
                      onSongClick={handleSongClick}
                      loading={loading}
                    />
                  )}
                </section>
              </div>
            ) : (
              <div className="magazine-coming-soon">
                <div className="theme-card">
                  <h2 className="coming-soon-title">
                    Coming Soon for {currentMood} mood!
                  </h2>
                  <p className="coming-soon-text">
                    We're currently curating personalized recommendations for "
                    {currentMood}" mood.
                    <br />
                    <br />
                    <span className="coming-soon-highlight">
                      Currently available for:
                    </span>
                    <br />
                    Happy and Sad moods
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}
