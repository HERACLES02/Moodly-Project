"use client"
import { useState, useEffect } from "react"

import AddToPlaylistComponent from "@/components/PlaylistComponents/AddToPlaylistComponent"
import { usePoints } from "@/hooks/usePoints"

import "./page.css"

export default function WatchMovies({ movieId }: { movieId: string }) {
  const [id, setId] = useState<string>(movieId)
  const [movie, setMovie] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { addPoints } = usePoints()
  const [hasEarnedWatchPoints, setHasEarnedWatchPoints] = useState(false)

  useEffect(() => {
    if (id) {
      fetchMovieData()
    }
  }, [id])

  useEffect(() => {
    if (!hasEarnedWatchPoints && id) {
      const timer = setTimeout(() => {
        console.log("🎬 Adding points for watching movie:", id)
        // ✅ OPTIMIZATION: Make this non-blocking
        addPoints("watch", id, "movie").catch((err) => {
          console.error("Failed to add points:", err)
        })

        setHasEarnedWatchPoints(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [id, hasEarnedWatchPoints])

  const fetchMovieData = async () => {
    try {
      // ✅ OPTIMIZATION: Fetch movie data immediately, don't wait
      const response = await fetch(
        `http://localhost:9513/api/get-movie-data?id=${id}`,
      )
      const movieData = await response.json()
      setMovie(movieData)
    } catch (error) {
      console.error("Error fetching movie data:", error)
    } finally {
      setLoading(false)
    }
  }

  const embedUrl = `https://vidsrc-embed.ru/embed/movie?tmdb=${id}`

  return (
    <>
      <div className="watch-page-container">
        <div className="video-container p-2">
          <iframe
            src={embedUrl}
            className="video-player"
            allowFullScreen
            title={`Watch ${movie?.title || "Movie"}`}
          />
        </div>

        <div className="movie-title-section">
          <div className="movie-title-info">
            <h1 className="movie-title-below">
              {movie?.title || "Movie Title"}
            </h1>
            {movie?.release_date && (
              <span className="movie-year-below">
                ({new Date(movie.release_date).getFullYear()})
              </span>
            )}
          </div>
          <div className="movie-actions">
            <AddToPlaylistComponent type="MOVIE" itemId={id} />
          </div>
        </div>

        <div className="movie-info-section">
          {movie?.vote_average && (
            <div className="movie-rating-info">
              <span className="rating-display">
                {movie.vote_average.toFixed(1)} / 10
              </span>
            </div>
          )}

          {movie?.overview && (
            <div className="movie-overview">
              <h2>Overview</h2>
              <p>{movie.overview}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
