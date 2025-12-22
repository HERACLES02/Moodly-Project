// src/components/UserPage/Tabs/AchievementsTab.tsx
"use client"

import { useEffect, useState } from "react"
import {
  Trophy,
  Film,
  Music,
  Target,
  Zap,
  Users,
  Star,
  Flame,
  Crown,
  Calendar,
  Radio,
} from "lucide-react"
import { useUser } from "@/contexts/UserContext"

type AchievementTier = "bronze" | "silver" | "gold" | "platinum"
type AchievementCategory = "movies" | "music" | "community" | "streaks" | "exploration"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  tier: AchievementTier
  progress: number
  maxProgress: number
  unlocked: boolean
  category: AchievementCategory
}

const TIER_COLORS = {
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  platinum: "from-cyan-400 to-blue-600",
}

const TIER_LABELS = {
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
}

export default function AchievementsTab() {
  const { user } = useUser()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filterCategory, setFilterCategory] = useState<AchievementCategory | "all">("all")

  useEffect(() => {
    if (user) {
      generateAchievements()
    }
  }, [user])

  const generateAchievements = () => {
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

  const filteredAchievements = achievements.filter(
    (a) => filterCategory === "all" || a.category === filterCategory
  )

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalCount = achievements.length

  return (
    <div className="space-y-8">
      {/* Page Title & Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight theme-text-foreground mb-2">
            Achievements
          </h2>
          <p className="theme-text-accent text-sm opacity-70">
            Track your progress and unlock rewards
          </p>
        </div>
        <div className="theme-card-variant-1-no-hover px-4 py-2">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="theme-text-accent" />
            <span className="text-lg font-black theme-text-foreground">
              {unlockedCount}/{totalCount}
            </span>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: "All", icon: Trophy },
          { id: "movies", label: "Movies", icon: Film },
          { id: "music", label: "Music", icon: Music },
          { id: "streaks", label: "Streaks", icon: Flame },
          { id: "exploration", label: "Exploration", icon: Target },
          { id: "community", label: "Community", icon: Users },
        ].map((cat) => {
          const Icon = cat.icon
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                filterCategory === cat.id
                  ? "bg-[var(--accent)] text-[var(--background)]"
                  : "theme-card-variant-1-no-hover theme-text-accent hover:bg-[var(--glass-bg)]"
              }`}
            >
              <Icon size={16} />
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`theme-card-variant-1-no-hover p-5 relative overflow-hidden transition-all ${
              achievement.unlocked
                ? "!border-2 !border-[var(--accent)]"
                : ""
            }`}
          >
            {/* Tier Badge */}
            <div className="absolute top-3 right-3">
              <div
                className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-gradient-to-br ${TIER_COLORS[achievement.tier]} text-white`}
              >
                {TIER_LABELS[achievement.tier]}
              </div>
            </div>

            {/* Icon & Title */}
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`p-3 rounded-xl transition-all ${
                  achievement.unlocked
                    ? "bg-[var(--accent)] text-[var(--background)] shadow-lg"
                    : "bg-[var(--secondary)] theme-text-accent"
                }`}
              >
                {achievement.icon}
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3
                  className={`text-base font-black mb-1 ${
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
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="theme-text-accent text-xs font-bold">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
                <span className="theme-text-accent text-xs font-bold">
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
              <div className="absolute top-3 left-3">
                <div className="bg-[var(--accent)] text-[var(--background)] text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">
                  ✓ Unlocked
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <div className="theme-card-variant-1-no-hover p-12 text-center">
          <Trophy size={48} className="theme-text-accent opacity-30 mx-auto mb-4" />
          <p className="theme-text-accent text-sm">
            No achievements in this category yet
          </p>
        </div>
      )}
    </div>
  )
}