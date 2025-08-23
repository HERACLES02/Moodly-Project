import { useEffect, useState } from "react"

interface User {
    id: string
    email: string
    anonymousName: string
    mood?: string
    note?: string
    isAdmin: boolean  // Make sure this is included
    isBanned?: boolean
}


export function useGetUser(){

    const [user, setUser] = useState(null)
    const [ loading, setLoading] = useState(true)


    useEffect(() => {

        async function fetchUser() {

            const response = await fetch('/api/getUser')
            if (response.ok){
                const data = await response.json()
                console.log(data)
                setUser(data)
            
            setLoading(false)
            }


        }
        fetchUser()
    }, [])
    console.log(user)
    return {user, setUser}

    }
