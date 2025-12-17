"use client"

import "./PointsDisplay.css"
import { useUser } from "@/contexts/UserContext"
import MoodCurrencyIcon from "./icons/MoodCurrencyIcon"

export default function PointsDisplay() {
  const { user } = useUser()

  return (
    <div className="theme-card-variant-1-no-hover p-2 flex justify-center items-center shadow-none border m-auto px-4 gap-2 ">
      <MoodCurrencyIcon size={40} />
      <span className="text-[var(--dark-text)] font-black">{user?.points}</span>
    </div>
  )
}
