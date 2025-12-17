import { use } from "react"

import SyncedMoviePlayer from "@/components/SyncedMoviePlayer"
import "./page.css"

interface PageProps {
  params: Promise<{ mood: string }>
}

export default function LiveStreamPage({ params }: PageProps) {
  const { mood } = use(params)

  // Validate mood
  const validMoods = ["happy", "sad"]
  const normalizedMood = mood.toLowerCase()

  if (!validMoods.includes(normalizedMood)) {
    return (
      <div className="livestream-page-container">
        <div className="livestream-content">
          <div className="error-message">
            <h2>Invalid Mood Stream</h2>
            <p>The mood "{mood}" is not supported yet.</p>
            <p>Available moods: Happy, Sad</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="livestream-page-container">
      <SyncedMoviePlayer mood={normalizedMood} />
    </div>
  )
}
