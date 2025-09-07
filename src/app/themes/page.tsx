'use client'

import { useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import RedeemableCard from '@/components/RedeemableCard'
import { useGetUser } from '@/hooks/useGetUser'
import '@/components/ThemeOverrides.css'
import './themes.css'

export default function ThemesPage() {
  const { user } = useGetUser()

  // Apply theme when user data changes
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

  return (
    <div className="themes-container">
      <NavbarComponent />
      
      <main className="themes-main">
        <div className="themes-content">
          <div className="themes-header">
            <h1 className="themes-title">Redeem Your Mood Points</h1>
            <p className="themes-subtitle">
              Personalize your dashboard with exclusive Moodly themes!
            </p>
          </div>

          {/* This is the new simplified approach */}
          <div className="themes-grid">
            {/* Van Gogh Theme - Just pass the 4 required props */}
            <RedeemableCard
              name="Van Gogh"
              price={3}
              type="theme"
              thumbnailPath="van-gogh-image"
            />

            {/* Cat Theme - Just pass the 4 required props */}
            <RedeemableCard
              name="Cat"
              price={600}
              type="theme"
              thumbnailPath="cat-image"
            />
            
          

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