'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@/contexts/UserContext'  // ← CHANGED: Import from context
import { useTheme } from 'next-themes'
import './ThemeSelector.css'

interface ThemeSelectorProps {
  onClose: () => void
  onThemeSelect: (theme: string) => void
}

export default function ThemeSelector({ onClose, onThemeSelect }: ThemeSelectorProps) {
  const { user, updateUserTheme } = useUser()
  const { setTheme } = useTheme()

  const unlockedThemes = user?.unlockedThemes 
    ? ['Default', ...user.unlockedThemes.split(',').filter(Boolean) ]
    : ['Default']

  const loading = !user // Simple loading check

  

  const handleThemeSelect = async (selectedTheme: string) => {
    try {
      // Update database with selected theme
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: selectedTheme.toLowerCase(), action: 'apply' })
      })

      const data = await response.json()

      if (data.success) {
        // ════════════════════════════════════════════════════════════
        // CHANGED: Update context instead of setUser
        // ════════════════════════════════════════════════════════════
        updateUserTheme(selectedTheme)
        console.log('✅ Updated theme in context:', selectedTheme)

        // Apply theme logic using provider
        if (selectedTheme === 'Default') {
          // For default theme, use mood if available
          if (user?.mood) {
            setTheme(user.mood.toLowerCase())
            console.log('Applied mood theme:', user.mood.toLowerCase())
          } else {
            setTheme('default')
            console.log('Applied default theme')
          }
        } else {
          // For premium themes, use the theme directly
          setTheme(selectedTheme.toLowerCase())
          console.log('Applied premium theme:', selectedTheme.toLowerCase())
        }

        // Call parent callback and close
        onThemeSelect(selectedTheme)
        onClose()
      } else {
        alert(data.error || 'Failed to apply theme')
      }
    } catch (error) {
      console.error('Error applying theme:', error)
      alert('Failed to apply theme')
    }
  }

  const getThemeDisplayName = (themeId: string) => {
    switch (themeId.toLowerCase()) {
      case 'vangogh': return 'Van Gogh'
      case 'cat': return 'Cat'
      case 'default': return 'Default'
      default: return themeId.charAt(0).toUpperCase() + themeId.slice(1)
    }
  }

  const getCurrentTheme = () => {
    return user?.currentTheme?.toLowerCase() || 'default'
  }

  return (
    <div className="theme-selector-overlay">
      <div className="theme-selector-container">
        <div className="theme-selector-header">
          <h3 className="theme-selector-title">Select Theme</h3>
          <button 
            onClick={onClose}
            className="theme-selector-close"
          >
            ✕
          </button>
        </div>

        <div className="theme-selector-content">
          {loading ? (
            <div className="theme-selector-loading">Loading themes...</div>
          ) : (
            <>
              <p className="theme-selector-description">
                Choose a theme to apply to your experience
              </p>
              
              <div className="theme-options-list">
                {unlockedThemes.map((themeId) => {
                  const isActive = getCurrentTheme() === themeId.toLowerCase()
                  return (
                    <button
                      key={themeId}
                      onClick={() => handleThemeSelect(themeId)}
                      className={`theme-option ${isActive ? 'active' : ''}`}
                    >
                      <span className="theme-option-name">
                        {getThemeDisplayName(themeId)}
                      </span>
                      {isActive && (
                        <span className="theme-option-active">✓ Active</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {unlockedThemes.length === 1 && (
                <div className="no-themes-message">
                  <p>You haven't unlocked any premium themes yet.</p>
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