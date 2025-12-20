// src/components/UserPage/RecentActivity.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Film, Music, Clock } from "lucide-react"

interface RecentItem {
  itemId: string
  itemName: string
  createdAt: Date
  mood: string
}

export default function RecentActivity() {
  const router = useRouter()
  const [movies, setMovies] = useState<RecentItem[]>([])
  const [songs, setSongs] = useState<RecentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentActivity()
  }, [])

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch("/api/user/recent-activity")
      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      setMovies(data.recentMovies || [])
      setSongs(data.recentSongs || [])
    } catch (error) {
      console.error("Error fetching recent activity:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMovieClick = (itemId: string) => {
    router.push(`/movie/watch/${itemId}`)
  }

  const handleSongClick = (itemId: string) => {
    router.push(`/song/listen/${itemId}`)
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000,
    )

    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[var(--accent)] rounded-full animate-pulse" />
          <div className="h-6 w-48 bg-[var(--glass-bg)] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div
                  key={j}
                  className="h-20 bg-[var(--glass-bg)] rounded-lg animate-pulse"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (movies.length === 0 && songs.length === 0) {
    return (
      <div className="theme-card-variant-1-no-hover p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <Clock size={48} className="theme-text-accent opacity-50" />
          <h3 className="theme-text-foreground text-xl font-bold">
            No Recent Activity
          </h3>
          <p className="theme-text-accent text-sm">
            Start watching movies or listening to songs to see your activity
            here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
        <h2 className="theme-text-foreground text-xl font-black uppercase tracking-tighter italic">
          Recently Watched & Listened
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--glass-border)] to-transparent opacity-20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Movies */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Film size={18} className="theme-text-accent" />
            <h3 className="theme-text-accent text-sm font-black uppercase tracking-widest">
              Movies
            </h3>
          </div>

          {movies.length === 0 ? (
            <div className="theme-card-variant-1-no-hover p-6 text-center">
              <p className="theme-text-accent text-sm">No movies watched yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {movies.map((movie) => (
                <div
                  key={movie.itemId}
                  onClick={() => handleMovieClick(movie.itemId)}
                  className="group theme-card-variant-1 p-4 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="theme-text-foreground text-sm font-bold truncate group-hover:theme-text-accent transition-colors">
                      {movie.itemName}
                    </h4>
                    <p className="theme-text-accent text-xs mt-1 opacity-70">
                      {formatTimeAgo(movie.createdAt)}
                    </p>
                  </div>
                  <Film
                    size={16}
                    className="theme-text-accent opacity-50 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Songs */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Music size={18} className="theme-text-accent" />
            <h3 className="theme-text-accent text-sm font-black uppercase tracking-widest">
              Songs
            </h3>
          </div>

          {songs.length === 0 ? (
            <div className="theme-card-variant-1-no-hover p-6 text-center">
              <p className="theme-text-accent text-sm">No songs listened yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song) => (
                <div
                  key={song.itemId}
                  onClick={() => handleSongClick(song.itemId)}
                  className="group theme-card-variant-1 p-4 cursor-pointer flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="theme-text-foreground text-sm font-bold truncate group-hover:theme-text-accent transition-colors">
                      {song.itemName}
                    </h4>
                    <p className="theme-text-accent text-xs mt-1 opacity-70">
                      {formatTimeAgo(song.createdAt)}
                    </p>
                  </div>
                  <Music
                    size={16}
                    className="theme-text-accent opacity-50 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
