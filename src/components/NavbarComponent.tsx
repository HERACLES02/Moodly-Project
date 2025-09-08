"use client"

import "./navbar.css"
import "./WeeklyProgressCompact.css"
import ThemeSelector from "./ThemeSelector"
import AvatarSelector from "./AvatarSelector"
import DisplayUser from "./DisplayUser"
import ProfileDropdown from "./ProfileDropdown"
import NotesSection from "./NotesSection"
import MoodSelector from "./MoodSelector"
import PointsDisplay from "@/components/PointsDisplay"
import LoginBonus from "@/components/LoginBonus"
import WeeklyProgressCompact from "@/components/WeeklyProgressCompact"
import { useGetUser } from "@/hooks/useGetUser"
import { useState } from "react"

interface NavbarProps {
    onSelectMoodClick?: (mood: string) => void
}

export default function NavbarComponent({ onSelectMoodClick }: NavbarProps) {
    const { user, setUser } = useGetUser()
    const [moodSelected, setMoodSelected] = useState(false)
    const [noteSelected, setNoteSelected] = useState(false)
    const [themeSelected, setThemeSelected] = useState(false)
    const [avatarSelected, setAvatarSelected] = useState(false)

    /** Handle Note Selection */
    function handleAddNote() {
        console.log("Add Note Clicked")
        if (noteSelected) {
            setNoteSelected(false)
            setTimeout(() => setNoteSelected(true), 100)
        } else {
            setNoteSelected(true)
        }
        setMoodSelected(false)
        console.log(noteSelected)
    }

    /** Handle Mood Selection Toggle */
    function handleSelectMood() {
        console.log("Select Mood Clicked")
        setMoodSelected(prev => {
            const newState = !prev
            console.log("MoodSelected will be:", newState)
            return newState
        })
        setNoteSelected(false)
    }

    function handleCloseMood() {
        setMoodSelected(false)
    }

    /** Handle Theme Selection Toggle */
    function handleSelectTheme() {
        console.log("Select Theme Clicked")
        setThemeSelected(prev => {
            const newState = !prev
            console.log("ThemeSelected will be:", newState)
            return newState
        })
        setMoodSelected(false)
        setNoteSelected(false)
        setAvatarSelected(false)
    }

    function handleCloseTheme() {
        setThemeSelected(false)
    }

    /** Handle Avatar Selection Toggle */
    function handleSelectAvatar() {
        console.log("Select Avatar Clicked")
        setAvatarSelected(prev => {
            const newState = !prev
            console.log("AvatarSelected will be:", newState)
            return newState
        })
        setMoodSelected(false)
        setNoteSelected(false)
        setThemeSelected(false)
    }

    function handleCloseAvatar() {
        setAvatarSelected(false)
    }

    /** Handle Avatar Update */
    function handleAvatarSelection(avatarId: string) {
        console.log("Avatar selected in Navbar:", avatarId)
        if (user && setUser) {
            setUser({
                ...user,
                currentAvatarId: avatarId === "default" ? null : avatarId
            })
        }
        setAvatarSelected(false)
    }

    /** Handle Theme Update */
    function handleThemeSelection(theme: string) {
        console.log("Theme selected in Navbar:", theme)
        if (user && setUser) {
            setUser({
                ...user,
                currentTheme: theme
            })
        }
        setThemeSelected(false)
    }

    /** Handle Mood Update */
    function handleMoodSelection(mood: string) {
        console.log("Mood selected in Navbar:", mood)
        if (onSelectMoodClick && mood) {
            onSelectMoodClick(mood)
        }
        setMoodSelected(false)
    }

    function handleCloseNotes() {
        setNoteSelected(false)
    }

    return (
        <>
            {/* Daily Login Bonus */}
            <LoginBonus />

            {/* Navbar */}
            <nav className="navbar">
                {/* Logo */}
                <div className="moodlyImage">
                    <img
                        src="/images/moodly-logo.gif"
                        alt="Moodly Logo"
                        className="logo-gif"
                    />
                </div>

                {/* Weekly Progress */}
                <div className="navbar-center">
                    <WeeklyProgressCompact />
                </div>

                {/* User Section */}
                <div className="UserSection">
                    <div>
                        <PointsDisplay />
                    </div>
                    <span className="separator"></span>
                    <div>
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

            {/* Notes Section */}
            {noteSelected && <NotesSection onClose={handleCloseNotes} />}

            {/* Mood Selector */}
            {moodSelected && (
                <MoodSelector
                    onClose={handleCloseMood}
                    onMoodSelect={handleMoodSelection}
                />
            )}

            {/* Theme Selector */}
            {themeSelected && (
                <ThemeSelector
                    onClose={handleCloseTheme}
                    onThemeSelect={handleThemeSelection}
                />
            )}

            {/* Avatar Selector */}
            {avatarSelected && (
                <AvatarSelector
                    onClose={handleCloseAvatar}
                    onAvatarSelect={handleAvatarSelection}
                />
            )}
        </>
    )
}
