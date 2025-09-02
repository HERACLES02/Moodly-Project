'use client'

import React from 'react'

interface RedeemableCardProps {
  name: string
  price: number
  imagePath: string   // actual image path or CSS class
  type: 'avatar' | 'theme'
  userPoints: number
  currentTheme: string
  unlockedThemes: string[]
  handleAction: (id: string, action: 'redeem' | 'apply') => void
}

export default function RedeemableCard({
  name,
  price,
  imagePath,
  type,
  userPoints,
  currentTheme,
  unlockedThemes,
  handleAction
}: RedeemableCardProps) {

  // Use lowercase id from name (safe for matching)
  const id = name.toLowerCase().replace(/\s+/g, '-')

  const isUnlocked = unlockedThemes.includes(id)

  const getButtonText = () => {
    if (isUnlocked) {
      return currentTheme === id ? 'CURRENTLY ACTIVE' : 'APPLY'
    }
    return userPoints >= price ? 'REDEEM NOW' : `NEED ${price - userPoints} MORE`
  }

  const getButtonClass = () => {
    if (isUnlocked) {
      return currentTheme === id ? 'current-theme' : 'can-apply'
    }
    return userPoints >= price ? 'can-redeem' : 'cannot-redeem'
  }

  return (
    <div className={`redeem-card ${type}-card`}>
      <div className="redeem-preview">
        {/* If you’re using real images */}
        {imagePath.endsWith('.jpg') || imagePath.endsWith('.png') ? (
          <img src={imagePath} alt={name} className="redeem-image" />
        ) : (
          // If you’re using CSS background class
          <div className={`redeem-image ${imagePath}`}></div>
        )}

        <div className="redeem-points-badge">{price} POINTS</div>
        <div className="redeem-label">{name.toUpperCase()}</div>
      </div>

      <div className="redeem-actions">
        <button
          onClick={() => handleAction(id, isUnlocked ? 'apply' : 'redeem')}
          className={`redeem-button ${getButtonClass()}`}
          disabled={!isUnlocked && userPoints < price}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}
