'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useGetUser } from '@/hooks/useGetUser'
import "./dashboard.css"
import NavbarComponent from '@/components/NavbarComponent'
import MoodMovies from '@/components/MoodMovies/MoodMovies'
import MoodMusic from '@/components/MoodMusic/MoodMusicComponent'
import { useRouter } from 'next/navigation'
import PlaylistComponent from '@/components/PlaylistComponents/PlaylistComponent'
import LiveStreamComponent from '@/components/LiveStreamComponent'

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const backgroundImage = '/images/background.jpg'
  const { user } = useGetUser()
  const router = useRouter()

  useEffect(() => {
    if (user?.mood) {
      setCurrentMood(user.mood)
      console.log('Dashboard: User mood from context:', user.mood)
    }
  }, [user?.mood])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleMoodSelected = (mood: string) => {
    console.log('Dashboard received mood from navbar:', mood)
    if (mood) {setCurrentMood(mood)}
    
  }

  
  const handleMovieClick = (movieId: number) => {
  router.push(`/movie/watch/${movieId}`)
}
  const handleSongClick = (songId: number) => {
    router.push(`/song/listen/${songId}`)
}

  const supportedMoods = ['happy', 'sad']
  const normalizedMood = currentMood?.toLowerCase()
  const showRecommendations = normalizedMood && supportedMoods.includes(normalizedMood)

  const getDashboardTheme = () => {
    if (!normalizedMood) return 'dashboard-default'
    return `dashboard-${normalizedMood}`
  }

  return (
    <div className={`dashboard-container ${getDashboardTheme()}`}>
      {!normalizedMood && isMounted && (
        <div className="background-image">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="background-img"
            priority
            quality={100}
          />
        </div>
      )}

      

      <NavbarComponent />

     

      <main className="main-content">
        {showRecommendations ? (
          <div className="mood-recommendations-section">
            <MoodMovies mood={normalizedMood} onMovieClick = {handleMovieClick}/>
            <MoodMusic mood={normalizedMood} onSongClick= {handleSongClick}/>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <button 
        onClick={() => router.push(`/livestream/${normalizedMood}`)}
        style={{
          padding: '0.75rem 2rem',
          fontSize: '1.1rem',
          fontWeight: '600',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        🔴 Join Live Session
      </button>
    </div>
          </div>
        ) : currentMood ? (
          <div className="content-card">
            <h2 className="content-title accent-text">
              Coming Soon for {currentMood} mood!
            </h2>
            <p className="content-text mood-text">
              We're currently curating personalized movie and music recommendations for "{currentMood}" mood.
              <br /><br />
              <span className="content-highlight">Currently available for:</span>
              <br />
              Happy and Sad moods
            </p>
          </div>
        ) : (
          <div className="content-card">
          </div>
        )}
      </main>
    </div>
  )
}