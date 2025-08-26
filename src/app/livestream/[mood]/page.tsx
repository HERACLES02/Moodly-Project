'use client'
import { useState, useEffect } from 'react'
import { useGetUser } from '@/hooks/useGetUser'
import NavbarComponent from '@/components/NavbarComponent'
import LiveStreamComponent from '@/components/LiveStreamComponent'
import './page.css'

export default function LiveStreamPage({ params }: { params: Promise<{ mood: string }> }) {
  const [mood, setMood] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const { user } = useGetUser()

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params
      setMood(resolvedParams.mood)
      setLoading(false)
    }
    getParams()
  }, [params])

  if (loading) {
    return <div>Loading...</div>
  }

  

  return (
    <div className="livestream-page-container">
      <NavbarComponent />
      <div className="livestream-content">
        
        <LiveStreamComponent mood={mood.toLowerCase()} user={user} />
      </div>
    </div>
  )
}