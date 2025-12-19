"use client"
import { useState, useEffect } from "react"

import AddToPlaylistComponent from "@/components/PlaylistComponents/AddToPlaylistComponent"
import { usePoints } from "@/hooks/usePoints"
import "./page.css"

export default function ListenSong({ songId }: { songId: string }) {
  const [id, setId] = useState<string>(songId)
  const [song, setSong] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { addPoints } = usePoints()
  const [hasEarnedListenPoints, setHasEarnedListenPoints] = useState(false)

  useEffect(() => {
    if (id) {
      fetchSongData()
    }
  }, [id])

  useEffect(() => {
    if (!hasEarnedListenPoints && id) {
      const timer = setTimeout(() => {
        console.log("🎵 Adding points for listening song:", id)
        addPoints("listen", id, "song")
        setHasEarnedListenPoints(true)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [id, hasEarnedListenPoints])

  const fetchSongData = async () => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_PRODUCTION_URL || "http://localhost:9513"
      const response = await fetch(`${baseUrl}/api/get-song-data?id=${id}`)
      const songData = await response.json()
      setSong(songData)
    } catch (error) {
      console.error("Error fetching song data:", error)
    } finally {
      setLoading(false)
    }
  }
  const embedUrl = `https://open.spotify.com/embed/track/${id}`

  return (
    <>
      <div className="listen-page-container">
        <div className="spotify-embed-container">
          <iframe
            src={embedUrl}
            className="spotify-player"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title={`Listen to ${song?.name || "song"}`}
          ></iframe>
        </div>

        <div className="main-content-area">
          <div className="currently-playing-section">
            <h1 className="section-heading">Currently Playing</h1>
            <p className="song-title">{song?.name || "Song Name"}</p>
            {song?.artists && song.artists.length > 0 && (
              <p className="artist-name">
                {song.artists.map((artist: any) => artist.name).join(", ")}
              </p>
            )}
          </div>

          <div className="next-up-section">
            <AddToPlaylistComponent type="SONG" itemId={id} />
          </div>
        </div>
      </div>
    </>
  )
}
