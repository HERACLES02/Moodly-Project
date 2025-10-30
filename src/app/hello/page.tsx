"use client"
import { useGetUser } from '@/hooks/useGetUser'
import prisma from '@/lib/prisma'
import React, { useState } from 'react'

const hello = () => {

    const [ points, setPoints ] = useState(0)
    const {user} = useGetUser()

    const increasePoint = () => {
        setPoints(points + 1)
    }

    const getUserPoints = async () => {

        
        const p = await fetch('/api/ohno')
        console.log(p)

    }


  return (
    <div onClick={getUserPoints}>hello
        <div>
            {points}
        </div>

    </div>
  )
}

export default hello