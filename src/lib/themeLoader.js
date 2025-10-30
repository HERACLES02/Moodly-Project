// Theme loader for all pages
export const loadUserTheme = async () => {
  try {
    const response = await fetch('/api/user/get')
    const data = await response.json()
    
    if (data.currentTheme) {
      document.body.className = `theme-${data.currentTheme}`
      return data.currentTheme
    }
  } catch (error) {
    console.error('Error loading theme:', error)
  }
  
  // Fallback to localStorage
  const savedTheme = localStorage.getItem('currentTheme') || 'default'
  document.body.className = `theme-${savedTheme}`
  return savedTheme
}

// Apply theme immediately
export const applyTheme = (theme) => {
  document.body.className = `theme-${theme}`
  localStorage.setItem('currentTheme', theme)
}