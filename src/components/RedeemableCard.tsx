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
  // This gets the user's points, unlocked items, and current theme
  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Get current theme and points from themes API
      const response = await fetch('/api/themes')
      const data = await response.json()
      setUserPoints(data.points || 0)
      setCurrentTheme(data.currentTheme || 'default')
      
      
      // Get unlocked themes (we'll expand this for avatars later)
      if (type === 'theme') {
        const unlockedResponse = await fetch('/api/themes/unlocked')
        const unlockedData = await unlockedResponse.json()
        setUnlockedItems(unlockedData.unlockedThemes || [])
      }
      
      // TODO: Add avatar API call when avatar system is ready
      
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
      
      // Make API call to themes endpoint
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: itemId, action })
      })

      const data = await response.json()

      if (data.success) {
        // Show success message
        alert(data.message)
        
        // Refresh user data to update the component state
        await fetchUserData()
        
        // If we applied a theme, update user context - ThemeProvider will handle the theme switch automatically
        if (action === 'apply' && type === 'theme' && user) {
          setUser({ 
            ...user, 
            currentTheme: itemId 
          })
          console.log('Updated user context with new theme:', itemId)
        }
      } else {
        // Show error message
        alert(data.error || 'Something went wrong')
      }
    } catch (error) {
      console.error('Error with action:', error)
      alert('Failed to process request')
    } finally {
      setTheme(itemId.toLowerCase())
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
      if (type === 'theme' && currentTheme === itemId) {
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
    if (type === 'theme' && currentTheme === itemId) return true
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