'use client'
import { useState, useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import AddToPlaylistComponent from '@/components/PlaylistComponents/AddToPlaylistComponent'
import { useGetUser } from '@/hooks/useGetUser'
import { usePoints } from '@/hooks/usePoints'
import SelectTheme from '@/components/SelectTheme'
import './page.css'

export default function ListenMusic({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [song, setSong] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { user } = useGetUser()
    const { addPoints } = usePoints()
    const [hasEarnedListenPoints, setHasEarnedListenPoints] = useState(false)

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

    const fetchSongData = async () => {
        try {
            const response = await fetch(`http://moodly-blond.vercel.app/api/get-song-data?id=${id}`)
            const songData = await response.json()
            setSong(songData)
        } catch (error) {
            console.error('Error fetching song data:', error)
        } finally {
            setLoading(false)
        }
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
                    <AddToPlaylistComponent type="SONG" itemId={id}/>
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