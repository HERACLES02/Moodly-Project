"use client"

import { useEffect, useState } from "react"

export const useThemeToggler = () => {
    const [theme, setTheme] = useState<String>("")

    //load saved theme from local storage on initial mount
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme')
        console.log(`loading theme ${savedTheme}`)

        if (savedTheme == "vangogh" || savedTheme == "cat"){
            setTheme(savedTheme)
            const html = document.querySelector('html')!;
            html.classList.add(savedTheme)
        }


    }, [])

    //update the theme class on html and save and remove themes from local storage

    useEffect(() => {
        const html = document.querySelector('html')!;

        html.classList.remove('vangogh', 'cat')

        if (theme == "vangogh"){
            html.classList.add('vangogh')
            localStorage.setItem('theme', 'vangogh')
        } else if(theme == "cat"){
            html.classList.add('cat')
            localStorage.setItem('theme', 'cat')
        }  else{
            localStorage.removeItem('theme')
        }
        console.log(`added theme ${theme}`)




    }, [theme])


    const toggleTheme = () => {
        console.log(`Current theme ${theme}`)


        if (theme == "vangogh"){
            setTheme("cat")
        } else if(theme == "cat"){
            setTheme("")
        }  else{
            setTheme("vangogh")
        }
        console.log(`changed theme ${theme}`)


    }

    return { theme, toggleTheme }
}   