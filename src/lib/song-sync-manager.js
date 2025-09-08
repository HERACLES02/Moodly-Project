class SongSyncManager {
  constructor(mood) {
    this.mood = mood
    this.currentSong = null
    this.songStartTime = null
    this.songDuration = 240000 // 4 minutes default for songs
    this.songQueue = []
    this.currentIndex = 0
    this.isActive = false
    this.listeners = new Map()
    this.songChangeTimer = null
  }

  async initializeQueue() { 
    try {
      console.log(`🎵 Initializing song queue for ${this.mood} mood...`)
      
      const response = await fetch(`http://moodly-blond.vercel.app/api/recommendations/songs?mood=${this.mood}`)
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`API Response for ${this.mood}:`, data) 

      if (data.tracks && data.tracks.length > 0) {
        this.songQueue = data.tracks.map(song => ({
          id: song.id,
          title: song.name, 
          artist: song.artist,
          spotifyUrl: song.external_url || '#',
          previewUrl: song.preview_url,
          duration: this.songDuration,
          image: song.albumArt || '/images/song-placeholder.jpg', 
          albumName: song.album
        }))
        
        console.log(`${this.mood} mood song queue initialized with ${this.songQueue.length} songs`)
        console.log(`🎵 First song: ${this.songQueue[0].title} by ${this.songQueue[0].artist}`)
        return true
      } else {
        console.log(`${this.mood} song API returned no tracks, using fallback songs`)
        this.songQueue = this.getFallbackSongs(this.mood)
        return true
      }
    } catch (error) {
      console.error(`Failed to initialize ${this.mood} song queue:`, error)
      console.log(`Using fallback songs for ${this.mood} mood`)
      this.songQueue = this.getFallbackSongs(this.mood)
      return true
    }
  }

  getFallbackSongs(mood) {
    const happySongs = [
      {
        id: 'happy1',
        title: 'Happy',
        artist: 'Pharrell Williams',
        spotifyUrl: 'https://open.spotify.com/track/60nZcImufyMA1MKQY3dcCH',
        previewUrl: 'https://p.scdn.co/mp3-preview/happy-preview.mp3',
        duration: this.songDuration,
        image: '/images/happy-song.jpg',
        albumName: 'G I R L'
      },
      {
        id: 'happy2',
        title: 'Good as Hell',
        artist: 'Lizzo',
        spotifyUrl: 'https://open.spotify.com/track/1gGErmJL9JelQTl4F4qT7V',
        previewUrl: 'https://p.scdn.co/mp3-preview/good-as-hell-preview.mp3',
        duration: this.songDuration,
        image: '/images/good-as-hell.jpg',
        albumName: 'Cuz I Love You'
      },
      {
        id: 'happy3',
        title: 'Uptown Funk',
        artist: 'Mark Ronson ft. Bruno Mars',
        spotifyUrl: 'https://open.spotify.com/track/32OlwWuMpZ6b0aN2RZOeMS',
        previewUrl: 'https://p.scdn.co/mp3-preview/uptown-funk-preview.mp3',
        duration: this.songDuration,
        image: '/images/uptown-funk.jpg',
        albumName: 'Uptown Special'
      }
    ]

    const sadSongs = [
      {
        id: 'sad1',
        title: 'Someone Like You',
        artist: 'Adele',
        spotifyUrl: 'https://open.spotify.com/track/1zwMYTA5nlNjZxYrvBB2pV',
        previewUrl: 'https://p.scdn.co/mp3-preview/someone-like-you-preview.mp3',
        duration: this.songDuration,
        image: '/images/someone-like-you.jpg',
        albumName: '21'
      },
      {
        id: 'sad2',
        title: 'Mad World',
        artist: 'Gary Jules',
        spotifyUrl: 'https://open.spotify.com/track/4Sh3CKPXbZIpJW4BjYeWqz',
        previewUrl: 'https://p.scdn.co/mp3-preview/mad-world-preview.mp3',
        duration: this.songDuration,
        image: '/images/mad-world.jpg',
        albumName: 'Trading Snakeoil for Wolftickets'
      },
      {
        id: 'sad3',
        title: 'Hurt',
        artist: 'Johnny Cash',
        spotifyUrl: 'https://open.spotify.com/track/2LbinT2MlJhpCsKPVvOQpn',
        previewUrl: 'https://p.scdn.co/mp3-preview/hurt-preview.mp3',
        duration: this.songDuration,
        image: '/images/hurt.jpg',
        albumName: 'American IV: The Man Comes Around'
      }
    ]

    return mood === 'happy' ? happySongs : sadSongs
  }

  startSession() {
    if (this.isActive) {
      console.log(`${this.mood} radio session already active`)
      return this.getCurrentSessionInfo()
    }

    console.log(`🎵 Starting synchronized ${this.mood} radio session`)
    
    // Start with first song
    this.currentIndex = 0
    this.currentSong = this.songQueue[0]
    this.songStartTime = Date.now()
    this.isActive = true
    
    // Schedule next song
    this.scheduleNextSong()
    
    return this.getCurrentSessionInfo()
  }

  scheduleNextSong() {
    if (this.songChangeTimer) {
      clearTimeout(this.songChangeTimer)
    }

    // Change song after duration
    this.songChangeTimer = setTimeout(() => {
      this.switchToNextSong()
    }, this.songDuration)
    
    console.log(`🎵 ${this.mood} radio: Next song scheduled in ${this.songDuration / 60000} minutes`)
  }

  switchToNextSong() {
    this.currentIndex = (this.currentIndex + 1) % this.songQueue.length
    this.currentSong = this.songQueue[this.currentIndex]
    this.songStartTime = Date.now()
    
    console.log(`${this.mood} radio switching to: ${this.currentSong.title} by ${this.currentSong.artist}`)
    
    // Schedule next song
    this.scheduleNextSong()
    
    // Return info for broadcasting
    return this.getCurrentSessionInfo()
  }

  getCurrentSessionInfo() {
    if (!this.isActive || !this.currentSong) {
      return null
    }

    const now = Date.now()
    const elapsed = now - this.songStartTime
    const remainingTime = Math.max(0, this.songDuration - elapsed)
    
    return {
      currentSong: this.currentSong,
      startedAt: this.songStartTime,
      elapsedTime: elapsed,
      remainingTime: remainingTime,
      progress: Math.min(100, (elapsed / this.songDuration) * 100),
      listenerCount: this.listeners.size,
      isActive: this.isActive,
      nextSong: this.songQueue[(this.currentIndex + 1) % this.songQueue.length],
      mood: this.mood,
      syncData: {
        elapsedSeconds: Math.floor(elapsed / 1000),
        shouldSync: true,
        timestamp: now
      }
    }
  }

  addListener(socketId, username, mood) {
    this.listeners.set(socketId, {
      username,
      mood,
      joinedAt: Date.now()
    })
    
    console.log(`🎧 ${username} joined ${this.mood} radio (${this.listeners.size} total listeners)`)
    return this.getCurrentSessionInfo()
  }

  removeListener(socketId) {
    const listener = this.listeners.get(socketId)
    if (listener) {
      this.listeners.delete(socketId)
      console.log(`${listener.username} left ${this.mood} radio (${this.listeners.size} total listeners)`)
    }
  }
}

// Separate instances for each mood
const songSyncManagers = {
  happy: null,
  sad: null
}

function getSongSyncManager(mood = 'happy') {
  if (!songSyncManagers[mood]) {
    songSyncManagers[mood] = new SongSyncManager(mood)
    console.log(`🎵 Created new song sync manager for ${mood} mood`)
  }
  return songSyncManagers[mood]
}

module.exports = { getSongSyncManager }