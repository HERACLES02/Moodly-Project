"use client"
import "./navbar.css"

import { useGetUser } from "@/hooks/useGetUser"
import ProfileDropdown from "./ProfileDropdown"
import { useState, useEffect } from "react"
import NotesSection from "./NotesSection"
import MoodSelector from "./MoodSelector"




export default function NavbarComponent() {
    
    const { user, setUser } = useGetUser() 
    const [moodSelected, setMoodSelected] = useState(false)
    const [noteSelected, setNoteSelected] = useState(false)
    




    function handleAddNote(){
        console.log("Add Note Clicked")
        if (noteSelected){    
        setNoteSelected(false)
            setTimeout(() => 
                setNoteSelected(true), 100)
        } else {
            setNoteSelected(true)
        }

            setMoodSelected(false)
        console.log(noteSelected)

    }
    
    function handleSelectMood(){
        console.log("Select Mood Clicked")
            setMoodSelected(!moodSelected)
            setNoteSelected(false)
        console.log(moodSelected)
        
        
    }

    function handleCloseMood() {
        setMoodSelected(false)
    }

    function handleCloseNotes() {
        setNoteSelected(false)
    }    


    return (
        <>
        <nav className="navbar">
            
            <div className="moodlyImage">
                Moodly
            </div>


            <div className="UserSection">

            <div className="PointsSection">
                <span>
                    ⭐
                </span>
                <span>
                    Your Points
                </span>
                
            </div>
            <span className="separator"></span>
            <div>
                <ProfileDropdown
                userName={user?.anonymousName}
                isAdmin = {user?.isAdmin}
              onAddNote = {handleAddNote}
              onSelectMood= {handleSelectMood}
                />    
            </div>

            </div>


        </nav>
        


        <div>
            {noteSelected && (
                        <NotesSection onClose={handleCloseNotes} />
            )
            }
        </div>
            
            <div>
            {moodSelected && (
                        <MoodSelector onClose={handleCloseMood} />
            )
            }
        </div>

        </>
    )

}