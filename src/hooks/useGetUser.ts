import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface User {
    id: string
    email: string
    anonymousName: string
    mood?: string
    note?: string
    isAdmin: boolean
    isBanned?: boolean
    currentTheme?: string        // Add this line
    unlockedThemes?: string      // Add this line
    points?: number              // Add this line
}

export function useGetUser(){
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const { setTheme } = useTheme()

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await fetch('/api/getUser')
                if (response.ok){
                    const data = await response.json()
                    console.log('User data fetched:', data)
                    setUser(data)
                }
            } catch (error) {
                console.error('Error fetching user:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
        
        // if (user){
        //     if (user?.currentTheme && user.currentTheme != "default"){
        //         setTheme(user?.currentTheme?.toLowerCase())
        //     }
        //     else{
        //         if (user?.mood)
        //         setTheme(user?.mood?.toLowerCase())
        //     }

        // }

    }, [])

    console.log('Current user:', user)
    return { user, setUser, loading }
}