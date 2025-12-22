"use client"

import { Suspense, lazy, useEffect, useState } from "react"
import { useUser } from "@/contexts/UserContext"
import { useSearchParams, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Activity,
  Folder,
  Trophy,
  TrendingUp,
  Flame,
  Star,
} from "lucide-react"
import "./userpage-revamped.css"

// Lazy load tab components for optimization
const OverviewTab = lazy(() => import("@/components/UserPage/Tabs/OverviewTab"))
const ActivityTab = lazy(() => import("@/components/UserPage/Tabs/ActivityTab"))
const CollectionTab = lazy(() => import("@/components/UserPage/Tabs/CollectionTab"))
const AchievementsTab = lazy(() => import("@/components/UserPage/Tabs/AchievementsTab"))

// Loading skeleton for tabs
function TabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-[var(--glass-bg)] rounded-lg" />
      <div className="h-48 bg-[var(--glass-bg)] rounded-lg" />
      <div className="h-64 bg-[var(--glass-bg)] rounded-lg" />
    </div>
  )
}

interface UserPageRevampedProps {
  streak: number | null
}

type TabType = "overview" | "activity" | "collection" | "achievements"

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "collection", label: "Collection", icon: Folder },
  { id: "achievements", label: "Achievements", icon: Trophy },
] as const

export default function UserPageRevamped({ streak }: UserPageRevampedProps) {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<TabType>("overview")

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab") as TabType
    if (tab && TABS.some((t) => t.id === tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    router.push(`/userpage?tab=${tab}`, { scroll: false })
  }

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
    <div className="userpage-revamped">
      {/* Hero Profile Section */}
      <section className="profile-hero">
        <div className="profile-hero-content">
          {/* Avatar */}
          {user.currentAvatar && (
            <div className="profile-avatar">
              <img
                src={user.currentAvatar.imagePath}
                alt={user.anonymousName}
                className="avatar-image"
              />
              <div className="avatar-glow" />
            </div>
          )}

          {/* Profile Info */}
          <div className="profile-info">
            <h1 className="profile-name">{user.anonymousName}</h1>
            <div className="profile-stats">
              <div className="stat-item">
                <Star size={18} className="stat-icon" />
                <span className="stat-value">{user.points || 0}</span>
                <span className="stat-label">Points</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <Flame size={18} className="stat-icon" />
                <span className="stat-value">{streak ?? "-"}</span>
                <span className="stat-label">Day Streak</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <TrendingUp size={18} className="stat-icon" />
                <span className="stat-value">
                  {user.weeklyActvities?.completedCount || 0}/
                  {user.weeklyActvities?.targetCount || 0}
                </span>
                <span className="stat-label">Weekly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="userpage-main">
        {/* Vertical Tab Navigation */}
        <aside className="tab-sidebar">
          <nav className="tab-nav">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as TabType)}
                  className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
                >
                  <Icon size={20} className="tab-icon" />
                  <span className="tab-label">{tab.label}</span>
                  {activeTab === tab.id && <div className="tab-indicator" />}
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Tab Content Area */}
        <main className="tab-content">
          <Suspense fallback={<TabSkeleton />}>
            {activeTab === "overview" && <OverviewTab user={user} streak={streak} />}
            {activeTab === "activity" && <ActivityTab />}
            {activeTab === "collection" && <CollectionTab />}
            {activeTab === "achievements" && <AchievementsTab />}
          </Suspense>
        </main>
      </div>
    </div>
  )
}