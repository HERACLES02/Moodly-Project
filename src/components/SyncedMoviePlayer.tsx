'use client'

import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useGetUser } from '@/hooks/useGetUser'
import NavbarComponent from '@/components/NavbarComponent'
import AddMusicToPlaylistComponent from '@/components/PlaylistComponents/AddMusicToPlaylistComponent'
import { LiveChatComponent } from './LiveChatComponenet'
import './page.css'

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
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [embedUrl, setEmbedUrl] = useState('')

  // SOCKET.IO HANDLING
  useEffect(() => {
    const newSocket = io('http://localhost:9513')

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join-radio-session', {
        streamId: `${mood}-radio-session`,
        username: user?.anonymousName || 'Anonymous',
        mood
      })
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    // Syncing Radio Session Data
    newSocket.on('radio-session-sync', (info: RadioSessionInfo) => {
      setSessionInfo(info)
      setIsLoading(false)
      setEmbedUrl(`https://open.spotify.com/embed/track/${info.currentSong.id}`)

      // Handle Audio Playback
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

        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      }
    })

    // Song Changed
    newSocket.on('song-changed', (info: RadioSessionInfo) => {
      setSessionInfo(info)
      if (info.currentSong.previewUrl && audioRef.current) {
        const audio = audioRef.current
        audio.src = info.currentSong.previewUrl
        audio.currentTime = 0
        audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      } else {
        setIsPlaying(false)
      }
    })

    // Listener Count Updates
    newSocket.on('listener-count-update', (data: { count: number }) => {
      setSessionInfo(prev => prev ? { ...prev, listenerCount: data.count } : prev)
    })

    setSocket(newSocket)
    return () => {
      newSocket.close()
    }
  }, [mood, user?.anonymousName])

  // Playback Toggle
  const togglePlayback = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  // Theme Class Setter
  const getThemeClass = () => {
    const moodClass = user?.mood?.toLowerCase()
    if (moodClass === 'happy') return 'mood-happy'
    if (moodClass === 'sad') return 'mood-sad'
    return ''
  }

  useEffect(() => {
    const themeClass = getThemeClass()
    document.body.className = themeClass
    return () => {
      document.body.className = ''
    }
  }, [user?.mood])

  if (isLoading || !sessionInfo) {
    return (
      <>
        <NavbarComponent />
        <div className="loading-screen">Tuning into your radio session...</div>
      </>
    )
  }

  return (
    <>
      <NavbarComponent />
      <div className="listen-page-container">
        {/* LEFT SIDE: Music Player */}
        <div className="spotify-embed-container">
          <iframe
            src={embedUrl}
            className="spotify-player"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Current Song"
          />
        </div>

        <div className="main-content-area">
          {/* CURRENTLY PLAYING */}
          <div className="currently-playing-section">
            <h1 className="section-heading">Currently Playing</h1>
            <p className="song-title">{sessionInfo.currentSong.title}</p>
            <p className="artist-name">{sessionInfo.currentSong.artist}</p>
            <p className="listener-count">👥 {sessionInfo.listenerCount} listeners</p>
            <button onClick={togglePlayback} className="play-btn">
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          </div>

          {/* NEXT UP */}
          {sessionInfo.nextSong && (
            <div className="next-up-section">
              <h2 className="section-heading">Up Next</h2>
              <p className="song-title">{sessionInfo.nextSong.title}</p>
              <p className="artist-name">{sessionInfo.nextSong.artist}</p>
            </div>
          )}

          {/* ADD TO PLAYLIST */}
          <div className="playlist-add-section">
            <AddMusicToPlaylistComponent itemId={sessionInfo.currentSong.id} />
          </div>
        </div>

        {/* RIGHT SIDE: Live Chat */}
        <div className="chat-section">
          <LiveChatComponent
            streamId={`${mood}-radio-session`}
            user={user}
            mood={mood}
            sharedSocket={socket}
            isSocketConnected={isConnected}
          />
        </div>

        {/* Hidden audio element */}
        <audio ref={audioRef} hidden />
      </div>
    </>
  )
}
