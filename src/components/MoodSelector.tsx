"use client"
import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { useUser } from "@/contexts/UserContext"

interface MoodSelectorProps {
  onClose?: () => void
  onMoodSelect: (mood: string) => void
}

export default function MoodSelector({
  onClose,
  onMoodSelect,
}: MoodSelectorProps) {
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const { user, setUser } = useUser()
  const { theme, setTheme } = useTheme()
  const { updateUserMood } = useUser()

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        handleClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const handleMoodSelect = async (moodName: string) => {
    setIsLoading(true)

    try {
      updateUserMood(moodName)
      handleClose()
    } catch (error) {
      console.error("Error recording mood:", error)
      alert("Error saving mood. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div ref={modalRef} className="theme-card-variant-2-no-hover shadow-none">
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
          Select Your Mood {user?.mood ? `(Current: ${user.mood})` : ""}
        </h3>

        <div className="space-y-2 ">
          {moodOptions.map((mood) => (
            <button
              key={mood.name}
              onClick={() => handleMoodSelect(mood.name)}
              disabled={isLoading}
              className={`flex relative items-center w-full p-3 hover:bg-[var(--secondary)] hover:cursor-pointer rounded-2xl transition-colors`}
            >
              <span className={`w-4 h-4 rounded-full mr-3 ${mood.color}`} />
              <span className="text-[var(--foreground)] font-bold text-">
                {mood.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleClose}
          className="relative mt-6 px-4 py-2 text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
