class SimpleSyncManager {
  constructor() {
    this.currentMovie = null
    this.movieStartTime = null
    this.movieDuration = 7200000 // 2 hours in milliseconds (default)
    this.movieQueue = []
    this.currentIndex = 0
    this.isActive = false
    this.viewers = new Map()
    this.movieChangeTimer = null
  }

  async initializeQueue(mood = 'happy') {
    try {
      console.log(`🎬 Initializing movie queue for ${mood} mood...`)
      
      // Fetch movies from your existing API
      const response = await fetch(`http://localhost:9513/api/recommendations/movies?mood=${mood}`)
      const data = await response.json()
      
      if (data.movies && data.movies.length > 0) {
        this.movieQueue = data.movies.map(movie => ({
          id: movie.id.toString(),
          title: movie.title,
          vidsrcUrl: `https://vidsrc.xyz/embed/movie?tmdb=${movie.id}`,
          duration: 7200000, // 2 hours default
          poster: movie.poster,
          overview: movie.overview
        }))
        
        console.log(`✅ Queue initialized with ${this.movieQueue.length} movies`)
        return true
      }
    } catch (error) {
      console.error('❌ Failed to initialize queue:', error)
      return false
    }
  }

  startSession(mood = 'happy') {
    if (this.isActive) {
      console.log('⚠️ Session already active')
      return this.getCurrentSessionInfo()
    }

    console.log(`🚀 Starting synchronized session for ${mood} mood`)
    
    // Start with first movie
    this.currentIndex = 0
    this.currentMovie = this.movieQueue[0]
    this.movieStartTime = Date.now()
    this.isActive = true
    
    // Schedule next movie
    this.scheduleNextMovie()
    
    return this.getCurrentSessionInfo()
  }

  scheduleNextMovie() {
    if (this.movieChangeTimer) {
      clearTimeout(this.movieChangeTimer)
    }

    // Change movie after duration
    this.movieChangeTimer = setTimeout(() => {
      this.switchToNextMovie()
    }, this.movieDuration)
    
    console.log(`⏰ Next movie scheduled in ${this.movieDuration / 60000} minutes`)
  }

  switchToNextMovie() {
    this.currentIndex = (this.currentIndex + 1) % this.movieQueue.length
    this.currentMovie = this.movieQueue[this.currentIndex]
    this.movieStartTime = Date.now()
    
    console.log(`🔄 Switching to: ${this.currentMovie.title}`)
    
    // Schedule next movie
    this.scheduleNextMovie()
    
    // Return info for broadcasting
    return this.getCurrentSessionInfo()
  }

  getCurrentSessionInfo() {
    if (!this.isActive || !this.currentMovie) {
      return null
    }

    const now = Date.now()
    const elapsed = now - this.movieStartTime
    const remainingTime = Math.max(0, this.movieDuration - elapsed)
    
    return {
      currentMovie: this.currentMovie,
      startedAt: this.movieStartTime,
      elapsedTime: elapsed,
      remainingTime: remainingTime,
      progress: Math.min(100, (elapsed / this.movieDuration) * 100),
      viewerCount: this.viewers.size,
      isActive: this.isActive,
      nextMovie: this.movieQueue[(this.currentIndex + 1) % this.movieQueue.length]
    }
  }

  addViewer(socketId, username, mood) {
    this.viewers.set(socketId, {
      username,
      mood,
      joinedAt: Date.now()
    })
    
    console.log(`👤 ${username} joined (${this.viewers.size} total viewers)`)
    return this.getCurrentSessionInfo()
  }

  removeViewer(socketId) {
    const viewer = this.viewers.get(socketId)
    if (viewer) {
      this.viewers.delete(socketId)
      console.log(`👋 ${viewer.username} left (${this.viewers.size} total viewers)`)
    }
  }

  // Admin functions
  skipToNextMovie() {
    console.log('⏭️ Admin skipping to next movie')
    return this.switchToNextMovie()
  }

  changeMovieDuration(newDuration) {
    this.movieDuration = newDuration
    console.log(`⏱️ Movie duration changed to ${newDuration / 60000} minutes`)
    
    // Reschedule current movie
    this.scheduleNextMovie()
  }

  stopSession() {
    this.isActive = false
    this.viewers.clear()
    
    if (this.movieChangeTimer) {
      clearTimeout(this.movieChangeTimer)
      this.movieChangeTimer = null
    }
    
    console.log('🛑 Session stopped')
  }
}

// Singleton instance
let syncManager = null

function getSyncManager() {
  if (!syncManager) {
    syncManager = new SimpleSyncManager()
  }
  return syncManager
}

module.exports = { getSyncManager }