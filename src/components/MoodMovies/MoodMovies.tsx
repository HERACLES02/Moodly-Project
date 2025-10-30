'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import './MoodMovies.css'
import { Spinner } from '../ui/spinner'
import Fuse from 'fuse.js'

interface Movie {
  id: number
  title: string
  poster: string
  overview: string
  releaseDate: string
  rating: number
}

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
  const fuseRef = useRef<Fuse<Movie> | null>(null)
  const movieEmbCache = useRef<Map<number, Float32Array>>(new Map())
  const fetchingRef = useRef(false)

  // Lazy USE loader (singleton per tab)
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

  // Convert a movie to text for embedding
  const toText = (m: Movie) => `${m.title || ''} | ${(m.overview || '').slice(0, 500)} | ${m.releaseDate || ''}`

  // cosine sim
  const cosineSim = (a: Float32Array, b: Float32Array) => {
    let dot = 0, na = 0, nb = 0
    for (let i = 0; i < a.length; i++) { const x = a[i], y = b[i]; dot += x * y; na += x * x; nb += y * y }
    const d = Math.sqrt(na * nb)
    return d ? dot / d : 0
  }

  // -------- Mood intent vector (for semantic mood bias) --------
  const moodVecRef = useRef<Float32Array | null>(null)
  const moodForVecRef = useRef<string | null>(null)

  const moodIntentTextFor = (m: string) => {
    switch ((m || '').toLowerCase()) {
      case 'sad':
        // pure sad vibe; no uplifting tokens here
        return 'sad melancholy heartbreak sorrow low valence emotional reflective film cinema'
      case 'happy':
        return 'happy upbeat positive feel good fun lighthearted film cinema'
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

  // -------- Fetch movies when mood OR query changes (query may increase server candidate pool) --------
  useEffect(() => {
    if (!mood) return
    fetchMovies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mood, query])

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)
    fetchingRef.current = true

    try {
      const normalizedMood = mood.toLowerCase()
      // If your movies API doesn't accept q yet, it's fine; see API tweak in section 2 below.
      const url = `/api/recommendations/movies?mood=${normalizedMood}${query ? `&q=${encodeURIComponent(query)}` : ''}`
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to fetch movies: ${response.status}`)

      const data = await response.json()
      const list: Movie[] = data.movies || []

      setMovies(list)
      setVisibleMovies(list.slice(0, 4)) // show 4 by default

      // Build/refresh Fuse index
      const options: Fuse.IFuseOptions<Movie> = {
        keys: [
          { name: 'title', weight: 0.7 },
          { name: 'overview', weight: 0.3 },
        ],
        threshold: 0.45,
        distance: 200,
        ignoreLocation: true,
        findAllMatches: true,
        minMatchCharLength: 2,
      }
      fuseRef.current = new Fuse<Movie>(list, options)

      // If there is a query, run search ONCE now that tracks & fuse are ready
      if (query) {
        await runSearch(query)
      }
    } catch (err) {
      console.error('Error fetching movies:', err)
      setError('Failed to load movie recommendations')
    } finally {
      setLoading(false)
      fetchingRef.current = false
    }
  }

  // -------- Search pipeline (Fuse shortlist → USE re-rank with query+mood blending) --------
  const runSearch = async (q: string) => {
    const qq = (q || '').trim()
    if (qq.length < 2) { setVisibleMovies(movies.slice(0, 4)); return }
    if (!fuseRef.current || movies.length === 0) return

    // 1) Fuse shortlist
    const raw = fuseRef.current.search(qq)
    let shortlist: Movie[] = raw.slice(0, 30).map(r => r.item)
    if (shortlist.length === 0) {
      shortlist = movies.slice(0, Math.min(movies.length, 50))
    }

    // 2) USE re-rank
    const model = await loadUSE()

    const qTensor = await model.embed([qq])
    const qArray = await qTensor.array() as number[][]
    const qEmb = Float32Array.from(qArray[0])

    const moodEmb = await getMoodVec(model, mood)

    // embed items not cached yet
    const texts: string[] = []
    const toEmbedIdx: number[] = []
    shortlist.forEach((m, idx) => {
      if (!movieEmbCache.current.has(m.id)) {
        texts.push(toText(m))
        toEmbedIdx.push(idx)
      }
    })
    if (texts.length > 0) {
      const batchTensor = await model.embed(texts)
      const batch = await batchTensor.array() as number[][]
      batch.forEach((vec, i) => {
        const sIdx = toEmbedIdx[i]
        const mid = shortlist[sIdx].id
        movieEmbCache.current.set(mid, Float32Array.from(vec))
      })
    }

    // Combine semantic similarity: query + mood
    const sadish = /heartbreak|breakup|melancholy|sad|grief|sorrow|lonely|blue/i.test(qq)
    let alpha = 0.6 // weight for query
    if ((mood || '').toLowerCase() === 'sad' && sadish) alpha = 0.3 // mood dominates when sad & sad-ish query

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
  useEffect(() => {
    if (fetchingRef.current) return
    if (!query) {
      setVisibleMovies(movies.slice(0, 4))
      return
    }
    if (!fuseRef.current || movies.length === 0) return
    runSearch(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

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
      console.log('Movie click tracked in Database')
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
