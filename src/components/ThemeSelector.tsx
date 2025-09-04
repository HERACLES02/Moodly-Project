'use client'

import { useState, useEffect } from 'react'
import './ThemeSelector.css'

interface ThemeSelectorProps {
  onClose: () => void
  onThemeSelect: (theme: string) => void
}

export default function ThemeSelector({ onClose, onThemeSelect }: ThemeSelectorProps) {
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([])
  const [currentTheme, setCurrentTheme] = useState('default')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchThemeData()
  }, [])

  const fetchThemeData = async () => {
    try {
      // Get current theme
      const response = await fetch('/api/themes')
      const data = await response.json()
      setCurrentTheme(data.currentTheme || 'default')
      
      // Get unlocked themes
      const unlockedResponse = await fetch('/api/themes/unlocked')
      const unlockedData = await unlockedResponse.json()
      setUnlockedThemes(unlockedData.unlockedThemes || [])
    } catch (error) {
      console.error('Error fetching theme data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeSelect = async (themeId: string) => {
    try {
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, action: 'apply' })
      })

      const data = await response.json()

      if (data.success) {
        // This is the key fix: Call the onThemeSelect callback first
        onThemeSelect(themeId)
        
        // Close the selector
        onClose()
        
        // Add a small delay to ensure the selector closes, then reload
        // This is the same logic that works in RedeemableCard
        setTimeout(() => {
          console.log('ThemeSelector: Reloading page to apply theme:', themeId)
          window.location.reload()
        }, 100)
        
      } else {
        alert(data.error || 'Failed to apply theme')
      }
    } catch (error) {
      console.error('Error applying theme:', error)
      alert('Failed to apply theme')
    }
  }

  const getThemeDisplayName = (themeId: string) => {
    switch (themeId) {
      case 'van-gogh': return 'Van Gogh'
      case 'cat': return 'Cat'
      case 'default': return 'Default'
      default: return themeId
    }
  }

  const allAvailableThemes = ['default', ...unlockedThemes]

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
                {allAvailableThemes.map((themeId) => (
                  <button
                    key={themeId}
                    onClick={() => handleThemeSelect(themeId)}
                    className={`theme-option ${currentTheme === themeId ? 'active' : ''}`}
                  >
                    <span className="theme-option-name">
                      {getThemeDisplayName(themeId)}
                    </span>
                    {currentTheme === themeId && (
                      <span className="theme-option-active">✓ Active</span>
                    )}
                  </button>
                ))}
              </div>

              {unlockedThemes.length === 0 && (
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