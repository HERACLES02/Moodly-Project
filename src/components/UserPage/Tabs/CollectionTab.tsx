// src/components/UserPage/Tabs/CollectionTab.tsx
"use client"

import { useRouter } from "next/navigation"
import { Music, Film, Star, TrendingUp, List, ChevronRight } from "lucide-react"
import { useUser } from "@/contexts/UserContext"
import { useUserPageData } from "@/hooks/useUserPageData"

interface Playlist {
  id: string
  name: string
  type: "SONG" | "MOVIE"
  createdAt: string
}

interface RatedMovie {
  id: string
  title: string
  userRating: number
  posterPath?: string
}

interface CollectionData {
  musicPlaylists: Playlist[]
  moviePlaylists: Playlist[]
}

const DUMMY_TOP_RATED: RatedMovie[] = [
  { id: "550", title: "Fight Club", userRating: 9.5 },
  { id: "13", title: "Forrest Gump", userRating: 9.2 },
  { id: "278", title: "The Shawshank Redemption", userRating: 9.0 },
  { id: "238", title: "The Godfather", userRating: 8.8 },
  { id: "424", title: "Schindler's List", userRating: 8.5 },
]

export default function CollectionTab() {
  const router = useRouter()
  const { user } = useUser()

  // Cached data fetching
  const { data, loading, error } = useUserPageData<CollectionData>(
    "user-collection",
    async () => {
      if (!user?.id) return { musicPlaylists: [], moviePlaylists: [] }

      const [musicRes, movieRes] = await Promise.all([
        fetch(`/api/playlist/get-playlist?userid=${user.id}&type=SONG`),
        fetch(`/api/playlist/get-playlist?userid=${user.id}&type=MOVIE`),
      ])

      const musicData = await musicRes.json()
      const movieData = await movieRes.json()

      return {
        musicPlaylists: Array.isArray(musicData) ? musicData : [],
        moviePlaylists: Array.isArray(movieData) ? movieData : [],
      }
    }
  )

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-48 rounded-2xl animate-pulse bg-[var(--glass-bg)]"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="theme-text-accent text-sm">{error}</p>
      </div>
    )
  }

  const musicPlaylists = data?.musicPlaylists || []
  const moviePlaylists = data?.moviePlaylists || []

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-black tracking-tight theme-text-foreground mb-2">
          Collection
        </h2>
        <p className="theme-text-accent text-sm opacity-70">
          Your playlists and top-rated content
        </p>
      </div>

      {/* Playlists Section */}
      <div className="space-y-6">
        {/* Music Playlists */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Music size={20} className="theme-text-accent" />
            <h3 className="text-lg font-black uppercase tracking-widest theme-text-foreground">
              Song Playlists
            </h3>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[var(--accent)] to-transparent opacity-30" />
          </div>

          {musicPlaylists.length === 0 ? (
            <div className="theme-card-variant-1-no-hover p-12 text-center">
              <List
                size={48}
                className="theme-text-accent opacity-30 mx-auto mb-4"
              />
              <p className="theme-text-accent text-sm">
                No music playlists yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {musicPlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => router.push(`/playlist/view/${playlist.id}`)}
                  className="group theme-card-variant-1 p-5 cursor-pointer flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--secondary)] flex items-center justify-center shadow-md">
                    <Music size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold theme-text-foreground truncate group-hover:theme-text-accent transition-colors">
                      {playlist.name}
                    </h4>
                    <p className="text-xs theme-text-accent opacity-70 mt-1">
                      Created{" "}
                      {new Date(playlist.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight
                    size={20}
                    className="theme-text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Movie Playlists */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Film size={20} className="theme-text-accent" />
            <h3 className="text-lg font-black uppercase tracking-widest theme-text-foreground">
              Movie Playlists
            </h3>
            <div className="flex-1 h-[2px] bg-gradient-to-r from-[var(--accent)] to-transparent opacity-30" />
          </div>

          {moviePlaylists.length === 0 ? (
            <div className="theme-card-variant-1-no-hover p-12 text-center">
              <List
                size={48}
                className="theme-text-accent opacity-30 mx-auto mb-4"
              />
              <p className="theme-text-accent text-sm">
                No movie playlists yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moviePlaylists.map((playlist) => (
                <div
                  key={playlist.id}
                  onClick={() => router.push(`/playlist/view/${playlist.id}`)}
                  className="group theme-card-variant-1 p-5 cursor-pointer flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--secondary)] flex items-center justify-center shadow-md">
                    <Film size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold theme-text-foreground truncate group-hover:theme-text-accent transition-colors">
                      {playlist.name}
                    </h4>
                    <p className="text-xs theme-text-accent opacity-70 mt-1">
                      Created{" "}
                      {new Date(playlist.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight
                    size={20}
                    className="theme-text-accent opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Rated Movies Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Star size={20} className="theme-text-accent" />
          <h3 className="text-lg font-black uppercase tracking-widest theme-text-foreground">
            Top Rated Movies
          </h3>
          <div className="flex-1 h-[2px] bg-gradient-to-r from-[var(--accent)] to-transparent opacity-30" />
          <span className="text-xs theme-text-accent font-bold uppercase tracking-widest opacity-50">
            Coming Soon
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {DUMMY_TOP_RATED.map((movie, index) => (
            <div
              key={movie.id}
              onClick={() => router.push(`/movie/watch/${movie.id}`)}
              className="group theme-card-variant-1 p-0 cursor-pointer relative overflow-hidden"
            >
              {/* Rank Badge */}
              <div className="absolute top-2 left-2 z-10 bg-[var(--accent)] text-[var(--background)] w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-md">
                #{index + 1}
              </div>

              {/* Placeholder Image */}
              <div className="w-full aspect-[2/3] bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] flex items-center justify-center rounded-t-lg">
                <TrendingUp
                  size={32}
                  className="theme-text-accent opacity-30"
                />
              </div>

              {/* Movie Info */}
              <div className="p-3">
                <h4 className="text-xs font-bold theme-text-foreground mb-2 truncate group-hover:theme-text-accent transition-colors">
                  {movie.title}
                </h4>

                {/* Rating Display */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={10}
                      className={
                        i < Math.floor(movie.userRating / 2)
                          ? "text-[var(--accent)] fill-[var(--accent)]"
                          : "theme-text-accent opacity-30"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Message */}
        <div className="theme-card-variant-1-no-hover p-4 border-l-4 border-[var(--accent)]">
          <p className="theme-text-accent text-xs">
            <span className="font-bold">Coming Soon:</span> Rate movies after
            watching them and see your personal top picks here!
          </p>
        </div>
      </div>
    </div>
  )
}
