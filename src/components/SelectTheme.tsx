"use client"
import { useTheme } from "next-themes"
import React, { useEffect, useState } from 'react'

const SelectTheme = () => {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    
    const handleClick = (appliedTheme: string) => {
        setTheme(appliedTheme)
    }
    
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <button className="theme-btn">Loading...</button>
    }
    
    return (
        <div className="btn-group-centered">
            <button 
                className="theme-btn" 
                onClick={() => handleClick("default")}
            >
                Default
            </button>
            <button 
                className="theme-btn" 
                onClick={() => handleClick("vangogh")}
            >
                Van Gogh
            </button>
            <button 
                className="theme-btn" 
                onClick={() => handleClick("happy")}
            >
                Happy
            </button>
            <button 
                className="theme-btn" 
                onClick={() => handleClick("sad")}
            >
                Sad
            </button>
            <button 
                className="theme-btn" 
                onClick={() => handleClick("cat")}
            >
                Cat
            </button>
        </div>
    )
}

export default SelectTheme