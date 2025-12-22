// src/components/UserPage/Tabs/ActivityTab.tsx
"use client"

import { useRouter } from "next/navigation"
import {
  Film,
  Music,
  Clock,
  TrendingUp,
  TrendingDown,
  Play,
} from "lucide-react"
import { useUserPageData } from "@/hooks/useUserPageData"

interface RecentItem {
  itemId: string
  itemName: string
  createdAt: Date
  mood: string
}

type Activity =
  | {
      id: string
      type: "point"
      points: number
      reason: string
      createdAt: Date
    }
  | {
      id: string
      type: "interaction"
      itemType: string
      itemId: string
      itemName: string
      mood: string
      createdAt: Date
    }

interface ActivityData {
  movies: RecentItem[]
  songs: RecentItem[]
  activities: Activity[]
}

export default function ActivityTab() {
  const router = useRouter()

  // Cached data fetching
  const { data, loading, error } = useUserPageData<ActivityData>(
    "user-activity",
    async () => {
      const [recentRes, logRes] = await Promise.all([
        fetch("/api/user/recent-activity"),
        fetch("/api/user/activity-log"),
      ])

      const recentData = await recentRes.json()
      const logData = await logRes.json()

      return {
        movies: recentData.recentMovies || [],
        songs: recentData.recentSongs || [],
        activities: logData.activities || [],
      }
    }
  )

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    )
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getActivityIcon = (activity: Activity) => {
    if (activity.type === "point") {
      return activity.points > 0 ? (
        <TrendingUp size={16} className="text-green-500" />
      ) : (
        <TrendingDown size={16} className="text-red-500" />
      )
    }
    if (activity.itemType === "movie")
      return <Film size={16} className="theme-text-accent" />
    if (activity.itemType === "song")
      return <Music size={16} className="theme-text-accent" />
    return <Clock size={16} className="theme-text-accent" />
  }

  const getActivityDescription = (activity: Activity) => {
    if (activity.type === "point") {
      const action = activity.reason.split("_")[0]
      const type = activity.reason.includes("movie")
        ? "movie"
        : activity.reason.includes("song")
          ? "song"
          : "content"

      return (
        <span>
          <span className="font-bold">
            {activity.points > 0 ? "+" : ""}
            {activity.points} points
          </span>{" "}
          for{" "}
          {action === "watch"
            ? "watching"
            : action === "listen"
              ? "listening to"
              : action}{" "}
          a {type}
        </span>
      )
    }

    return (
      <span>
        {activity.itemType === "movie" ? "Watched" : "Listened to"}{" "}
        <span className="font-bold">{activity.itemName}</span>
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl animate-pulse bg-[var(--glass-bg)]"
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

  const movies = data?.movies || []
  const songs = data?.songs || []
  const activities = data?.activities || []

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-black tracking-tight theme-text-foreground mb-2">
          Activity
        </h2>
        <p className="theme-text-accent text-sm opacity-70">
          Your recent watches, listens, and interactions
        </p>
      </div>

      {/* Recent Activity Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black theme-text-foreground uppercase tracking-widest">
          Recently Played
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent Movies */}
          <div className="theme-card-variant-1-no-hover p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--glass-border)]">
              <Film size={18} className="theme-text-accent" />
              <h4 className="text-sm font-black uppercase tracking-widest theme-text-accent">
                Movies
              </h4>
            </div>

            {movies.length === 0 ? (
              <div className="py-8 text-center">
                <Film
                  size={32}
                  className="theme-text-accent opacity-30 mx-auto mb-2"
                />
                <p className="text-xs theme-text-accent opacity-70">
                  No movies watched yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {movies.slice(0, 5).map((movie) => (
                  <div
                    key={movie.itemId}
                    onClick={() => router.push(`/movie/watch/${movie.itemId}`)}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--glass-bg)] cursor-pointer transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center group-hover:bg-[var(--accent)] transition-colors">
                      <Play size={16} className="theme-text-accent group-hover:text-[var(--background)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold theme-text-foreground truncate group-hover:theme-text-accent transition-colors">
                        {movie.itemName}
                      </h5>
                      <p className="text-xs theme-text-accent opacity-70">
                        {formatTimeAgo(movie.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Songs */}
          <div className="theme-card-variant-1-no-hover p-6">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--glass-border)]">
              <Music size={18} className="theme-text-accent" />
              <h4 className="text-sm font-black uppercase tracking-widest theme-text-accent">
                Songs
              </h4>
            </div>

            {songs.length === 0 ? (
              <div className="py-8 text-center">
                <Music
                  size={32}
                  className="theme-text-accent opacity-30 mx-auto mb-2"
                />
                <p className="text-xs theme-text-accent opacity-70">
                  No songs listened yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {songs.slice(0, 5).map((song) => (
                  <div
                    key={song.itemId}
                    onClick={() => router.push(`/song/listen/${song.itemId}`)}
                    className="group flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--glass-bg)] cursor-pointer transition-all"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[var(--secondary)] flex items-center justify-center group-hover:bg-[var(--accent)] transition-colors">
                      <Play size={16} className="theme-text-accent group-hover:text-[var(--background)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-bold theme-text-foreground truncate group-hover:theme-text-accent transition-colors">
                        {song.itemName}
                      </h5>
                      <p className="text-xs theme-text-accent opacity-70">
                        {formatTimeAgo(song.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Log Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black theme-text-foreground uppercase tracking-widest">
          Activity Timeline
        </h3>

        <div className="theme-card-variant-1-no-hover p-6">
          {activities.length === 0 ? (
            <div className="py-12 text-center">
              <Clock
                size={48}
                className="theme-text-accent opacity-30 mx-auto mb-4"
              />
              <p className="theme-text-accent text-sm">No activity yet</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--glass-bg)] transition-colors"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="theme-text-foreground text-sm">
                      {getActivityDescription(activity)}
                    </p>
                    <p className="theme-text-accent text-xs opacity-70 mt-1">
                      {formatTimeAgo(activity.createdAt)}
                    </p>
                  </div>

                  {activity.type === "point" && (
                    <div
                      className={`flex-shrink-0 px-2 py-1 rounded text-xs font-bold ${
                        activity.points > 0
                          ? "bg-green-500/20 text-green-500"
                          : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {activity.points > 0 ? "+" : ""}
                      {activity.points}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    )
    if (seconds < 60) return "Just now"
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getActivityIcon = (activity: Activity) => {
    if (activity.type === "point") {
      return activity.points > 0 ? (
        <TrendingUp size={16} className="text-green-500" />
      ) : (
        <TrendingDown size={16} className="text-red-500" />
      )
    }
    if (activity.itemType === "movie")
      return <Film size={16} className="theme-text-accent" />
    if (activity.itemType === "song")
      return <Music size={16} className="theme-text-accent" />
    return <Clock size={16} className="theme-text-accent" />
  }

  const getActivityDescription = (activity: Activity) => {
    if (activity.type === "point") {
      const action = activity.reason.split("_")[0]
      const type = activity.reason.includes("movie")
        ? "movie"
        : activity.reason.includes("song")
          ? "song"
          : "content"

      return (
        <span>
          <span className="font-bold">
            {activity.points > 0 ? "+" : ""}
            {activity.points} points
          </span>{" "}
          for{" "}
          {action === "watch"
            ? "watching"
            : action === "listen"
              ? "listening to"
              : action}{" "}
          a {type}
        </span>
      )
    }

    return (
      <span>
        {activity.itemType === "movie" ? "Watched" : "Listened to"}{" "}
        <span className="font-bold">{activity.itemName}</span>
      </span>
    )
  }
