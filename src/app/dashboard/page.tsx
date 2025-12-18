"use client"

import { useState, useEffect } from "react"

import NavbarComponent from "@/components/NavbarComponent"
import MoodMovies from "@/components/MoodMovies/MoodMovies"
import MoodMusic from "@/components/MoodMusic/MoodMusicComponent"
import MoodMusicAlbums from "@/components/MoodMusic/MoodMusicAlbums"


import { redirect, useRouter } from "next/navigation"
import SearchBar from "@/components/SearchBar"
import { useTheme } from "next-themes"
import { signOut } from "next-auth/react"
import { useUser } from "@/contexts/UserContext"

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchMode, setSearchMode] = useState<"movie" | "song">("movie")
  const [submittedMode, setSubmittedMode] = useState<"movie" | "song">("movie");
  const [submittedQuery, setSubmittedQuery] = useState<string>("");
  const { user, updateUserMood } = useUser()
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (user?.mood) {
      setCurrentMood(user.mood)
      console.log(user)
      console.log("Dashboard: User mood from context:", user.mood)

      if (user?.currentTheme != "default") {
        setTheme(user.currentTheme?.toLowerCase())
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
        className="flex items-center justify-center h-screen w-screen scale-200 cursor:pointer"
        onClick={handleAutoSignOut}
      >
        <div className="theme-btn inline-flex font-black items-center justify-center">
          <button>You are banned. Click to sign out.</button>
        </div>
      </div>
    )
  }

  const handleMoodSelected = (mood: string) => {
    console.log("Dashboard received mood from navbar:", mood)
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

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* If no mood → Show first mood selection */}
      {!normalizedMood ? (
        <div></div>
      ) : (
        <>
          {/* Navbar will only render AFTER mount ✅ */}
          <NavbarComponent onSelectMoodClick={handleMoodSelected} />

            <main className="max-w-6xl mx-auto p-8">
            {showRecommendations ? (
              <div className="mood-recommendations-section">
                <section className="mb-6">

                  <SearchBar
                    placeholder="Type to search…"
                    onModeChange={(m) => setSearchMode(m)}
                      onSubmit={(val, m) => {
                        const trimmed = val.trim();
                        // keep UI state in sync
                        setSearchMode(m);
                        setSearchQuery(trimmed);
                        // store the exact submitted pair used by children
                        setSubmittedMode(m);
                        setSubmittedQuery(trimmed);
                        console.log('submitted:', { query: trimmed, mode: m })
                    }}
                  />
                </section>

                <MoodMovies
                  mood={normalizedMood!}
                  onMovieClick={handleMovieClick}
                  query={searchMode === "movie" ? submittedQuery  : ""}
                />
                <MoodMusicAlbums mood={normalizedMood!} />
                <MoodMusic
                  mood={normalizedMood!}
                  onSongClick={handleSongClick}
                  query={searchMode === "song" ? submittedQuery  : ""}
                />

                <div className="flex w-[100%] justify-center items-center gap-1">
                  <button
                    onClick={() => router.push(`/stream/${normalizedMood}`)}
                    className="theme-button"
                  >
                    Join Live Session
                  </button>
                  <button
                    onClick={() => router.push(`/radio/${normalizedMood}`)}
                    className="theme-button"
                  >
                    Join Radio Station
                  </button>
                </div>
              </div>
            ) : (
              <div className="theme-card">
                <h2 className="content-title accent-text">
                  Coming Soon for {currentMood} mood!
                </h2>
                <p className="content-text mood-text">
                  We're currently curating personalized movie and music
                  recommendations for "{currentMood}" mood.
                  <br />
                  <br />
                  <span className="content-highlight">
                    Currently available for:
                  </span>
                  <br />
                  Happy and Sad moods
                </p>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  )
}
