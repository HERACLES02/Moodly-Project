"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import MiniSearch from "minisearch"
import { useRouter } from "next/navigation"
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

interface Album {
  id: string
  name: string
  artist: string
  albumArt: string
  external_url: string
}

type SectionItem = Track | Album

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
      { key: "sunlit_adventures", title: "Sunlit Adventures" },
      { key: "feel_good_classics", title: "Feel-Good Classics" },
    ],
    sad: [
      { key: "broken_hearts", title: "Broken Hearts" },
      { key: "hard_truths", title: "Life's Hard Truths" },
      { key: "healing_through_pain", title: "Healing Through Pain" },
      { key: "lonely_nights", title: "Lonely Nights" },
      { key: "bittersweet_memories", title: "Bittersweet Memories" },
    ],
  }

// Album section titles per mood
const ALBUM_SECTION_TITLES: Record<string, string> = {
  happy: "Feel-Good Albums",
  sad: "Melancholic Albums",
  anxious: "Calming Albums",
  calm: "Peaceful Albums",
  energetic: "High-Energy Albums",
  excited: "Party Albums",
  tired: "Cozy Albums",
  grateful: "Heartfelt Albums",
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const cosine = (a: number[], b: number[]) => {
  let dot = 0,
    na = 0,
    nb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  const d = Math.sqrt(na * nb)
  return d ? dot / d : 0
}

const toTrackText = (t: Track) =>
  `${t.name || ""} | ${t.artist || ""} | ${t.album || ""}`

const toAlbumText = (a: Album) => `${a.name || ""} | ${a.artist || ""}`

export default function MoodMusic({
  mood,
  onSongClick,
  query = "",
}: MoodMusicProps) {
  const router = useRouter()
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [visibleTracks, setVisibleTracks] = useState<Track[]>([])
  const [visibleAlbums, setVisibleAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sectionRows, setSectionRows] = useState<
    { title: string; items: SectionItem[]; type: "track" | "album" }[]
  >([])
  const [searchingEmbeddings, setSearchingEmbeddings] = useState(false)

  const miniTrackRef = useRef<MiniSearch<Track> | null>(null)
  const miniAlbumRef = useRef<MiniSearch<Album> | null>(null)
  const trackEmbCache = useRef<Map<string, number[]>>(new Map())
  const albumEmbCache = useRef<Map<string, number[]>>(new Map())
  const fetchingRef = useRef(false)

  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    if (!mood) return
    fetchMusic()
  }, [mood, debouncedQuery])

  const fetchMusic = async () => {
    setLoading(true)
    setError(null)
    fetchingRef.current = true
    try {
      const normalizedMood = mood.toLowerCase()

      // ✅ EFFICIENT: Default mode - randomly select 2 track sections + fetch albums
      if (!debouncedQuery && DEFAULT_SECTION_CONFIG[normalizedMood]) {
        const trackSections = DEFAULT_SECTION_CONFIG[normalizedMood]

        // Randomly select 2 track sections from 5
        const shuffledSections = [...trackSections].sort(
          () => Math.random() - 0.5,
        )
        const selectedTrackSections = shuffledSections.slice(0, 2)

        // Fetch ONLY the 2 selected track sections + albums in parallel (efficient!)
        const [trackRows, albumData] = await Promise.all([
          Promise.all(
            selectedTrackSections.map(async (s) => {
              const u = `/api/recommendations/songs?mood=${normalizedMood}&section=${encodeURIComponent(s.key)}`
              const r = await fetch(u)
              if (!r.ok)
                throw new Error(
                  `Failed to fetch tracks (${s.key}): ${r.status}`,
                )
              const j = await r.json()
              const list: Track[] = j.tracks || []
              return {
                title: s.title,
                items: list.slice(0, 6),
                type: "track" as const,
              }
            }),
          ),
          (async () => {
            const albumUrl = `/api/recommendations/songs?mood=${normalizedMood}&kind=album`
            const albumRes = await fetch(albumUrl)
            if (!albumRes.ok) throw new Error("Failed to fetch albums")
            return albumRes.json()
          })(),
        ])

        const albumList: Album[] = albumData.albums || []
        const albumRow = {
          title: ALBUM_SECTION_TITLES[normalizedMood] || "Albums for You",
          items: albumList.slice(0, 6),
          type: "album" as const,
        }

        // Combine: 2 track sections + 1 album section (total 3)
        setSectionRows([...trackRows, albumRow])

        // Clear single-row/search state
        setTracks([])
        setAlbums([])
        setVisibleTracks([])
        setVisibleAlbums([])
        miniTrackRef.current = null
        miniAlbumRef.current = null
        trackEmbCache.current.clear()
        albumEmbCache.current.clear()

        return
      }

      // Search mode
      setSectionRows([])

      // Fetch tracks
      const trackUrl = `/api/recommendations/songs?mood=${normalizedMood}${debouncedQuery ? `&q=${encodeURIComponent(debouncedQuery)}` : ""}`
      const trackResponse = await fetch(trackUrl)
      if (!trackResponse.ok)
        throw new Error(`Failed to fetch tracks: ${trackResponse.status}`)
      const trackData = await trackResponse.json()
      const trackList: Track[] = trackData.tracks || []
      setTracks(trackList)
      setVisibleTracks(!debouncedQuery ? trackList.slice(0, 6) : trackList)

      // Fetch albums
      const albumUrl = `/api/recommendations/songs?mood=${normalizedMood}&kind=album${debouncedQuery ? `&q=${encodeURIComponent(debouncedQuery)}` : ""}`
      const albumResponse = await fetch(albumUrl)
      if (!albumResponse.ok)
        throw new Error(`Failed to fetch albums: ${albumResponse.status}`)
      const albumData = await albumResponse.json()
      const albumList: Album[] = albumData.albums || []
      setAlbums(albumList)
      setVisibleAlbums(!debouncedQuery ? albumList.slice(0, 6) : albumList)

      // Build MiniSearch indexes
      miniTrackRef.current = new MiniSearch<Track>({
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
      miniTrackRef.current.addAll(trackList)

      miniAlbumRef.current = new MiniSearch<Album>({
        fields: ["name", "artist"],
        storeFields: ["id", "name", "artist", "albumArt", "external_url"],
        searchOptions: {
          boost: { name: 3, artist: 2 },
          fuzzy: 0.2,
          prefix: true,
        },
      })
      miniAlbumRef.current.addAll(albumList)

      if (debouncedQuery) await runSearch(debouncedQuery)
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
      setVisibleTracks(tracks.slice(0, 6))
      setVisibleAlbums(albums.slice(0, 6))
      return
    }

    // Search tracks
    if (miniTrackRef.current && tracks.length > 0) {
      const rawTracks = miniTrackRef.current.search(qq)
      let trackShortlist: Track[] = rawTracks.map((r) => r as unknown as Track)
      if (trackShortlist.length === 0) trackShortlist = tracks.slice(0, 60)

      setSearchingEmbeddings(true)
      try {
        const tracksToEmbed = trackShortlist
          .filter((t) => !trackEmbCache.current.has(t.id))
          .map((t) => toTrackText(t))

        if (tracksToEmbed.length > 0) {
          const response = await fetch("/api/embeddings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: tracksToEmbed,
              mood: mood,
              queryText: qq,
            }),
          })

          if (response.ok) {
            const { embeddings, moodEmbedding, queryEmbedding } =
              await response.json()

            let idx = 0
            for (const t of trackShortlist) {
              if (!trackEmbCache.current.has(t.id)) {
                trackEmbCache.current.set(t.id, embeddings[idx])
                idx++
              }
            }

            const m = (mood || "").toLowerCase()
            let alpha = 0.6
            if (m === "happy") alpha = 0.65
            if (m === "sad") alpha = 0.35

            const scored = trackShortlist
              .map((t) => {
                const v = trackEmbCache.current.get(t.id)!
                return {
                  t,
                  score:
                    alpha * cosine(queryEmbedding, v) +
                    (1 - alpha) * cosine(moodEmbedding, v),
                }
              })
              .sort((a, b) => b.score - a.score)

            setVisibleTracks(scored.map((s) => s.t))
          } else {
            setVisibleTracks(trackShortlist)
          }
        } else {
          const response = await fetch("/api/embeddings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: [],
              mood: mood,
              queryText: qq,
            }),
          })

          if (response.ok) {
            const { moodEmbedding, queryEmbedding } = await response.json()

            const m = (mood || "").toLowerCase()
            let alpha = 0.6
            if (m === "happy") alpha = 0.65
            if (m === "sad") alpha = 0.35

            const scored = trackShortlist
              .map((t) => {
                const v = trackEmbCache.current.get(t.id)!
                return {
                  t,
                  score:
                    alpha * cosine(queryEmbedding, v) +
                    (1 - alpha) * cosine(moodEmbedding, v),
                }
              })
              .sort((a, b) => b.score - a.score)

            setVisibleTracks(scored.map((s) => s.t))
          }
        }
      } catch (error) {
        console.error("Track search error:", error)
        setVisibleTracks(trackShortlist)
      }
    }

    // Search albums
    if (miniAlbumRef.current && albums.length > 0) {
      const rawAlbums = miniAlbumRef.current.search(qq)
      let albumShortlist: Album[] = rawAlbums.map((r) => r as unknown as Album)
      if (albumShortlist.length === 0) albumShortlist = albums.slice(0, 60)

      try {
        const albumsToEmbed = albumShortlist
          .filter((a) => !albumEmbCache.current.has(a.id))
          .map((a) => toAlbumText(a))

        if (albumsToEmbed.length > 0) {
          const response = await fetch("/api/embeddings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: albumsToEmbed,
              mood: mood,
              queryText: qq,
            }),
          })

          if (response.ok) {
            const { embeddings, moodEmbedding, queryEmbedding } =
              await response.json()

            let idx = 0
            for (const a of albumShortlist) {
              if (!albumEmbCache.current.has(a.id)) {
                albumEmbCache.current.set(a.id, embeddings[idx])
                idx++
              }
            }

            const m = (mood || "").toLowerCase()
            let alpha = 0.6
            if (m === "happy") alpha = 0.65
            if (m === "sad") alpha = 0.35

            const scored = albumShortlist
              .map((a) => {
                const v = albumEmbCache.current.get(a.id)!
                return {
                  a,
                  score:
                    alpha * cosine(queryEmbedding, v) +
                    (1 - alpha) * cosine(moodEmbedding, v),
                }
              })
              .sort((a, b) => b.score - a.score)

            setVisibleAlbums(scored.map((s) => s.a))
          } else {
            setVisibleAlbums(albumShortlist)
          }
        } else {
          const response = await fetch("/api/embeddings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              texts: [],
              mood: mood,
              queryText: qq,
            }),
          })

          if (response.ok) {
            const { moodEmbedding, queryEmbedding } = await response.json()

            const m = (mood || "").toLowerCase()
            let alpha = 0.6
            if (m === "happy") alpha = 0.65
            if (m === "sad") alpha = 0.35

            const scored = albumShortlist
              .map((a) => {
                const v = albumEmbCache.current.get(a.id)!
                return {
                  a,
                  score:
                    alpha * cosine(queryEmbedding, v) +
                    (1 - alpha) * cosine(moodEmbedding, v),
                }
              })
              .sort((a, b) => b.score - a.score)

            setVisibleAlbums(scored.map((s) => s.a))
          }
        }
      } catch (error) {
        console.error("Album search error:", error)
        setVisibleAlbums(albumShortlist)
      } finally {
        setSearchingEmbeddings(false)
      }
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
      console.error("Interaction error:", err)
    }
  }

  const handleTrackClick = async (track: Track) => {
    await trackInteraction(track)
    onSongClick(track.id)
  }

  const handleAlbumClick = (album: Album) => {
    // Navigate to our custom album listen page instead of opening Spotify
    router.push(`/album/listen/${album.id}`)
  }

  // UI Components
  const ItemCard = ({
    item,
    type,
  }: {
    item: SectionItem
    type: "track" | "album"
  }) => (
    <div
      className="group relative w-full flex items-center cursor-pointer overflow-hidden transition-all duration-300 bg-white/5 hover:bg-white/10 rounded-2xl pr-4"
      onClick={() =>
        type === "track"
          ? handleTrackClick(item as Track)
          : handleAlbumClick(item as Album)
      }
    >
      <div className="relative z-10 w-56 h-56 flex-shrink-0 rounded-xl overflow-hidden shadow-xl theme-card-variant-1-no-hover p-0 border-none bg-[var(--background)]">
        <Image
          src={item.albumArt || "/images/music-placeholder.jpg"}
          alt={item.name}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)]/90 backdrop-blur-sm flex items-center justify-center text-black shadow-lg">
            <span className="text-xs "><Play/></span>
          </div>
        </div>
      </div>

      <div className="flex-1 ml-4 py-2 flex flex-col justify-center border-b border-transparent group-hover:border-[var(--accent)]/10 transition-colors">
        <h3 className="theme-text-foreground text-xl flex flex-wrap font-black tracking-tight leading-tight line-clamp-1 group-hover:theme-text-accent transition-colors">
          {item.name}
        </h3>
        <p className="theme-text-accent text-md font-bold  mt-1">
          {item.artist}
        </p>

        <div className="flex items-end gap-0.5 h-4 mt-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          {[0.4, 0.9, 0.6, 1.1, 0.5, 0.8].map((h, i) => (
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
        {searchingEmbeddings && (
          <p className="text-xs opacity-60">Analyzing mood relevance...</p>
        )}
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
      <div className="relative mb-20">

        <div className="relative z-10 pt-4">
          <span className="theme-text-accent text-[10px] font-black uppercase tracking-[0.6em] block mb-2">
            <br />
          </span>
          <h2 className="theme-text-foreground text-4xl font-black tracking-tight">
            Recommendations
          </h2>
        </div>
      </div>

      {!debouncedQuery && sectionRows.length > 0 ? (
        <div className="space-y-20">
          {sectionRows.map((row, idx) => (
            <section key={`${row.title}-${idx}`} className="w-full">
              <SectionHeader title={row.title} />
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
                {row.items.map((item) => (
                  <ItemCard key={item.id} item={item} type={row.type} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <>
          <section className="w-full mb-20">
            <SectionHeader
              title={
                debouncedQuery
                  ? `Track Results: ${debouncedQuery}`
                  : "Top Tracks For You"
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              {visibleTracks.map((track) => (
                <ItemCard key={track.id} item={track} type="track" />
              ))}
            </div>
          </section>

          <section className="w-full">
            <SectionHeader
              title={
                debouncedQuery
                  ? `Album Results: ${debouncedQuery}`
                  : ALBUM_SECTION_TITLES[mood.toLowerCase()] || "Albums For You"
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              {visibleAlbums.map((album) => (
                <ItemCard key={album.id} item={album} type="album" />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
