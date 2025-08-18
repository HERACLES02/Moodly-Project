'use client'

import { signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ProfileDropdownProps {
  userName: string
  userInitials: string
  onAddNote: () => void
  onSelectMood: () => void
}

export default function ProfileDropdown({ 
  userName, 
  userInitials,
  onAddNote, 
  onSelectMood
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const menuItems = [
    { label: 'Add/Update Notes', action: onAddNote },
    { label: 'Select Mood', action:  onSelectMood },
    { label: 'Go to Dashboard', action: () => console.log('Dashboard clicked') },
    { label: 'Edit Profile', action: () => console.log('Profile clicked') },
    { label: 'Log Out', action: handleLogout },
  ]

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
        className="flex items-center space-x-2 bg-[#815FD0] hover:bg-[#9479d9] transition-colors rounded-lg px-4 py-2"
      >
        <span className="text-white font-medium">{userName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[#815FD0] rounded-lg shadow-lg z-20 overflow-hidden border border-[#9479d9]">
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