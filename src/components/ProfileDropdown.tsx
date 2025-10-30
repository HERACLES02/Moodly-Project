'use client'

import { signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DisplayUser from './DisplayUser'


interface ProfileDropdownProps {
  userName: string
  isAdmin?: boolean,
  onAddNote: () => void
  onSelectMood: () => void
  onSelectTheme: () => void
  onSelectAvatar: () => void  // ADD THIS LINE
}

export default function ProfileDropdown({ 
  userName, 
  isAdmin = false,
  onAddNote, 
  onSelectMood,
  onSelectTheme,
  onSelectAvatar  // ADD THIS PARAMETER
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()


  const handleLogout = async () => {
  

    await signOut({ redirect: false })
    
    router.push('/login')
  }

  const handleAdmin = () =>{
    router.push('/admin')
  }

  const handleDashboard = () =>{
    router.push('/dashboard')
  }

  const handleUserPage = () => {
    router.push('/userpage')
  }

  const handleRedeemPoints = () => {
    router.push('/themes')
  }

   const menuItems = [
    { label: 'Add/Update Notes', action: onAddNote },
    { label: 'Select Mood', action:  onSelectMood },
    { label: 'Select Theme', action: onSelectTheme },
    { label: 'Select Avatar', action: onSelectAvatar },  // ADD THIS LINE
    { label: 'Dashboard', action: handleDashboard },
    { label: 'User Page', action: handleUserPage },
    { label: 'Redeem Your Mood Points', action: handleRedeemPoints },
    
  ]
  if (isAdmin) {
  menuItems.push({ label: 'Admin Panel', action: handleAdmin })
}
menuItems.push({ label: 'Log Out', action: handleLogout })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 hover:bg-[#ffffff] transition-colors rounded-lg px-4 py-2"
      >
        <span > <DisplayUser/></span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#815FD0] rounded-lg shadow-lg z-[9999] overflow-hidden border border-[#9479d9]">
          <div className="space-y-1 p-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action()
                  setIsOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 text-white hover:bg-[#BF77F6] transition-colors rounded-md ${
                  index === menuItems.length - 1 ? '!bg-[#a890df] hover:!bg-[#BF77F6]' : ''
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}