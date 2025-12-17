"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import MiniSearch from "minisearch"

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
  onSongClick: (songId: string) => void
  query?: string
}

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

export default function MoodMusic({
  mood,
  onSongClick,
  query = "",
}: MoodMusicProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [visibleTracks, setVisibleTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sectionRows, setSectionRows] = useState<
    { title: string; tracks: Track[] }[]
  >([])

  const miniRef = useRef<MiniSearch<Track> | null>(null)
  const trackEmbCache = useRef<Map<string, Float32Array>>(new Map())
  const fetchingRef = useRef(false)
  const modelRef = useRef<any | null>(null)
  const loadingModelRef = useRef<Promise<any> | null>(null)
  const moodVecRef = useRef<Float32Array | null>(null)
  const moodForVecRef = useRef<string | null>(null)

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

  useEffect(() => {
    if (!mood) return
    fetchMusic()
  }, [mood, query])

  const fetchMusic = async () => {
    setLoading(true)
    setError(null)
    fetchingRef.current = true
    try {
      const normalizedMood = mood.toLowerCase()
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
        setTracks([])
        setVisibleTracks([])
        miniRef.current = null
        trackEmbCache.current.clear()
        return
      }

      setSectionRows([])
      const url = `/api/recommendations/songs?mood=${normalizedMood}${query ? `&q=${encodeURIComponent(query)}` : ""}`
      const response = await fetch(url)
      if (!response.ok)
        throw new Error(`Failed to fetch music: ${response.status}`)
      const data = await response.json()
      const list: Track[] = data.tracks || []
      setTracks(list)
      setVisibleTracks(!query ? list.slice(0, 4) : list)

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
      if (query) await runSearch(query)
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
      setVisibleTracks(tracks)
      return
    }
    if (!miniRef.current || tracks.length === 0) return
    const raw = miniRef.current.search(qq, { limit: 50 })
    let shortlist: Track[] = raw.map((r) => r as unknown as Track)
    if (shortlist.length === 0) shortlist = tracks.slice(0, 60)
    const pipe = await loadMiniLM()
    const qOut = await pipe(qq, { pooling: "mean", normalize: true })
    const qEmb = Float32Array.from((qOut?.data ?? qOut?.[0]) as number[])
    const moodEmb = await getMoodVec(pipe, mood)
    const toEmbed: { id: string; text: string }[] = []
    shortlist.forEach((t) => {
      if (!trackEmbCache.current.has(t.id))
        toEmbed.push({ id: t.id, text: toText(t) })
    })
    for (const it of toEmbed) {
      const out = await pipe(it.text, { pooling: "mean", normalize: true })
      const emb = Float32Array.from((out?.data ?? out?.[0]) as number[])
      trackEmbCache.current.set(it.id, emb)
    }
    const m = (mood || "").toLowerCase()
    let alpha = 0.6
    if (m === "happy") alpha = 0.65
    if (m === "sad") alpha = 0.35
    const scored = shortlist
      .map((t) => {
        const v = trackEmbCache.current.get(t.id)!
        return {
          t,
          score: alpha * cosine(qEmb, v) + (1 - alpha) * cosine(moodEmb, v),
        }
      })
      .sort((a, b) => b.score - a.score)
    setVisibleTracks(scored.map((s) => s.t))
  }

  useEffect(() => {
    if (fetchingRef.current) return
    if (!query) {
      setVisibleTracks(tracks.slice(0, 4))
      return
    }
    if (!miniRef.current || tracks.length === 0) return
    runSearch(query)
  }, [query])

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
      console.error("Interaction error:", err)
    }
  }

  const handleTrackClick = async (track: Track) => {
    await trackInteraction(track)
    onSongClick(track.id)
  }

  // --- UI COMPONENTS ---

  const SongCard = ({ track }: { track: Track }) => (
    <div
      className="group relative w-full max-w-[340px] h-28 flex items-center cursor-pointer overflow-hidden transition-all duration-300"
      onClick={() => handleTrackClick(track)}
    >
      {/* 🖼️ Album Jacket - Minimal & Static position */}
      <div className="relative z-10 w-28 h-28 rounded-xl overflow-hidden shadow-xl theme-card-variant-1-no-hover p-0 border-none bg-[var(--background)]">
        <Image
          src={track.albumArt || "/images/music-placeholder.jpg"}
          alt={track.name}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/images/music-placeholder.jpg"
          }}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors" />

        {/* Simple Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)]/90 backdrop-blur-sm flex items-center justify-center text-black shadow-lg">
            <span className="text-lg ml-0.5">▶</span>
          </div>
        </div>
      </div>

      {/* 🎵 Track Details */}
      <div className="flex-1 ml-4 py-2 flex flex-col justify-center border-b border-transparent group-hover:border-[var(--accent)]/10 transition-colors">
        <h3 className="theme-text-foreground text-sm font-black tracking-tight leading-tight line-clamp-1 group-hover:theme-text-accent transition-colors">
          {track.name}
        </h3>
        <p className="theme-text-muted text-[10px] font-bold uppercase tracking-widest mt-1 opacity-70">
          {track.artist}
        </p>

        {/* 📊 Hover-Only Visualizer */}
        <div className="flex items-end gap-0.5 h-4 mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          {[0.6, 1.0, 0.7, 1.2, 0.5, 0.9].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-[var(--accent)] rounded-full"
              style={{
                height: `${h * 100}%`,
                animation: `bar-bounce 0.8s ease-in-out infinite alternate ${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes bar-bounce {
          0% {
            transform: scaleY(0.3);
            opacity: 0.4;
          }
          100% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-1.5 h-6 bg-[var(--accent)] rounded-full " />
      <h2 className="theme-text-foreground text-xl font-black uppercase tracking-tighter italic">
        {title}
      </h2>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--glass-border)] to-transparent opacity-20" />
    </div>
  )

  if (loading)
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-[var(--accent)] animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    )

  if (error)
    return (
      <div className="w-full py-20 text-center">
        <p className="theme-text-accent font-bold uppercase tracking-widest">
          {error}
        </p>
      </div>
    )

  return (
    <div className="w-full py-10 px-4 md:px-8">
      {/* Editorial Header */}
      <div className="relative mb-20">
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter opacity-5 absolute -top-8 left-0 select-none uppercase pointer-events-none">
          Music
        </h1>
        <div className="relative z-10 pt-4">
          <span className="theme-text-accent text-[10px] font-black uppercase tracking-[0.6em] block mb-2">
            <br />
          </span>
          <h2 className="theme-text-foreground text-4xl font-black tracking-tight">
            Recommendations
          </h2>
        </div>
      </div>

      {!query && sectionRows.length > 0 ? (
        <div className="space-y-20">
          {sectionRows.map((row) => (
            <section key={row.title} className="w-full">
              <SectionHeader title={row.title} />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                {row.tracks.map((track) => (
                  <SongCard key={track.id} track={track} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <section className="w-full">
          <SectionHeader
            title={query ? `Search Results: ${query}` : "Top Picks For You"}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            {visibleTracks.map((track) => (
              <SongCard key={track.id} track={track} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
