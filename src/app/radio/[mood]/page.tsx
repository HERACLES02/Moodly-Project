import { use } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import SyncedRadioPlayer from '@/components/SyncedRadioPlayer'
import './page.css'

interface PageProps {
  params: Promise<{ mood: string }>
}

export default function RadioPage({ params }: PageProps) {
  const { mood } = use(params)
  
  // Validate mood
  const validMoods = ['happy', 'sad']
  const normalizedMood = mood.toLowerCase()
  
  if (!validMoods.includes(normalizedMood)) {
    return (
      <div className="radio-page-container">
        <NavbarComponent />
        <div className="radio-content">
          <div className="error-message">
            <h2>Invalid Radio Station</h2>
            <p>The radio station "{mood}" is not available yet.</p>
            <p>Available stations: Happy Radio, Sad Radio</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="radio-page-container">
      <NavbarComponent />
      <SyncedRadioPlayer mood={normalizedMood} />
    </div>
  )
}