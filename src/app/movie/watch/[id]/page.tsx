'use client'
import { useState, useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import AddToPlaylistComponent from '@/components/PlaylistComponents/AddToPlaylistComponent'
import { useGetUser } from '@/hooks/useGetUser'
import { usePoints } from '@/hooks/usePoints'
import { Heart } from 'lucide-react'
import './page.css'

export default function WatchMovies({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [movie, setMovie] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { user } = useGetUser()
    const { addPoints, isAdding } = usePoints()
    const [hasEarnedWatchPoints, setHasEarnedWatchPoints] = useState(false)
    const [isFavorited, setIsFavorited] = useState(false)

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

    // FIX 1: Use the resolved 'id' instead of params.id
    useEffect(() => {
        if (!hasEarnedWatchPoints && id) {
            // Wait 5 seconds after page loads (assuming they started watching)
            const timer = setTimeout(() => {
                console.log('🎬 Adding points for watching movie:', id)
                addPoints("watch", id, "movie")
                setHasEarnedWatchPoints(true)
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [id, hasEarnedWatchPoints]) // Use 'id' here, not params.id

    const handleFavorite = () => {
        if (!isFavorited && !isAdding) {
            console.log('❤️ Adding points for favoriting movie:', id)
            addPoints("favorite", id, "movie")
            setIsFavorited(true)
            // Here you would also save the favorite to your database
        }
    }

    const fetchMovieData = async () => {
        try {
            // FIX 2: Add backticks for template literal
            const response = await fetch(`http://localhost:9513/api/get-movie-data?id=${id}`)
            const movieData = await response.json()
            setMovie(movieData)
        } catch (error) {
            console.error('Error fetching movie data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getThemeClass = () => {
        const mood = user?.mood?.toLowerCase()
        if (mood === 'happy') return 'watch-page-happy'
        if (mood === 'sad') return 'watch-page-sad'
        return 'watch-page-default'
    }

    if (loading) {
        return <div>Loading...</div>
    }

    // FIX 3: Add backticks for template literal
    const embedUrl = `https://vidsrc.xyz/embed/movie?tmdb=${id}`
    
    return (
        <>
        <NavbarComponent/>
        <div className={`watch-page-container ${getThemeClass()}`}>
            
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
                    
                    {/* ADD THIS: Favorite button with heart icon */}
                    <button
                        onClick={handleFavorite}
                        disabled={isAdding}
                        className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
                        title={isFavorited ? 'Favorited' : 'Add to Favorites (+5 points)'}
                    >
                        <Heart 
                            className={`heart-icon ${isFavorited ? 'filled' : ''}`}
                            fill={isFavorited ? 'currentColor' : 'none'}
                        />
                    </button>
                </div>
            </div>

            {/* ADD THIS: Points notification */}
            {hasEarnedWatchPoints && (
                <div className="points-notification">
                    ✨ You earned 10 points for watching!
                </div>
            )}

            <div className="movie-info-section">
                {movie?.vote_average && (
                    <div className="movie-rating-info">
                        <span className="rating-display">
                            ⭐ {movie.vote_average.toFixed(1)} / 10
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