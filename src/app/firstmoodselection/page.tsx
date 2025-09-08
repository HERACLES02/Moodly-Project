'use client'

import { useState, useEffect } from 'react'
import { useGetUser } from '@/hooks/useGetUser'
import { useTheme } from 'next-themes'
import './FirstMoodSelection.css'
import { redirect } from "next/navigation"



export default function FirstMoodSelection() {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showMoods, setShowMoods] = useState(false)
  const { user, setUser } = useGetUser()
  // ADDED THIS LINE:
    const [isMounted, setIsMounted] = useState(false)


  // This array contains all the mood options, exactly like in MoodSelector
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
  // REPLACED the old useEffect with:
useEffect(() => {
  setTheme("default")          // ADDED THIS

  setIsMounted(true)     // ADDED THIS
})

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
  if (!isMounted) return null
  // This function handles when user clicks a mood button
  const handleMoodSelect = async (moodName: string) => {
    // Prevent multiple clicks while processing
    setIsLoading(true)
    
    try {
      // Send the mood to the API (same as MoodSelector component)
      const response = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodName })
      })

      const data = await response.json()

      if (response.ok) {
        // Update the user context with the new mood
        if (user) {
          setUser({ ...user, mood: moodName })
        }
        
        console.log('First mood saved:', data.message)
        
        // Small delay for better user experience
        setTimeout(() => {
          // This will trigger the dashboard to show the real content
          setTheme(moodName.toLowerCase())
          redirect('/dashboard')
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
      <h1 className={`first-mood-title ${showTitle ? 'title-visible' : ''}`}>
        What is your mood for today?
      </h1>

      {/* Mood Selection Grid */}
      <div className={`first-mood-buttons ${showMoods ? 'moods-visible' : ''}`}>
        {moodOptions.map((mood) => (
          <button
            key={mood.name}
            onClick={() => handleMoodSelect(mood.name)}
            disabled={isLoading}
            className="theme-button"
          >
            
            {/* Mood Name */}
            <span className="mood-name">{mood.name}</span>
          </button>
        ))}
      </div>

      {/* Loading State */}
      
    </div>
  )
}