'use client'
import { useState, useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import AddMusicToPlaylistComponent from '@/components/PlaylistComponents/AddMusicToPlaylistComponent'

import { useGetUser } from '@/hooks/useGetUser'
import './page.css'

export default function ListenMusic({ params }: { params: Promise<{ id: string }> }) {
    const [id, setId] = useState<string>('')
    const [song, setSong] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const { user } = useGetUser()

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

    useEffect(() => {
        const themeClass = getThemeClass()
        document.body.className = themeClass
        
        return () => {
            document.body.className = ''
        }
    }, [user?.mood])

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
                </div>
                
            </div>
        </div>
        </>
    )
}