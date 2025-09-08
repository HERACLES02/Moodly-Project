'use client'

import { useState, useEffect } from 'react'
import { useGetUser } from '@/hooks/useGetUser'
import './AvatarSelector.css'

interface AvatarSelectorProps {
  onClose: () => void
  onAvatarSelect: (avatarId: string) => void
}

interface AvatarOption {
  id: string
  name: string
  imagePath: string
}

export default function AvatarSelector({ onClose, onAvatarSelect }: AvatarSelectorProps) {
  const [unlockedAvatars, setUnlockedAvatars] = useState<AvatarOption[]>([])
  const [loading, setLoading] = useState(true)
  const { user, setUser } = useGetUser()

  useEffect(() => {
    fetchUnlockedAvatars()
  }, [])

  const fetchUnlockedAvatars = async () => {
    try {
      // Get unlocked avatars from API
      const response = await fetch('/api/avatars/unlocked')
      const data = await response.json()
      
      if (data.avatarDetails) {
        // Include default option + unlocked avatars
        const allAvatars = [
          { id: 'default', name: 'Default', imagePath: '' }, // Empty path means use emoji
          ...data.avatarDetails
        ]
        setUnlockedAvatars(allAvatars)
        console.log('Available avatars:', allAvatars)
      } else {
        // Fallback to just default if API fails
        const defaultOnly = [{ id: 'default', name: 'Default', imagePath: '' }]
        setUnlockedAvatars(defaultOnly)
        console.log('Available avatars (fallback):', defaultOnly)
      }
      
    } catch (error) {
      console.error('Error fetching unlocked avatars:', error)
      // Fallback to just default if API fails
      const defaultOnly = [{ id: 'default', name: 'Default', imagePath: '' }]
      setUnlockedAvatars(defaultOnly)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarSelect = async (selectedAvatarId: string) => {
    try {
      if (selectedAvatarId === 'default') {
        // Apply default avatar (remove current avatar)
        const response = await fetch('/api/getUser', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentAvatarId: null })
        })

        const data = await response.json()

        if (data.success) {
          // Update user context
          if (user) {
            setUser({ 
              ...user, 
              currentAvatarId: null 
            })
          }
          console.log('Applied default avatar')
        } else {
          alert(data.error || 'Failed to apply avatar')
          return
        }
      } else {
        // Apply selected avatar using avatar API
        const response = await fetch('/api/avatars', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatarId: selectedAvatarId, action: 'apply' })
        })

        const data = await response.json()

        if (data.success) {
          // Update user context
          if (user) {
            setUser({ 
              ...user, 
              currentAvatarId: selectedAvatarId 
            })
          }
          console.log('Applied avatar:', selectedAvatarId)
        } else {
          alert(data.error || 'Failed to apply avatar')
          return
        }
      }

      // Call parent callback and close
      onAvatarSelect(selectedAvatarId)
      onClose()
    } catch (error) {
      console.error('Error applying avatar:', error)
      alert('Failed to apply avatar')
    }
  }

  const getCurrentAvatarId = () => {
    return user?.currentAvatarId || 'default'
  }

  const getAvatarPreview = (avatar: AvatarOption) => {
    if (avatar.imagePath) {
      return (
        <img 
          src={avatar.imagePath} 
          alt={avatar.name}
          className="avatar-option-image"
        />
      )
    } else {
      return <span className="avatar-option-emoji">👤</span>
    }
  }

  return (
    <div className="avatar-selector-overlay">
      <div className="avatar-selector-container">
        <div className="avatar-selector-header">
          <h3 className="avatar-selector-title">Select Avatar</h3>
          <button 
            onClick={onClose}
            className="avatar-selector-close"
          >
            ✕
          </button>
        </div>

        <div className="avatar-selector-content">
          {loading ? (
            <div className="avatar-selector-loading">Loading avatars...</div>
          ) : (
            <>
              <p className="avatar-selector-description">
                Choose an avatar to represent you
              </p>
              
              <div className="avatar-options-list">
                {unlockedAvatars.map((avatar) => {
                  const isActive = getCurrentAvatarId() === avatar.id
                  return (
                    <button
                      key={avatar.id}
                      onClick={() => handleAvatarSelect(avatar.id)}
                      className={`avatar-option ${isActive ? 'active' : ''}`}
                    >
                      <div className="avatar-option-preview">
                        {getAvatarPreview(avatar)}
                      </div>
                      <div className="avatar-option-info">
                        <span className="avatar-option-name">
                          {avatar.name}
                        </span>
                        {isActive && (
                          <span className="avatar-option-active">✓ Active</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {unlockedAvatars.length === 1 && (
                <div className="no-avatars-message">
                  <p>You haven't unlocked any custom avatars yet.</p>
                  <p>Visit the themes store to redeem some with your points!</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}