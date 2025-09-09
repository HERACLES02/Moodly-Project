'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useGetUser } from '@/hooks/useGetUser'
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
              <div className="flex mt-4 justify-between">
                <div className="flex items-center gap-4 " >
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
                <div className="flex flex-col text-center">
                  <div>
                    <p className="text-sm font-medium">Next:</p>
                  </div>
                    <div>
                    <p className="opacity-70 text-xs">
                      {sessionInfo.nextSong?.title || 'Loading...'}
                      
                    </p>
                    <p className="text-sm font-medium">
                    {sessionInfo.nextSong?.artist || 'Loading...'}
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



      </div>
    </div>
  )
}