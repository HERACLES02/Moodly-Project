'use client'

import { useState, useEffect } from 'react'
import './DisplayUser.css'

// Define the props that this component accepts
interface DisplayUserProps {
  userId?: string           // Optional: specific user ID (for displaying other users)
  showName?: boolean       // Optional: show username (default: true)
  showAvatar?: boolean     // Optional: show avatar (default: true) 
  note?: boolean          // Optional: show notes on hover (for livestream)
  className?: string      // Optional: additional CSS classes
}

// Define what user data looks like
interface UserData {
  anonymousName: string
  currentAvatarId: string | null
  note: string
  currentAvatar?: {
    imagePath: string
    name: string
  }
}

export default function DisplayUser({ 
  userId,                    // If provided, show specific user; if not, show current user
  showName = true,          // Default to showing name
  showAvatar = true,        // Default to showing avatar
  note = false,             // Default to not showing notes
  className = ''            // Default to no extra classes
}: DisplayUserProps) {
  
  // Component state - this manages all the data internally
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  // When component mounts, fetch user data
  useEffect(() => {
    fetchUserData()
  }, [userId]) // Re-fetch if userId changes

  const fetchUserData = async () => {
    try {
      // Determine which API endpoint to use
      const endpoint = userId ? `/api/users/${userId}` : '/api/getUser'
      
      console.log('🔍 DisplayUser: Fetching user data from:', endpoint)
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 DisplayUser: Received user data:', data)
        console.log('🔍 DisplayUser: Current avatar ID:', data.currentAvatarId)
        console.log('🔍 DisplayUser: Current avatar object:', data.currentAvatar)
        setUserData(data)
      } else {
        console.error('❌ DisplayUser: Failed to fetch user data, status:', response.status)
      }
    } catch (error) {
      console.error('❌ DisplayUser: Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className={`display-user loading ${className}`}>
        <div className="loading-placeholder">Loading...</div>
      </div>
    )
  }

  // Show error state if no user data
  if (!userData) {
    return (
      <div className={`display-user error ${className}`}>
        <span>👤 Unknown</span>
      </div>
    )
  }

  // Determine what avatar to show
  const getAvatarDisplay = () => {
    console.log('🎭 DisplayUser: Getting avatar display...')
    console.log('🎭 DisplayUser: userData.currentAvatar:', userData.currentAvatar)
    console.log('🎭 DisplayUser: userData.currentAvatarId:', userData.currentAvatarId)
    
    if (userData.currentAvatar && userData.currentAvatar.imagePath) {
      console.log('✅ DisplayUser: Using custom avatar:', userData.currentAvatar.imagePath)
      // User has a custom avatar selected
      return (
        <img 
          src={userData.currentAvatar.imagePath} 
          alt={userData.currentAvatar.name}
          className="user-avatar-image"
          onError={(e) => {
            console.error('❌ DisplayUser: Avatar image failed to load:', userData.currentAvatar?.imagePath)
            console.error('❌ DisplayUser: Image error:', e)
          }}
          onLoad={() => {
            console.log('✅ DisplayUser: Avatar image loaded successfully:', userData.currentAvatar?.imagePath)
          }}
        />
      )
    } else {
      console.log('📱 DisplayUser: Using default emoji avatar')
      // Use default emoji avatar
      return <span className="user-avatar-emoji">👤</span>
    }
  }

  // Handle mouse enter for tooltip (notes feature)
  const handleMouseEnter = () => {
    if (note && userData.note) {
      setShowTooltip(true)
    }
  }

  // Handle mouse leave for tooltip
  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  return (
    <div 
      className={`display-user ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Avatar Section */}
      {showAvatar && (
        <div className="user-avatar-container">
          {getAvatarDisplay()}
        </div>
      )}

      {/* Name Section */}
      {showName && (
        <span className="user-name">
          {userData.anonymousName}
        </span>
      )}

      {/* Tooltip for notes (when note prop is true) */}
      {note && showTooltip && userData.note && (
        <div className="user-note-tooltip">
          {userData.note}
        </div>
      )}
    </div>
  )
}