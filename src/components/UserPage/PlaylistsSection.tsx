// src/components/UserPage/PlaylistsSection.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Music, Film, ChevronDown, ChevronRight, List } from "lucide-react"
import { useUser } from "@/contexts/UserContext"

interface Playlist {
  id: string
  name: string
  type: "SONG" | "MOVIE"
  createdAt: string
}

export default function PlaylistsSection() {
  const router = useRouter()
  const { user } = useUser()
  const [musicPlaylists, setMusicPlaylists] = useState<Playlist[]>([])
  const [moviePlaylists, setMoviePlaylists] = useState<Playlist[]>([])
  const [expandedSection, setExpandedSection] = useState<
    "music" | "movie" | null
  >(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchPlaylists()
    }
  }, [user?.id])

  const fetchPlaylists = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const [musicRes, movieRes] = await Promise.all([
        fetch(`/api/playlist/get-playlist?userid=${user.id}&type=SONG`),
        fetch(`/api/playlist/get-playlist?userid=${user.id}&type=MOVIE`),
      ])

      const musicData = await musicRes.json()
      const movieData = await movieRes.json()

      setMusicPlaylists(Array.isArray(musicData) ? musicData : [])
      setMoviePlaylists(Array.isArray(movieData) ? movieData : [])
    } catch (error) {
      console.error("Error fetching playlists:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaylistClick = (playlistId: string) => {
    router.push(`/playlist/view/${playlistId}`)
  }

  const toggleSection = (section: "music" | "movie") => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[var(--accent)] rounded-full animate-pulse" />
          <div className="h-6 w-32 bg-[var(--glass-bg)] rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 bg-[var(--glass-bg)] rounded-lg animate-pulse"
            />
          ))}
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
          My Playlists
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--glass-border)] to-transparent opacity-20" />
      </div>

      {/* Playlists Grid */}
      <div className="space-y-3">
        {/* Music Playlists Section */}
        <div className="theme-card-variant-1-no-hover p-0 overflow-hidden">
          <button
            onClick={() => toggleSection("music")}
            className="w-full p-4 flex items-center justify-between hover:bg-[var(--glass-bg)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Music size={20} className="theme-text-accent" />
              <div className="text-left">
                <h3 className="theme-text-foreground text-base font-bold">
                  Song Playlists
                </h3>
                <p className="theme-text-accent text-xs">
                  {musicPlaylists.length} playlist
                  {musicPlaylists.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {expandedSection === "music" ? (
              <ChevronDown size={20} className="theme-text-accent" />
            ) : (
              <ChevronRight size={20} className="theme-text-accent" />
            )}
          </button>

          {/* Expanded Music Playlists */}
          {expandedSection === "music" && (
            <div className="px-4 pb-4 space-y-2 border-t border-[var(--glass-border)]">
              {musicPlaylists.length === 0 ? (
                <div className="py-8 text-center">
                  <List
                    size={32}
                    className="theme-text-accent opacity-30 mx-auto mb-2"
                  />
                  <p className="theme-text-accent text-sm">
                    No music playlists yet
                  </p>
                </div>
              ) : (
                musicPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist.id)}
                    className="group p-3 rounded-lg hover:bg-[var(--glass-bg)] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                        <Music size={18} className="theme-text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="theme-text-foreground text-sm font-bold truncate group-hover:theme-text-accent transition-colors">
                          {playlist.name}
                        </h4>
                        <p className="theme-text-accent text-xs opacity-70">
                          Created{" "}
                          {new Date(playlist.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="theme-text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Movie Playlists Section */}
        <div className="theme-card-variant-1-no-hover p-0 overflow-hidden">
          <button
            onClick={() => toggleSection("movie")}
            className="w-full p-4 flex items-center justify-between hover:bg-[var(--glass-bg)] transition-colors"
          >
            <div className="flex items-center gap-3">
              <Film size={20} className="theme-text-accent" />
              <div className="text-left">
                <h3 className="theme-text-foreground text-base font-bold">
                  Movie Playlists
                </h3>
                <p className="theme-text-accent text-xs">
                  {moviePlaylists.length} playlist
                  {moviePlaylists.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            {expandedSection === "movie" ? (
              <ChevronDown size={20} className="theme-text-accent" />
            ) : (
              <ChevronRight size={20} className="theme-text-accent" />
            )}
          </button>

          {/* Expanded Movie Playlists */}
          {expandedSection === "movie" && (
            <div className="px-4 pb-4 space-y-2 border-t border-[var(--glass-border)]">
              {moviePlaylists.length === 0 ? (
                <div className="py-8 text-center">
                  <List
                    size={32}
                    className="theme-text-accent opacity-30 mx-auto mb-2"
                  />
                  <p className="theme-text-accent text-sm">
                    No movie playlists yet
                  </p>
                </div>
              ) : (
                moviePlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => handlePlaylistClick(playlist.id)}
                    className="group p-3 rounded-lg hover:bg-[var(--glass-bg)] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center flex-shrink-0">
                        <Film size={18} className="theme-text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="theme-text-foreground text-sm font-bold truncate group-hover:theme-text-accent transition-colors">
                          {playlist.name}
                        </h4>
                        <p className="theme-text-accent text-xs opacity-70">
                          Created{" "}
                          {new Date(playlist.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={16}
                      className="theme-text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
