// src/app/userpage/page.tsx
"use client"

import { Suspense, lazy } from "react"
import { useUser } from "@/contexts/UserContext"
import { useEffect } from "react"
import "./userpage.css"

// ✅ OPTIMIZATION: Lazy load heavy components
const RecentActivity = lazy(
  () => import("@/components/UserPage/RecentActivity"),
)
const TopRatedMovies = lazy(
  () => import("@/components/UserPage/TopRatedMovies"),
)
const PlaylistsSection = lazy(
  () => import("@/components/UserPage/PlaylistsSection"),
)
const AchievementsSection = lazy(
  () => import("@/components/UserPage/AchievementsSection"),
)
const ActivityLog = lazy(() => import("@/components/UserPage/ActivityLog"))

// Loading skeleton for sections
function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-2 h-8 bg-[var(--accent)] rounded-full animate-pulse" />
        <div className="h-6 w-48 bg-[var(--glass-bg)] rounded animate-pulse" />
      </div>
      <div className="h-48 bg-[var(--glass-bg)] rounded-lg animate-pulse" />
    </div>
  )
}

export default function UserPage() {
  const { user } = useUser()

  if (!user) {
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

  return (
    <div className="userpage-container min-h-screen">
      <main className="userpage-main">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
          {/* Hero Section */}
          <section className="relative pt-8 pb-12">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[var(--accent)] opacity-5 blur-[100px] pointer-events-none" />

            <div className="relative z-10 text-center space-y-4">
              {/* User Avatar */}
              {user.currentAvatar && (
                <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-[var(--accent)] shadow-2xl">
                  <img
                    src={user.currentAvatar.imagePath}
                    alt={user.anonymousName}
                    className="w-24 h-24 object-cover"
                  />
                </div>
              )}

              {/* Welcome Text */}
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                  <span className="theme-text-accent">
                    {user.anonymousName}
                  </span>
                </h1>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-center gap-6 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-black theme-text-accent">
                    {user.points || 0}
                  </div>
                  <div className="text-xs theme-text-accent opacity-70 uppercase tracking-wider">
                    Points
                  </div>
                </div>
                <div className="w-px h-8 bg-[var(--glass-border)]" />
                <div className="text-center">
                  <div className="text-2xl font-black theme-text-accent">
                    {user.loginStreak || 0}
                  </div>
                  <div className="text-xs theme-text-accent opacity-70 uppercase tracking-wider">
                    Day Streak
                  </div>
                </div>

                <div className="text-center"></div>
              </div>
            </div>
          </section>

          {/* Recent Activity Section */}
          <section>
            <Suspense fallback={<SectionSkeleton />}>
              <RecentActivity />
            </Suspense>
          </section>

          {/* Top Rated Movies Section */}
          <section>
            <Suspense fallback={<SectionSkeleton />}>
              <TopRatedMovies />
            </Suspense>
          </section>

          {/* Playlists Section */}
          <section>
            <Suspense fallback={<SectionSkeleton />}>
              <PlaylistsSection />
            </Suspense>
          </section>

          {/* Achievements Section */}
          <section>
            <Suspense fallback={<SectionSkeleton />}>
              <AchievementsSection />
            </Suspense>
          </section>

          {/* Activity Log Section */}
          <section>
            <Suspense fallback={<SectionSkeleton />}>
              <ActivityLog />
            </Suspense>
          </section>
        </div>
      </main>
    </div>
  )
}
