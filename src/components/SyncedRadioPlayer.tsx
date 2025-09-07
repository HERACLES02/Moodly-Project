'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useGetUser } from '@/hooks/useGetUser'
import { LiveChatComponent } from './LiveChatComponent'
import './syncedRadio.css'

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
  const { user } = useGetUser()
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
    const newSocket = io('http://localhost:9513')

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

    // Receive radio session sync info
    newSocket.on('radio-session-sync', (info: RadioSessionInfo) => {
      setSessionInfo(info)
      setIsLoading(false)
      setEmbedUrl(`https://open.spotify.com/embed/track/${info.currentSong.id}`)

      if (info.currentSong.previewUrl && audioRef.current) {
        const audio = audioRef.current
        audio.src = info.currentSong.previewUrl
        const seekTime = Math.min(info.syncData.elapsedSeconds, 28)

        audio.addEventListener(
          'loadeddata',
          () => {
            audio.currentTime = seekTime
          },
          { once: true }
        )

        audio.play().then(() => {
          setIsPlaying(true)
        }).catch(() => {
          setIsPlaying(false)
        })
      }
    })

    newSocket.on('song-changed', (info: RadioSessionInfo) => {
      setSessionInfo(info)
      setShowSongChange(true)

      if (info.currentSong.previewUrl && audioRef.current) {
        const audio = audioRef.current
        audio.src = info.currentSong.previewUrl
        audio.currentTime = 0

        audio.addEventListener(
          'loadeddata',
          () => {
            if (isPlaying) {
              audio.play().catch(() => setIsPlaying(false))
            }
          },
          { once: true }
        )
      }

      setTimeout(() => setShowSongChange(false), 5000)
    })

    newSocket.on('listener-count-update', (data: { count: number }) => {
      setSessionInfo(prev => prev ? { ...prev, listenerCount: data.count } : prev)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [mood, user?.anonymousName])

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className={`synced-radio-container mood-${mood}`}>
        <div className="loading-card">
          <div className="spinner"></div>
          <p className="loading-text">Tuning into radio station...</p>
          <p className="sub-text">Connecting to {mood} mood radio</p>
        </div>
      </div>
    )
  }

  if (!sessionInfo) {
    return (
      <div className={`synced-radio-container mood-${mood}`}>
        <div className="error-card">
          <p className="error-text">Failed to connect to radio station</p>
          <p className="sub-text">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`synced-radio-container mood-${mood}`}>
      <div className="synced-radio-content">
        <div className="left-section">
          <div className="spotify-embed-container">
            <iframe
              src={embedUrl}
              className="spotify-player"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="song"
            />
          </div>
        </div>

        <div className="right-section">
          <div className="chat-container">
            <LiveChatComponent
              streamId={`${mood}-radio-session`}
              user={user}
              mood={mood}
              sharedSocket={socket}
              isSocketConnected={isConnected}
            />
          </div>
        </div>
      </div>

      {sessionInfo.nextSong && (
        <div className="next-song-container">
          <h2 className="next-song-heading">⏭️ Coming Up Next</h2>
          <div className="next-song-info">
            <img
              src={sessionInfo.nextSong.image || '/images/song-placeholder.jpg'}
              alt={sessionInfo.nextSong.albumName}
              className="next-song-image"
            />
            <div>
              <h3 className="song-title">{sessionInfo.nextSong.title}</h3>
              <p className="artist-name">by {sessionInfo.nextSong.artist}</p>
              <p className="time-left">
                Starting in {formatTime(sessionInfo.remainingTime)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
