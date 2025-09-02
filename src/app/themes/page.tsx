'use client'

import { useState, useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import { useGetUser } from '@/hooks/useGetUser'  // Add this import
import '@/components/ThemeOverrides.css'        // Add this import
import './themes.css'

export default function ThemesPage() {
  const [userPoints, setUserPoints] = useState(0)
  const [loading, setLoading] = useState(true)
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([])
  const [currentTheme, setCurrentTheme] = useState('default')
  const { user } = useGetUser()  // Add this line

  // Add this useEffect for theme application
  useEffect(() => {
    if (user?.currentTheme) {
      console.log('ThemesPage: Applying theme:', user.currentTheme)
      // Remove any existing theme and mood classes
      document.body.classList.remove('theme-van-gogh', 'theme-cat', 'theme-default', 'mood-happy', 'mood-sad')
      
      // If it's default theme, apply mood class instead
      if (user.currentTheme === 'default') {
        if (user.mood) {
          document.body.classList.add(`mood-${user.mood.toLowerCase()}`)
          console.log('ThemesPage: Applied mood class for default theme:', user.mood.toLowerCase())
        }
      } else {
        // Apply premium theme class
        document.body.classList.add(`theme-${user.currentTheme}`)
      }
    }
  }, [user?.currentTheme, user?.mood])

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/themes')
      const data = await response.json()
      setUserPoints(data.points || 0)
      setCurrentTheme(data.currentTheme || 'default')
      
      // Get unlocked themes
      const userResponse = await fetch('/api/themes/unlocked')
      const userData = await userResponse.json()
      setUnlockedThemes(userData.unlockedThemes || [])
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeAction = async (themeId: string, action: 'redeem' | 'apply') => {
    try {
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId, action })
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        // Refresh user data
        await fetchUserData()
        // Refresh page to apply theme immediately
        window.location.reload()
      } else {
        alert(data.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('Error with theme action:', error)
      alert('Failed to process theme request')
    }
  }

  const isThemeUnlocked = (themeId: string) => {
    return unlockedThemes.includes(themeId)
  }

  const getButtonText = (themeId: string, pointsRequired: number) => {
    if (isThemeUnlocked(themeId)) {
      return currentTheme === themeId ? 'CURRENTLY ACTIVE' : 'APPLY THEME'
    }
    return userPoints >= pointsRequired ? 'REDEEM NOW' : `NEED ${pointsRequired - userPoints} MORE`
  }

  const getButtonClass = (themeId: string, pointsRequired: number) => {
    if (isThemeUnlocked(themeId)) {
      return currentTheme === themeId ? 'current-theme' : 'can-apply'
    }
    return userPoints >= pointsRequired ? 'can-redeem' : 'cannot-redeem'
  }

  if (loading) {
    return (
      <div className="themes-container">
        <NavbarComponent />
        <div className="loading-section">
          <p className="loading-text">Loading themes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="themes-container">
      <NavbarComponent />
      
      <main className="themes-main">
        <div className="themes-content">
          <div className="themes-header">
            <h1 className="themes-title">Redeem Your Mood Points</h1>
            <p className="themes-subtitle">
              Personalize your dashboard with exclusive Moodly theme!
            </p>
            <div className="user-points-display">
              <span className="points-label">Your Points:</span>
              <span className="points-value">{userPoints}</span>
            </div>
          </div>

          <div className="themes-grid">
            {/* Van Gogh Theme Card */}
            <div className="theme-card van-gogh-card">
              <div className="theme-preview van-gogh-preview">
                <div className="theme-image van-gogh-image"></div>
                <div className="theme-points-badge">3 POINTS</div>
                <div className="theme-label">VAN GOGH</div>
              </div>
              
              <div className="theme-actions">
                <button 
                  onClick={() => handleThemeAction('van-gogh', isThemeUnlocked('van-gogh') ? 'apply' : 'redeem')}
                  className={`redeem-button ${getButtonClass('van-gogh', 3)}`}
                  disabled={!isThemeUnlocked('van-gogh') && userPoints < 3}
                >
                  {getButtonText('van-gogh', 3)}
                </button>
              </div>
            </div>

            {/* Cat Theme Card */}
            <div className="theme-card cat-card">
              <div className="theme-preview cat-preview">
                <div className="theme-image cat-image"></div>
                <div className="theme-points-badge">6 POINTS</div>
                <div className="theme-label">CAT</div>
              </div>
              
              <div className="theme-actions">
                <button 
                  onClick={() => handleThemeAction('cat', isThemeUnlocked('cat') ? 'apply' : 'redeem')}
                  className={`redeem-button ${getButtonClass('cat', 6)}`}
                  disabled={!isThemeUnlocked('cat') && userPoints < 6}
                >
                  {getButtonText('cat', 6)}
                </button>
              </div>
            </div>
          </div>

          <div className="themes-footer">
            <p className="earn-points-text">
              💡 Earn more points by watching movies, listening to songs, and favoriting content!
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}