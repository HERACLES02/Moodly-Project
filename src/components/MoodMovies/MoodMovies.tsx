"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import MiniSearch from "minisearch"

interface Movie {
  id: number
  title: string
  poster: string
  overview: string
  releaseDate: string
  rating: number
}

type MovieDoc = Movie & { [key: string]: unknown }

interface MoodMoviesProps {
  mood: string
  onMovieClick: (movieId: number) => void
  query?: string
}

const DEFAULT_SECTION_CONFIG: Record<string, { key: string; title: string }[]> =
  {
    happy: [
      { key: "mellow_dreams", title: "Mellow Dreams" },
      { key: "romanticism_galore", title: "Romanticism Galore" },
      { key: "laugh_out_loud", title: "Laugh Out Loud" },
    ],
    sad: [
      { key: "broken_hearts", title: "Broken Hearts" },
      { key: "hard_truths", title: "Life’s Hard Truths" },
      { key: "healing_through_pain", title: "Healing Through Pain" },
    ],
  }

export default function MoodMovies({
  mood,
  onMovieClick,
  query = "",
}: MoodMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [visibleMovies, setVisibleMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sectionRows, setSectionRows] = useState<
    { title: string; movies: Movie[] }[]
  >([])

  const miniRef = useRef<MiniSearch<MovieDoc> | null>(null)
  const movieEmbCache = useRef<Map<number, Float32Array>>(new Map())
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
        return "sad melancholy heartbreak sorrow grief emotional reflective cinema"
      case "happy":
        return "happy upbeat energetic positive cheerful feel-good comedy"
      case "anxious":
        return "calming soothing reassuring grounded peaceful cinema"
      case "calm":
        return "calm peaceful relaxed serene gentle cinema"
      case "energetic":
        return "energetic high energy intense action adventure exciting"
      case "excited":
        return "excited celebratory party fun thrilling adventurous"
      case "tired":
        return "gentle soft relaxing unwind cozy slow cinema"
      case "grateful":
        return "grateful thankful warm heartfelt inspiring wholesome"
      default:
        return "balanced contemporary popular cinema"
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

  const toText = (m: Movie) =>
    `${m.title || ""} | ${(m.overview || "").slice(0, 200)} | ${m.releaseDate || ""}`

  useEffect(() => {
    if (!mood) return
    fetchMovies()
  }, [mood, query])

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)
    fetchingRef.current = true
    try {
      const normalizedMood = mood.toLowerCase()
      if (!query && DEFAULT_SECTION_CONFIG[normalizedMood]) {
        const sections = DEFAULT_SECTION_CONFIG[normalizedMood]
        const rows = await Promise.all(
          sections.map(async (s) => {
            const u = `/api/recommendations/movies?mood=${normalizedMood}&section=${encodeURIComponent(s.key)}`
            const r = await fetch(u)
            if (!r.ok) throw new Error(`Failed to fetch movies (${s.key})`)
            const j = await r.json()
            return { title: s.title, movies: (j.movies || []).slice(0, 4) }
          }),
        )
        setSectionRows(rows)
        setMovies([])
        setVisibleMovies([])
        miniRef.current = null
        movieEmbCache.current.clear()
        return
      }

      setSectionRows([])
      const url = `/api/recommendations/movies?mood=${normalizedMood}${query ? `&q=${encodeURIComponent(query)}` : ""}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Status: ${response.status}`)
      const data = await response.json()
      const list: Movie[] = data.movies || []
      setMovies(list)
      setVisibleMovies(list.slice(0, 4))

      miniRef.current = new MiniSearch<MovieDoc>({
        fields: ["title", "overview"],
        storeFields: [
          "id",
          "title",
          "poster",
          "overview",
          "releaseDate",
          "rating",
        ],
        searchOptions: {
          boost: { title: 3, overview: 1 },
          fuzzy: 0.2,
          prefix: true,
        },
      })
      miniRef.current.addAll(list as unknown as MovieDoc[])
      if (query) await runSearch(query)
    } catch (err) {
      setError("Failed to load cinema recommendations")
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  const runSearch = async (q: string) => {
    const qq = (q || "").trim()
    if (qq.length < 2) {
      setVisibleMovies(movies.slice(0, 4))
      return
    }
    if (!miniRef.current || movies.length === 0) return
    const raw = miniRef.current.search(qq, { limit: 50 })
    let shortlist: Movie[] = raw.map((r) => r as unknown as Movie)
    if (shortlist.length === 0) shortlist = movies.slice(0, 60)

    const pipe = await loadMiniLM()
    const qOut = await pipe(qq, { pooling: "mean", normalize: true })
    const qEmb = Float32Array.from((qOut?.data ?? qOut?.[0]) as number[])
    const moodEmb = await getMoodVec(pipe, mood)

    for (const m of shortlist) {
      if (!movieEmbCache.current.has(m.id)) {
        const out = await pipe(toText(m), { pooling: "mean", normalize: true })
        movieEmbCache.current.set(
          m.id,
          Float32Array.from((out?.data ?? out?.[0]) as number[]),
        )
      }
    }

    const alpha = 0.7
    const scored = shortlist
      .map((m) => {
        const v = movieEmbCache.current.get(m.id)!
        return {
          m,
          score: alpha * cosine(qEmb, v) + (1 - alpha) * cosine(moodEmb, v),
        }
      })
      .sort((a, b) => b.score - a.score)
    setVisibleMovies(scored.slice(0, 4).map((s) => s.m))
  }

  const handleMovieClick = async (movie: Movie) => {
    try {
      await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "movie",
          itemId: movie.id,
          itemName: movie.title,
          mood,
        }),
      })
    } catch (e) {}
    onMovieClick(movie.id)
  }

  // --- UI COMPONENTS ---

  const MovieCard = ({ movie }: { movie: Movie }) => (
    <div
      className="group relative w-full max-w-[340px] h-28 flex items-center cursor-pointer overflow-hidden transition-all duration-300"
      onClick={() => handleMovieClick(movie)}
    >
      <div className="relative z-10 w-28 h-28 rounded-xl overflow-hidden shadow-xl theme-card-variant-1-no-hover p-0 border-none bg-[var(--background)]">
        <Image
          src={movie.poster || "/images/movie-placeholder.jpg"}
          alt={movie.title}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/40 transition-colors" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)]/90 backdrop-blur-sm flex items-center justify-center text-black shadow-lg">
            <span className="text-xs font-black">▶</span>
          </div>
        </div>
      </div>

      <div className="flex-1 ml-4 py-2 flex flex-col justify-center border-b border-transparent group-hover:border-[var(--accent)]/10 transition-colors">
        <h3 className="theme-text-foreground text-sm font-black tracking-tight leading-tight line-clamp-1 group-hover:theme-text-accent transition-colors">
          {movie.title}
        </h3>
        <p className="theme-text-accent text-[10px] font-bold uppercase tracking-widest mt-1 ">
          {movie.releaseDate?.split("-")[0]} • ⭐ {movie.rating.toFixed(1)}
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
      {/* Editorial Header - Matches Music perfectly */}
      <div className="relative mb-20">
        <h1 className="text-7xl md:text-8xl font-black tracking-tighter opacity-5 absolute -top-8 left-0 select-none uppercase pointer-events-none">
          Movies
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
                {row.movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
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
            {visibleMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
