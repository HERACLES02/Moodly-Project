'use client'

import { useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import RedeemableCard from '@/components/RedeemableCard'
import { useGetUser } from '@/hooks/useGetUser'
import './themes.css'
import { useTheme } from 'next-themes'
import SelectTheme from '@/components/SelectTheme'

export default function ThemesPage() {
  const { user } = useGetUser()
  const { setTheme } = useTheme()

  useEffect(() => {
    if (user?.currentTheme && user?.currentTheme != "default"){
      console.log("Themes Page: Current Theme Being Applied")
      setTheme(user.currentTheme.toLowerCase())

    }else if (user?.currentTheme && user.currentTheme == "default") {
       if (user?.mood) {
      setTheme(user.mood.toLowerCase());
    }
    }


  }, [user?.currentTheme, user?.mood, ] )


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

          <div className="themes-grid">
            {/* Van Gogh Theme */}
            <RedeemableCard
              name="Van Gogh"
              price={3}
              type="theme"
              thumbnailPath="van-gogh-image"
            />

            {/* Cat Theme */}
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