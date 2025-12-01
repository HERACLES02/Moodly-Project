"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import "./MoodMusic.css"
import { Spinner } from "../ui/spinner"
import { Play } from "lucide-react"

export interface Track {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  preview_url: string | null
  external_url: string
}

interface MoodMusicProps {
  mood: string
  tracks: Track[]
  onSongClick?: (songId: String) => void
  loading: boolean
}

export default function MoodMusic({
  tracks,
  mood,
  onSongClick,
  loading,
}: MoodMusicProps) {
  // const [tracks, setTracks] = useState<Track[]>([])

  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const trackInteraction = async (track: Track) => {
    try {
      await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "song",
          itemId: track.id,
          itemName: track.name,
          mood: mood,
        }),
      })
    } catch (err) {
      console.error("Error tracking interaction:", err)
    }
  }

  const handleTrackClick = async (track: Track) => {
    await trackInteraction(track)
    onSongClick(track.id)
  }

  if (error) {
    return (
      <div className="mood-music-container">
        <div className="carousel-box">
          <div className="carousel-error">{error}</div>
          <span className="carousel-label">Songs</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mood-music-container">
      <div className="carousel-box theme-card">
        {/* Scrollable Track */}
        <div className="carousel-track" ref={scrollRef}>
          {tracks.map((track) => (
            <div
              key={track.id}
              className="carousel-item"
              onClick={() => handleTrackClick(track)}
            >
              <div className="item-card circle">
                {!loading ? (
                  <Image
                    src={track.albumArt || "/images/music-placeholder.jpg"}
                    alt={`${track.album} cover`}
                    width={210} // Match largest size
                    height={210} // Square
                    className="item-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/images/music-placeholder.jpg"
                    }}
                  />
                ) : (
                  <div className="w-full" />
                )}

                <div className="item-play-overlay">
                  <Play color="white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* End Fade - Diagonal Triangle */}
        <div className="carousel-fade-end"></div>

        {/* Label */}
        <span className="carousel-label theme-text-highlight">Songs</span>
      </div>
    </div>
  )
}
