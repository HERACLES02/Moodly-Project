'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useUser } from '@/contexts/UserContext'  // ← CHANGED: Import from context
import { LiveChatComponent } from './LiveChatComponent'
import './syncedRadio.css'
import { SOCKET_URL } from '@/lib/socket-config'

interface RadioSessionInfo {
  currentSong: {
    id: string
    title: string
    artist: string
    spotifyUrl: string
    previewUrl: string
    image: string
    albumName: string
  }
  startedAt: number
  elapsedTime: number
  remainingTime: number
  progress: number
  listenerCount: number
  isActive: boolean
  nextSong: any
  mood: string
  syncData: {
    elapsedSeconds: number
    shouldSync: boolean
    timestamp: number
  }
}

interface SyncedRadioPlayerProps {
  mood: string
}

export default function SyncedRadioPlayer({ mood }: SyncedRadioPlayerProps) {
  // ══════════════════════════════════════════════════════════════════
  // CHANGED: Use context instead of useGetUser
  // ══════════════════════════════════════════════════════════════════
  const { user } = useUser()
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [sessionInfo, setSessionInfo] = useState<RadioSessionInfo | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSongChange, setShowSongChange] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')

  // Socket connection and event handlers
  useEffect(() => {
    const newSocket = io(SOCKET_URL)

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join-radio-session', {
        streamId: `${mood}-radio-session`,
        username: user?.anonymousName || 'Anonymous',
        mood: mood
      })
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('radio-session-sync', (info: RadioSessionInfo) => {
      setSessionInfo(info)
      setIsLoading(false)
      setEmbedUrl(`https://open.spotify.com/embed/track/${info.currentSong.id}`)

      if (info.currentSong.previewUrl && audioRef.current) {
        const audio = audioRef.current
        audio.src = info.currentSong.previewUrl
        const seekTime = info.syncData.elapsedSeconds

        audio.currentTime = seekTime
        
        if (isPlaying) {
          audio.play().catch(err => {
            console.error('Audio play error:', err)
          })
        }
      }
    })

    newSocket.on('song-change', (info: RadioSessionInfo) => {
      console.log('🎵 Song changed:', info.currentSong.title)
      setShowSongChange(true)
      setTimeout(() => setShowSongChange(false), 3000)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [mood, user?.anonymousName, isPlaying])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  if (isLoading) {
    return (
      <div className="synced-radio-loading">
        <div className="loading-spinner"></div>
        <p>Loading radio session...</p>
      </div>
    )
  }

  if (!sessionInfo) {
    return (
      <div className="synced-radio-error">
        <p>Unable to load radio session. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="synced-radio-container">
      {/* Connection Status */}
      <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
        {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>

      {/* Song Info */}
      <div className="radio-info">
        <h2 className="radio-title">{mood} Radio</h2>
        <div className="listener-count">
          👥 {sessionInfo.listenerCount} listening
        </div>
      </div>

      {/* Current Song Display */}
      <div className="current-song-section">
        <img 
          src={sessionInfo.currentSong.image} 
          alt={sessionInfo.currentSong.title}
          className="song-artwork"
        />
        <div className="song-details">
          <h3 className="song-title">{sessionInfo.currentSong.title}</h3>
          <p className="song-artist">{sessionInfo.currentSong.artist}</p>
          <p className="song-album">{sessionInfo.currentSong.albumName}</p>
        </div>
      </div>

      {/* Spotify Embed */}
      {embedUrl && (
        <div className="spotify-embed">
          <iframe
            src={embedUrl}
            width="100%"
            height="152"
            frameBorder="0"
            allow="encrypted-media"
          ></iframe>
        </div>
      )}

      {/* Audio Element for Preview */}
      <audio ref={audioRef} />

      {/* Play Controls */}
      <div className="radio-controls">
        <button onClick={togglePlay} className="play-button">
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
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

      {/* Song Change Notification */}
      {showSongChange && (
        <div className="song-change-notification">
          🎵 New Song Playing!
        </div>
      )}

      {/* Live Chat */}
      {socket && (
        <LiveChatComponent 
          socket={socket}
          streamId={`${mood}-radio-session`}
          username={user?.anonymousName || 'Anonymous'}
        />
      )}
    </div>
  )
}