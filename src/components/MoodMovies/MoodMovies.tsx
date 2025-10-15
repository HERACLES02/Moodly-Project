'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import './MoodMovies.css'
import { Spinner } from '../ui/spinner'


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
}

export default function MoodMovies({ mood, onMovieClick }: MoodMoviesProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {

    if (!mood) return
    
    fetchMovies()
  }, [mood])

  const fetchMovies = async () => {
    setLoading(true)
    setError(null)

    try {
      const normalizedMood = mood.toLowerCase()
      console.log("ASDASDASDS")
      const response = await fetch(`/api/recommendations/movies?mood=${normalizedMood}`)

      if (!response.ok) throw new Error(`Failed to fetch movies: ${response.status}`)

      const data = await response.json()
      setMovies(data.movies || [])
    } catch (err) {
      console.error('Error fetching movies:', err)
      setError('Failed to load movie recommendations')
    } finally {
      setLoading(false)
    }
  }


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
      console.log("Movie click tracked in Database")
    } catch (err) {
      console.error('Error tracking interaction:', err)
    }
  }

  const handleMovieClick = async(movie: Movie) => {
    console.log(`Movie clicked: "${movie.title}" for mood: ${mood}`)
    console.log('Movie details:', {
      id: movie.id,
      title: movie.title,
      rating: movie.rating,
      releaseDate: movie.releaseDate,
      mood
    })
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
        {movies.map((movie) => (
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
