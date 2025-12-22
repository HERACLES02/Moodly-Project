"use client"

import "./navbar.css"
import "./WeeklyProgressCompact.css"
import ThemeSelector from "./ThemeSelector"
import AvatarSelector from "./AvatarSelector"
import ProfileDropdown from "./ProfileDropdown"
import NotesSection from "./NotesSection"
import MoodSelector from "./MoodSelector"
import PointsDisplay from "@/components/PointsDisplay"
import LoginBonus from "@/components/LoginBonus"
import WeeklyProgressCompact from "@/components/WeeklyProgressCompact"
import { useUser } from "@/contexts/UserContext"
import { useEffect, useState } from "react"

import { setUserMood, setUserTheme } from "@/lib/userActions"
import { useTheme } from "next-themes"
import { useSearchStore } from "@/lib/store"
import SearchBar from "./SearchBar"
import { useRouter } from "next/navigation"

export default function NavbarComponent({
  isLoggedIn,
}: {
  isLoggedIn?: boolean
}) {
  const router = useRouter()
  const { user, updateUserAvatar, updateUserTheme, updateUserMood } = useUser()
  const { theme, setTheme } = useTheme()
  const [moodSelected, setMoodSelected] = useState(false)
  const [noteSelected, setNoteSelected] = useState(false)
  const [themeSelected, setThemeSelected] = useState(false)
  const [avatarSelected, setAvatarSelected] = useState(false)
  const { setSearchQuery, setSearchMode, setSubmittedMode, setSubmittedQuery } =
    useSearchStore()

  useEffect(() => {
    async function setMood(moodName: string) {
      try {
        await setUserMood(moodName)
      } catch (error) {
        throw error
      }
    }

    if (user?.mood) {
      setMood(user.mood)

      if (user?.currentTheme != "default") {
        setTheme(user?.currentTheme?.toLowerCase() || "")
      } else {
        setTheme(user.mood.toLowerCase())
      }
    }
  }, [user?.mood])
  useEffect(() => {
    async function themeSet(themeName: string) {
      try {
        await setUserTheme(themeName)
      } catch (error) {
        throw error
      }
    }
    if (theme) {
      themeSet(theme)
    }
  }, [theme])

  if (!user || !user.mood) {
    return
  }

  if (!user || !user.mood) {
    return
  }

  function handleAddNote() {
    if (noteSelected) {
      setNoteSelected(false)
      setTimeout(() => setNoteSelected(true), 100)
    } else {
      setNoteSelected(true)
    }
    setMoodSelected(false)
  }

  function handleSelectMood() {
    setMoodSelected((prev) => !prev)
    setNoteSelected(false)
  }

  function handleSelectTheme() {
    setThemeSelected((prev) => !prev)
    setMoodSelected(false)
    setNoteSelected(false)
    setAvatarSelected(false)
  }

  function handleSelectAvatar() {
    setAvatarSelected((prev) => !prev)
    setMoodSelected(false)
    setNoteSelected(false)
    setThemeSelected(false)
  }

  function handleAvatarSelection(avatarId: string) {
    updateUserAvatar(avatarId === "default" ? null : avatarId)
    setAvatarSelected(false)
  }

  function handleThemeSelection(theme: string) {
    updateUserTheme(theme)
    setThemeSelected(false)
  }

  function handleMoodSelection(mood: string) {
    setMoodSelected(false)
    updateUserMood(mood)
  }

  return (
    <>
      <LoginBonus />

      <nav className="theme-navbar">
        {/* Logo - Kept Original */}
        <div
          className="moodlyImage"
          onClick={() => {
            router.push(`/dashboard`)
          }}
        >
          <img
            src="/images/moodly-logo.gif"
            alt="Moodly Logo"
            className="logo-gif"
          />
        </div>

        {/* SearchBar - Styled to match dashboard */}
        <section className="hidden md:block w-full max-w-xl lg:max-w-3xl px-4">
          <SearchBar
            placeholder="What's on your mood today?"
            onModeChange={(m) => setSearchMode(m)}
            onSubmit={(val, m) => {
              const trimmed = val.trim()
              setSearchMode(m)
              setSearchQuery(trimmed)
              setSubmittedMode(m)
              setSubmittedQuery(trimmed)
            }}
          />
        </section>

        {/* User Section - WeeklyProgressCompact moved here for right alignment */}
        <div className="UserSection h-full px-5 flex justify-center items-center gap-6">
          <div className="hidden sm:block">
            <WeeklyProgressCompact />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <PointsDisplay />
            </div>
          </div>

          <div className="h-full w-full ">
            <ProfileDropdown
              userName={user?.anonymousName}
              isAdmin={user?.isAdmin}
              onAddNote={handleAddNote}
              onSelectMood={handleSelectMood}
              onSelectTheme={handleSelectTheme}
              onSelectAvatar={handleSelectAvatar}
            />
          </div>
        </div>
      </nav>

      {noteSelected && <NotesSection onClose={() => setNoteSelected(false)} />}
      {moodSelected && (
        <MoodSelector
          onClose={() => setMoodSelected(false)}
          onMoodSelect={handleMoodSelection}
        />
      )}
      {themeSelected && (
        <ThemeSelector
          onClose={() => setThemeSelected(false)}
          onThemeSelect={handleThemeSelection}
        />
      )}
      {avatarSelected && (
        <AvatarSelector
          onClose={() => setAvatarSelected(false)}
          onAvatarSelect={handleAvatarSelection}
        />
      )}
    </>
  )
}
