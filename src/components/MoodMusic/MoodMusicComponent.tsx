'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import './MoodMusic.css'

interface Track {
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
  onSongClick: (songId: String) => void
}

export default function MoodMusic({ mood, onSongClick }: MoodMusicProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!mood) return
    fetchMusic()
  }, [mood])

  const fetchMusic = async () => {
    setLoading(true)
    setError(null)

    try {
      const normalizedMood = mood.toLowerCase()
      const response = await fetch(`/api/recommendations/songs?mood=${normalizedMood}`)

      if (!response.ok) throw new Error(`Failed to fetch music: ${response.status}`)

      const data = await response.json()
      setTracks(data.tracks || [])
    } catch (err) {
      console.error('Error fetching music:', err)
      setError('Failed to load music recommendations')
    } finally {
      setLoading(false)
    }
  }

    const trackInteraction = async (track: Track) => {
      try {
        await fetch('/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'song',
            itemId: track.id,
            itemName: track.name,
            mood: mood
          })
        })
      console.log("Movie click tracked in Database")

      } catch (err) {
        console.error('Error tracking interaction:', err)
      }
    }

  const handleTrackClick = async (track: Track) => {
    console.log(`Song clicked: "${track.name}" by ${track.artist} for mood: ${mood}`)
    console.log('Track details:', {
      id: track.id,
      name: track.name,
      artist: track.artist,
      album: track.album,
      mood,
      spotifyUrl: track.external_url
    })
    await trackInteraction(track)
    onSongClick(track.id)
  }

  if (loading)
    return (
      <div className="mood-music-container">
        <h2 className="mood-music-title">🎵 Music for your {mood} mood</h2>
        <div className="mood-music-loading">Loading music...</div>
      </div>
    )

  if (error)
    return (
      <div className="mood-music-container">
        <h2 className="mood-music-title">🎵 Music for your {mood} mood</h2>
        <div className="mood-music-error">{error}</div>
      </div>
    )

  return (
    <div className="mood-music-container">
      <h2 className="mood-music-title">🎵 Music for your {mood} mood</h2>
      <div className="mood-music-grid">
        {tracks.map((track) => (
          <div key={track.id} className="mood-music-card" onClick={() => handleTrackClick(track)}>
            <div className="mood-music-album-wrapper">
              <Image
                src={track.albumArt || '/images/music-placeholder.jpg'}
                alt={`${track.album} cover`}
                width={200}
                height={200}
                className="mood-music-album-art"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/music-placeholder.jpg'
                }}
              />
              <div className="mood-music-play-overlay">
                <div className="mood-music-play-button">▶</div>
              </div>
            </div>
            <div className="mood-music-info">
              <p className="mood-music-track-name">{track.name}</p>
              <p className="mood-music-artist">{track.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
