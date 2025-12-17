"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import "./MoodMusic.css"
import MiniSearch from "minisearch"
import { Spinner } from "../ui/spinner"

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
  onSongClick?: (songId: string) => void
  loading: boolean
  query?: string // AI search query
}

// ✅ NEW: section config for default (no-search) rows
const DEFAULT_SECTION_CONFIG: Record<string, { key: string; title: string }[]> =
  {
    happy: [
      { key: "mellow_dreams", title: "Mellow Dreams" },
      { key: "romanticism_galore", title: "Romanticism Galore" },
      { key: "dancefloor_joy", title: "Dancefloor Joy" },
    ],
    sad: [
      { key: "broken_hearts", title: "Broken Hearts" },
      { key: "hard_truths", title: "Life’s Hard Truths" },
      { key: "healing_through_pain", title: "Healing Through Pain" },
    ],
  }

// ✅ NEW: section config for default (no-search) rows

export default function MoodMusic({
  tracks,
  mood,
  onSongClick,
  loading,
  query = "",
}: MoodMusicProps) {
  const [visibleTracks, setVisibleTracks] = useState<Track[]>([])
  const [error, setError] = useState<string | null>(null)

  // ✅ NEW: holds the 3 rows for default mode
  const [sectionRows, setSectionRows] = useState<
    { title: string; tracks: Track[] }[]
  >([])

  // --- Search infra ---
  const miniRef = useRef<MiniSearch<Track> | null>(null)
  const trackEmbCache = useRef<Map<string, Float32Array>>(new Map())

  // Xenova MiniLM loader (singleton)
  const modelRef = useRef<any | null>(null)
  const loadingModelRef = useRef<Promise<any> | null>(null)

  const loadMiniLM = async () => {
    if (modelRef.current) return modelRef.current
    if (!loadingModelRef.current) {
      loadingModelRef.current = (async () => {
        const { pipeline } = await import("@xenova/transformers")
        const pipe = await pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2",
        )
        modelRef.current = pipe
        return pipe
      })()
    }
    return loadingModelRef.current
  }

  // Mood intent helpers
  const moodVecRef = useRef<Float32Array | null>(null)
  const moodForVecRef = useRef<string | null>(null)

  const moodIntentTextFor = (m: string) => {
    switch ((m || "").toLowerCase()) {
      case "sad":
        return "sad melancholy heartbreak sorrow low valence emotional reflective vocals"
      case "happy":
        return "happy upbeat energetic positive cheerful vocals"
      case "anxious":
        return "calming soothing reassuring grounded vocals"
      case "calm":
        return "calm peaceful relaxed serene vocals"
      case "energetic":
        return "energetic high energy hype intense vocals"
      case "excited":
        return "excited celebratory party anthems vocals"
      case "tired":
        return "gentle soft relaxing unwind low energy vocals"
      case "grateful":
        return "grateful thankful warm heartfelt vocals"
      default:
        return "balanced contemporary popular vocals"
    }
  }

  const getMoodVec = async (pipe: any, m: string) => {
    const key = (m || "").toLowerCase()
    if (!moodVecRef.current || moodForVecRef.current !== key) {
      const out = await pipe(moodIntentTextFor(key), {
        pooling: "mean",
        normalize: true,
      })
      const vec = (out?.data ?? out?.[0]) as number[] | Float32Array
      moodVecRef.current = Float32Array.from(vec as number[])
      moodForVecRef.current = key
    }
    return moodVecRef.current!
  }

  const cosine = (a: Float32Array, b: Float32Array) => {
    let dot = 0,
      na = 0,
      nb = 0
    for (let i = 0; i < a.length; i++) {
      const x = a[i],
        y = b[i]
      dot += x * y
      na += x * x
      nb += y * y
    }
    const d = Math.sqrt(na * nb)
    return d ? dot / d : 0
  }

  const toText = (t: Track) =>
    `${t.name || ""} | ${t.artist || ""} | ${t.album || ""}`

  // Initialize MiniSearch when tracks change
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

      // ✅ NEW: default rows mode (no query) for moods with sections
      if (!query && DEFAULT_SECTION_CONFIG[normalizedMood]) {
        const sections = DEFAULT_SECTION_CONFIG[normalizedMood]

        const rows = await Promise.all(
          sections.map(async (s) => {
            const u = `/api/recommendations/songs?mood=${normalizedMood}&section=${encodeURIComponent(s.key)}`
            const r = await fetch(u)
            if (!r.ok)
              throw new Error(`Failed to fetch music (${s.key}): ${r.status}`)
            const j = await r.json()
            const list: Track[] = j.tracks || []
            return { title: s.title, tracks: list.slice(0, 4) }
          }),
        )

        setSectionRows(rows)

        // clear single-row/search state
        setTracks([])
        setVisibleTracks([])
        miniRef.current = null
        trackEmbCache.current.clear()

        return
      }

      // ✅ NEW: clear section rows when searching (or mood has no sections)
      setSectionRows([])

      const url = `/api/recommendations/songs?mood=${normalizedMood}${query ? `&q=${encodeURIComponent(query)}` : ""}`
      const response = await fetch(url)
      if (!response.ok)
        throw new Error(`Failed to fetch music: ${response.status}`)

      const data = await response.json()
      const list: Track[] = data.tracks || []
      setTracks(list)
      setVisibleTracks(list.slice(0, 4))

      // Build MiniSearch index
      miniRef.current = new MiniSearch<Track>({
        fields: ["name", "artist", "album"],
        storeFields: [
          "id",
          "name",
          "artist",
          "album",
          "albumArt",
          "preview_url",
          "external_url",
        ],
        searchOptions: {
          boost: { name: 3, artist: 2, album: 1 },
          fuzzy: 0.2,
          prefix: true,
        },
      })
      miniRef.current.addAll(list)

      // If there's a query, run a single search now
      if (query) {
        await runSearch(query)
      }
    } catch (err) {
      console.error("Error fetching music:", err)
      setError("Failed to load music recommendations")
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  const runSearch = async (q: string) => {
    const qq = (q || "").trim()
    if (qq.length < 2) {
      setVisibleTracks(tracks.slice(0, 4))
      return
    }
    if (!miniRef.current || tracks.length === 0) return

    try {
      // 1) MiniSearch shortlist (BM25)
      const raw = miniRef.current.search(qq, { limit: 50 })
      let shortlist: Track[] = raw.map((r) => r as unknown as Track)

      if (shortlist.length === 0) {
        shortlist = tracks.slice(0, Math.min(tracks.length, 60))
      }

      // 2) Semantic re-rank with MiniLM
      const pipe = await loadMiniLM()
      const qOut = await pipe(qq, { pooling: "mean", normalize: true })
      const qEmb = Float32Array.from((qOut?.data ?? qOut?.[0]) as number[])

      const moodEmb = await getMoodVec(pipe, mood)

      // Embed shortlisted items not cached
      const toEmbed: { id: string; text: string }[] = []
      shortlist.forEach((t) => {
        if (!trackEmbCache.current.has(t.id)) {
          toEmbed.push({ id: t.id, text: toText(t) })
        }
      })
      for (const it of toEmbed) {
        const out = await pipe(it.text, { pooling: "mean", normalize: true })
        const emb = Float32Array.from((out?.data ?? out?.[0]) as number[])
        trackEmbCache.current.set(it.id, emb)
      }

      // Weighted blend (query + mood). Lean more to mood for sad + sad-ish queries.
      const sadish =
        /heartbreak|breakup|melancholy|sad|lonely|blue|sorrow|grief/i.test(qq)
      const m = (mood || "").toLowerCase()
      let alpha = 0.6

      if (m === "happy") alpha = 0.65
      if (m === "sad") alpha = 0.35

      const scored = shortlist
        .map((t) => {
          const v = trackEmbCache.current.get(t.id)!
          const sQ = cosine(qEmb, v)
          const sM = cosine(moodEmb, v)
          return { t, score: alpha * sQ + (1 - alpha) * sM }
        })
        .sort((a, b) => b.score - a.score)

      setVisibleTracks(scored.slice(0, 4).map((s) => s.t))
    } catch (err) {
      console.error("Search error:", err)
      setVisibleTracks(tracks.slice(0, 4))
    }
  }

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
    onSongClick?.(track.id)
  }

  if (error) {
    return (
      <div className="mood-music-container">
        <div className="carousel-box">
          <div className="carousel-error">{error}</div>
          <span className="carousel-label">Music</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mood-music-container">
      <h2 className="mood-music-title">🎵 Music for your {mood} mood</h2>

      {/* ✅ NEW: render 3 rows in default mode */}
      {!query && sectionRows.length > 0 ? (
        <div className="space-y-6">
          {sectionRows.map((row) => (
            <div key={row.title}>
              <h3 className="text-base font-semibold mb-3">{row.title}</h3>

              <div className="mood-music-grid">
                {row.tracks.map((track) => (
                  <div
                    key={track.id}
                    className="mood-music-card"
                    onClick={() => handleTrackClick(track)}
                  >
                    <div className="mood-music-album-wrapper">
                      <Image
                        src={track.albumArt || "/images/music-placeholder.jpg"}
                        alt={`${track.album} cover`}
                        width={200}
                        height={200}
                        className="mood-music-album-art"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/images/music-placeholder.jpg"
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
          ))}
        </div>
      ) : (
        <div className="mood-music-grid">
          {visibleTracks.map((track) => (
            <div
              key={track.id}
              className="mood-music-card"
              onClick={() => handleTrackClick(track)}
            >
              <div className="mood-music-album-wrapper">
                <Image
                  src={track.albumArt || "/images/music-placeholder.jpg"}
                  alt={`${track.album} cover`}
                  width={200}
                  height={200}
                  className="mood-music-album-art"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/images/music-placeholder.jpg"
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
      )}
    </div>
  )
}
