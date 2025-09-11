class MovieSyncManager {
  constructor(mood, onMovieChanged = null) {
    this.mood = mood
    this.currentMovie = null
    this.movieStartTime = null
    this.movieDuration = 60000 
    this.movieQueue = []
    this.currentIndex = 0
    this.isActive = false
    this.viewers = new Map()
    this.movieChangeTimer = null
    this.onMovieChanged = onMovieChanged 
  }

  async initializeQueue() { 
    try {
      const response = await fetch(`http://localhost:9513/api/recommendations/movies?mood=${this.mood}`)
      const data = await response.json()
      
      if (data.movies && data.movies.length > 0) {
        this.movieQueue = data.movies.map(movie => ({
          id: movie.id.toString(),
          title: movie.title,
          vidsrcUrl: `https://vidsrc.xyz/embed/movie?tmdb=${movie.id}&autoplay=1`,
          duration: this.movieDuration,
          poster: movie.poster,
          overview: movie.overview
        }))
        
        console.log(`✅ ${this.mood} mood queue initialized with ${this.movieQueue.length} movies`)
        return true
      } else {
        // Fallback movies if API fails
        console.log(`${this.mood} API failed, using fallback movies`)
        this.movieQueue = this.getFallbackMovies(this.mood)
        return true
      }
    } catch (error) {
      console.error(`Failed to initialize ${this.mood} queue, using fallback:`, error)
      this.movieQueue = this.getFallbackMovies(this.mood)
      return true
    }
  }

  getFallbackMovies(mood) {
    const happyMovies = [
      {
        id: '862',
        title: 'Toy Story',
        vidsrcUrl: 'https://vidsrc.xyz/embed/movie?tmdb=862&autoplay=1',
        duration: this.movieDuration,
        poster: 'https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg',
        overview: 'A cowboy doll is profoundly threatened when a new spaceman toy supplants him as top toy in a boy\'s room.'
      },
      {
        id: '585',
        title: 'Monsters, Inc.',
        vidsrcUrl: 'https://vidsrc.xyz/embed/movie?tmdb=585&autoplay=1',
        duration: this.movieDuration,
        poster: 'https://image.tmdb.org/t/p/w500/wdWwtvkRRlgTiUr6TyLSMixTQT.jpg',
        overview: 'Lovable Sulley and his wisecracking sidekick Mike Wazowski are the top scare team at Monsters, Inc.'
      },
      {
        id: '121',
        title: 'The Lord of the Rings',
        vidsrcUrl: 'https://vidsrc.xyz/embed/movie?tmdb=121&autoplay=1',
        duration: this.movieDuration,
        poster: 'https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
        overview: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring.'
      },
      {
        id: '671',
        title: 'Harry Potter',
        vidsrcUrl: 'https://vidsrc.xyz/embed/movie?tmdb=671&autoplay=1',
        duration: this.movieDuration,
        poster: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
        overview: 'Harry Potter learns on his 11th birthday that he is the orphaned son of two powerful wizards.'
      }
    ]

    const sadMovies = [
      {
        id: '550',
        title: 'Fight Club',
        vidsrcUrl: 'https://vidsrc.xyz/embed/movie?tmdb=550&autoplay=1',
        duration: this.movieDuration,
        poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        overview: 'An insomniac office worker forms an underground fight club.'
      },
      {
        id: '13',
        title: 'Forrest Gump',
        vidsrcUrl: 'https://vidsrc.xyz/embed/movie?tmdb=13&autoplay=1',
        duration: this.movieDuration,
        poster: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
        overview: 'The presidencies of Kennedy and Johnson through the eyes of Alabama man with an IQ of 75.'
      },
      {
        id: '238',
        title: 'The Godfather',
        vidsrcUrl: 'https://vidsrc.xyz/embed/movie?tmdb=238&autoplay=1',
        duration: this.movieDuration,
        poster: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.'
      },
      {
        id: '424',
        title: 'Schindler\'s List',
        vidsrcUrl: 'https://vidsrc.xyz/embed/movie?tmdb=424&autoplay=1',
        duration: this.movieDuration,
        poster: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
        overview: 'The true story of how businessman Oskar Schindler saved over a thousand Jewish lives.'
      }
    ]

    return mood === 'happy' ? happyMovies : sadMovies
  }

  startSession() {
    if (this.isActive) {
      console.log(`⚠️ ${this.mood} session already active`)
      return this.getCurrentSessionInfo()
    }

    console.log(`🚀 Starting synchronized ${this.mood} session`)
    
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
      const newSessionInfo = this.switchToNextMovie()
      
      // Notify socket server about the movie change
      if (this.onMovieChanged) {
        this.onMovieChanged(this.mood, newSessionInfo)
      }
    }, this.movieDuration)
    
    console.log(`⏰ ${this.mood} mood: Next movie scheduled in ${this.movieDuration / 60000} minutes`)
  }

  switchToNextMovie() {
    this.currentIndex = (this.currentIndex + 1) % this.movieQueue.length
    this.currentMovie = this.movieQueue[this.currentIndex]
    this.movieStartTime = Date.now()
    
    console.log(`🔄 ${this.mood} mood switching to: ${this.currentMovie.title}`)
    
    this.scheduleNextMovie()
    
    return this.getCurrentSessionInfo()
  }

  getCurrentSessionInfo() {
    if (!this.isActive || !this.currentMovie) {
      return null
    }

    const now = Date.now()
    const elapsed = now - this.movieStartTime
    const remainingTime = Math.max(0, this.movieDuration - elapsed)
    const elapsedSeconds = Math.floor(elapsed / 1000)
    
    // Create a unique URL by adding a timestamp to force iframe refresh
    const baseUrl = this.currentMovie.vidsrcUrl
    const synchronizedUrl = `${baseUrl}&t=${elapsedSeconds}&_=${now}`
    
    return {
      currentMovie: {
        ...this.currentMovie,
        synchronizedUrl: synchronizedUrl,
        baseUrl: baseUrl
      },
      startedAt: this.movieStartTime,
      elapsedTime: elapsed,
      remainingTime: remainingTime,
      progress: Math.min(100, (elapsed / this.movieDuration) * 100),
      viewerCount: this.viewers.size,
      isActive: this.isActive,
      nextMovie: this.movieQueue[(this.currentIndex + 1) % this.movieQueue.length],
      mood: this.mood,
      syncData: {
        elapsedSeconds: elapsedSeconds,
        shouldForceReload: false, // Changed to false since we're using URL-based updates
        timestamp: now
      }
    }
  }

  addViewer(socketId, username, mood) {
    this.viewers.set(socketId, {
      username,
      mood,
      joinedAt: Date.now()
    })
    
    console.log(`👤 ${username} joined ${this.mood} stream (${this.viewers.size} total viewers)`)
    return this.getCurrentSessionInfo()
  }

  removeViewer(socketId) {
    const viewer = this.viewers.get(socketId)
    if (viewer) {
      this.viewers.delete(socketId)
      console.log(`👋 ${viewer.username} left ${this.mood} stream (${this.viewers.size} total viewers)`)
    }
  }


  

  changeMovieDuration(newDuration) {
    if (typeof newDuration === 'number' && newDuration > 0) {
      this.movieDuration = newDuration
      
      // Clear existing timer if any
      if (this.movieChangeTimer) {
        clearTimeout(this.movieChangeTimer)
      }
      
      // Reschedule next movie with new duration
      this.scheduleNextMovie()
      
      return true
    }
    return false
  }

  stopSession() {    
    this.isActive = false
    this.viewers.clear()
    
    if (this.movieChangeTimer) {
      clearTimeout(this.movieChangeTimer)
      this.movieChangeTimer = null
    }
        
    console.log(`🛑 ${this.mood} session stopped`)
  }
}

// Separate instances for each mood
const syncManagers = {
  happy: null,
  sad: null
}

function getSyncManager(mood = 'happy', onMovieChanged = null) {
  if (!syncManagers[mood]) {
    syncManagers[mood] = new MovieSyncManager(mood, onMovieChanged)
    console.log(`🎭 Created new sync manager for ${mood} mood`)
  }
  return syncManagers[mood]
}

module.exports = { getSyncManager }