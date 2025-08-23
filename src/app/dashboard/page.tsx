'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import ProfileDropdown from '@/components/ProfileDropdown'
import { auth } from "@/auth"
import { useGetUser } from '@/hooks/useGetUser'
import { useTest } from '@/hooks/useTest'
import "./dashboard.css"
import NotesSection from '@/components/NotesSection'
console.log("📦 useGetUser import:", typeof useGetUser)

import NavbarComponent from '@/components/NavbarComponent'



export default function Dashboard() {

  const [activeNote, setActiveNote] = useState<string | null>(null)
  const [isNoteOpen, setIsNoteOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState<any[]>([])
  const noteRef = useRef<HTMLDivElement>(null)
  const [showMoodDialog, setShowMoodDialog] = useState(false)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)


  const backgroundImage = '/images/background.jpg'

  const userInitials = "AT"


  const { user, setUser} = useGetUser()
  const userName = user?.anonymousName
  
  const moodOptions = [
    { name: 'Happy', color: 'bg-yellow-300' },
    { name: 'Calm', color: 'bg-blue-300' },
    { name: 'Energetic', color: 'bg-red-300' },
    { name: 'Anxious', color: 'bg-purple-300' }
  ]

  useEffect(() => {
    
    setIsMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {

      if (noteRef.current && !noteRef.current.contains(event.target as Node)) {
        setIsNoteOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMoodSelect = async (mood: string) => {
    try {
      const response = await fetch('/api/moods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moodName: mood })
      })

      if (response.ok) {
        setSelectedMood(mood)
        setShowMoodDialog(false)
        console.log('Mood recorded:', mood)
      }
    } catch (error) {
      console.error('Error recording mood:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })
      
      if (response.ok) {
        const newNote = await response.json()
        setNotes([newNote, ...notes])
        setActiveNote("Note: " + newNote.content)
        setIsNoteOpen(false)
        setTitle('')
        setContent('')
      }
    } catch (error) {
      console.error('Error saving note:', error)
    }
  }

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

      <NavbarComponent/>

      {/* Header */}
      <header className="bg-[#815FD0]/90 shadow-sm sticky top-0 z-10 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="moodlyTitle">Moodly</h1>
          
          <div className="flex items-center space-x-4">
            {/* Mood indicator */}
            {selectedMood && (
              <div className="px-3 py-1.5 bg-[#a890df] rounded-md text-white text-sm font-medium">
                {selectedMood}
              </div>
            )}

            {/* Active note indicator */}
            {activeNote && (
              <div className="px-3 py-1.5 bg-[#a890df] rounded-md text-white text-sm font-medium max-w-[200px] truncate">
                {activeNote}
              </div>
            )}

            {/* Profile Dropdown */}
            <ProfileDropdown 
              userName={userName}
              userInitials={userInitials}
              onAddNote={() => setIsNoteOpen(true)}
              onSelectMood={() => setShowMoodDialog(true)}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-0">
        {/* Note Creation Popup */}
        {isNoteOpen && (
          <div 
            ref={noteRef}
            className="fixed inset-0 flex items-center justify-center z-30 bg-black/50"
          >
            <div className="bg-[#9479d9] rounded-2xl shadow-xl w-full max-w-md p-6 mx-4">
              <h3 className="text-xl font-bold text-white mb-4">New Note</h3>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind..."
                className="w-full h-32 p-3 border bg-[#815FD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#815FD0]"
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setIsNoteOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 bg-[#815FD0] text-white rounded-lg hover:bg-[#9479d9] transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mood Selection Dialog */}
        {showMoodDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4">
              <h3 className="text-xl font-bold text-[#815FD0] mb-4">Select Your Mood</h3>
              <div className="space-y-2">
                {moodOptions.map((mood) => (
                  <button
                    key={mood.name}
                    onClick={() => handleMoodSelect(mood.name)}
                    className="flex items-center w-full p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <span className={`w-4 h-4 rounded-full mr-3 ${mood.color}`} />
                    <span className="text-gray-800">{mood.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMoodDialog(false)}
                className="mt-6 px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        )}


      </main>
    </div>
  )
}