'use client'

import { createContext, useContext, ReactNode, useState, useEffect } from 'react'
import { themes, type ThemeName, type Theme } from '@/lib/themes'

// Define what our theme context will provide
interface ThemeContextType {
  currentTheme: ThemeName
  theme: Theme
  setTheme: (theme: ThemeName) => void
  isLoading: boolean
}

// Create the context (empty warehouse)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme Provider Component (the delivery system)
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeName>('default')
  const [isLoading, setIsLoading] = useState(true)

  // Load theme from user data when provider mounts
  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        console.log('🔍 Loading user theme from API...')
        const response = await fetch('/api/getUser')
        if (response.ok) {
          const user = await response.json()
          const userTheme = user.currentTheme as ThemeName
          
          console.log('🔍 User theme from API:', userTheme)
          
          // Only set if it's a valid theme
          if (userTheme && themes[userTheme]) {
            setCurrentTheme(userTheme)
            console.log('✅ Set theme to:', userTheme)
          } else {
            console.log('⚠️ Invalid theme, using default:', userTheme)
          }
        } else {
          console.log('⚠️ Failed to load user, using default theme')
        }
      } catch (error) {
        console.error('❌ Error loading theme:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserTheme()
  }, [])

  // Apply theme to CSS variables whenever theme changes
  useEffect(() => {
    if (!isLoading) {
      console.log('🎨 Applying theme to CSS variables:', currentTheme)
      
      const themeData = themes[currentTheme]
      const root = document.documentElement

      // Set CSS variables
      root.style.setProperty('--theme-background', themeData.background)
      root.style.setProperty('--theme-foreground', themeData.foreground)
      root.style.setProperty('--theme-card', themeData.card)
      root.style.setProperty('--theme-border', themeData.border)
      root.style.setProperty('--theme-accent', themeData.accent)
      root.style.setProperty('--theme-navbar', themeData.navbar)

      console.log('✅ CSS variables applied for theme:', currentTheme)
    }
  }, [currentTheme, isLoading])

  // Function to change theme
  const setTheme = async (newTheme: ThemeName) => {
    console.log('🎯 Theme change requested:', newTheme)
    
    // Update UI immediately (optimistic update)
    setCurrentTheme(newTheme)
    
    // Save to database in background
    try {
      console.log('💾 Saving theme to database...')
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: newTheme, action: 'apply' })
      })
      
      const data = await response.json()
      if (data.success) {
        console.log('✅ Theme saved to database successfully')
      } else {
        console.error('❌ Failed to save theme:', data.error)
        // Could revert theme here if needed
      }
    } catch (error) {
      console.error('❌ Error saving theme:', error)
      // Could revert theme here if needed
    }
  }

  // Package all the data to provide
  const contextValue: ThemeContextType = {
    currentTheme,
    theme: themes[currentTheme],
    setTheme,
    isLoading
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme (the connection)
export function useTheme() {
  const context = useContext(ThemeContext)
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  
  return context
}