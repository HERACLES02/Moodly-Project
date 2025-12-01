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
