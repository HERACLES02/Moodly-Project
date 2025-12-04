'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import './MoodMovies.css'
import { Spinner } from '../ui/spinner'
import MiniSearch from 'minisearch'

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

export default function MoodMovies({ mood, onMovieClick, query = '' }: MoodMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [visibleMovies, setVisibleMovies] = useState<Movie[]>([])
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
        const { pipeline } = await import('@xenova/transformers')
        const pipe = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
        transformerRef.current = pipe
        return pipe
      })()
    }
    return transformerPromiseRef.current
  }

  const embeddingOptions = { pooling: 'mean', normalize: true } as const

  const embedText = async (pipe: any, text: string) => {
    const output = await pipe(text, embeddingOptions)
    return toEmbedding(output)
  }

  const toEmbedding = (output: any): Float32Array => {
    if (!output) return new Float32Array()
    const data = output.data ?? output
    if (data instanceof Float32Array) return data
    if (ArrayBuffer.isView(data)) return Float32Array.from(data as ArrayLike<number>)
    if (Array.isArray(data)) {
      const first = data[0]
      if (Array.isArray(first) || ArrayBuffer.isView(first)) {
        const arr = ArrayBuffer.isView(first) ? Array.from(first as Float32Array) : (first as number[])
        return Float32Array.from(arr)
      }
      return Float32Array.from(data as number[])
    }
    return new Float32Array()
  }

  const toText = (m: Movie) => `${m.title || ''} | ${(m.overview || '').slice(0, 500)} | ${m.releaseDate || ''}`

  const cosineSim = (a: Float32Array, b: Float32Array) => {
    let dot = 0, na = 0, nb = 0
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
  // We'll store separate mood vectors depending on "variant" (default vs search)
  const moodVecRef = useRef<Record<string, Float32Array | null>>({})
  const moodForVecRef = useRef<Record<string, string | null>>({})

  // variant: 'default' or 'search'
  const moodIntentTextFor = (m: string, variant: 'default' | 'search') => {
    const key = (m || '').toLowerCase()
    // default (initial) intents: for sad we want uplifting default picks
    if (variant === 'default') {
      switch (key) {
        case 'sad':
          return 'uplifting inspiring hopeful motivating overcoming adversity redemption feel good inspiring film cinema'
        case 'happy':
          return 'happy upbeat positive feel good fun lighthearted musical film cinema'
        case 'anxious':
          return 'calming reassuring soothing safe grounded comforting film cinema'
        case 'calm':
          return 'calm peaceful relaxed serene gentle film cinema'
        case 'energetic':
          return 'energetic intense high energy action exciting film cinema'
        case 'excited':
          return 'excited celebratory adventurous thrilling film cinema'
        case 'tired':
          return 'gentle slow relaxing low energy cozy film cinema'
        case 'grateful':
          return 'warm heartfelt thankful inspiring tender film cinema'
        default:
          return 'balanced contemporary popular film cinema'
      }
    } else {
      // search-time intents: reflect the declared mood more directly (sad -> sad)
      switch (key) {
        case 'sad':
          return 'sad melancholy heartbreak sorrow low valence emotional reflective film cinema'
        case 'happy':
          return 'happy upbeat positive feel good fun lighthearted musical film cinema'
        case 'anxious':
          return 'calming reassuring soothing safe grounded comforting film cinema'
        case 'calm':
          return 'calm peaceful relaxed serene gentle film cinema'
        case 'energetic':
          return 'energetic intense high energy action exciting film cinema'
        case 'excited':
          return 'excited celebratory adventurous thrilling film cinema'
        case 'tired':
          return 'gentle slow relaxing low energy cozy film cinema'
        case 'grateful':
          return 'warm heartfelt thankful inspiring tender film cinema'
        default:
          return 'balanced contemporary popular film cinema'
      }
    }
  }

  const getMoodVec = async (pipe: any, m: string, variant: 'default' | 'search') => {
    const key = `${m}::${variant}`
    if (!moodVecRef.current[key] || moodForVecRef.current[key] !== key) {
      const text = moodIntentTextFor(m, variant)
      moodVecRef.current[key] = await embedText(pipe, text)
      moodForVecRef.current[key] = key
    }
    return moodVecRef.current[key]!
  }

  // -------- Fetch movies when mood OR query changes (query may increase server candidate pool) --------
  useEffect(() => {
    if (!mood) return

    // If there's no query -> default view (we want uplifting default picks for some moods)
    // If there is a query -> search variant
    fetchMovies(!!query ? 'search' : 'default')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, query])

  const fetchMovies = async (variant: 'default' | 'search') => {
    setLoading(true)
    setError(null)
    fetchingRef.current = true

    try {
      const normalizedMood = mood.toLowerCase()
      const url = `/api/recommendations/movies?mood=${normalizedMood}&variant=${variant}${query ? `&q=${encodeURIComponent(query)}` : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch movies: ${response.status}`)

      const data = await response.json()
      const list: Movie[] = data.movies || []

      setMovies(list)
      setVisibleMovies(list.slice(0, 4)) // show 4 by default
      movieEmbCache.current.clear()
      movieByIdRef.current = new Map(list.map((mv) => [mv.id, mv]))

      // Build/refresh MiniSearch index
      miniRef.current = new MiniSearch<MovieDoc>({
        idField: 'id',
        fields: ['title', 'overview', 'releaseDate'],
        storeFields: ['id', 'title', 'poster', 'overview', 'releaseDate', 'rating'],
        searchOptions: {
          boost: { title: 3, overview: 1.5 },
          prefix: true,
          fuzzy: 0.34,
        },
      })
      miniRef.current.addAll(list.map((mv) => ({ ...mv })) as MovieDoc[])
      // don't call runSearch here; the effect will call runSearch when ready if needed
    } catch (err) {
      console.error('Error fetching movies:', err)
      setError('Failed to load movie recommendations')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  // -------- Search pipeline (MiniSearch shortlist → MiniLM re-rank with query+mood blending) --------
  const runSearch = async (q: string) => {
    const qq = (q || '').trim()
    if (qq.length < 2) {
      setVisibleMovies(movies.slice(0, 4))
      return
    }
    if (!miniRef.current || movies.length === 0) return

    // 1) MiniSearch shortlist
    const raw = miniRef.current.search(qq, { limit: 60 })
    let shortlist: Movie[] = raw
      .map((r) => {
        const id = Number(r.id)
        return movieByIdRef.current.get(id) ?? {
          id,
          title: (r as MovieDoc).title as string,
          poster: ((r as MovieDoc).poster as string) || '',
          overview: ((r as MovieDoc).overview as string) || '',
          releaseDate: ((r as MovieDoc).releaseDate as string) || '',
          rating: Number((r as MovieDoc).rating ?? 0),
        }
      })

    if (shortlist.length < 4) {
      const extra = movies.filter(m => !shortlist.includes(m)).slice(0, 4 - shortlist.length)
      shortlist = [...shortlist, ...extra]
    }

    // 2) MiniLM re-rank
    const pipe = await loadMiniLM()

    const qEmb = await embedText(pipe, qq)
    // Important: For search re-ranking use the search-intent mood vector (e.g., sad -> sad)
    const moodEmb = await getMoodVec(pipe, mood, 'search')

    // embed items not cached yet
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
      })
    )

    // Combine semantic similarity: query + mood (search-time mood)
    const alpha = qq.length > 3 ? 0.75 : 0.5

    const scored = shortlist.map(mv => {
      const v = movieEmbCache.current.get(mv.id)!
      const sQ = cosineSim(qEmb, v)
      const sM = cosineSim(moodEmb, v)
      const score = alpha * sQ + (1 - alpha) * sM
      return { mv, score }
    }).sort((a, b) => b.score - a.score)

    setVisibleMovies(scored.slice(0, 4).map(s => s.mv))
  }

  // Re-run search when query changes (single run; if fetching, fetchMovies will call runSearch)
  // NOTE: We replaced the previous combined effect with two effects so we can:
  //  - re-run search AFTER movies finish loading if a query exists, and
  //  - for a query run with search-intent; for empty query we keep default visibleMovies
  useEffect(() => {
    if (fetchingRef.current) return
    if (!query) {
      // default: show the default fetched list (likely from variant=default)
      setVisibleMovies(movies.slice(0, 4))
      return
    }
    if (!miniRef.current || movies.length === 0) return

    // run the search using search-intent (sad -> sad)
    runSearch(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, movies, loading])

  // Run search after fetchMovies finishes populating movies, only when a query exists
  useEffect(() => {
    if (!loading && query && movies.length > 0 && miniRef.current) {
      runSearch(query)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies, loading])

  // -------- Interaction tracking (unchanged) --------
  const trackInteraction = async (movie: Movie) => {
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'movie',
          itemId: movie.id,
          itemName: movie.title,
          mood: mood
        })
      })
      // console.log('Movie click tracked in Database')
    } catch (err) {
      console.error('Error tracking interaction:', err)
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
      <div className="mood-movies-grid">
        {visibleMovies.map((movie) => (
          <div key={movie.id} className="mood-movie-card" onClick={() => handleMovieClick(movie)}>
            <div className="mood-movie-poster-wrapper">
              <Image
                src={movie.poster || '/images/movie-placeholder.jpg'}
                alt={movie.title}
                width={200}
                height={300}
                className="mood-movie-poster"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/movie-placeholder.jpg'
                }}
              />
              <div className="mood-movie-overlay">
                <p className="mood-movie-title">{movie.title}</p>
                <p className="mood-movie-rating">⭐ {movie.rating.toFixed(1)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
"use client"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import "./MoodMovies.css"
import { Spinner } from "../ui/spinner"

export interface Movie {
  id: number
  title: string
  poster: string
  overview: string
  releaseDate: string
  rating: number
}

interface MoodMoviesProps {
  mood: string
  movies: Movie[]
  onMovieClick?: (movieId: number) => void
  loading: boolean
}

export default function MoodMovies({
  movies,
  mood,
  onMovieClick,
  loading,
}: MoodMoviesProps) {
  // const [movies, setMovies] = useState<Movie[]>([])

  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  if (error) {
    return (
      <div className="mood-movies-container">
        <div className="carousel-box">
          <div className="carousel-error">{error}</div>
          <span className="carousel-label">Movies</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mood-movies-container">
      <div className="carousel-box theme-card border-transparent">
        {/* Scrollable Track */}
        <div className="carousel-track" ref={scrollRef}>
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="carousel-item"
              onClick={() => handleMovieClick(movie)}
            >
              <div className="item-card ">
                {!loading ? (
                  <Image
                    src={movie.poster || "/images/movie-placeholder.jpg"}
                    alt={movie.title}
                    width={200}
                    height={170}
                    className="item-image"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/images/movie-placeholder.jpg"
                    }}
                  />
                ) : (
                  <div className="w-full bg-[var(--muted)]" />
                )}

                <div className="item-overlay">
                  <span className="item-title">{movie.title}</span>
                  <span className="item-rating">
                    ⭐ {movie.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* End Fade - Diagonal Triangle */}
        <div className="carousel-fade-end"></div>

        {/* Label */}
        <span className="carousel-label theme-text-highlight">Movies</span>
      </div>
    </div>
  )
}
