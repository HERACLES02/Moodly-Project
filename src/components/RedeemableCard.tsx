'use client'

import { useState, useEffect } from 'react'
import { useGetUser } from '@/hooks/useGetUser'
import './RedeemableCard.css'
import { useTheme } from 'next-themes'

// Step 1: Define the props interface
// This is exactly what you'll pass from the themes page - nothing more, nothing less
interface RedeemableCardProps {
  name: string           // "Van Gogh", "Cat", etc.
  price: number         // 3, 6, etc. (points required)
  type: 'theme' | 'avatar'  // Theme for now, Avatar for later
  thumbnailPath: string // Path to image or CSS class name
}

export default function RedeemableCard({ name, price, type, thumbnailPath }: RedeemableCardProps) {
  // Step 2: Set up state for managing component data
  // These states handle all the logic internally
  const [userPoints, setUserPoints] = useState(0)
  const [unlockedItems, setUnlockedItems] = useState<string[]>([])
  const [currentTheme, setCurrentTheme] = useState('default')
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const { setTheme } = useTheme()
  
  // Get user context to update it when theme changes
  const { user, setUser } = useGetUser()

  // Step 3: Convert the name to ID format for database operations
  // This converts "Van Gogh" to "van-gogh" for consistent database storage
  const itemId = name.toLowerCase().replace(/\s+/g, '')

  // Step 4: Fetch user data when component mounts
  // This gets the user's points, unlocked items, and current theme/avatar
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Get user points first (same endpoint for both themes and avatars)
      const userResponse = await fetch('/api/getUser')
      const userData = await userResponse.json()
      setUserPoints(userData.points || 0)

      if (type === 'theme') {
        // Get current theme and unlocked themes
        const themeResponse = await fetch('/api/themes')
        const themeData = await themeResponse.json()
        setCurrentTheme(themeData.currentTheme || 'default')
        
        const unlockedResponse = await fetch('/api/themes/unlocked')
        const unlockedData = await unlockedResponse.json()
        setUnlockedItems(unlockedData.unlockedThemes || [])
      } else if (type === 'avatar') {
        // Get current avatar and unlocked avatars
        const avatarResponse = await fetch('/api/avatars')
        const avatarData = await avatarResponse.json()
        setCurrentTheme(avatarData.currentAvatarId || 'default') // We reuse currentTheme state for current avatar
        
        const unlockedResponse = await fetch('/api/avatars/unlocked')
        const unlockedData = await unlockedResponse.json()
        setUnlockedItems(unlockedData.unlockedAvatars || [])
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Step 5: Check if user owns this item
  // This determines whether to show "Redeem" or "Apply" button
  const isUnlocked = unlockedItems.includes(itemId)

  // Step 6: Handle the main action (Redeem or Apply)
  // This function contains all the clicking logic
  const handleAction = async () => {
    // Prevent multiple clicks while processing
    if (isProcessing) return

    setIsProcessing(true)

    try {
      // Determine action: if unlocked, apply it; if not, redeem it
      const action = isUnlocked ? 'apply' : 'redeem'
      
      // Determine API endpoint based on type
      const apiEndpoint = type === 'theme' ? '/api/themes' : '/api/avatars'
      
      // Make API call to appropriate endpoint
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          [type === 'theme' ? 'themeId' : 'avatarId']: itemId, 
          action 
        })
      })

      const data = await response.json()

      if (data.success) {
        // Show success message
        alert(data.message)
        
        // Refresh user data to update the component state
        await fetchUserData()
        
        // Update user context if applying
        if (action === 'apply' && user) {
          if (type === 'theme') {
            setUser({ 
              ...user, 
              currentTheme: itemId 
            })
            setTheme(itemId.toLowerCase())
          } else if (type === 'avatar') {
            setUser({ 
              ...user, 
              currentAvatarId: data.avatarId 
            })
          }
          console.log(`Updated user context with new ${type}:`, itemId)
        }
      } else {
        // Show error message
        alert(data.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('Error with action:', error)
      alert('Failed to process request')
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 7: Determine button text based on current state
  // This logic determines what text to show on the button
  const getButtonText = () => {
    if (loading) return 'LOADING...'
    if (isProcessing) return 'PROCESSING...'
    
    if (isUnlocked) {
      // User owns this item
      if (type === 'theme' && currentTheme === itemId) {
        return 'CURRENTLY ACTIVE'
      } else if (type === 'avatar' && currentTheme === itemId) {
        return 'CURRENTLY ACTIVE'
      }
      return type === 'theme' ? 'APPLY THEME' : 'APPLY AVATAR'
    } else {
      // User doesn't own this item
      if (userPoints >= price) {
        return 'REDEEM NOW'
      } else {
        return `NEED ${price - userPoints} MORE`
      }
    }
  }

  // Step 8: Determine button styling based on current state
  // This logic determines what CSS class to apply to the button
  const getButtonClass = () => {
    if (loading || isProcessing) return 'loading'
    
    if (isUnlocked) {
      if ((type === 'theme' && currentTheme === itemId) || 
          (type === 'avatar' && currentTheme === itemId)) {
        return 'current-theme'
      }
      return 'can-apply'
    } else {
      return userPoints >= price ? 'can-redeem' : 'cannot-redeem'
    }
  }

  // Step 9: Determine if button should be disabled
  // This prevents clicks when user can't afford or when processing
  const isButtonDisabled = () => {
    if (loading || isProcessing) return true
    if (!isUnlocked && userPoints < price) return true
    if ((type === 'theme' && currentTheme === itemId) || 
        (type === 'avatar' && currentTheme === itemId)) return true
    return false
  }

  // Step 10: Render the component
  return (
    <div className={`redeemable-card ${type}-card ${itemId}-card`}>
      {/* Preview section with image and labels */}
      <div className="redeemable-preview">
        {/* Handle both image files and CSS background classes */}
        {thumbnailPath.endsWith('.jpg') || thumbnailPath.endsWith('.png') || thumbnailPath.endsWith('.jpeg') ? (
          <img src={thumbnailPath} alt={name} className="redeemable-image" />
        ) : (
          <div className={`redeemable-image ${thumbnailPath}`}></div>
        )}
        
        {/* Points badge */}
        <div className="redeemable-points-badge">{price} POINTS</div>
        
        {/* Item name label */}
        <div className="redeemable-label">{name.toUpperCase()}</div>
      </div>

      {/* Action section with button */}
      <div className="redeemable-actions">
        <button
          onClick={handleAction}
          className={`redeemable-button ${getButtonClass()}`}
          disabled={isButtonDisabled()}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  )
}