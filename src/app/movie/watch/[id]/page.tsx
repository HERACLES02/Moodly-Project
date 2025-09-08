'use client'
import { useState, useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import AddToPlaylistComponent from '@/components/PlaylistComponents/AddToPlaylistComponent'
import { useGetUser } from '@/hooks/useGetUser'
import { usePoints } from '@/hooks/usePoints'
import SelectTheme from '@/components/SelectTheme'
import './page.css'

export default function WatchMovies({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [movie, setMovie] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { user } = useGetUser()
    const { addPoints } = usePoints()
    const [hasEarnedWatchPoints, setHasEarnedWatchPoints] = useState(false)

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params
            setId(resolvedParams.id)
        }
        getParams()
    }, [params])

    useEffect(() => {
        if (id) {
            fetchMovieData()
        }
    }, [id])

    useEffect(() => {
        if (!hasEarnedWatchPoints && id) {
            const timer = setTimeout(() => {
                console.log('🎬 Adding points for watching movie:', id)
                addPoints("watch", id, "movie")
                setHasEarnedWatchPoints(true)
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [id, hasEarnedWatchPoints])

    const fetchMovieData = async () => {
        try {
            const response = await fetch(`http://localhost:9513/api/get-movie-data?id=${id}`)
            const movieData = await response.json()
            setMovie(movieData)
        } catch (error) {
            console.error('Error fetching movie data:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div>Loading...</div>
    }

    const embedUrl = `https://vidsrc.xyz/embed/movie?tmdb=${id}`
    
    return (
        <>
        <NavbarComponent/>
        
        

        <div className="watch-page-container">
            
            <div className="video-container">
                <iframe
                    src={embedUrl}
                    className="video-player"
                    allowFullScreen
                    title={`Watch ${movie?.title || 'Movie'}`}
                >
                </iframe>
            </div>

            <div className="movie-title-section">
                <div className="movie-title-info">
                    <h1 className="movie-title-below">{movie?.title || 'Movie Title'}</h1>
                    {movie?.release_date && (
                        <span className="movie-year-below">
                            ({new Date(movie.release_date).getFullYear()})
                        </span>
                    )}
                </div>
                <div className="movie-actions">
                    <AddToPlaylistComponent type="MOVIE" itemId={id}/>
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
               
                {movie?.genres && movie.genres.length > 0 && (
                    <div className="movie-genres">
                        <h3>Genres</h3>
                        <div className="genre-tags">
                            {movie.genres.map((genre: any) => (
                                <span key={genre.id} className="genre-tag">
                                    {genre.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        </>
    )
}