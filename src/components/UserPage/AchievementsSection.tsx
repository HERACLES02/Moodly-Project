// src/components/UserPage/AchievementsSection.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Trophy,
  Award,
  Target,
  Zap,
  Heart,
  Film,
  Music,
  Users,
  Star,
  TrendingUp,
  Flame,
  Crown,
  Calendar,
  Radio,
  Eye,
} from "lucide-react"
import { useUser } from "@/contexts/UserContext"

// Achievement tier types
type AchievementTier = "bronze" | "silver" | "gold" | "platinum"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  tier: AchievementTier
  progress: number
  maxProgress: number
  unlocked: boolean
  category: "movies" | "music" | "community" | "streaks" | "exploration"
}

// Tier colors
const TIER_COLORS = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-cyan-400 to-blue-600",
}

export default function AchievementsSection() {
  const { user } = useUser()
  const [achievements, setAchievements] = useState<Achievement[]>([])

  useEffect(() => {
    if (user) {
      generateAchievements()
    }
  }, [user])

  const generateAchievements = () => {
    // ⭐ DUMMY DATA - Will be replaced with real backend data
    const allAchievements: Achievement[] = [
      // Movie Achievements
      {
        id: "first_movie",
        title: "Cinema Debut",
        description: "Watch your first movie",
        icon: <Film size={24} />,
        tier: "bronze",
        progress: 1,
        maxProgress: 1,
        unlocked: true,
        category: "movies",
      },
      {
        id: "movie_marathon",
        title: "Movie Marathon",
        description: "Watch 10 movies",
        icon: <Film size={24} />,
        tier: "silver",
        progress: 7,
        maxProgress: 10,
        unlocked: false,
        category: "movies",
      },
      {
        id: "cinephile",
        title: "Cinephile",
        description: "Watch 50 movies",
        icon: <Crown size={24} />,
        tier: "gold",
        progress: 23,
        maxProgress: 50,
        unlocked: false,
        category: "movies",
      },
      {
        id: "movie_master",
        title: "Movie Master",
        description: "Watch 100 movies",
        icon: <Trophy size={24} />,
        tier: "platinum",
        progress: 23,
        maxProgress: 100,
        unlocked: false,
        category: "movies",
      },

      // Music Achievements
      {
        id: "first_song",
        title: "Music Lover",
        description: "Listen to your first song",
        icon: <Music size={24} />,
        tier: "bronze",
        progress: 1,
        maxProgress: 1,
        unlocked: true,
        category: "music",
      },
      {
        id: "music_session",
        title: "Melody Maker",
        description: "Listen to 25 songs",
        icon: <Music size={24} />,
        tier: "silver",
        progress: 18,
        maxProgress: 25,
        unlocked: false,
        category: "music",
      },
      {
        id: "audiophile",
        title: "Audiophile",
        description: "Listen to 100 songs",
        icon: <Star size={24} />,
        tier: "gold",
        progress: 18,
        maxProgress: 100,
        unlocked: false,
        category: "music",
      },

      // Mood & Exploration
      {
        id: "mood_explorer",
        title: "Mood Explorer",
        description: "Try 5 different moods",
        icon: <Target size={24} />,
        tier: "silver",
        progress: 3,
        maxProgress: 5,
        unlocked: false,
        category: "exploration",
      },
      {
        id: "mood_master",
        title: "Mood Master",
        description: "Experience all moods",
        icon: <Zap size={24} />,
        tier: "gold",
        progress: 3,
        maxProgress: 8,
        unlocked: false,
        category: "exploration",
      },

      // Streak Achievements
      {
        id: "streak_starter",
        title: "Dedication",
        description: "Maintain a 3-day login streak",
        icon: <Flame size={24} />,
        tier: "bronze",
        progress: user?.loginStreak || 0,
        maxProgress: 3,
        unlocked: (user?.loginStreak || 0) >= 3,
        category: "streaks",
      },
      {
        id: "streak_champion",
        title: "Streak Champion",
        description: "Maintain a 7-day login streak",
        icon: <Flame size={24} />,
        tier: "silver",
        progress: user?.loginStreak || 0,
        maxProgress: 7,
        unlocked: (user?.loginStreak || 0) >= 7,
        category: "streaks",
      },
      {
        id: "streak_legend",
        title: "Streak Legend",
        description: "Maintain a 30-day login streak",
        icon: <Crown size={24} />,
        tier: "gold",
        progress: user?.loginStreak || 0,
        maxProgress: 30,
        unlocked: (user?.loginStreak || 0) >= 30,
        category: "streaks",
      },

      // Community (Future)
      {
        id: "first_stream",
        title: "Social Butterfly",
        description: "Join your first live stream",
        icon: <Radio size={24} />,
        tier: "bronze",
        progress: 0,
        maxProgress: 1,
        unlocked: false,
        category: "community",
      },
      {
        id: "stream_regular",
        title: "Stream Regular",
        description: "Join 10 live streams",
        icon: <Users size={24} />,
        tier: "silver",
        progress: 0,
        maxProgress: 10,
        unlocked: false,
        category: "community",
      },

      // Weekly Challenge
      {
        id: "weekly_warrior",
        title: "Weekly Warrior",
        description: "Complete a weekly challenge",
        icon: <Calendar size={24} />,
        tier: "silver",
        progress: user?.weeklyActivities?.bonusClaimed ? 1 : 0,
        maxProgress: 1,
        unlocked: user?.weeklyActivities?.bonusClaimed || false,
        category: "exploration",
      },
    ]

    setAchievements(allAchievements)
  }

  const getProgressPercentage = (achievement: Achievement) => {
    return Math.min((achievement.progress / achievement.maxProgress) * 100, 100)
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-6 bg-[var(--accent)] rounded-full" />
        <h2 className="theme-text-foreground text-xl font-black uppercase tracking-tighter italic">
          Achievements
        </h2>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-[var(--glass-border)] to-transparent opacity-20" />
        <div className="flex items-center gap-2">
          <Trophy size={18} className="theme-text-accent" />
          <span className="theme-text-accent text-sm font-bold">
            {unlockedCount}/{achievements.length}
          </span>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`theme-card-variant-1-no-hover p-4 relative overflow-hidden transition-all ${
              achievement.unlocked ? "border-2 border-[var(--accent)]" : ""
            }`}
          >
            {/* Tier Badge */}
            <div className="absolute top-2 right-2">
              <div
                className={`w-2 h-2 rounded-full bg-gradient-to-br ${TIER_COLORS[achievement.tier]}`}
              />
            </div>

            {/* Icon & Title */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`p-2 rounded-lg ${
                  achievement.unlocked
                    ? "bg-[var(--accent)] text-[var(--background)]"
                    : "bg-[var(--secondary)] theme-text-accent"
                }`}
              >
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-sm font-bold ${
                    achievement.unlocked
                      ? "theme-text-accent"
                      : "theme-text-foreground"
                  }`}
                >
                  {achievement.title}
                </h3>
                <p className="theme-text-accent text-xs opacity-70 line-clamp-2">
                  {achievement.description}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="theme-text-accent text-xs font-medium">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
                <span className="theme-text-accent text-xs font-medium">
                  {Math.round(getProgressPercentage(achievement))}%
                </span>
              </div>
              <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(achievement)}%` }}
                />
              </div>
            </div>

            {/* Unlocked Badge */}
            {achievement.unlocked && (
              <div className="absolute top-2 left-2">
                <div className="bg-[var(--accent)] text-[var(--background)] text-[10px] font-black uppercase px-2 py-1 rounded">
                  Unlocked
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
