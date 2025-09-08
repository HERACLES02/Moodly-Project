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
  const [autoPlay, setAutoPlay] = useState(true)
  const [userCurrentMovie, setUserCurrentMovie] = useState<any>(null)
  const [showNextButton, setShowNextButton] = useState(false)
  const [hasInitialLoad, setHasInitialLoad] = useState(false)

  // Socket connection and event handlers
  useEffect(() => {
    const newSocket = io('http://moodly-blond.vercel.app/')

    newSocket.on('connect', () => {
      console.log('🔌 Connected to sync server')
      setIsConnected(true)
      
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

    newSocket.on('session-sync', (info: SessionInfo) => {
      console.log('📺 Session sync received:', info)
      setSessionInfo(info)
      
      if (!hasInitialLoad) {
        console.log('🎬 Initial movie load for new user:', info.currentMovie.title)
        setUserCurrentMovie(info.currentMovie)
        setHasInitialLoad(true)
      } else {
        console.log('🔄 Server movie update received, user stays on their current movie')
        
        if (!autoPlay) {
          setShowNextButton(true)
        } else if (userCurrentMovie?.id !== info.currentMovie.id) {
          console.log('⏭️ Auto-switching to new movie')
          setUserCurrentMovie(info.currentMovie)
          setShowMovieChange(true)
          setTimeout(() => setShowMovieChange(false), 5000)
        }
      }
      
      setIsLoading(false)
    })

    newSocket.on('movie-changed', (info: SessionInfo) => {
      console.log('🎬 Movie changed on server:', info.currentMovie.title)
      setSessionInfo(info)
      
      if (autoPlay) {
        setUserCurrentMovie(info.currentMovie)
        setShowMovieChange(true)
        setTimeout(() => setShowMovieChange(false), 5000)
      } else {
        setShowNextButton(true)
      }
    })

    newSocket.on('viewer-count-update', (data: { count: number }) => {
      setSessionInfo(prev => prev ? { ...prev, viewerCount: data.count } : prev)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [mood, user?.anonymousName, autoPlay, userCurrentMovie?.id])

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const goToNextMovie = () => {
    if (sessionInfo) {
      console.log('⏭️ User manually switching to next movie')
      setUserCurrentMovie(sessionInfo.currentMovie)
      setShowNextButton(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="theme-card backdrop-blur-md p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="font-medium">Starting synchronized session...</p>
          <p className="opacity-70 text-sm mt-2">
            Connecting to {mood} mood stream
          </p>
        </div>
      </div>
    )
  }

  if (!sessionInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="theme-card backdrop-blur-md p-8 text-center">
          <p className="font-medium text-red-600">
            Failed to connect to synchronized session
          </p>
          <p className="opacity-70 text-sm mt-2">
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
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {showMovieChange && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            🎬 Now Playing: {userCurrentMovie?.title || sessionInfo.currentMovie.title}
          </div>
        )}

        <div className="theme-card backdrop-blur-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold capitalize">
                {mood} Mood TV - Synchronized Live Stream
              </h1>
              <p className="opacity-70 text-lg font-medium">
                You're Watching: {userCurrentMovie?.title || sessionInfo.currentMovie.title}
              </p>
              <p className="opacity-50 text-sm">
                Server Timeline: {sessionInfo.currentMovie.title}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                🔴 LIVE
              </span>
              <span className="font-medium">
                👥 {sessionInfo.viewerCount} viewers
              </span>
            </div>
          </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <div className="theme-card backdrop-blur-md p-4">
              <VideoPlayer />
              
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {userCurrentMovie?.title || sessionInfo.currentMovie.title}
                    </h2>
                    <p className="opacity-70 text-sm mt-1">
                      {userCurrentMovie?.id === sessionInfo.currentMovie.id 
                        ? "You're watching with everyone" 
                        : `You're watching independently (Server: ${sessionInfo.currentMovie.title})`
                      }
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Server Next:</p>
                    <p className="opacity-70 text-xs">
                      {sessionInfo.nextMovie?.title || 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <div className="backdrop-blur-md h-[600px]">
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

        {sessionInfo.nextMovie && (
          <div className="theme-card backdrop-blur-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ⏭️ Coming Up Next on Server
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-24 bg-gray-300 rounded flex items-center justify-center">
                🎬
              </div>
              <div>
                <h3 className="font-medium">
                  {sessionInfo.nextMovie.title}
                </h3>
                <p className="opacity-70 text-sm">
                  Server switching in {formatTime(sessionInfo.remainingTime)}
                </p>
                {!autoPlay && (
                  <p className="opacity-50 text-xs mt-1">
                    (You'll see a Next Movie button when ready)
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="theme-card backdrop-blur-md p-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">
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
              
              {userCurrentMovie?.id !== sessionInfo.currentMovie.id && (
                <button
                  onClick={() => {
                    console.log('⏩ Syncing to server movie')
                    setUserCurrentMovie(sessionInfo.currentMovie)
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