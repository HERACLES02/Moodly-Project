// src/components/UserPage/ActivityLog.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Film,
  Music,
  Heart,
} from "lucide-react"

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

export default function ActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivityLog()
  }, [])

  const fetchActivityLog = async () => {
    try {
      const response = await fetch("/api/user/activity-log")
      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error("Error fetching activity log:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffMs = now.getTime() - activityDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return activityDate.toLocaleDateString()
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
    return <Heart size={16} className="theme-text-accent" />
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
        <span className="font-bold">{activity.itemName}</span> in{" "}
        <span className="italic">{activity.mood}</span> mood
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[var(--accent)] rounded-full animate-pulse" />
          <div className="h-6 w-32 bg-[var(--glass-bg)] rounded animate-pulse" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
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
          Activity Log
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--glass-border)] to-transparent opacity-20" />
      </div>

      {/* Activity Timeline */}
      <div className="theme-card-variant-1-no-hover p-6">
        {activities.length === 0 ? (
          <div className="text-center py-12">
            <Clock
              size={48}
              className="theme-text-accent opacity-30 mx-auto mb-4"
            />
            <p className="theme-text-accent text-sm">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[var(--glass-bg)] transition-colors"
              >
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="theme-text-foreground text-sm">
                    {getActivityDescription(activity)}
                  </p>
                  <p className="theme-text-accent text-xs opacity-70 mt-1">
                    {formatDate(activity.createdAt)}
                  </p>
                </div>

                {/* Points Badge (if applicable) */}
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
  )
}
