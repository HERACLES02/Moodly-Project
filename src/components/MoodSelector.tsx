'use client'
import { useState, useEffect, useRef } from 'react'
import { useGetUser } from '@/hooks/useGetUser'

interface MoodSelectorProps {
  onClose?: () => void
  onMoodSelect: (mood: string) => void
}

export default function MoodSelector({ onClose, onMoodSelect }: MoodSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const { user, setUser } = useGetUser()

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

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose]) // Added dependency

  const handleMoodSelect = async (moodName: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodName })
      })

      const data = await response.json()

      if (response.ok) {
        // Update user mood in context
        if (user) {
          setUser({ ...user, mood: moodName })
        }
        onMoodSelect(moodName)
        
        console.log('Mood saved to user:', data.message)
        
        // Close immediately after successful save
        onMoodSelect?.(moodName)
        handleClose()
      } else {
        console.error('Failed to save mood:', data.error)
        alert(data.error || 'Failed to save mood. Please try again.')
      }
    } catch (error) {
      console.error('Error recording mood:', error)
      alert('Error saving mood. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4"
      >
        <h3 className="text-xl font-bold text-[#815FD0] mb-4">Select Your Mood</h3>
        
        <div className="space-y-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.name}
              onClick={() => handleMoodSelect(mood.name)}
              disabled={isLoading}
              className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className={`w-4 h-4 rounded-full mr-3 ${mood.color}`} />
              <span className="text-gray-800">{mood.name}</span>
            </button>
          ))}
        </div>
        
        <button
          onClick={handleClose}
          className="mt-6 px-4 py-2 text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}