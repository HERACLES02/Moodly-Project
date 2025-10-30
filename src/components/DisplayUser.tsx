'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'  // ← CHANGED: Import from context
import './DisplayUser.css'

// ═══════════════════════════════════════════════════════════════════
// Define the props that this component accepts
// ═══════════════════════════════════════════════════════════════════
interface DisplayUserProps {
  userId?: string           // Optional: specific user ID (for displaying other users)
  showName?: boolean       // Optional: show username (default: true)
  showAvatar?: boolean     // Optional: show avatar (default: true) 
  note?: boolean          // Optional: show notes on hover (for livestream)
  className?: string      // Optional: additional CSS classes
}

// ═══════════════════════════════════════════════════════════════════
// Define what user data looks like
// ═══════════════════════════════════════════════════════════════════
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
  
  // ══════════════════════════════════════════════════════════════════
  // CHANGED: Get current user from context
  // ══════════════════════════════════════════════════════════════════
  const { user: currentUser, loading: contextLoading } = useUser()
  
  // Component state - manages data for display
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(false)

  // ══════════════════════════════════════════════════════════════════
  // When component mounts or userId changes, fetch/set user data
  // ══════════════════════════════════════════════════════════════════
  const [ imgPath, setimgPath ] = useState('')
  useEffect( () => {
    if (currentUser?.currentAvatar)
    setimgPath(currentUser?.unlockedAvatars?.find( a => a.id === currentUser?.currentAvatarId).imagePath)
  }, [currentUser?.currentAvatarId] )
  useEffect(() => {
    // Wait for context to finish loading
    

    // If no userId provided, display current user from context
    if (!userId && currentUser) {
      console.log('🔍 DisplayUser: Using current user from context')
      setUserData({
        anonymousName: currentUser.anonymousName,
        currentAvatarId: currentUser.currentAvatarId || null,
        note: currentUser.note || '',
        currentAvatar: currentUser.currentAvatar
      })
      setLoading(false)
    } 
    // If userId provided, fetch that specific userf no userId and no currentUser, we're not logged in
    else {
      setLoading(false)
    }
  }, [userId, currentUser, contextLoading])

  // ══════════════════════════════════════════════════════════════════
  // Fetch data for other users (not the current user)
  // ══════════════════════════════════════════════════════════════════
  const fetchOtherUserData = async () => {
    try {
      setLoading(true)
      const endpoint = `/api/users/${userId}`
      
      console.log('🔍 DisplayUser: Fetching other user data from:', endpoint)
      const response = await fetch(endpoint)
      
      if (response.ok) {
        const data = await response.json()
        console.log('🔍 DisplayUser: Received other user data:', data)
        setUserData(data)
      } else {
        console.error('❌ DisplayUser: Failed to fetch user data, status:', response.status)
        setUserData(null)
      }
    } catch (error) {
      console.error('❌ DisplayUser: Error fetching user data:', error)
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // Show loading state while fetching data
  // ══════════════════════════════════════════════════════════════════
  if (loading || contextLoading) {
    return (
      <div className={`display-user loading ${className}`}>
        <div className="loading-placeholder">Loading...</div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════
  // Show error state if no user data
  // ══════════════════════════════════════════════════════════════════
  if (!userData) {
    return (
      <div className={`display-user error ${className}`}>
        <span>👤 Unknown</span>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════
  // Determine what avatar to show
  // ══════════════════════════════════════════════════════════════════
  const getAvatarDisplay = () => {
    if (userData.currentAvatar && userData.currentAvatar.imagePath) {
      return (
        <img 
          src={imgPath} 
          alt={userData.currentAvatar.name}
          className="user-avatar-image"
          onError={(e) => {
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

  // ══════════════════════════════════════════════════════════════════
  // Handle mouse enter for tooltip (notes feature)
  // ══════════════════════════════════════════════════════════════════
  const handleMouseEnter = () => {
    if (note && userData.note) {
      setShowTooltip(true)
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // Handle mouse leave for tooltip
  // ══════════════════════════════════════════════════════════════════
  const handleMouseLeave = () => {
    setShowTooltip(false)
  }

  // ══════════════════════════════════════════════════════════════════
  // Render Component
  // ══════════════════════════════════════════════════════════════════
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
        <span className="user-name text-black">
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

