"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import "./MoodMovies.css"
import { Spinner } from "../ui/spinner"
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
  const [sectionRows, setSectionRows] = useState<
    { title: string; movies: Movie[] }[]
  >([]) // NEW
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search infra
  const miniRef = useRef<MiniSearch<MovieDoc> | null>(null)
  const movieEmbCache = useRef<Map<number, Float32Array>>(new Map())
  const movieByIdRef = useRef<Map<number, Movie>>(new Map())
  const fetchingRef = useRef(false)

  // Lazy MiniLM loader (singleton per tab)
  const transformerRef = useRef<any | null>(null)
  const transformerPromiseRef = useRef<Promise<any> | null>(null)

  const loadMiniLM = async () => {
    if (transformerRef.current) return transformerRef.current
    if (!transformerPromiseRef.current) {
      transformerPromiseRef.current = (async () => {
        const { pipeline } = await import("@xenova/transformers")
        const pipe = await pipeline(
          "feature-extraction",
          "Xenova/all-MiniLM-L6-v2",
        )
        transformerRef.current = pipe
        return pipe
      })()
    }
    return transformerPromiseRef.current
  }

  const embeddingOptions = { pooling: "mean", normalize: true } as const

  const embedText = async (pipe: any, text: string) => {
    const output = await pipe(text, embeddingOptions)
    return toEmbedding(output)
  }

  const toEmbedding = (output: any): Float32Array => {
    if (!output) return new Float32Array()
    const data = output.data ?? output
    if (data instanceof Float32Array) return data
    if (ArrayBuffer.isView(data))
      return Float32Array.from(data as ArrayLike<number>)
    if (Array.isArray(data)) {
      const first = data[0]
      if (Array.isArray(first) || ArrayBuffer.isView(first)) {
        const arr = ArrayBuffer.isView(first)
          ? Array.from(first as Float32Array)
          : (first as number[])
        return Float32Array.from(arr)
      }
      return Float32Array.from(data as number[])
    }
    return new Float32Array()
  }

  const toText = (m: Movie) =>
    `${m.title || ""} | ${(m.overview || "").slice(0, 500)} | ${m.releaseDate || ""}`

  const cosineSim = (a: Float32Array, b: Float32Array) => {
    let dot = 0,
      na = 0,
      nb = 0
    const len = Math.min(a.length, b.length)
    for (let i = 0; i < len; i++) {
      const x = a[i]
      const y = b[i]
      dot += x * y
      na += x * x
      nb += y * y
    }
    const d = Math.sqrt(na * nb)
    return d ? dot / d : 0
  }

  // -------- Mood intent vector (for semantic mood bias) --------
  const moodVecRef = useRef<Record<string, Float32Array | null>>({})
  const moodForVecRef = useRef<Record<string, string | null>>({})

  const moodIntentTextFor = (m: string, variant: "default" | "search") => {
    const key = (m || "").toLowerCase()

    if (variant === "default") {
      switch (key) {
        case "sad":
          return "sad melancholy melancholic heartbreak grief loss sorrow emotional cathartic tragic tearjerker somber film cinema"
        case "happy":
          return "happy upbeat positive feel good fun lighthearted musical film cinema"
        case "anxious":
          return "calming reassuring soothing safe grounded comforting film cinema"
        case "calm":
          return "calm peaceful relaxed serene gentle film cinema"
        case "energetic":
          return "energetic intense high energy action exciting film cinema"
        case "excited":
          return "excited celebratory adventurous thrilling film cinema"
        case "tired":
          return "gentle slow relaxing low energy cozy film cinema"
        case "grateful":
          return "warm heartfelt thankful inspiring tender film cinema"
        default:
          return "balanced contemporary popular film cinema"
      }
    } else {
      switch (key) {
        case "sad":
          return "uplifting inspiring hopeful motivating overcoming adversity redemption feel good inspiring film cinema"
        case "happy":
          return "happy upbeat positive feel good fun lighthearted musical film cinema"
        case "anxious":
          return "calming reassuring soothing safe grounded comforting film cinema"
        case "calm":
          return "calm peaceful relaxed serene gentle film cinema"
        case "energetic":
          return "energetic intense high energy action exciting film cinema"
        case "excited":
          return "excited celebratory adventurous thrilling film cinema"
        case "tired":
          return "gentle slow relaxing low energy cozy film cinema"
        case "grateful":
          return "warm heartfelt thankful inspiring tender film cinema"
        default:
          return "balanced contemporary popular film cinema"
      }
    }
  }

  const getMoodVec = async (
    pipe: any,
    m: string,
    variant: "default" | "search",
  ) => {
    const key = `${m}::${variant}`
    if (!moodVecRef.current[key] || moodForVecRef.current[key] !== key) {
      const text = moodIntentTextFor(m, variant)
      moodVecRef.current[key] = await embedText(pipe, text)
      moodForVecRef.current[key] = key
    }
    return moodVecRef.current[key]!
  }

  // -------- Simple mood-aware query expansion (no LLM) --------
  const MOOD_KEYWORDS: Record<string, string[]> = {
    happy: ["feel-good", "lighthearted", "funny", "positive"],
    sad: [
      "sad",
      "heartbreaking",
      "tragic",
      "melancholy",
      "tearjerker",
      "loss",
      "grief",
      "hardships",
    ],
    anxious: ["calming", "comforting", "low-stress", "gentle"],
    calm: ["relaxing", "peaceful", "slow-paced"],
    energetic: ["high-energy", "action-packed", "fast-paced"],
    excited: ["adventurous", "thrilling", "fun", "exciting"],
    tired: ["cozy", "low-energy", "easy-to-watch"],
    grateful: ["heartfelt", "wholesome", "family", "human stories"],
  }

  const expandQuery = (raw: string, mood: string): string[] => {
    const base = raw.toLowerCase().trim()
    const m = mood.toLowerCase().trim()

    const extra: string[] = []

    extra.push(`${base} movie`)
    extra.push(`${base} movies`)
    extra.push(`${base} film`)
    extra.push(`${base} films`)

    if (m) {
      extra.push(`${base} ${m} movie`)
      extra.push(`${m} ${base} movies`)
    }

    const moodKeywords = MOOD_KEYWORDS[m] || []
    for (const kw of moodKeywords) {
      extra.push(`${base} ${kw}`)
      extra.push(`${kw} ${base}`)
    }

    const seen = new Set<string>()
    return [base, ...extra].filter((q) => {
      if (!q) return false
      if (seen.has(q)) return false
      seen.add(q)
      return true
    })
  }

  useEffect(() => {
    if (!mood) return
    fetchMovies(!!query ? "search" : "default")
  }, [mood, query])

  const fetchMovies = async (variant: "default" | "search") => {
    setLoading(true)
    setError(null)
    fetchingRef.current = true

    try {
      const normalizedMood = mood.toLowerCase()

      // NEW: default rows mode (no query) for moods with configured sections
      if (
        variant === "default" &&
        !query &&
        DEFAULT_SECTION_CONFIG[normalizedMood]
      ) {
        const sections = DEFAULT_SECTION_CONFIG[normalizedMood]

        const rows = await Promise.all(
          sections.map(async (s) => {
            const u = `/api/recommendations/movies?mood=${normalizedMood}&section=${encodeURIComponent(s.key)}`
            const r = await fetch(u)
            if (!r.ok)
              throw new Error(`Failed to fetch movies (${s.key}): ${r.status}`)
            const j = await r.json()
            const list: Movie[] = j.movies || []
            return { title: s.title, movies: list.slice(0, 4) }
          }),
        )

        setSectionRows(rows)

        // clear single-row/search state
        setMovies([])
        setVisibleMovies([])
        miniRef.current = null
        movieEmbCache.current.clear()
        movieByIdRef.current = new Map()

        return
      }

      setSectionRows([])

      const url = `/api/recommendations/movies?mood=${normalizedMood}&variant=${variant}${
        query ? `&q=${encodeURIComponent(query)}` : ""
      }`

      const response = await fetch(url)
      if (!response.ok)
        throw new Error(`Failed to fetch movies: ${response.status}`)

      const data = await response.json()
      const list: Movie[] = data.movies || []

      setMovies(list)
      setVisibleMovies(list.slice(0, 4))
      movieEmbCache.current.clear()
      movieByIdRef.current = new Map(list.map((mv) => [mv.id, mv]))

      miniRef.current = new MiniSearch<MovieDoc>({
        idField: "id",
        fields: ["title", "overview", "releaseDate"],
        storeFields: [
          "id",
          "title",
          "poster",
          "overview",
          "releaseDate",
          "rating",
        ],
        searchOptions: {
          boost: { title: 3, overview: 1.5 },
          prefix: true,
          fuzzy: 0.34,
        },
      })

      miniRef.current.addAll(list.map((mv) => ({ ...mv })) as MovieDoc[])
    } catch (err) {
      console.error("Error fetching movies:", err)
      setError("Failed to load movie recommendations")
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  // -------- Search pipeline --------
  const runSearch = async (q: string) => {
    const qq = (q || "").trim()
    if (qq.length < 2) {
      setVisibleMovies(movies.slice(0, 4))
      return
    }
    if (!miniRef.current || movies.length === 0) return

    const effectiveQueries = expandQuery(qq, mood)

    const collected = new Map<number, Movie>()

    for (const qtext of effectiveQueries) {
      const raw = miniRef.current!.search(qtext, { limit: 40 })
      raw.forEach((r) => {
        const id = Number(r.id)
        if (!collected.has(id)) {
          const existing = movieByIdRef.current.get(id)

          const mv: Movie =
            existing ??
            ({
              id,
              title: (r as MovieDoc).title as string,
              poster: ((r as MovieDoc).poster as string) || "",
              overview: ((r as MovieDoc).overview as string) || "",
              releaseDate: ((r as MovieDoc).releaseDate as string) || "",
              rating: Number((r as MovieDoc).rating ?? 0),
            } as Movie)

          collected.set(id, mv)
        }
      })
    }

    let shortlist = Array.from(collected.values())

    if (shortlist.length > 80) {
      shortlist = shortlist.slice(0, 80)
    }

    if (shortlist.length < 4) {
      const extra = movies
        .filter((m) => !shortlist.includes(m))
        .slice(0, 4 - shortlist.length)
      shortlist = [...shortlist, ...extra]
    }

    const pipe = await loadMiniLM()
    const qEmb = await embedText(pipe, qq)
    const moodEmb = await getMoodVec(pipe, mood, "search")

    const toEmbed: { id: number; text: string }[] = []
    shortlist.forEach((m) => {
      if (!movieEmbCache.current.has(m.id)) {
        toEmbed.push({ id: m.id, text: toText(m) })
      }
    })

    await Promise.all(
      toEmbed.map(async ({ id, text }) => {
        const emb = await embedText(pipe, text)
        movieEmbCache.current.set(id, emb)
      }),
    )

    const alpha = 0.75

    const scored = shortlist
      .map((mv) => {
        const v = movieEmbCache.current.get(mv.id)
        if (!v) return { mv, score: -Infinity }

        const sQ = cosineSim(qEmb, v)
        const sM = cosineSim(moodEmb, v)
        const score = alpha * sQ + (1 - alpha) * sM

        return { mv, score }
      })
      .sort((a, b) => b.score - a.score)

    setVisibleMovies(scored.slice(0, 4).map((s) => s.mv))
  }

  // -------- Re-run search when query changes --------
  useEffect(() => {
    if (fetchingRef.current) return
    if (!query) {
      setVisibleMovies(movies.slice(0, 4))
      return
    }
    if (!miniRef.current || movies.length === 0) return

    runSearch(query)
  }, [query, movies, loading])

  // -------- Interaction Tracking --------
  const trackInteraction = async (movie: Movie) => {
    try {
      await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "movie",
          itemId: movie.id,
          itemName: movie.title,
          mood: mood,
        }),
      })
    } catch (err) {
      console.error("Error tracking interaction:", err)
    }
  }

  const handleMovieClick = async (movie: Movie) => {
    await trackInteraction(movie)
    onMovieClick(movie.id)
  }

  if (loading)
    return (
      <div className="mood-movies-container relative">
        <h2 className="mood-movies-title">🎬 Movies</h2>
        <div className="absolute inset-0 flex justify-center items-center">
          <Spinner />
        </div>
      </div>
    )

  if (error)
    return (
      <div className="mood-movies-container">
        <h2 className="mood-movies-title">🎬 Movies for your {mood} mood</h2>
        <div className="mood-movies-error">{error}</div>
      </div>
    )

  return (
    <div className="mood-movies-container">
      <h2 className="mood-movies-title">🎬 Movies for your {mood} mood</h2>

      {!query && sectionRows.length > 0 ? (
        <div className="space-y-6">
          {sectionRows.map((row) => (
            <div key={row.title}>
              <h3 className="text-base font-semibold mb-3">{row.title}</h3>
              <div className="mood-movies-grid">
                {row.movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="mood-movie-card"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <div className="mood-movie-poster-wrapper">
                      <Image
                        src={movie.poster || "/images/movie-placeholder.jpg"}
                        alt={movie.title}
                        width={200}
                        height={300}
                        className="mood-movie-poster"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/images/movie-placeholder.jpg"
                        }}
                      />
                      <div className="mood-movie-overlay">
                        <p className="mood-movie-title">{movie.title}</p>
                        <p className="mood-movie-rating">
                          ⭐ {movie.rating.toFixed(1)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mood-movies-grid">
          {visibleMovies.map((movie) => (
            <div
              key={movie.id}
              className="mood-movie-card"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="mood-movie-poster-wrapper">
                <Image
                  src={movie.poster || "/images/movie-placeholder.jpg"}
                  alt={movie.title}
                  width={200}
                  height={300}
                  className="mood-movie-poster"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "/images/movie-placeholder.jpg"
                  }}
                />
                <div className="mood-movie-overlay">
                  <p className="mood-movie-title">{movie.title}</p>
                  <p className="mood-movie-rating">
                    ⭐ {movie.rating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
