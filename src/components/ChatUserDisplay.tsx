'use client'

import { useState } from 'react'
import DisplayUser from './DisplayUser'
import './ChatUserDisplay.css'

interface ChatUserDisplayProps {
  username: string
  userId?: string
  showNote?: boolean
  className?: string
}

export default function ChatUserDisplay({ 
  username, 
  userId, 
  showNote = false,
  className = '' 
}: ChatUserDisplayProps) {
  const [userNote, setUserNote] = useState<string | null>(null)
  const [noteLoading, setNoteLoading] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const fetchUserNote = async (targetUserId: string) => {
    if (noteLoading || userNote !== null) return // Don't fetch if already loading or cached
    
    setNoteLoading(true)
    try {
      const response = await fetch(`/api/users/${targetUserId}/note`)
      if (response.ok) {
        const data = await response.json()
        setUserNote(data.note || 'No note available')
      } else {
        setUserNote('Failed to load note')
      }
    } catch (error) {
      console.error('Error fetching user note:', error)
      setUserNote('Failed to load note')
    } finally {
      setNoteLoading(false)
    }
  }

  const handleMouseEnter = () => {
    if (showNote && userId) {
      setShowTooltip(true)
      fetchUserNote(userId)
    }
  }

  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  return (
    <div 
      className={`chat-user-display ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {userId ? (
        // If we have userId, use DisplayUser component
        <DisplayUser 
          userId={userId}
          showName={true}
          showAvatar={true}
          className="chat-display-user"
        />
      ) : (
        // Fallback for users without userId (legacy messages)
        <div className="fallback-user-display">
          <span className="fallback-avatar">👤</span>
          <span className="fallback-username">{username}</span>
        </div>
      )}

      {/* Note Tooltip */}
      {showNote && showTooltip && userId && (
        <div className="chat-note-tooltip">
          {noteLoading ? (
            <div className="note-loading">Loading note...</div>
          ) : (
            <div className="note-content">{userNote}</div>
          )}
        </div>
      )}
    </div>
  )
}