"use client"
import "./navbar.css"
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
        </>
    )
}