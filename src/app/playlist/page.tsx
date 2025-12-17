"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavbarComponent from "@/components/NavbarComponent"
import "./playlist.css"
import { useUser } from "@/contexts/UserContext"

interface Playlist {
  id: string
  name: string
  type: "SONG" | "MOVIE"
  createdAt: string
  updatedAt: string
}

export default function PlaylistPage() {
  const [musicPlaylists, setMusicPlaylists] = useState<Playlist[]>([])
  const [moviePlaylists, setMoviePlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string | null>(null)
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user?.mood) {
      setCurrentMood(user.mood)
      console.log("PlaylistPage: User mood from context:", user.mood)
    }
  }, [user?.mood])

  useEffect(() => {
    // Check for type parameter in URL
    const urlParams = new URLSearchParams(window.location.search)
    const typeParam = urlParams.get("type")
    setFilterType(typeParam)
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchAllPlaylists()
    }
  }, [user?.id])

  const fetchAllPlaylists = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Fetch music playlists
      const musicResponse = await fetch(
        `/api/playlist/get-playlist?userid=${user.id}&type=SONG`,
      )
      const musicData = await musicResponse.json()
      setMusicPlaylists(Array.isArray(musicData) ? musicData : [])

      // Fetch movie playlists
      const movieResponse = await fetch(
        `/api/playlist/get-playlist?userid=${user.id}&type=MOVIE`,
      )
      const movieData = await movieResponse.json()
      setMoviePlaylists(Array.isArray(movieData) ? movieData : [])

      console.log("Fetched all playlists:", { musicData, movieData })
    } catch (error) {
      console.error("Error fetching playlists:", error)
      setMusicPlaylists([])
      setMoviePlaylists([])
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSelected = (mood: string) => {
    console.log("PlaylistPage received mood from navbar:", mood)
    if (mood) {
      setCurrentMood(mood)
    }
  }

  const getPlaylistPageTheme = () => {
    const normalizedMood = currentMood?.toLowerCase()
    if (normalizedMood === "happy") return "playlist-happy"
    if (normalizedMood === "sad") return "playlist-sad"
    return "playlist-default"
  }

  const handlePlaylistClick = (playlistId: string) => {
    // Navigate to individual playlist page to see its items
    router.push(`/playlist/view/${playlistId}`)
  }

  const getPlaylistTypeIcon = (type: string) => {
    return type === "SONG" ? "🎵" : "🎬"
  }

  if (loading) {
    return (
      <div className={`playlist-page-container ${getPlaylistPageTheme()}`}>
        <div className="loading-container">
          <p>Loading your playlists...</p>
        </div>
      </div>
    )
  }

  const totalPlaylists = musicPlaylists.length + moviePlaylists.length

  return (
    <div className={`playlist-page-container ${getPlaylistPageTheme()}`}>
      <main className="playlist-main">
        <div className="playlist-content">
          <div className="playlist-header">
            <button
              onClick={() => router.push("/userpage")}
              className="back-button"
            >
              ← Back to User Page
            </button>

            <div className="playlist-title-section">
              <h1 className="playlist-title">My Playlists</h1>
              <p className="playlist-info">
                {totalPlaylists} playlist{totalPlaylists !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>

          <div className="playlist-items-section">
            {(filterType === "SONG"
              ? musicPlaylists.length
              : filterType === "MOVIE"
                ? moviePlaylists.length
                : totalPlaylists) === 0 ? (
              <div className="empty-playlist">
                <p>
                  You haven't created any{" "}
                  {filterType === "SONG"
                    ? "music"
                    : filterType === "MOVIE"
                      ? "movie"
                      : ""}{" "}
                  playlists yet
                </p>
                <p className="empty-subtitle">
                  Start adding{" "}
                  {filterType === "SONG"
                    ? "songs"
                    : filterType === "MOVIE"
                      ? "movies"
                      : "songs and movies"}{" "}
                  to create your first playlist!
                </p>
              </div>
            ) : (
              <>
                {/* Music Playlists Section - only show if not filtered to MOVIE only */}
                {(!filterType || filterType === "SONG") &&
                  musicPlaylists.length > 0 && (
                    <div className="playlist-section">
                      <h2 className="section-title">
                        🎵 Music Playlists ({musicPlaylists.length})
                      </h2>
                      <div className="playlist-items-grid">
                        {musicPlaylists.map((playlist) => (
                          <div
                            key={playlist.id}
                            className="playlist-item-card"
                            onClick={() => handlePlaylistClick(playlist.id)}
                          >
                            <div className="item-icon">
                              {getPlaylistTypeIcon(playlist.type)}
                            </div>
                            <div className="item-info">
                              <h3 className="item-name">{playlist.name}</h3>
                              <p className="item-date">
                                Created{" "}
                                {new Date(
                                  playlist.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="item-arrow">▶️</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Movie Playlists Section - only show if not filtered to SONG only */}
                {(!filterType || filterType === "MOVIE") &&
                  moviePlaylists.length > 0 && (
                    <div className="playlist-section">
                      <h2 className="section-title">
                        🎬 Movie Playlists ({moviePlaylists.length})
                      </h2>
                      <div className="playlist-items-grid">
                        {moviePlaylists.map((playlist) => (
                          <div
                            key={playlist.id}
                            className="playlist-item-card"
                            onClick={() => handlePlaylistClick(playlist.id)}
                          >
                            <div className="item-icon">
                              {getPlaylistTypeIcon(playlist.type)}
                            </div>
                            <div className="item-info">
                              <h3 className="item-name">{playlist.name}</h3>
                              <p className="item-date">
                                Created{" "}
                                {new Date(
                                  playlist.createdAt,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="item-arrow">▶️</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
