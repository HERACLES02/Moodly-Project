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
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="theme-card backdrop-blur-md p-8 text-center max-w-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="font-medium text-lg">Tuning into radio station...</p>
          <p className="opacity-70 text-sm mt-2">Connecting to {mood} mood radio</p>
        </div>
      </div>
    )
  }

  if (!sessionInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="theme-card backdrop-blur-md p-8 text-center max-w-md">
          <p className="font-medium text-lg text-red-600">Failed to connect to radio station</p>
          <p className="opacity-70 text-sm mt-2">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Song Change Notification */}
        {showSongChange && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg">
            🎵 Now Playing: {sessionInfo.currentSong.title}
          </div>
        )}

        {/* Radio Header */}
        <div className="theme-card backdrop-blur-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold capitalize">
                {mood} Mood Radio - Live Station
              </h1>
              <p className="opacity-70 text-lg font-medium">
                Now Playing: {sessionInfo.currentSong.title}
              </p>
              <p className="opacity-50 text-sm">
                by {sessionInfo.currentSong.artist}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                🔴 LIVE
              </span>
              <span className="font-medium">
                🎧 {sessionInfo.listenerCount} listeners
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${sessionInfo.progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm opacity-70">
            <span>Elapsed: {formatTime(sessionInfo.elapsedTime)}</span>
            <span>Remaining: {formatTime(sessionInfo.remainingTime)}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Spotify Player Section */}
          <div className="lg:col-span-2">
            <div className="theme-card backdrop-blur-md p-4">
              <div className="rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-40 border-none rounded-lg"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="song"
                />
              </div>
              
              {/* Song Info */}
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <img
                    src={sessionInfo.currentSong.image || '/images/song-placeholder.jpg'}
                    alt={sessionInfo.currentSong.albumName}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">
                      {sessionInfo.currentSong.title}
                    </h2>
                    <p className="opacity-70">
                      by {sessionInfo.currentSong.artist}
                    </p>
                    <p className="opacity-50 text-sm">
                      Album: {sessionInfo.currentSong.albumName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="">
            <div className="backdrop-blur-md h-[600px]">
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

        {/* Next Song Preview */}
        {sessionInfo.nextSong && (
          <div className="theme-card backdrop-blur-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              ⏭️ Coming Up Next
            </h2>
            <div className="flex items-center gap-4">
              <img
                src={sessionInfo.nextSong.image || '/images/song-placeholder.jpg'}
                alt={sessionInfo.nextSong.albumName}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-medium text-lg">
                  {sessionInfo.nextSong.title}
                </h3>
                <p className="opacity-70">
                  by {sessionInfo.nextSong.artist}
                </p>
                <p className="opacity-50 text-sm">
                  Starting in {formatTime(sessionInfo.remainingTime)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Status */}
        <div className="theme-card backdrop-blur-md p-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm">
                {isConnected ? 'Connected to radio station' : 'Disconnected'}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (socket) {
                    socket.emit('get-radio-info')
                    console.log('🔄 Manual radio sync requested')
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                disabled={!isConnected}
              >
                🔄 Sync Radio
              </button>
            </div>
          </div>
        </div>

        {/* Hidden audio element for preview sync */}
        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </div>
  )
}