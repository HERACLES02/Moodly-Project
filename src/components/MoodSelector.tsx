'use client'
import { useState } from 'react'

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  

  const moodOptions = [
    { name: 'Happy', color: 'bg-yellow-300' },
    { name: 'Calm', color: 'bg-blue-300' },
    { name: 'Energetic', color: 'bg-red-300' },
    { name: 'Anxious', color: 'bg-purple-300' }
  ]

  const handleSelect = (mood: string) => {
    setSelectedMood(mood)
    setShowDropdown(false)

    //update user moood in database
    

    
    console.log('Selected mood:', mood)
  }

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 bg-gray-100 rounded-md"
      >
        {selectedMood || 'Select Mood'}
      </button>
      
      {showDropdown && (
        <div className="absolute mt-1 w-full bg-white border rounded-md shadow-md">
          {moodOptions.map((mood) => (
            <div
              key={mood.name}
              onClick={() => handleSelect(mood.name)}
              className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
            >
              <span className={`w-3 h-3 rounded-full mr-2 ${mood.color}`} />
              {mood.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}