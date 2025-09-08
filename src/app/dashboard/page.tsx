'use client'

import { useState, useEffect } from 'react'
import { useGetUser } from '@/hooks/useGetUser'
import NavbarComponent from '@/components/NavbarComponent'
import MoodMovies from '@/components/MoodMovies/MoodMovies'
import MoodMusic from '@/components/MoodMusic/MoodMusicComponent'
import { useRouter } from 'next/navigation'
import SelectTheme from '@/components/SelectTheme'
import FirstMoodSelection from '@/components/FirstMoodSelection'
import { useTheme } from 'next-themes'

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const { user } = useGetUser()
  const router = useRouter()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (user?.mood) {
      setCurrentMood(user.mood)
      console.log('Dashboard: User mood from context:', user.mood)
      
      if (user?.currentTheme != "default"){

        setTheme(user.currentTheme?.toLowerCase())
      }else{
        setTheme(user.mood.toLowerCase())
      }

       

    }
  }, [user?.mood])

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleMoodSelected = (mood: string) => {
    console.log('Dashboard received mood from navbar:', mood)
    if (mood) setCurrentMood(mood)
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


  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen">
      {/* If no mood → Show first mood selection */}
      {!normalizedMood ? (
        <div>
          
        </div>
      ) : (
        <>
          {/* Navbar will only render AFTER mount ✅ */}
          <NavbarComponent onSelectMoodClick={handleMoodSelected} />

          <main className="max-w-6xl mx-auto p-8">
            {/* testing theme selection */}
            {/* <div className="theme-card mb-6 p-4">
              <SelectTheme />
            </div> */}

            {showRecommendations ? (
              <div className="mood-recommendations-section">
                <MoodMovies mood={normalizedMood!} onMovieClick={handleMovieClick} />
                <MoodMusic mood={normalizedMood!} onSongClick={handleSongClick} />

                {/* Join Live / Radio Buttons */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                  <button
                    onClick={() => router.push(`/livestream/${normalizedMood}`)}
                    style={{
                      padding: '0.75rem 2rem',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      background: '#3b82f6',
                      color: 'white',
                    }}
                  >
                    Join Live Session
                  </button>
                  <button
                    onClick={() => router.push(`/radio/${normalizedMood}`)}
                    style={{
                      padding: '0.75rem 2rem',
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      background: '#16a34a',
                      color: 'white',
                      marginLeft: '1rem',
                    }}
                  >
                    Join Radio Station
                  </button>
                </div>
              </div>
            ) : (
              <div className="theme-card">
                <h2 className="content-title accent-text">
                  Coming Soon for {currentMood} mood!
                </h2>
                <p className="content-text mood-text">
                  We're currently curating personalized movie and music recommendations for "{currentMood}" mood.
                  <br />
                  <br />
                  <span className="content-highlight">Currently available for:</span>
                  <br />
                  Happy and Sad moods
                </p>
              </div>
            )}
          </main>
        </>
      )}
    </div>
  )
}
