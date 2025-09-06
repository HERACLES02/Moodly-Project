'use client'

import { useTheme } from '@/contexts/ThemeContext'

export function SimpleThemeSelector() {
  const { currentTheme, setTheme, isLoading } = useTheme()

  if (isLoading) {
    return <span>Loading...</span>
  }

  return (
    <div className="theme-selector">
      <select 
        value={currentTheme} 
        onChange={(e) => setTheme(e.target.value as any)}
        className="theme-select"
      >
        <option value="default">Default</option>
        <option value="van-gogh">Van Gogh</option>
        <option value="cat">Cat</option>
      </select>
    </div>
  )
}