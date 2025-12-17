"use client"

import { useEffect, useState } from "react"
import { Film, Music, Trophy } from "lucide-react"
import { useUser } from "@/contexts/UserContext"

interface WeeklyProgress {
  moviesWatched: number
  songsListened: number
  bonusClaimed: boolean
}

export default function WeeklyProgressCompact() {
  const { user } = useUser()
  const [progress, setProgress] = useState<WeeklyProgress | null>(null)

  useEffect(() => {
    if (user) {
      setProgress(user?.weeklyActivities)
    }
  }, [user?.weeklyActivities])

  if (!progress) return null

  const movieProgress = Math.min(progress.moviesWatched, 3)
  const songProgress = Math.min(progress.songsListened, 3)
  const moviePercentage = (movieProgress / 3) * 100
  const songPercentage = (songProgress / 3) * 100

  return (
    <div className="flex items-center gap-4 bg-white/30 backdrop-blur-md p-1.5 px-4 rounded-full border border-white/20 shadow-sm">
      {/* Movie Progress */}
      <div className="flex items-center gap-2">
        <Film size={14} className="text-[#1a1a1a] opacity-60" />
        <div className="w-12 h-1.5 bg-black/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-pink-400 rounded-full transition-all duration-500"
            style={{ width: `${moviePercentage}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-[#1a1a1a] opacity-80">
          {movieProgress}/3
        </span>
      </div>

      {/* Song Progress */}
      <div className="flex items-center gap-2 border-l border-black/10 pl-3">
        <Music size={14} className="text-[#1a1a1a] opacity-60" />
        <div className="w-12 h-1.5 bg-black/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-400 rounded-full transition-all duration-500"
            style={{ width: `${songPercentage}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-[#1a1a1a] opacity-80">
          {songProgress}/3
        </span>
      </div>

      {progress.bonusClaimed && (
        <div className="flex items-center justify-center">
          <Trophy size={14} className="text-yellow-500 drop-shadow-sm" />
        </div>
      )}
    </div>
  )
}
