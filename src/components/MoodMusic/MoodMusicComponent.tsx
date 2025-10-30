'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import './MoodMusic.css'
import Fuse from 'fuse.js'

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
  query?: string
}

export default function MoodMusic({ mood, onSongClick, query = '' }: MoodMusicProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [visibleTracks, setVisibleTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fuse index + embedding cache
  const fuseRef = useRef<Fuse<Track> | null>(null)
  const trackEmbCache = useRef<Map<string, Float32Array>>(new Map())
  const moodVecRef = useRef<Float32Array | null>(null)
  const moodForVecRef = useRef<string | null>(null)

  // Control repeated runs
  const fetchingRef = useRef(false)

  // ---- USE loader (singleton per tab) ----
  const useModelPromiseRef = useRef<Promise<any> | null>(null)
  const loadUSE = async () => {
    if (!useModelPromiseRef.current) {
      useModelPromiseRef.current = (async () => {
        await import('@tensorflow/tfjs')
        const use = await import('@tensorflow-models/universal-sentence-encoder')
        return use.load()
      })()
    }
    return useModelPromiseRef.current
  }

  // Cosine & text builder for ranking
  const toText = (t: Track) => `${t.name || ''} | ${t.artist || ''} | ${t.album || ''}`

  const moodIntentTextFor = (m: string) => {
  switch ((m || '').toLowerCase()) {
    case 'sad':
      // keep the sad vibe, but nudge toward hopeful (you can tune this)
      return 'sad melancholy low valence emotional reflective heartbreak but hopeful uplifting vocals'
    case 'happy':
      return 'happy upbeat energetic feel good positive cheerful vocals'
    case 'anxious':
      return 'calming reassuring soothing safe grounding vocals'
    case 'calm':
      return 'calm peaceful relaxed mellow serene vocals'
    case 'energetic':
      return 'energetic high energy hype workout pump up vocals'
    case 'excited':
      return 'excited celebratory upbeat party anthems vocals'
    case 'tired':
      return 'low energy gentle soft relaxing unwind vocals'
    case 'grateful':
      return 'grateful thankful warm heartfelt uplifting vocals'
    default:
      return 'balanced contemporary popular vocals'
  }
}
  const getMoodVec = async (model: any, m: string) => {
  const key = (m || '').toLowerCase()
  if (!moodVecRef.current || moodForVecRef.current !== key) {
    const text = moodIntentTextFor(key)
    const t = await model.embed([text])
    const arr = await t.array() as number[][]
    moodVecRef.current = Float32Array.from(arr[0])
    moodForVecRef.current = key
  }
  return moodVecRef.current!
}

  const cosineSim = (a: Float32Array, b: Float32Array) => {
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < a.length; i++) { const x=a[i], y=b[i]; dot+=x*y; na+=x*x; nb+=y*y }
  const d = Math.sqrt(na * nb)
  return d ? dot / d : 0
}

  

  // ---- Fetch tracks whenever mood OR query changes (query changes bump candidate pool server-side) ----
  useEffect(() => {
    if (!mood) return
    fetchMusic()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, query])

  const fetchMusic = async () => {
    setLoading(true)
    setError(null)
    fetchingRef.current = true

    try {
      const normalizedMood = mood.toLowerCase()
      const url = `/api/recommendations/songs?mood=${normalizedMood}${query ? `&q=${encodeURIComponent(query)}` : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch music: ${response.status}`)

      const data = await response.json()
      const list: Track[] = data.tracks || []

      setTracks(list)
      setVisibleTracks(list.slice(0, 4)) // show 4 by default

      // Build/refresh Fuse index
      const options: Fuse.IFuseOptions<Track> = {
        keys: [
          { name: 'name', weight: 0.2 },
          { name: 'artist', weight: 0.3 },
          { name: 'album', weight: 0.2 },
        ],
        threshold: 0.5,
        distance: 100,
        ignoreLocation: true,
        findAllMatches: true,
        minMatchCharLength: 2,
      }
      fuseRef.current = new Fuse<Track>(list, options)

      // If a query exists, run search ONCE now that tracks & fuse are ready
      if (query) {
        await runSearch(query)
      }
    } catch (err) {
      console.error('Error fetching music:', err)
      setError('Failed to load music recommendations')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }



  // ---- Search pipeline (Fuse shortlist → USE re-rank) ----
  const runSearch = async (q: string) => {
    const qq = (q || '').trim()
    if (!qq) {
      setVisibleTracks(tracks.slice(0, 4))
      return
    }
    if (!fuseRef.current || tracks.length === 0) {
      // Not ready yet; fetchMusic will call us when ready.
      return
    }

    // 1) Fuse shortlist
    const raw = fuseRef.current.search(qq)
    let shortlist: Track[] = raw.slice(0, 30).map(r => r.item)

    // Fallback: if Fuse found nothing, let USE re-rank a bigger pool
    if (shortlist.length === 0) {
      shortlist = tracks.slice(0, Math.min(tracks.length, 50))
    }

    // 2) USE re-rank
    const model = await loadUSE()

    const qTensor = await model.embed([qq])
    const qArray = await qTensor.array() as number[][]
    const qEmb = Float32Array.from(qArray[0])
    const moodEmb = await getMoodVec(model, mood)

    // Embed items not yet cached
    const texts: string[] = []
    const toEmbedIdx: number[] = []
    shortlist.forEach((t, idx) => {
      if (!trackEmbCache.current.has(t.id)) {
        texts.push(toText(t))
        toEmbedIdx.push(idx)
      }
    })

    if (texts.length > 0) {
      const batchTensor = await model.embed(texts)
      const batch = await batchTensor.array() as number[][]
      batch.forEach((vec, i) => {
        const sIdx = toEmbedIdx[i]
        const tid = shortlist[sIdx].id
        trackEmbCache.current.set(tid, Float32Array.from(vec))
      })
    }

    const scored = shortlist.map(t => {
    const v = trackEmbCache.current.get(t.id)!
    const sQ = cosineSim(qEmb, v)      // semantic match to query
    const sM = cosineSim(moodEmb, v)   // semantic match to mood

    // If user typed sad-ish terms while mood is sad, lean strongly to mood
    const sadish = /heartbreak|breakup|melancholy|sad|lonely|blue|sorrow|grief/i.test(qq)

    // Weight for query (alpha). Default 0.6 (query-leaning).
    // If (mood === 'sad' && sadish), reduce alpha so mood dominates.
    let alpha = 0.6
    if ((mood || '').toLowerCase() === 'sad' && sadish) alpha = 0.3

    const score = alpha * sQ + (1 - alpha) * sM
    return { t, score }
  }).sort((a, b) => b.score - a.score)

  setVisibleTracks(scored.slice(0, 4).map(s => s.t)) // show top 4 after search
  }

  // Run search when query changes (single run; if fetching, fetchMusic will call runSearch)
  useEffect(() => {
    if (fetchingRef.current) return
    if (!query) {
      setVisibleTracks(tracks.slice(0, 4))
      return
    }
    if (!fuseRef.current || tracks.length === 0) return
    runSearch(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // ---- Interaction tracking ----
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
      console.log('Song click tracked in Database')
    } catch (err) {
      console.error('Error tracking interaction:', err)
    }
  }

  const handleTrackClick = async (track: Track) => {
    console.log(`Song clicked: "${track.name}" by ${track.artist} for mood: ${mood}`)
    await trackInteraction(track)
    onSongClick(track.id)
  }

  // ---- UI ----
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
        {visibleTracks.map((track) => (
          <div
            key={track.id}
            className="mood-music-card"
            onClick={() => handleTrackClick(track)}
          >
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
