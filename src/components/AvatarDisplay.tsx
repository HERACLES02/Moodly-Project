'use client'
import { useState, useEffect } from 'react'
import './AvatarDisplay.css'

interface AvatarDisplayProps {
  size?: 'small' | 'medium' | 'large'
  showBorder?: boolean
  className?: string
}

export default function AvatarDisplay({ 
  size = 'medium', 
  showBorder = true, 
  className = '' 
}: AvatarDisplayProps) {
  const [currentAvatar, setCurrentAvatar] = useState('default')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only fetch if we don't have the avatar data yet
    if (currentAvatar === 'default' && !loading) {
      fetchUserAvatar()
    }
  }, []) // Empty dependency array to run only once

  const fetchUserAvatar = async () => {
    try {
      const response = await fetch('/api/themes')
      const data = await response.json()
      
      if (response.ok && data.currentAvatar) {
        setCurrentAvatar(data.currentAvatar)
      }
    } catch (error) {
      console.error('Error fetching user avatar:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAvatarImage = () => {
    const avatarImages = {
      'avagato': '/images/avatars/Avagato.jpg',
      'baenana': '/images/avatars/Baenana.jpg',
      'buluberry': '/images/avatars/Buluberry.jpg',
      'peeckaboo': '/images/avatars/Peeckaboo.jpg',
      'storoberry': '/images/avatars/Storoberry.jpg',
      'default': '/images/avatars/default-avatar.png'
    }
    return avatarImages[currentAvatar] || avatarImages.default
  }

  const getAvatarName = () => {
    const avatarNames = {
      'avagato': 'Avagato',
      'baenana': 'Baenana',
      'buluberry': 'Buluberry',
      'peeckaboo': 'Peeckaboo',
      'storoberry': 'Storoberry',
      'default': 'Default'
    }
    return avatarNames[currentAvatar] || 'Default'
  }

  if (loading) {
    return (
      <div className={`avatar-display ${size} ${className}`}>
        <div className="avatar-skeleton"></div>
      </div>
    )
  }

  return (
    <div className={`avatar-display ${size} ${showBorder ? 'with-border' : ''} ${className}`}>
      <img
        src={getAvatarImage()}
        alt={`${getAvatarName()} Avatar`}
        className="avatar-image"
        onError={(e) => {
          // Fallback to default avatar if image fails to load
          e.currentTarget.src = '/images/avatars/default-avatar.png'
        }}
      />
      <div className="avatar-glow"></div>
    </div>
  )
}