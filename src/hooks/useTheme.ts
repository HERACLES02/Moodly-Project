'use client'

import { useState, useEffect } from 'react'

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>('default')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentTheme()
  }, [])

  const fetchCurrentTheme = async () => {
    try {
      const response = await fetch('/api/themes')
      const data = await response.json()
      const theme = data.currentTheme || 'default'
      setCurrentTheme(theme)
      
      // Apply theme to body class
      applyThemeToBody(theme)
    } catch (error) {
      console.error('Error fetching current theme:', error)
      setCurrentTheme('default')
      applyThemeToBody('default')
    } finally {
      setLoading(false)
    }
  }

  const applyThemeToBody = (theme: string) => {
    // Remove any existing theme classes
    document.body.classList.remove('theme-van-gogh', 'theme-cat', 'theme-default')
    
    // If it's default theme, don't add any theme class
    // This allows mood classes to work normally
    if (theme !== 'default') {
      document.body.classList.add(`theme-${theme}`)
    }
    
    console.log('Applied theme to body:', theme)
  }

  const updateTheme = (newTheme: string) => {
    setCurrentTheme(newTheme)
    applyThemeToBody(newTheme)
  }

  return {
    currentTheme,
    loading,
    updateTheme,
    refreshTheme: fetchCurrentTheme
  }
}