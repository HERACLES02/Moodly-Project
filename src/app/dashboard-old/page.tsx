"use client"

import { useState, useEffect } from "react"
import NavbarComponent from "@/components/NavbarComponent"
import MoodMovies, { Movie } from "@/components/MoodMovies/MoodMovies"
import MoodMusic, { Track } from "@/components/MoodMusic/MoodMusicComponent"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { useUser } from "@/contexts/UserContext"
import { Search } from "lucide-react"
import "./dashboard.css"

const movieCache = new Map<string, Movie[]>()
const songCache = new Map<string, Track[]>()

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"movies" | "songs">("movies")
  const { user, updateUserMood } = useUser()
  const router = useRouter()
  const { setTheme } = useTheme()
  const [moviesState, setMoviesState] = useState<Movie[]>([])
  const [songState, setSongState] = useState<Track[]>([])

  useEffect(() => {
    if (user?.mood) {
      setCurrentMood(user.mood)
      if (user?.currentTheme != "default") {
        setTheme(user?.currentTheme?.toLowerCase())
      } else {
        setTheme(user.mood.toLowerCase())
      }
    }
  }, [user?.mood])

  useEffect(() => {
    setIsMounted(true)
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

  const handleSongClick = (songId: number) => {
    router.push(`/song/listen/${songId}`)
  }

  const supportedMoods = ["happy", "sad"]
  const normalizedMood = user?.mood?.toLowerCase()
  const showRecommendations =
    normalizedMood && supportedMoods.includes(normalizedMood)
  useEffect(() => {
    if (!user?.mood) return

    const cached = movieCache.get(user.mood)
    const song_cached = songCache.get(user.mood)
    if (cached) {
      setMoviesState(cached)
    } else {
      fetchMovies()
    }
    if (song_cached) {
      setSongState(song_cached)
    } else {
      fetchMusic()
    }
  }, [user?.mood])

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)
    try {
      const normalizedMood = user?.mood?.toLowerCase()
      const response = await fetch(
        `/api/recommendations/movies?mood=${normalizedMood}`,
      )
      if (!response.ok)
        throw new Error(`Failed to fetch movies: ${response.status}`)
      const data = await response.json()
      movieCache.set(normalizedMood, data.movies || [])
      setMoviesState(data.movies || [])
    } catch (err) {
      console.error("Error fetching movies:", err)
      setError("Failed to load movie recommendations")
    } finally {
      setLoading(false)
    }
  }
  const fetchMusic = async () => {
    setLoading(true)
    setError(null)
    try {
      const normalizedMood = user?.mood?.toLowerCase()
      const response = await fetch(
        `/api/recommendations/songs?mood=${normalizedMood}`,
      )
      if (!response.ok)
        throw new Error(`Failed to fetch music: ${response.status}`)
      const data = await response.json()
      songCache.set(normalizedMood, data.tracks || [])
      setSongState(data.tracks || [])
    } catch (err) {
      console.error("Error fetching music:", err)
      setError("Failed to load music recommendations")
    } finally {
      setLoading(false)
    }
  }

  if (!isMounted && !movieCache) return null

  return (
    <div className="min-h-screen">
      {!normalizedMood ? (
        <div></div>
      ) : (
        <div className="min-h-screen flex flex-col">
          <NavbarComponent onSelectMoodClick={handleMoodSelected} />

          <main className="magazine-layout">
            {/* Top Bar */}
            <header className="magazine-header">
              <div className="magazine-search">
                <Search className="magazine-search-icon" size={16} />
                <input
                  type="text"
                  placeholder="What is on your mood today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="magazine-search-input"
                />
              </div>
            </header>

            {showRecommendations ? (
              <div className="magazine-content">
                {/* Hero Section - 12 column grid */}
                <section className="magazine-hero">
                  {/* Left Column - Typography Toggle */}
                  <div className="magazine-hero-left">
                    <div
                      className="magazine-toggle"
                      onClick={() =>
                        setActiveTab(
                          activeTab === "movies" ? "songs" : "movies",
                        )
                      }
                    >
                      <p className="magazine-label ">Curated for you</p>
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

                    <p className="magazine-description">
                      {activeTab === "movies"
                        ? `Handpicked films that match your ${normalizedMood} mood today.`
                        : `Songs selected to complement your ${normalizedMood} state of mind.`}
                    </p>
                  </div>

                  {/* Right Column - Featured Card */}
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
                        className="theme-button social-button"
                      >
                        {activeTab === "movies"
                          ? "Join Live Session"
                          : "Join Radio Station"}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Content Rows */}
                <section className="magazine-rows">
                  {activeTab === "movies" ? (
                    <MoodMovies
                      movies={moviesState}
                      mood={normalizedMood!}
                      onMovieClick={handleMovieClick}
                    />
                  ) : (
                    <MoodMusic
                      tracks={songState}
                      mood={normalizedMood!}
                      onSongClick={handleSongClick}
                    />
                  )}
                </section>

                {/* Social Section */}
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
