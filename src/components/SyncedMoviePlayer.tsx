'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

import { useGetUser } from '@/hooks/useGetUser'
import { LiveChatComponent } from './LiveChatComponenet'

interface SessionInfo {
  currentMovie: {
    id: string
    title: string
    vidsrcUrl: string
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

    // Receive session sync info
    newSocket.on('session-sync', (info: SessionInfo) => {
      console.log('📺 Session sync received:', info)
      setSessionInfo(info)
      setIsLoading(false)
    })

    // Movie changed
    newSocket.on('movie-changed', (info: SessionInfo) => {
      console.log('🔄 Movie changed:', info.currentMovie.title)
      setSessionInfo(info)
      setShowMovieChange(true)
      
      // Hide notification after 5 seconds
      setTimeout(() => setShowMovieChange(false), 5000)
    })

    // Viewer count updates
    newSocket.on('viewer-count-update', (data: { count: number }) => {
      setSessionInfo(prev => prev ? { ...prev, viewerCount: data.count } : null)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [mood, user?.anonymousName])

  // Progress updates
  useEffect(() => {
    if (!sessionInfo) return

    const interval = setInterval(() => {
      setSessionInfo(prev => {
        if (!prev) return null
        
        const now = Date.now()
        const elapsed = now - prev.startedAt
        const remaining = Math.max(0, 7200000 - elapsed) // 2 hours
        const progress = Math.min(100, (elapsed / 7200000) * 100)
        
        return {
          ...prev,
          elapsedTime: elapsed,
          remainingTime: remaining,
          progress: progress
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [sessionInfo?.startedAt])

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getThemeClasses = () => {
    const moodLower = mood.toLowerCase()
    return {
      container: moodLower === 'happy' ? 'bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200' :
                 moodLower === 'sad' ? 'bg-gradient-to-br from-slate-600 via-purple-800 to-indigo-900' :
                 'bg-gradient-to-br from-indigo-200 to-purple-300',
      
      card: moodLower === 'happy' ? 'bg-white/70 border-white/40' :
            moodLower === 'sad' ? 'bg-slate-800/30 border-white/10 text-purple-200' :
            'bg-white/80 border-white/50',
            
      text: moodLower === 'sad' ? 'text-purple-200' : 'text-slate-800'
    }
  }

  const themes = getThemeClasses()

  if (isLoading || !sessionInfo) {
    return (
      <div className={`min-h-screen ${themes.container} flex items-center justify-center`}>
        <div className={`p-8 rounded-lg ${themes.card} backdrop-blur-md text-center`}>
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className={themes.text}>Synchronizing with watch party...</p>
          {!isConnected && (
            <p className="text-red-500 mt-2 text-sm">Connecting to server...</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themes.container} p-6`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Movie Change Notification */}
        {showMovieChange && (
          <div className="fixed top-4 right-4 z-50 animate-bounce">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎬</span>
                <div>
                  <p className="font-bold">Now Playing!</p>
                  <p className="text-sm">{sessionInfo.currentMovie.title}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stream Header */}
        <div className={`${themes.card} backdrop-blur-md rounded-lg p-6 mb-6 border`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={`text-2xl font-bold ${themes.text} flex items-center gap-2`}>
                🔴 Moodly Watch Party - {mood.charAt(0).toUpperCase() + mood.slice(1)}
                {!isConnected && <span className="text-red-500 text-sm">(Disconnected)</span>}
              </h1>
              <p className={`${themes.text} opacity-80 text-lg mt-1`}>
                {sessionInfo.currentMovie.title}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                🔴 SYNC
              </span>
              <span className={`${themes.text} font-medium`}>
                👥 {sessionInfo.viewerCount} viewers
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${sessionInfo.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm opacity-70">
            <span>Elapsed: {formatTime(sessionInfo.elapsedTime)}</span>
            <span>Remaining: {formatTime(sessionInfo.remainingTime)}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className={`${themes.card} backdrop-blur-md rounded-lg p-4 border`}>
              <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={sessionInfo.currentMovie.vidsrcUrl}
                  className="w-full h-full"
                  allowFullScreen
                  title={`Watch ${sessionInfo.currentMovie.title}`}
                  allow="fullscreen"
                />
              </div>
              
              {/* Movie Info */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className={`text-xl font-semibold ${themes.text}`}>
                      {sessionInfo.currentMovie.title}
                    </h2>
                    <p className={`${themes.text} opacity-70 text-sm mt-1`}>
                      Everyone is watching this together in real-time
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`${themes.text} text-sm font-medium`}>Up Next:</p>
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
              />
            </div>
          </div>
        </div>

        {/* Next Movie Preview */}
        {sessionInfo.nextMovie && (
          <div className={`${themes.card} backdrop-blur-md rounded-lg p-6 mt-6 border`}>
            <h2 className={`text-xl font-semibold ${themes.text} mb-4 flex items-center gap-2`}>
              ⏭️ Coming Up Next
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
                  Starting in {formatTime(sessionInfo.remainingTime)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}