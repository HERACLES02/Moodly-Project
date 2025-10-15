'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'  // ← CHANGED: Import from context
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import './FirstMoodSelection.css'

export default function FirstMoodSelection() {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showMoods, setShowMoods] = useState(false)
  
  // ══════════════════════════════════════════════════════════════════
  // CHANGED: Use context instead of useGetUser
  // ══════════════════════════════════════════════════════════════════
  const { user, updateUserMood } = useUser()
  const router = useRouter()

  // This array contains all the mood options
  const moodOptions = [
    { name: 'Happy', color: 'bg-yellow-300' },
    { name: 'Calm', color: 'bg-blue-300' },
    { name: 'Energetic', color: 'bg-red-300' },
    { name: 'Anxious', color: 'bg-purple-300' },
    { name: 'Sad', color: 'bg-gray-400' },
    { name: 'Excited', color: 'bg-orange-300' },
    { name: 'Tired', color: 'bg-indigo-300' },
    { name: 'Grateful', color: 'bg-green-300' }
  ]

  // When component mounts, start the animation sequence
  useEffect(() => {
    if (!user?.mood) {
      setTheme("")
    }
  }, [user?.mood, setTheme])

  useEffect(() => {
    // First, show the title with animation
    const titleTimer = setTimeout(() => {
      setShowTitle(true)
    }, 300)

    // Then, show the mood buttons
    const moodsTimer = setTimeout(() => {
      setShowMoods(true)
    }, 1200)

    // Cleanup function to clear timers if component unmounts
    return () => {
      clearTimeout(titleTimer)
      clearTimeout(moodsTimer)
    }
  }, [])

  // ══════════════════════════════════════════════════════════════════
  // This function handles when user clicks a mood button
  // ══════════════════════════════════════════════════════════════════
  const handleMoodSelect = async (moodName: string) => {
    // Prevent multiple clicks while processing
    setIsLoading(true)
    
    try {
      // Send the mood to the API
      const response = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodName })
      })

      const data = await response.json()

      if (response.ok) {
        // ════════════════════════════════════════════════════════════
        // CHANGED: Update context instead of setUser
        // ════════════════════════════════════════════════════════════
        updateUserMood(moodName)
        console.log('✅ First mood saved and updated in context:', moodName)
        
        // Small delay for better user experience
        setTimeout(() => {
          // This will trigger the dashboard to show the real content
          window.location.reload()
        }, 500)
      } else {
        console.error('Failed to save mood:', data.error)
        alert(data.error || 'Failed to save mood. Please try again.')
      }
    } catch (error) {
      console.error('Error saving first mood:', error)
      alert('Error saving mood. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="first-mood-container">
      {/* Main Title with Animation */}
      <h1 className={`first-mood-title ${showTitle ? 'show' : ''}`}>
        How are you feeling today?
      </h1>

      {/* Mood Buttons Grid */}
      <div className={`mood-grid ${showMoods ? 'show' : ''}`}>
        {moodOptions.map((mood, index) => (
          <button
            key={mood.name}
            onClick={() => handleMoodSelect(mood.name)}
            disabled={isLoading}
            className={`mood-button ${mood.color}`}
            style={{
              animationDelay: `${index * 0.1}s`
            }}
          >
            {mood.name}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Setting your mood...</p>
        </div>
      )}
    </div>
  )
}