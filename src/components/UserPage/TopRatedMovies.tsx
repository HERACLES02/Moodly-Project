// src/components/UserPage/TopRatedMovies.tsx
"use client"

import { useRouter } from "next/navigation"
import { Star, TrendingUp } from "lucide-react"

// ⭐ FRONTEND ONLY - Dummy data for now
// TODO: Backend implementation for user ratings
interface RatedMovie {
  id: string
  title: string
  userRating: number
  posterPath?: string
}

const DUMMY_TOP_RATED: RatedMovie[] = [
  { id: "550", title: "Fight Club", userRating: 9.5 },
  { id: "13", title: "Forrest Gump", userRating: 9.2 },
  { id: "278", title: "The Shawshank Redemption", userRating: 9.0 },
  { id: "238", title: "The Godfather", userRating: 8.8 },
  { id: "424", title: "Schindler's List", userRating: 8.5 },
]

export default function TopRatedMovies() {
  const router = useRouter()

  const handleMovieClick = (movieId: string) => {
    router.push(`/movie/watch/${movieId}`)
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
        <h2 className="theme-text-foreground text-xl font-black uppercase tracking-tighter italic">
          Your Top Rated Movies
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--glass-border)] to-transparent opacity-20" />
        <span className="theme-text-accent text-xs font-bold uppercase tracking-widest opacity-50">
          Coming Soon
        </span>
      </div>

      {/* Horizontal Scrollable List */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
          {DUMMY_TOP_RATED.map((movie, index) => (
            <div
              key={movie.id}
              onClick={() => handleMovieClick(movie.id)}
              className="group flex-shrink-0 w-64 theme-card-variant-1 p-0 cursor-pointer snap-start"
            >
              {/* Rank Badge */}
              <div className="relative">
                <div className="absolute top-2 left-2 z-10 bg-[var(--accent)] text-[var(--background)] w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                  #{index + 1}
                </div>

                {/* Placeholder Image */}
                <div className="w-full h-32 bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] flex items-center justify-center">
                  <TrendingUp
                    size={48}
                    className="theme-text-accent opacity-30"
                  />
                </div>
              </div>

              {/* Movie Info */}
              <div className="p-4">
                <h3 className="theme-text-foreground text-sm font-bold mb-2 truncate group-hover:theme-text-accent transition-colors">
                  {movie.title}
                </h3>

                {/* Rating Display */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(movie.userRating / 2)
                            ? "text-[var(--accent)] fill-[var(--accent)]"
                            : "theme-text-accent opacity-30"
                        }
                      />
                    ))}
                  </div>
                  <span className="theme-text-accent text-xs font-bold">
                    {movie.userRating}/10
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--background)] to-transparent pointer-events-none" />
      </div>

      {/* Info Message */}
      <div className="theme-card-variant-1-no-hover p-4 border-l-4 border-[var(--accent)]">
        <p className="theme-text-accent text-xs">
          <span className="font-bold">Coming Soon:</span> Rate movies after
          watching them and see your personal top picks here!
        </p>
      </div>
    </div>
  )
}
