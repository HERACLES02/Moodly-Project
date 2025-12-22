// src/components/UserPage/Tabs/OverviewTab.tsx
"use client"

import { Calendar, TrendingUp, Award, Zap } from "lucide-react"

interface OverviewTabProps {
  user: any
  streak: number | null
}

export default function OverviewTab({ user, streak }: OverviewTabProps) {
  const weeklyProgress = user?.weeklyActivities
    ? Math.round(
        (user.weeklyActivities.completedCount /
          user.weeklyActivities.targetCount) *
          100
      )
    : 0

  const weeklyTarget = user?.weeklyActivities?.targetCount || 7
  const weeklyCompleted = user?.weeklyActivities?.completedCount || 0
  const canClaimBonus =
    weeklyCompleted >= weeklyTarget && !user?.weeklyActivities?.bonusClaimed

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h2 className="text-3xl font-black tracking-tight theme-text-foreground mb-2">
          Overview
        </h2>
        <p className="theme-text-accent text-sm opacity-70">
          Your activity summary and progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Points Card */}
        <div className="theme-card-variant-1-no-hover p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Award size={24} className="theme-text-accent" />
              <span className="text-xs theme-text-accent uppercase tracking-widest font-bold opacity-70">
                Points
              </span>
            </div>
            <div className="text-4xl font-black theme-text-foreground mb-1">
              {user?.points || 0}
            </div>
            <p className="text-xs theme-text-accent opacity-70">
              Total earned points
            </p>
          </div>
        </div>

        {/* Login Streak Card */}
        <div className="theme-card-variant-1-no-hover p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Zap size={24} className="theme-text-accent" />
              <span className="text-xs theme-text-accent uppercase tracking-widest font-bold opacity-70">
                Streak
              </span>
            </div>
            <div className="text-4xl font-black theme-text-foreground mb-1">
              {streak ?? "-"}
            </div>
            <p className="text-xs theme-text-accent opacity-70">
              Consecutive days
            </p>
          </div>
        </div>

        {/* Weekly Progress Card */}
        <div className="theme-card-variant-1-no-hover p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Calendar size={24} className="theme-text-accent" />
              <span className="text-xs theme-text-accent uppercase tracking-widest font-bold opacity-70">
                Weekly
              </span>
            </div>
            <div className="text-4xl font-black theme-text-foreground mb-1">
              {weeklyCompleted}/{weeklyTarget}
            </div>
            <p className="text-xs theme-text-accent opacity-70">
              Activities completed
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Challenge Section */}
      <div className="theme-card-variant-1-no-hover p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-black theme-text-foreground mb-1">
              Weekly Challenge
            </h3>
            <p className="text-sm theme-text-accent opacity-70">
              Complete {weeklyTarget} activities this week
            </p>
          </div>
          <TrendingUp size={24} className="theme-text-accent" />
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold theme-text-foreground">
              Progress
            </span>
            <span className="text-sm font-bold theme-text-accent">
              {weeklyProgress}%
            </span>
          </div>
          <div className="h-3 bg-[var(--secondary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
              style={{ width: `${weeklyProgress}%` }}
            />
          </div>

          {/* Activities Grid */}
          <div className="grid grid-cols-7 gap-2 pt-4">
            {Array.from({ length: weeklyTarget }).map((_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  i < weeklyCompleted
                    ? "bg-[var(--accent)] text-[var(--background)]"
                    : "bg-[var(--secondary)] theme-text-accent opacity-30"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Bonus Claim Button */}
          {canClaimBonus && (
            <div className="pt-4">
              <button className="theme-button-variant-2 w-full">
                Claim Bonus Reward 🎉
              </button>
            </div>
          )}

          {user?.weeklyActivities?.bonusClaimed && (
            <div className="pt-4 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 rounded-full">
                <span className="text-sm font-bold theme-text-accent">
                  ✨ Bonus Claimed!
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="theme-card-variant-1-no-hover p-4 text-center">
          <div className="text-2xl font-black theme-text-accent mb-1">-</div>
          <div className="text-xs theme-text-accent opacity-70 uppercase tracking-widest">
            Movies
          </div>
        </div>
        <div className="theme-card-variant-1-no-hover p-4 text-center">
          <div className="text-2xl font-black theme-text-accent mb-1">-</div>
          <div className="text-xs theme-text-accent opacity-70 uppercase tracking-widest">
            Songs
          </div>
        </div>
        <div className="theme-card-variant-1-no-hover p-4 text-center">
          <div className="text-2xl font-black theme-text-accent mb-1">-</div>
          <div className="text-xs theme-text-accent opacity-70 uppercase tracking-widest">
            Playlists
          </div>
        </div>
        <div className="theme-card-variant-1-no-hover p-4 text-center">
          <div className="text-2xl font-black theme-text-accent mb-1">-</div>
          <div className="text-xs theme-text-accent opacity-70 uppercase tracking-widest">
            Achievements
          </div>
        </div>
      </div>
    </div>
  )
}