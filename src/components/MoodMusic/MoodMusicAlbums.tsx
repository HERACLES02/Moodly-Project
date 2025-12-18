'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import './MoodMusic.css'

interface AlbumRec {
  id: string
  name: string
  artist: string
  albumArt: string
  external_url: string
}

export default function MoodMusicAlbums({ mood }: { mood: string }) {
  const [albums, setAlbums] = useState<AlbumRec[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!mood) return

    const run = async () => {
      setLoading(true)
      try {
        const normalizedMood = mood.toLowerCase()
        const res = await fetch(
          `/api/recommendations/songs?mood=${normalizedMood}&kind=album`,
          { cache: 'no-store' }
        )

        if (!res.ok) {
          setAlbums([])
          return
        }

        const json = await res.json()
        setAlbums((json.albums || []).slice(0, 4))
      } catch {
        setAlbums([])
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [mood])

  if (loading && albums.length === 0) return null
  if (albums.length === 0) return null

  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold mb-3">💿 Albums for your {mood} mood</h3>

      <div className="mood-music-grid">
        {albums.map((album) => (
          <div
            key={album.id}
            className="mood-music-card"
            onClick={() => album.external_url && window.open(album.external_url, '_blank')}
          >
            <div className="mood-music-album-wrapper">
              <Image
                src={album.albumArt || '/images/music-placeholder.jpg'}
                alt={`${album.name} cover`}
                width={200}
                height={200}
                className="mood-music-album-art"
              />
            </div>

            <div className="mood-music-info">
              <p className="mood-music-track-name">{album.name}</p>
              <p className="mood-music-artist">{album.artist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
