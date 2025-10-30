'use client'
import MoodMovies from '@/components/MoodMovies/MoodMovies'
import SelectTheme from '@/components/SelectTheme'
import ThemeToggler from '@/components/theme-toggler'
import React from 'react'

const testPage = () => {
    
    return (
        <div className="min-h-screen">  {/* Remove bg/text - body handles this */}
            <nav className="theme-navbar p-4 flex justify-between items-center">
                <span>
                    <h1 className="nav-title">  {/* Changed from text-accent text-xl font-bold */}
                        Test Page
                    </h1>
                </span>
                <div className="flex gap-4">
                    <span className="nav-link">Us</span>  {/* Simplified from text-accent hover:text-[var(--accent)] */}
                    <span className="nav-link">Them</span>  {/* Simplified from text-accent hover:text-foreground */}
                    <span className="nav-link">Me</span>    {/* Simplified from text-foreground hover:text-accent */}
                    <span className="nav-link">You</span>   {/* Simplified from text-foreground hover:text-accent */}
                    <span className="nav-link">Yes</span>   {/* Simplified from text-foreground hover:text-accent */}
                </div>
            </nav>
           
            <div className="p-8">
                <p className="text-lg mb-6">  {/* Remove text-foreground - inherits from body */}
                    Hello How are you?
                </p>
                
                <div  className="theme-card mb-6 cursor-pointer">  {/* Changed from bg-primary text-accent to themed card */}
                    <SelectTheme/>
                </div>
               
                <div>
                    <MoodMovies mood="happy" />
                </div>
            </div>
        </div>
    )
}

export default testPage