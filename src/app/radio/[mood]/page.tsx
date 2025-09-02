import { use } from 'react'
import NavbarComponent from '@/components/NavbarComponent'
import SyncedRadioPlayer from '@/components/SyncedRadioPlayer'

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Invalid Radio Station
          </h1>
          <p className="text-gray-600 mb-4">
            The radio station "{mood}" is not available yet.
          </p>
          <p className="text-sm text-gray-500">
            Available stations: Happy Radio, Sad Radio
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <NavbarComponent />
      <SyncedRadioPlayer mood={normalizedMood} />
    </>
  )
}