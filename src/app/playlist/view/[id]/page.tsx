"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import NavbarComponent from "@/components/NavbarComponent"
import "./playlist.css"
import { useUser } from "@/contexts/UserContext"

interface PlaylistItem {
  id: string
  itemId: string
  itemName: string
  addedAt: string
}

interface Playlist {
  id: string
  name: string
  type: "SONG" | "MOVIE"
  items: PlaylistItem[]
}

export default function IndividualPlaylistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [playlistId, setPlaylistId] = useState<string>("")
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setPlaylistId(resolvedParams.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (user?.mood) {
      setCurrentMood(user.mood)
      console.log("IndividualPlaylistPage: User mood from context:", user.mood)
    }
  }, [user?.mood])

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistData()
    }
  }, [playlistId])

  const fetchPlaylistData = async () => {
    try {
      setLoading(true)

      // Use the API endpoint to get playlist with items
      const response = await fetch(
        `/api/playlist/get-individual-playlist?id=${playlistId}`,
      )

      if (!response.ok) {
        throw new Error("Failed to fetch playlist")
      }

      const playlistData = await response.json()

      // Now fetch the actual names for each item using existing APIs
      const itemsWithNames = await Promise.all(
        playlistData.items.map(async (item: PlaylistItem) => {
          try {
            let actualName = item.itemName

            if (playlistData.type === "SONG") {
              // Use existing song API
              const songResponse = await fetch(
                `/api/get-song-data?id=${item.itemId}`,
              )
              if (songResponse.ok) {
                const songData = await songResponse.json()
                actualName = `${songData.name} - ${songData.artists.map((a: any) => a.name).join(", ")}`
              }
            } else if (playlistData.type === "MOVIE") {
              // Use existing movie API
              const movieResponse = await fetch(
                `/api/get-movie-data?id=${item.itemId}`,
              )
              if (movieResponse.ok) {
                const movieData = await movieResponse.json()
                actualName = movieData.title
              }
            }

            return {
              ...item,
              itemName: actualName,
            }
          } catch (error) {
            console.error(`Error fetching name for item ${item.itemId}:`, error)
            return item // Return original item if API call fails
          }
        }),
      )

      // Update playlist with real names
      setPlaylist({
        ...playlistData,
        items: itemsWithNames,
      })

      console.log("Fetched playlist with real names:", {
        ...playlistData,
        items: itemsWithNames,
      })
    } catch (error) {
      console.error("Error fetching playlist:", error)
      setPlaylist(null)
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSelected = (mood: string) => {
    console.log("IndividualPlaylistPage received mood from navbar:", mood)
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

  const handleItemClick = (itemId: string, type: string) => {
    // Use the same navigation logic as your dashboard
    if (type === "SONG") {
      router.push(`/song/listen/${itemId}`)
    } else if (type === "MOVIE") {
      router.push(`/movie/watch/${itemId}`)
    }
  }

  const getPlaylistTypeIcon = (type: string) => {
    return type === "SONG" ? "🎵" : "🎬"
  }

  if (loading) {
    return (
      <div className={`playlist-page-container ${getPlaylistPageTheme()}`}>
        <div className="loading-container">
          <p>Loading playlist...</p>
        </div>
      </div>
    )
  }

  if (!playlist) {
    return (
      <div className={`playlist-page-container ${getPlaylistPageTheme()}`}>
        <div className="error-container">
          <p>Playlist not found</p>
          <button
            onClick={() => router.push("/playlist")}
            className="back-button"
          >
            Back to Playlists
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`playlist-page-container ${getPlaylistPageTheme()}`}>
      <main className="playlist-main">
        <div className="playlist-content">
          <div className="playlist-header">
            <button
              onClick={() => router.push("/playlist")}
              className="back-button"
            >
              ← Back to All Playlists
            </button>

            <div className="playlist-title-section">
              <div className="playlist-icon-large">
                {getPlaylistTypeIcon(playlist.type)}
              </div>
              <h1 className="playlist-title">{playlist.name}</h1>
              <p className="playlist-info">
                {playlist.items.length} {playlist.type.toLowerCase()}
                {playlist.items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="playlist-items-section">
            {playlist.items.length === 0 ? (
              <div className="empty-playlist">
                <p>This playlist is empty</p>
                <p className="empty-subtitle">
                  Start adding {playlist.type.toLowerCase()}s by using the "+"
                  button on songs/movies!
                </p>
              </div>
            ) : (
              <div className="playlist-items-grid">
                {playlist.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="playlist-item-card"
                    onClick={() => handleItemClick(item.itemId, playlist.type)}
                  >
                    <div className="item-number">{index + 1}</div>
                    <div className="item-info">
                      <h3 className="item-name">
                        {item.itemName || `${playlist.type} ${index + 1}`}
                      </h3>
                      <p className="item-date">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="item-icon">
                      {playlist.type === "SONG" ? "▶️" : "🎬"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
