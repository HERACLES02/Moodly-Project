'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavbarComponent from '@/components/NavbarComponent'
import { useGetUser } from '@/hooks/useGetUser'
import './userpage.css'

export default function UserPage() {
  const { user } = useGetUser()
  const router = useRouter()
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const [musicPlaylists, setMusicPlaylists] = useState<any[]>([])
  const [moviePlaylists, setMoviePlaylists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.mood) {
      setCurrentMood(user.mood)
      console.log('UserPage: User mood from context:', user.mood)
    }
  }, [user?.mood])

  useEffect(() => {
    if (user?.id) {
      fetchUserPlaylists()
    }
  }, [user?.id])

  const fetchUserPlaylists = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      
      // Use your existing API endpoints
      const musicResponse = await fetch(`/api/playlist/get-playlist?userid=${user.id}&type=SONG`)
      const musicData = await musicResponse.json()
      setMusicPlaylists(Array.isArray(musicData) ? musicData : [])
      
      const movieResponse = await fetch(`/api/playlist/get-playlist?userid=${user.id}&type=MOVIE`)
      const movieData = await movieResponse.json()
      setMoviePlaylists(Array.isArray(movieData) ? movieData : [])
      
    } catch (error) {
      console.error('Error fetching playlists:', error)
      setMusicPlaylists([])
      setMoviePlaylists([])
    } finally {
      setLoading(false)
    }
  }

  const handleMoodSelected = (mood: string) => {
    console.log('UserPage received mood from navbar:', mood)
    if (mood) {
      setCurrentMood(mood)
    }
  }

  const getUserPageTheme = () => {
    const normalizedMood = currentMood?.toLowerCase()
    if (normalizedMood === 'happy') return 'userpage-happy'
    if (normalizedMood === 'sad') return 'userpage-sad'
    return 'userpage-default'
  }

  const handleMusicPlaylistClick = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`)
  }

  const handleMoviePlaylistClick = (playlistId: string) => {
    router.push(`/playlist/${playlistId}`)
  }

  if (loading) {
    return (
      <div className={`userpage-container ${getUserPageTheme()}`}>
        <NavbarComponent onSelectMoodClick={handleMoodSelected} />
        <div className="loading-container">
          <p>Loading your playlists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`userpage-container ${getUserPageTheme()}`}>
      <NavbarComponent onSelectMoodClick={handleMoodSelected} />
      
      <main className="userpage-main">
        <div className="userpage-content">
          <div className="user-header">
            <h1 className="user-title">Welcome, {user?.anonymousName || 'User'}</h1>
            <p className="user-subtitle">Your personalized music and movie space</p>
          </div>

          <div className="playlists-section">
            <h2 className="section-title">My Favorite Playlists</h2>
            
            <div className="playlists-grid">
              {/* Favorite Music Playlist */}
              <div 
                className="playlist-card music-card"
                onClick={() => musicPlaylists.length > 0 && handleMusicPlaylistClick(musicPlaylists[0].id)}
              >
                <div className="playlist-icon">🎵</div>
                <h3 className="playlist-title">Favorite Songs</h3>
                <p className="playlist-description">
                  {musicPlaylists.length > 0 
                    ? `${musicPlaylists.length} playlists` 
                    : 'No songs yet - start adding music!'}
                </p>
              </div>

              {/* Favorite Movie Playlist */}
              <div 
                className="playlist-card movie-card"
                onClick={() => moviePlaylists.length > 0 && handleMoviePlaylistClick(moviePlaylists[0].id)}
              >
                <div className="playlist-icon">🎬</div>
                <h3 className="playlist-title">Favorite Movies</h3>
                <p className="playlist-description">
                  {moviePlaylists.length > 0 
                    ? `${moviePlaylists.length} playlists` 
                    : 'No movies yet - start adding movies!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}