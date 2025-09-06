"use client"
import "./navbar.css"
import ThemeSelector from "./ThemeSelector"
import { useGetUser } from "@/hooks/useGetUser"
import ProfileDropdown from "./ProfileDropdown"
import { useState, useEffect } from "react"
import NotesSection from "./NotesSection"
import MoodSelector from "./MoodSelector"
import PointsDisplay from "@/components/PointsDisplay"
import LoginBonus from "@/components/LoginBonus"
import WeeklyProgressCompact from "@/components/WeeklyProgressCompact"
import "./WeeklyProgressCompact.css"

interface NavbarProps {
    onSelectMoodClick?: (mood: string) => void
}

export default function NavbarComponent({ onSelectMoodClick }: NavbarProps) {
    const { user, setUser } = useGetUser()
    const [moodSelected, setMoodSelected] = useState(false)
    const [noteSelected, setNoteSelected] = useState(false)
    const [themeSelected, setThemeSelected] = useState(false)

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

    // Add these functions to your NavbarComponent.tsx

function handleSelectTheme() {
    console.log("Select Theme Clicked")
    setThemeSelected(prev => {
        const newState = !prev
        console.log("ThemeSelected will be:", newState)
        return newState
    })
    setMoodSelected(false)
    setNoteSelected(false)
}

function handleCloseTheme() {
    setThemeSelected(false)
}

function handleThemeSelection(theme: string) {
    console.log("Theme selected in Navbar:", theme)
    
    // Update the user context if you're using it
    if (user && setUser) {
        setUser({
            ...user,
            currentTheme: theme
        })
    }
    
    setThemeSelected(false)
}

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
            <LoginBonus />
            
            <nav className="navbar">
                <div className="moodlyImage">Moodly</div>
                
                <div className="navbar-center">
                    <WeeklyProgressCompact />
                </div>
                
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
                        />
                    </div>
                </div>
            </nav>
            
            {noteSelected && <NotesSection onClose={handleCloseNotes} />}
            {moodSelected && (
                <MoodSelector
                    onClose={handleCloseMood}
                    onMoodSelect={handleMoodSelection}
                />
            )}

{themeSelected && (
    <ThemeSelector
        onClose={handleCloseTheme}
        onThemeSelect={handleThemeSelection}
    />
)}
        </>
    )
}