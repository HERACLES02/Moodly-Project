'use client'
import { useState, useEffect, useRef } from 'react'
import { useGetUser } from '@/hooks/useGetUser'

interface NotesSectionProps {
  onClose?: () => void
}

export default function NotesSection({ onClose }: NotesSectionProps) {
  const [isNoteOpen, setIsNoteOpen] = useState(true) // Changed to true - modal opens immediately
  const [content, setContent] = useState('')
  const [notes, setNotes] = useState<any[]>([])
  const noteRef = useRef<HTMLDivElement>(null)
  const { user, setUser } = useGetUser()

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (noteRef.current && !noteRef.current.contains(event.target as Node)) {
        handleCloseModal()
      }
    }
    
    if (isNoteOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNoteOpen])

  const handleCloseModal = () => {
    setIsNoteOpen(false)
    setContent('')
    if (onClose) {
      onClose()
    }
  }

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes || [])
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return

    
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update user note in context
        if (user) {
          setUser({ ...user, note: content })
        }
        
        // Add new note to the list
        setNotes([data.note, ...notes])
        
        setIsNoteOpen(false)
        setContent('')
        

        
        console.log('Note saved successfully')
      } else {
        alert('Failed to save note. Please try again.')
      }
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Error saving note. Please try again.')
    } 
  }

  return (
    <>
      {isNoteOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-30 bg-black/50">
          <div 
            ref={noteRef}
            className="bg-[#9479d9] rounded-2xl shadow-xl w-full max-w-md p-6 mx-4"
          >
            <h3 className="text-xl font-bold text-white mb-4">New Note</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind..."
              className="w-full h-32 p-3 border bg-[#815FD0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#815FD0] text-white placeholder-gray-300"

            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={handleCloseModal}
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
    </>
  )
}