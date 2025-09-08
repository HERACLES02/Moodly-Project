'use client'
import { useThemeToggler } from '@/hooks/use-theme-toggler'
import { useTheme } from 'next-themes'
import React, { useEffect, useState } from 'react'

const ThemeToggler = () => {

    const { theme, setTheme } = useTheme()
    const [ mounted, setMounted ] = useState(false)

    const handleClick = () => {
       if (theme == "vangogh") setTheme("cat")
       if (theme == "cat") setTheme("default")
       if (theme == "default") setTheme("happy")
       if (theme == "happy") setTheme("sad")
       if (theme == "sad") setTheme("vangogh")
       console.log("clicked")
    }

    useEffect(() =>{
        setMounted(true)
    }, [])


    if (!mounted){
        return <button>Not yet </button>
    }
    return (
        <div className="">
            <button className = "text-xs rounded size-7" onClick={handleClick}>Change Theme</button>
        </div>
    )
}

export default ThemeToggler