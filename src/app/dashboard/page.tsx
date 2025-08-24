'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useGetUser } from '@/hooks/useGetUser'
import "./dashboard.css"
import NavbarComponent from '@/components/NavbarComponent'
import MoodMovies from '@/components/MoodMovies/MoodMovies'
import MoodMusic from '@/components/MoodMusic/MoodMusicComponent'

export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false)
  const [currentMood, setCurrentMood] = useState<string | null>(null)
  const backgroundImage = '/images/background.jpg'
  const { user } = useGetUser()

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

  const supportedMoods = ['happy', 'sad']
  const normalizedMood = currentMood?.toLowerCase()
  const showRecommendations = normalizedMood && supportedMoods.includes(normalizedMood)

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      {isMounted && (
        <div className="fixed inset-0 -z-10">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </div>
      )}

      <NavbarComponent onSelectMoodClick={handleMoodSelected} />


      <main className="container mx-auto px-4 py-8">

        {/* Mood-Based Recommendations Section */}
        {showRecommendations ? (
          <div className="mood-recommendations-section">
            <MoodMovies mood={normalizedMood} />
            <MoodMusic mood={normalizedMood} />
          </div>
        ) : currentMood ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">
            <h2 className="text-2xl font-bold text-[#815FD0] mb-4">
              Coming Soon for {currentMood} mood!
            </h2>
            <p className="text-gray-600">
              We're currently curating personalized movie and music recommendations for "{currentMood}" mood.
              <br /><br />
              <span className="font-semibold">Currently available for:</span>
              <br />
              Happy and Sad moods
            </p>
          </div>
        ) : (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">
            
          </div>
        )}

        
      </main>
    </div>
  )
}