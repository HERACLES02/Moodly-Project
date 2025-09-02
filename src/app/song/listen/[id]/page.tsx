'use client'
import { useState, useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import AddMusicToPlaylistComponent from '@/components/PlaylistComponents/AddMusicToPlaylistComponent'
import { useGetUser } from '@/hooks/useGetUser'
import { usePoints } from '@/hooks/usePoints'
import { Heart } from 'lucide-react'
import '@/components/ThemeOverrides.css'  // Add theme overrides
import './page.css'

export default function ListenMusic({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [song, setSong] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { user } = useGetUser()
    const { addPoints, isAdding } = usePoints()
    const [hasEarnedListenPoints, setHasEarnedListenPoints] = useState(false)
    const [isFavorited, setIsFavorited] = useState(false)

    useEffect(() => {
        const getParams = async () => {
            const p = await params
            setId(p.id)
        }
        getParams()
    }, [params])

    useEffect(() => {
        if (id) {
            fetchSongData()
        }
    }, [id])

    useEffect(() => {
        if (!hasEarnedListenPoints && id) {
            const timer = setTimeout(() => {
                console.log('🎵 Adding points for listening song:', id)
                addPoints("listen", id, "song")
                setHasEarnedListenPoints(true)
            }, 3000)

            return () => clearTimeout(timer)
        }
    }, [id, hasEarnedListenPoints]) 

    // Theme/Mood handling useEffect
    useEffect(() => {
        // Handle theme vs mood styling
        if (user?.currentTheme) {
            console.log('SongListen: Applying theme:', user.currentTheme)
            // Remove any existing theme and mood classes
            document.body.classList.remove('theme-van-gogh', 'theme-cat', 'theme-default', 'mood-happy', 'mood-sad')
            
            // If it's default theme, apply mood class instead
            if (user.currentTheme === 'default') {
                if (user.mood) {
                    document.body.classList.add(`mood-${user.mood.toLowerCase()}`)
                    console.log('SongListen: Applied mood class for default theme:', user.mood.toLowerCase())
                }
            } else {
                // Apply premium theme class
                document.body.classList.add(`theme-${user.currentTheme}`)
            }
        }
        
        // Cleanup function to remove classes when component unmounts
        return () => {
            document.body.classList.remove('theme-van-gogh', 'theme-cat', 'theme-default', 'mood-happy', 'mood-sad')
        }
    }, [user?.currentTheme, user?.mood])

    const handleFavorite = () => {
        if (!isFavorited && !isAdding) {
            console.log('❤️ Adding points for favoriting song:', id)
            addPoints("favorite", id, "song")
            setIsFavorited(true)
        }
    }

    const fetchSongData = async () => {
        try {
            const response = await fetch(`http://localhost:9513/api/get-song-data?id=${id}`)
            const songData = await response.json()
            setSong(songData)
        } catch (error) {
            console.error('Error fetching song data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getThemeClass = () => {
        const mood = user?.mood?.toLowerCase()
        if (mood === 'happy') return 'mood-happy'
        if (mood === 'sad') return 'mood-sad'
        return ''
    }

    if (loading) {
        return <div>Loading...</div>
    }

    const embedUrl = `https://open.spotify.com/embed/track/${id}`
    
    return (
        <>
        <NavbarComponent/>
        <div className="listen-page-container">
            <div className="spotify-embed-container">
                <iframe 
                    src={embedUrl}
                    className="spotify-player"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title={`Listen to ${song?.name || 'song'}`}
                >
                </iframe>
            </div>

            <div className="main-content-area">
                <div className="currently-playing-section">
                    <h1 className="section-heading">Currently Playing</h1>
                    <p className="song-title">{song?.name || "Song Name"}</p>
                    {song?.artists && song.artists.length > 0 && (
                        <p className="artist-name">
                            {song.artists.map((artist: any) => artist.name).join(', ')}
                        </p>
                    )}
                    
                </div>
                <div className="next-up-section">
                    <AddMusicToPlaylistComponent itemId={id}/>
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
                {hasEarnedListenPoints && (
                <div className="points-notification">
                     You earned 10 points for listening!
                </div>
                )}
            </div>
        </div>
        </>
    )
}