"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import AddToPlaylistComponent from "@/components/PlaylistComponents/AddToPlaylistComponent"
import { usePoints } from "@/hooks/usePoints"
import { Heart, Play, Clock } from "lucide-react"

interface Track {
  id: string
  name: string
  track_number: number
  duration_ms: number
  preview_url: string | null
  external_urls: {
    spotify: string
  }
  artists: {
    name: string
  }[]
}

interface Album {
  id: string
  name: string
  artists: {
    name: string
  }[]
  images: {
    url: string
  }[]
  release_date: string
  total_tracks: number
  tracks: {
    items: Track[]
  }
  external_urls: {
    spotify: string
  }
}

export default function AlbumListen({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string>("")
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const router = useRouter()
  const { addPoints } = usePoints()
  const [hasEarnedListenPoints, setHasEarnedListenPoints] = useState(false)

  useEffect(() => {
    const getParams = async () => {
      const p = await params
      setId(p.id)
    }
    getParams()
  }, [params])

  useEffect(() => {
    if (id) {
      fetchAlbumData()
    }
  }, [id])

  useEffect(() => {
    if (!hasEarnedListenPoints && id) {
      const timer = setTimeout(() => {
        console.log("🎵 Adding points for listening to album:", id)
        addPoints("listen", id, "album").catch((err) => {
          console.error("Failed to add points:", err)
        })
        setHasEarnedListenPoints(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [id, hasEarnedListenPoints])

  const fetchAlbumData = async () => {
    try {
      setLoading(true)

      // Get Spotify token
      const tokenResponse = await fetch("/api/get-spotify-token")
      const { access_token } = await tokenResponse.json()

      // Fetch album data
      const albumResponse = await fetch(
        `https://api.spotify.com/v1/albums/${id}`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      )

      if (!albumResponse.ok) throw new Error("Failed to fetch album")

      const albumData = await albumResponse.json()
      setAlbum(albumData)

      // Set first track as current
      if (albumData.tracks?.items?.length > 0) {
        setCurrentTrack(albumData.tracks.items[0])
      }
    } catch (error) {
      console.error("Error fetching album data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleTrackClick = (track: Track) => {
    setCurrentTrack(track)
    setIsPlaying(true)

    // if (track.preview_url) {
    // } else {
    //   // Open in Spotify if no preview
    //   window.open(track.external_urls.spotify, "_blank")
    // }
  }

  const handlePlayFullAlbum = () => {
    if (album?.external_urls?.spotify) {
      window.open(album.external_urls.spotify, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-[var(--accent)] animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="theme-text-accent">Album not found</p>
      </div>
    )
  }

  const embedUrl = currentTrack
    ? `https://open.spotify.com/embed/track/${currentTrack.id}`
    : `https://open.spotify.com/embed/album/${id}`

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Player & Album Info */}
          <div className="space-y-6">
            {/* Album Art & Info */}
            <div className="theme-card-variant-1-no-hover p-6">
              <div className="relative w-full aspect-square mb-6 rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={album.images[0]?.url || "/images/music-placeholder.jpg"}
                  alt={album.name}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-500 hover:scale-105"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h1 className="theme-text-foreground text-3xl font-black tracking-tight mb-2">
                    {album.name}
                  </h1>
                  <p className="theme-text-accent text-lg font-bold">
                    {album.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm theme-text-accent">
                  <span>{new Date(album.release_date).getFullYear()}</span>
                  <span>•</span>
                  <span>{album.total_tracks} tracks</span>
                </div>

                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handlePlayFullAlbum}
                    className="theme-button-variant-2 flex items-center gap-2"
                  >
                    <Play size={16} fill="currentColor" />
                    Play on Spotify
                  </button>
                  <AddToPlaylistComponent type="ALBUM" itemId={id} />
                </div>
              </div>
            </div>

            {/* Spotify Embed Player */}
            <div className="theme-card-variant-1-no-hover p-4">
              <h3 className="theme-text-foreground text-sm font-bold mb-3 uppercase tracking-wider">
                {currentTrack ? "Now Playing" : "Album Preview"}
              </h3>
              <div className="rounded-xl overflow-hidden">
                <iframe
                  src={embedUrl}
                  className="w-full h-[152px]"
                  allow="autoplay"
                  loading="lazy"
                  title={currentTrack ? currentTrack.name : album.name}
                ></iframe>
              </div>
              {currentTrack && (
                <div className="mt-3">
                  <p className="theme-text-foreground text-sm font-bold">
                    {currentTrack.name}
                  </p>
                  <p className="theme-text-accent text-xs">
                    Track {currentTrack.track_number}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Track List */}
          <div className="theme-card-variant-1-no-hover p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="theme-text-foreground text-2xl font-black tracking-tight">
                Tracks
              </h2>
              <div className="flex items-center gap-2 theme-text-accent text-sm">
                <Clock size={16} />
                <span>Duration</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {album.tracks.items.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className={`group relative flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    currentTrack?.id === track.id
                      ? "bg-[var(--accent)]/20 border-2 border-[var(--accent)]"
                      : "hover:bg-[var(--glass-bg)] border-2 border-transparent"
                  }`}
                >
                  {/* Track Number / Play Icon */}
                  <div className="w-8 flex items-center justify-center">
                    {currentTrack?.id === track.id ? (
                      <div className="w-4 h-4 rounded-full bg-[var(--accent)] flex items-center justify-center">
                        <Play size={10} fill="white" className="text-white" />
                      </div>
                    ) : (
                      <span className="theme-text-accent text-sm font-bold group-hover:hidden">
                        {track.track_number}
                      </span>
                    )}
                    <Play
                      size={16}
                      className="hidden group-hover:block theme-text-accent"
                    />
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-bold text-sm truncate ${
                        currentTrack?.id === track.id
                          ? "theme-text-accent"
                          : "theme-text-foreground"
                      }`}
                    >
                      {track.name}
                    </p>
                    <p className="theme-text-accent text-xs truncate">
                      {track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="theme-text-accent text-sm font-medium">
                    {formatDuration(track.duration_ms)}
                  </div>

                  {/* Preview Indicator */}
                  {!track.preview_url && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] theme-text-accent bg-[var(--glass-bg)] px-2 py-1 rounded">
                        Open in Spotify
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Album Stats */}
            <div className="mt-6 pt-6 border-t border-[var(--glass-border)]">
              <div className="flex items-center justify-between theme-text-accent text-sm">
                <span className="font-bold">Total Duration</span>
                <span>
                  {formatDuration(
                    album.tracks.items.reduce(
                      (sum, track) => sum + track.duration_ms,
                      0,
                    ),
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--glass-bg);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--accent);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--accent);
          opacity: 0.8;
        }
      `}</style>
    </div>
  )
}
