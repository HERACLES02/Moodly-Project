"use client"

import { useTheme } from "next-themes"
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react"

// ═══════════════════════════════════════════════════════════════════
// STEP 1: Define the User Data Structure
// ═══════════════════════════════════════════════════════════════════
// This interface defines what user information looks like
// It matches your database User model structure

export interface User {
  id: string
  email: string
  anonymousName: string
  mood?: string
  note?: string
  isAdmin: boolean
  isBanned?: boolean
  currentTheme?: string
  unlockedThemes?: string
  points?: number
  currentAvatarId?: string | null
  currentAvatar?: {
    imagePath: string
    name: string
  }
  unlockedAvatars?: {
    name?: string
    imagePath?: string
  }
  weeklyActvities: {
    id: string
    weekStart: Date
    moviesWatched: number
    songsListened: number
    bonusClaimed: Boolean
    createdAt: Date
    updatedAt: Date
  }
}

// ═══════════════════════════════════════════════════════════════════
// STEP 2: Define What the Context Provides
// ═══════════════════════════════════════════════════════════════════
// This interface defines all the tools and data that components can access

interface UserContextType {
  user: User | null // The actual user data
  setUser: (user: User | null) => void // Function to completely replace user data
  loading: boolean // Is data currently being fetched?
  refetchUser: () => Promise<void> // Function to reload user data from database
  updateUserPoints: (newPoints: number) => void // Quick update for points
  updateUserTheme: (newTheme: string) => void // Quick update for theme
  updateUserAvatar: (avatarId: string | null) => void // Quick update for avatar
  updateUserMood: (newMood: string) => void // Quick update for mood
  updateUserNote: (newNote: string) => void // Quick update for note
}

// ═══════════════════════════════════════════════════════════════════
// STEP 3: Create the Context
// ═══════════════════════════════════════════════════════════════════
// This creates an empty "warehouse" that will store user data
// Initially undefined because it hasn't been filled yet

const UserContext = createContext<UserContextType | undefined>(undefined)

// ═══════════════════════════════════════════════════════════════════
// STEP 4: Create the Provider Component
// ═══════════════════════════════════════════════════════════════════
// This component manages the user data and provides it to all child components
// Think of it as the "warehouse manager" that handles all user data operations

export function UserProvider({ children }: { children: ReactNode }) {
  // ─────────────────────────────────────────────────────────────────
  // Internal State
  // ─────────────────────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ─────────────────────────────────────────────────────────────────
  // Function to Fetch User Data from API
  // ─────────────────────────────────────────────────────────────────
  // This function calls your /api/getUser endpoint and updates the state
  // It runs once when the app loads, instead of in every component!

  const fetchUser = async () => {
    try {
      setLoading(true)
      console.log("🔄 UserContext: Fetching user data...")

      const response = await fetch("/api/getUser")

      if (response.ok) {
        const data = await response.json()
        console.log("✅ UserContext: User data loaded:", data)
        setUser(data)
      } else {
        console.log("⚠️ UserContext: User not logged in or API failed")
        setUser(null)
      }
    } catch (error) {
      console.error("❌ UserContext: Error fetching user:", error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Load User Data When Provider Mounts
  // ─────────────────────────────────────────────────────────────────
  // This useEffect runs ONCE when the app first loads
  // It fetches the user data and stores it in the context

  useEffect(() => {
    fetchUser()

    // ✅ OPTIMIZATION: Listen for point updates to refetch user
    // This prevents duplicate API calls from PointsDisplay
  }, [])

  // ─────────────────────────────────────────────────────────────────
  // Helper Function: Refetch User
  // ─────────────────────────────────────────────────────────────────
  // Components can call this when they need fresh data from the database
  // Example: After completing a purchase, call refetchUser() to get updated points

  const refetchUser = async () => {
    console.log("🔄 UserContext: Refetching user data...")
    await fetchUser()
  }

  // ─────────────────────────────────────────────────────────────────
  // Quick Update Functions
  // ─────────────────────────────────────────────────────────────────
  // These functions update the context data instantly WITHOUT calling the API
  // Use these for immediate UI updates after you've already updated the database
  //
  // IMPORTANT: These don't save to database! They just update the local context.
  // Always update the database first, then call these to update the UI.

  const updateUserPoints = (newPoints: number) => {
    if (user) {
      console.log(
        "💰 UserContext: Updating points from",
        user.points,
        "to",
        newPoints,
      )
      setUser({ ...user, points: newPoints })
    }
  }

  const updateUserTheme = (newTheme: string) => {
    console.log("here in theme")
    if (user) {
      console.log("🎨 UserContext: Updating theme to", newTheme)
      setUser({ ...user, currentTheme: newTheme })
    }
  }

  const updateUserAvatar = (avatarId: string | null) => {
    if (user) {
      console.log("👤 UserContext: Updating avatar to", avatarId)
      setUser({ ...user, currentAvatarId: avatarId })
    }
  }

  const updateUserMood = (newMood: string) => {
    if (user) {
      console.log("😊 UserContext: Updating mood to", newMood)
      setUser({ ...user, mood: newMood })
    }
  }

  const updateUserNote = (newNote: string) => {
    if (user) {
      console.log("📝 UserContext: Updating note")
      setUser({ ...user, note: newNote })
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // Package Everything to Provide
  // ─────────────────────────────────────────────────────────────────
  // This object contains all the data and functions that components can use

  const value: UserContextType = {
    user,
    setUser,
    loading,
    refetchUser,
    updateUserPoints,
    updateUserTheme,
    updateUserAvatar,
    updateUserMood,
    updateUserNote,
  }

  // ─────────────────────────────────────────────────────────────────
  // Provide the Context to All Children
  // ─────────────────────────────────────────────────────────────────
  // This makes the user data available to every component in the app

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

// ═══════════════════════════════════════════════════════════════════
// STEP 5: Create a Custom Hook to Use the Context
// ═══════════════════════════════════════════════════════════════════
// This is the "easy button" that components will use to access user data
// Usage in components: const { user, updateUserPoints } = useUser()

export function useUser() {
  const context = useContext(UserContext)

  // Error handling: If someone tries to use this hook outside the provider
  if (context === undefined) {
    throw new Error(
      "useUser must be used within a UserProvider. Did you wrap your app in <UserProvider>?",
    )
  }

  return context
}
