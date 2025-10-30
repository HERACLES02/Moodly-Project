'use client'

import { useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import RedeemableCard from '@/components/RedeemableCard'
import { useUser } from '@/contexts/UserContext'  // ← CHANGED: Import from context
import './themes.css'
import { useTheme } from 'next-themes'

export default function ThemesPage() {
  // ══════════════════════════════════════════════════════════════════
  // CHANGED: Use context instead of useGetUser
  // ══════════════════════════════════════════════════════════════════
  const { user } = useUser()
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
  }, [user?.currentTheme, user?.mood, setTheme] )

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
              price={20}
              type="theme"
              thumbnailPath="cat-image"
            />

            {/* Avagato Avatar */}
            <RedeemableCard
              name="Avagato"
              price={5}
              type="avatar"
              thumbnailPath="/images/avatars/Avagato.jpg"
            />

            {/* Baenana Avatar */}
            <RedeemableCard
              name="Baenana"
              price={8}
              type="avatar"
              thumbnailPath="/images/avatars/Baenana.jpg"
            />

            {/* Buluberry Avatar */}
            <RedeemableCard
              name="Buluberry"
              price={10}
              type="avatar"
              thumbnailPath="/images/avatars/Buluberry.jpg"
            />

            {/* Peeckaboo Avatar */}
            <RedeemableCard
              name="Peeckaboo"
              price={12}
              type="avatar"
              thumbnailPath="/images/avatars/Peeckaboo.jpg"
            />

            {/* Storoberry Avatar */}
            <RedeemableCard
              name="Storoberry"
              price={12}
              type="avatar"
              thumbnailPath="/images/avatars/Storoberry.jpg"
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