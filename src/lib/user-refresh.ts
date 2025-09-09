// Utility functions for refreshing user displays

/**
 * Refresh a specific user's display by their ID
 * @param userId - The user ID to refresh (or 'current' for current user)
 */
export const refreshUserDisplay = (userId?: string) => {
  if (typeof window === 'undefined') return
  
  const refreshKey = `refreshUser_${userId || 'current'}`
  const refreshFunction = (window as any)[refreshKey]
  
  if (refreshFunction && typeof refreshFunction === 'function') {
    console.log(`🔄 Refreshing user display for: ${userId || 'current'}`)
    refreshFunction()
  } else {
    console.warn(`⚠️ No refresh function found for user: ${userId || 'current'}`)
  }
}

/**
 * Refresh all user displays in the current chat
 * This is useful when a user updates their avatar or notes
 */
export const refreshAllUserDisplays = () => {
  if (typeof window === 'undefined') return
  
  // Refresh current user
  refreshUserDisplay('current')
  
  // Note: For other users, we'd need to track their IDs
  // This could be enhanced to refresh specific users if needed
  console.log('🔄 Refreshed all user displays')
}

/**
 * Refresh user displays after avatar or note updates
 * Call this after successful avatar/note updates
 */
export const refreshAfterUserUpdate = () => {
  // Small delay to ensure the database has been updated
  setTimeout(() => {
    refreshAllUserDisplays()
  }, 500)
}
