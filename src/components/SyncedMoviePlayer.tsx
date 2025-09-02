'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useGetUser } from '@/hooks/useGetUser'
import { LiveChatComponent } from './LiveChatComponent'

interface SessionInfo {
  currentMovie: {
    id: string
    title: string
    vidsrcUrl: string
    synchronizedUrl: string
    baseUrl: string
    poster: string
    overview: string
  }
  startedAt: number
  elapsedTime: number
  remainingTime: number
  progress: number
  viewerCount: number
  isActive: boolean
  nextMovie: any
  mood: string
  syncData: {
    elapsedSeconds: number
    shouldForceReload: boolean
    timestamp: number
  }
}

interface SyncedMoviePlayerProps {
  mood: string
}

export default function SyncedMoviePlayer({ mood }: SyncedMoviePlayerProps) {
  const { user } = useGetUser()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [showMovieChange, setShowMovieChange] = useState(false)
  
  // Individual user controls
  const [autoPlay, setAutoPlay] = useState(true) // User's autoplay preference
  const [userCurrentMovie, setUserCurrentMovie] = useState<any>(null) // What user is actually watching
  const [showNextButton, setShowNextButton] = useState(false) // Show manual next button

  // Socket connection and event handlers
  useEffect(() => {
    const newSocket = io('http://localhost:9513')

    newSocket.on('connect', () => {
      console.log('🔌 Connected to sync server')
      setIsConnected(true)
      
      // Join sync session
      newSocket.emit('join-sync-session', {
        streamId: `${mood}-sync-session`,
        username: user?.anonymousName || 'Anonymous',
        mood: mood
      })
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from sync server')
      setIsConnected(false)
    })

    // Receive session sync info (initial connection ONLY)
    newSocket.on('session-sync', (info: SessionInfo) => {
      console.log('📺 Session sync received:', info)
      setSessionInfo(info)
      
      // Only set user's movie if they don't have one yet (initial connection)
      if (!userCurrentMovie) {
        console.log('🎬 Initial movie load:', info.currentMovie.title)
        setUserCurrentMovie(info.currentMovie)
      }
      
      setIsLoading(false)
    })

    // Server movie changed (this is the server's official timeline)
    newSocket.on('movie-changed', (info: SessionInfo) => {
      console.log('🔄 Server movie changed:', info.currentMovie.title)
      setSessionInfo(info) // Update server timeline for chat
      
      if (autoPlay) {
        // Only switch if it's actually a different movie
        if (userCurrentMovie?.id !== info.currentMovie.id) {
          console.log('⏯️ Autoplay ON - Following server to:', info.currentMovie.title)
          setUserCurrentMovie(info.currentMovie)
          setShowMovieChange(true)
          
          // Update iframe URL seamlessly
          if (iframeRef.current) {
            iframeRef.current.src = info.currentMovie.vidsrcUrl
          }
          
          setTimeout(() => setShowMovieChange(false), 5000)
        } else {
          console.log('⏯️ Autoplay ON - Same movie, no change needed')
        }
      } else {
        // If autoplay is off, just show the next button
        console.log('⏸️ Autoplay OFF - Showing next button')
        setShowNextButton(true)
      }
    })

    // Viewer count updates
    newSocket.on('viewer-count-update', (data: { count: number }) => {
      setSessionInfo(prev => prev ? { ...prev, viewerCount: data.count } : prev)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [mood, user?.anonymousName, autoPlay])

  // Manual next movie function
  const goToNextMovie = () => {
    if (sessionInfo && sessionInfo.nextMovie) {
      console.log('👆 User manually going to next movie:', sessionInfo.currentMovie.title)
      setUserCurrentMovie(sessionInfo.currentMovie)
      setShowNextButton(false)
      setShowMovieChange(true)
      
      // Update iframe URL
      if (iframeRef.current) {
        iframeRef.current.src = sessionInfo.currentMovie.vidsrcUrl
      }
      
      setTimeout(() => setShowMovieChange(false), 3000)
    }
  }

  // Toggle autoplay function
  const toggleAutoPlay = () => {
    setAutoPlay(prev => {
      const newValue = !prev
      console.log(`🔄 Autoplay ${newValue ? 'enabled' : 'disabled'}`)
      
      if (newValue && sessionInfo && userCurrentMovie?.id !== sessionInfo.currentMovie.id) {
        // If turning autoplay on and user is behind, catch up to server
        console.log('⏩ Catching up to server movie')
        setUserCurrentMovie(sessionInfo.currentMovie)
        if (iframeRef.current) {
          iframeRef.current.src = sessionInfo.currentMovie.vidsrcUrl
        }
        setShowNextButton(false)
      }
      
      return newValue
    })
  }

  // Helper function to format time
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Get theme colors based on mood
  const getThemes = () => {
    if (mood === 'happy') {
      return {
        bg: 'bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100',
        card: 'bg-white/80',
        text: 'text-orange-900',
        accent: 'border-orange-200'
      }
    } else if (mood === 'sad') {
      return {
        bg: 'bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100',
        card: 'bg-white/80',
        text: 'text-blue-900',
        accent: 'border-blue-200'
      }
    }
    return {
      bg: 'bg-gradient-to-br from-gray-100 via-slate-50 to-zinc-100',
      card: 'bg-white/80',
      text: 'text-gray-900',
      accent: 'border-gray-200'
    }
  }

  const themes = getThemes()

  if (isLoading) {
    return (
      <div className={`min-h-screen ${themes.bg} flex items-center justify-center`}>
        <div className={`${themes.card} backdrop-blur-md rounded-lg p-8 border text-center`}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${themes.text} font-medium`}>Starting synchronized session...</p>
          <p className={`${themes.text} opacity-70 text-sm mt-2`}>
            Connecting to {mood} mood stream
          </p>
        </div>
      </div>
    )
  }

  if (!sessionInfo) {
    return (
      <div className={`min-h-screen ${themes.bg} flex items-center justify-center`}>
        <div className={`${themes.card} backdrop-blur-md rounded-lg p-8 border text-center`}>
          <p className={`${themes.text} font-medium text-red-600`}>
            Failed to connect to synchronized session
          </p>
          <p className={`${themes.text} opacity-70 text-sm mt-2`}>
            Please try refreshing the page
          </p>
        </div>
      </div>
    )
  }
  
  const VideoPlayer = () => (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        ref={iframeRef}
        src={userCurrentMovie?.vidsrcUrl || sessionInfo?.currentMovie.vidsrcUrl}
        className="w-full h-full"
        allowFullScreen
        title={userCurrentMovie?.title || sessionInfo?.currentMovie.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
      
      {/* Manual Next Button Overlay */}
      {showNextButton && !autoPlay && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={goToNextMovie}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg font-medium transition-all"
          >
            ⏭️ Next Movie Available
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div className={`min-h-screen ${themes.bg} p-6`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Movie Change Notification */}
        {showMovieChange && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            🎬 Now Playing: {userCurrentMovie?.title || sessionInfo.currentMovie.title}
          </div>
        )}

        {/* Session Status Header */}
        <div className={`${themes.card} backdrop-blur-md rounded-lg p-6 mb-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl font-bold ${themes.text} capitalize`}>
                {mood} Mood TV - Synchronized Live Stream
              </h1>
              <p className={`${themes.text} opacity-70 text-lg font-medium`}>
                You're Watching: {userCurrentMovie?.title || sessionInfo.currentMovie.title}
              </p>
              <p className={`${themes.text} opacity-50 text-sm`}>
                Server Timeline: {sessionInfo.currentMovie.title}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                🔴 LIVE
              </span>
              <span className={`${themes.text} font-medium`}>
                👥 {sessionInfo.viewerCount} viewers
              </span>
            </div>
          </div>

          {/* User Controls */}
          <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPlay}
                  onChange={toggleAutoPlay}
                  className="w-4 h-4"
                />
                <span className={`${themes.text} font-medium`}>
                  🔄 Auto-advance to next movie
                </span>
              </label>
              
              {!autoPlay && (
                <span className={`${themes.text} opacity-70 text-sm`}>
                  Manual control enabled - you decide when to advance
                </span>
              )}
            </div>
            
            {!autoPlay && sessionInfo.nextMovie && (
              <button
                onClick={goToNextMovie}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                ⏭️ Go to Next Movie
              </button>
            )}
          </div>

          {/* Progress Bar (Server Timeline) */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${sessionInfo.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm opacity-70">
            <span>Server Elapsed: {formatTime(sessionInfo.elapsedTime)}</span>
            <span>Server Remaining: {formatTime(sessionInfo.remainingTime)}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className={`${themes.card} backdrop-blur-md rounded-lg p-4 border`}>
              <VideoPlayer />
              
              {/* Movie Info */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-semibold ${themes.text}`}>
                      {userCurrentMovie?.title || sessionInfo.currentMovie.title}
                    </h2>
                    <p className={`${themes.text} opacity-70 text-sm mt-1`}>
                      {userCurrentMovie?.id === sessionInfo.currentMovie.id 
                        ? "You're watching with everyone" 
                        : `You're watching independently (Server: ${sessionInfo.currentMovie.title})`
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`${themes.text} text-sm font-medium`}>Server Next:</p>
                    <p className={`${themes.text} opacity-70 text-xs`}>
                      {sessionInfo.nextMovie?.title || 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <div className={`${themes.card} backdrop-blur-md rounded-lg border h-[600px]`}>
              <LiveChatComponent
                streamId={`${mood}-sync-session`}
                user={user}
                mood={mood}
                sharedSocket={socket}
                isSocketConnected={isConnected}
              />
            </div>
          </div>
        </div>

        {/* Next Movie Preview */}
        {sessionInfo.nextMovie && (
          <div className={`${themes.card} backdrop-blur-md rounded-lg p-6 mt-6 border`}>
            <h2 className={`text-xl font-semibold ${themes.text} mb-4 flex items-center gap-2`}>
              ⏭️ Coming Up Next on Server
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-24 bg-gray-300 rounded flex items-center justify-center">
                🎬
              </div>
              <div>
                <h3 className={`font-medium ${themes.text}`}>
                  {sessionInfo.nextMovie.title}
                </h3>
                <p className={`${themes.text} opacity-70 text-sm`}>
                  Server switching in {formatTime(sessionInfo.remainingTime)}
                </p>
                {!autoPlay && (
                  <p className={`${themes.text} opacity-50 text-xs mt-1`}>
                    (You'll see a Next Movie button when ready)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Connection Status Footer */}
        <div className={`${themes.card} backdrop-blur-md rounded-lg p-4 mt-6 border`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`${themes.text} text-sm`}>
                {isConnected ? 'Connected to sync server' : 'Disconnected'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (socket) {
                    socket.emit('get-session-info')
                    console.log('🔄 Manual sync requested')
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                disabled={!isConnected}
              >
                🔄 Sync Timeline
              </button>
              
              {/* Sync to Server Button (when user is behind) */}
              {userCurrentMovie?.id !== sessionInfo.currentMovie.id && (
                <button
                  onClick={() => {
                    console.log('⏩ Syncing to server movie')
                    setUserCurrentMovie(sessionInfo.currentMovie)
                    if (iframeRef.current) {
                      iframeRef.current.src = sessionInfo.currentMovie.vidsrcUrl
                    }
                    setShowNextButton(false)
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                  ⏩ Catch Up to Server
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}