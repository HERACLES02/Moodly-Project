'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useUser } from '@/contexts/UserContext'  // ← CHANGED: Import from context
import { LiveChatComponent } from './LiveChatComponent'
import { SOCKET_URL } from '@/lib/socket-config'

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
  // ══════════════════════════════════════════════════════════════════
  // CHANGED: Use context instead of useGetUser
  // ══════════════════════════════════════════════════════════════════
  const { user } = useUser()
  
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
    const newSocket = io(SOCKET_URL)

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
        console.log('🎬 Initial movie load')
        setUserCurrentMovie(info.currentMovie)
        setHasInitialLoad(true)
      }
      
      setIsLoading(false)
    })

    newSocket.on('movie-change', (info: SessionInfo) => {
      console.log('🎬 Movie changed:', info.currentMovie.title)
      setShowMovieChange(true)
      setShowNextButton(true)
      
      setTimeout(() => setShowMovieChange(false), 5000)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [mood, user?.anonymousName, hasInitialLoad])

  const handleWatchNext = () => {
    if (sessionInfo?.currentMovie) {
      setUserCurrentMovie(sessionInfo.currentMovie)
      setShowNextButton(false)
    }
  }

  if (isLoading) {
    return (
      <div className="synced-movie-loading">
        <div className="loading-spinner"></div>
        <p>Loading movie session...</p>
      </div>
    )
  }

  if (!sessionInfo || !userCurrentMovie) {
    return (
      <div className="synced-movie-error">
        <p>Unable to load movie session. Please try again.</p>
      </div>
    )
  }

  const currentMovieUrl = userCurrentMovie.synchronizedUrl || userCurrentMovie.vidsrcUrl

  return (
    <div className="synced-movie-container">
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* Movie Info */}
      <div className="movie-info">
        <h2 className="movie-title">{userCurrentMovie.title}</h2>
        <div className="viewer-count">
          👥 {sessionInfo.viewerCount} watching
        </div>
      </div>

      {/* Movie Player */}
      <div className="movie-player-wrapper">
        <iframe
          ref={iframeRef}
          src={currentMovieUrl}
          className="movie-iframe"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        ></iframe>
      </div>

      {/* Next Movie Button */}
      {showNextButton && sessionInfo.currentMovie.id !== userCurrentMovie.id && (
        <div className="next-movie-banner">
          <p>A new movie is playing!</p>
          <button onClick={handleWatchNext} className="watch-next-button">
            Watch "{sessionInfo.currentMovie.title}" Now
          </button>
        </div>
      )}

      {/* Movie Details */}
      <div className="movie-details-section">
        <img 
          src={userCurrentMovie.poster} 
          alt={userCurrentMovie.title}
          className="movie-poster"
        />
        <div className="movie-description">
          <h3>About this movie</h3>
          <p>{userCurrentMovie.overview}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${sessionInfo.progress}%` }}
          ></div>
        </div>
        <div className="time-info">
          <span>{Math.floor(sessionInfo.elapsedTime / 60)}:{String(Math.floor(sessionInfo.elapsedTime % 60)).padStart(2, '0')}</span>
          <span>{Math.floor(sessionInfo.remainingTime / 60)}:{String(Math.floor(sessionInfo.remainingTime % 60)).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Movie Change Notification */}
      {showMovieChange && (
        <div className="movie-change-notification">
          🎬 New Movie Starting Soon!
        </div>
      )}

      {/* Live Chat */}
      {socket && (
        <LiveChatComponent 
          socket={socket}
          streamId={`${mood}-sync-session`}
          username={user?.anonymousName || 'Anonymous'}
        />
      )}
    </div>
  )
}