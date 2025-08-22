'use client'
import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useGetUser } from '@/hooks/useGetUser'
import { useTest } from '@/hooks/useTest'
import "./dashboard.css"
console.log("📦 useGetUser import:", typeof useGetUser)

import NavbarComponent from '@/components/NavbarComponent'



export default function Dashboard() {

  const noteRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const backgroundImage = '/images/background.jpg'

  const { user, setUser} = useGetUser()
  const userName = user?.anonymousName
  
  useEffect(() => {
    
    setIsMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {

      if (noteRef.current && !noteRef.current.contains(event.target as Node)) {
        setIsNoteOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      {isMounted && (
        <div className="fixed inset-0 -z-10">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="object-cover"
            priority
            quality={100}
          />
        </div>
      )}

      <NavbarComponent/>

          </div>
  )
}