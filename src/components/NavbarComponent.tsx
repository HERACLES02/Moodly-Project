"use client"
import "./navbar.css"

import { useGetUser } from "@/hooks/useGetUser"
import ProfileDropdown from "./ProfileDropdown"
import { useState, useEffect } from "react"
import NotesSection from "./NotesSection"
import MoodSelector from "./MoodSelector"

interface NavbarProps {
  onSelectMoodClick?: (mood: string) => void
}

export default function NavbarComponent({ onSelectMoodClick }: NavbarProps) {
    
    const { user, setUser } = useGetUser() 
    const [moodSelected, setMoodSelected] = useState(false) // toggle for showing MoodSelector
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
        
        // Use functional update for correct toggle
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
            <nav className="navbar">
                <div className="moodlyImage">Moodly</div>

                <div className="UserSection">
                    <div className="PointsSection">
                        <span>⭐</span>
                        <span>Your Points</span>
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
                onMoodSelect={handleMoodSelection
                }
            />
            )}
            
        </>
    )
}
