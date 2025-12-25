"use client"

import { useState, useEffect } from "react"
import { useUser } from "@/contexts/UserContext"
import { useTheme } from "next-themes"
import "./FirstMoodSelection.css"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { Spinner } from "@/components/ui/spinner"
import Image from "next/image"
import { LoaderFive } from "@/components/ui/loader"

export default function FirstMoodSelection() {
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [showTitle, setShowTitle] = useState(false)
  const [showMoods, setShowMoods] = useState(false)
  const { user, updateUserMood } = useUser()
  const [isMounted, setIsMounted] = useState(false)
  const [fadeTitle, setFadeTitle] = useState(false)

  const router = useRouter()

  // Mood options with placeholder images (4:3 aspect ratio)
  const moodOptions = [
    {
      name: "Happy",
      className: "happy",
      // Placeholder image - replace with actual mood images
      image: "https://placehold.co/800x600/fef08a/1e293b?text=Happy",
    },
    {
      name: "Calm",
      className: "calm",
      image: "https://placehold.co/800x600/bfdbfe/1e293b?text=Calm",
    },
    {
      name: "Energetic",
      className: "energetic",
      image: "https://placehold.co/800x600/fca5a5/1e293b?text=Energetic",
    },
    {
      name: "Restless",
      className: "restless",
      image: "https://placehold.co/800x600/d8b4fe/1e293b?text=Anxious",
    },
    {
      name: "Sad",
      className: "sad",
      image: "https://placehold.co/800x600/cbd5e1/1e293b?text=Sad",
    },
    {
      name: "Excited",
      className: "excited",
      image: "https://placehold.co/800x600/fdba74/1e293b?text=Excited",
    },
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
    setFadeTitle(true)
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
          <h1
            className={`first-mood-title flex ${fadeTitle ? "fade-out-force" : ""}`}
            style={{
              transition: "opacity 1s ease-in-out",
              opacity: fadeTitle ? 0 : 1,
              visibility: fadeTitle && !isLoading ? "hidden" : "visible",
            }}
          >
            Welcome to
            <div className="moodlyImage mt-3">
              <img
                src="/images/moodly-logo.gif"
                alt="Moodly Logo"
                className="logo-gif"
              />
            </div>
          </h1>
          {/* Animated subtitle with dots */}

          <p className="first-mood-subtitle italic font-bold">
            How are you feeling tonight
            <span className="animated-dots">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </p>

          {isLoading ? (
            <LoaderFive text="Curating for you" />
          ) : (
            <div className={`mood-options-grid ${showMoods ? "show" : ""}`}>
              {moodOptions.map((mood, index) => (
                <button
                  key={mood.name}
                  onClick={() => handleMoodSelect(mood.name)}
                  disabled={isLoading}
                  className={`theme-btn hover:scale-105 transition-transform duration-200 hover:bg-${mood.className} `}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                  }}
                >
                  {mood.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
