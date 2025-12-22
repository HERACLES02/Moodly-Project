"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { useTheme } from "next-themes"
import "./FirstMoodSelection.css"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Spinner } from "@/components/ui/spinner"

export default function FirstMoodSelection() {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showMoods, setShowMoods] = useState(false)
  const { user, updateUserMood } = useUser()
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()

  // Mood options with CSS class names for styling
  const moodOptions = [
    { name: "Happy", className: "happy" },
    { name: "Calm", className: "calm" },
    { name: "Energetic", className: "energetic" },
    { name: "Anxious", className: "anxious" },
    { name: "Sad", className: "sad" },
    { name: "Excited", className: "excited" },
    { name: "Tired", className: "tired" },
    { name: "Grateful", className: "grateful" },
  ]

  useEffect(() => {
    // Always start with default theme (light pastel)
    setTheme("default")
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Animate content entrance
    const titleTimer = setTimeout(() => {
      setShowTitle(true)
    }, 300)

    const moodsTimer = setTimeout(() => {
      setShowMoods(true)
    }, 1200)

    return () => {
      clearTimeout(titleTimer)
      clearTimeout(moodsTimer)
    }
  }, [])

  if (!isMounted) return null

  const handleAutoSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  if (user?.isBanned) {
    return (
      <div
        className="flex items-center justify-center h-screen w-screen scale-200 cursor-pointer"
        onClick={handleAutoSignOut}
      >
        <div className="theme-btn inline-flex font-black items-center justify-center">
          <button>You are banned. Click to sign out.</button>
        </div>
      </div>
    )
  }

  const handleMoodSelect = async (moodName: string) => {
    // Change theme (triggers smooth background transition via CSS)
    setTheme(moodName.toLowerCase())

    setIsLoading(true)

    try {
      const response = await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodName }),
      })

      const data = await response.json()

      if (response.ok) {
        updateUserMood(moodName)
        console.log("✅ First mood saved and updated in context:", moodName)

        // Navigate to dashboard after theme transition
        router.push("/dashboard")
      } else {
        console.error("Failed to save mood:", data.error)
        alert(data.error || "Failed to save mood. Please try again.")
      }
    } catch (error) {
      console.error("Error saving first mood:", error)
      alert("Error saving mood. Please try again.")
    } finally {
      // Keep loading state to show transition
    }
  }

  return (
    <div className="first-mood-background">
      <div className="first-mood-container">
        <div className={`first-mood-content ${showTitle ? "show" : ""}`}>
          <h1 className="first-mood-title">Welcome to Moodly! 🎭</h1>
          <p className="first-mood-subtitle">How are you feeling today?</p>

          {isLoading ? (
            <div className="size-2">
              <Spinner />
            </div>
          ) : (
            <div className={`mood-options-grid ${showMoods ? "show" : ""}`}>
              {moodOptions.map((mood, index) => (
                <button
                  key={mood.name}
                  onClick={() => handleMoodSelect(mood.name)}
                  disabled={isLoading}
                  className={`mood-option-button ${mood.className}`}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  <span className="mood-name">{mood.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}