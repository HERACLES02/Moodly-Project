'use client'

import { useState, useEffect } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import './themes.css'

export default function ThemesPage() {
  const [userPoints, setUserPoints] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserPoints()
  }, [])

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/points/get')
      const data = await response.json()
      setUserPoints(data.points || 0)
    } catch (error) {
      console.error('Error fetching points:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemVanGogh = () => {
    if (userPoints >= 3) {
      alert('Van Gogh theme unlocked! (This will deduct 3 points)')
    } else {
      alert(`You need 3 points to unlock Van Gogh theme. You have ${userPoints} points.`)
    }
  }

  const handleRedeemCat = () => {
    if (userPoints >= 6) {
      alert('Cat theme unlocked! (This will deduct 6 points)')
    } else {
      alert(`You need 6 points to unlock Cat theme. You have ${userPoints} points.`)
    }
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
                  onClick={handleRedeemVanGogh}
                  className={`redeem-button ${userPoints >= 3 ? 'can-redeem' : 'cannot-redeem'}`}
                  disabled={userPoints < 3}
                >
                  {userPoints >= 3 ? 'REDEEM NOW' : `NEED ${3 - userPoints} MORE`}
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
                  onClick={handleRedeemCat}
                  className={`redeem-button ${userPoints >= 6 ? 'can-redeem' : 'cannot-redeem'}`}
                  disabled={userPoints < 6}
                >
                  {userPoints >= 6 ? 'REDEEM NOW' : `NEED ${6 - userPoints} MORE`}
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