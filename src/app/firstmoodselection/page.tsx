"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext" // ← CHANGED: Import from context
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

  // This array contains all the mood options
  const moodOptions = [
    { name: "Happy", color: "bg-yellow-300" },
    { name: "Calm", color: "bg-blue-300" },
    { name: "Energetic", color: "bg-red-300" },
    { name: "Anxious", color: "bg-purple-300" },
    { name: "Sad", color: "bg-gray-400" },
    { name: "Excited", color: "bg-orange-300" },
    { name: "Tired", color: "bg-indigo-300" },
    { name: "Grateful", color: "bg-green-300" },
  ]

  // useEffect(() => {
  //   if (user?.mood != "default") {
  //     router.push("/dashboard")
  //   }
  // }, [])
  useEffect(() => {
    setTheme("default")
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // First, show the title with animation
    const titleTimer = setTimeout(() => {
      setShowTitle(true)
    }, 300)

    // Then, show the mood buttons
    const moodsTimer = setTimeout(() => {
      setShowMoods(true)
    }, 1200)

    // Cleanup function to clear timers if component unmounts
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

  // ══════════════════════════════════════════════════════════════════
  // This function handles when user clicks a mood button
  // ══════════════════════════════════════════════════════════════════
  const handleMoodSelect = async (moodName: string) => {
    setTheme(moodName.toLowerCase())

    setIsLoading(true)

    try {
      // Send the mood to the API

      const response = await fetch("/api/moods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moodName }),
      })

      const data = await response.json()

      if (response.ok) {
        updateUserMood(moodName)
        console.log("✅ First mood saved and updated in context:", moodName)

        router.push("/dashboard")
      } else {
        console.error("Failed to save mood:", data.error)
        alert(data.error || "Failed to save mood. Please try again.")
      }
    } catch (error) {
      console.error("Error saving first mood:", error)
      alert("Error saving mood. Please try again.")
    } finally {
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
                  className={`mood-option-button ${mood.color}`}
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
