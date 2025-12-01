"use client"
import { Feature166 } from "@/components/testblock"
import { Button } from "@/components/ui/button"
import { useGetUser } from "@/hooks/useGetUser"
import prisma from "@/lib/prisma"
import { useTheme } from "next-themes"
import React, { useState } from "react"

const hello = () => {
  const [points, setPoints] = useState(0)
  const { user } = useGetUser()

  const { setTheme } = useTheme()

  const increasePoint = () => {
    setPoints(points + 1)
  }

  const getUserPoints = async () => {
    const p = await fetch("/api/ohno")
    console.log(p)
  }

  const changeTheme = (theme: string) => {
    setTheme(theme)
  }

  return (
    <div className="">
      {/* Soft Warm Pastel Texture */}

      <Button onClick={() => changeTheme("happy")}>happy</Button>
      <Button onClick={() => changeTheme("sad")}>sad</Button>
      <Button onClick={() => changeTheme("cat")}>cat</Button>
      <Button onClick={() => changeTheme("vangogh")}>vangogh</Button>
      <Button onClick={() => changeTheme("test")}>test</Button>
      <Feature166 />
    </div>
  )
}

export default hello
