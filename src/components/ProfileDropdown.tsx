"use client"

import { signOut } from "next-auth/react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import DisplayUser from "./DisplayUser"
import { useUser } from "@/contexts/UserContext"

interface ProfileDropdownProps {
  userName: string
  isAdmin?: boolean
  onAddNote: () => void
  onSelectMood: () => void
  onSelectTheme: () => void
  onSelectAvatar: () => void // ADD THIS LINE
}

export default function ProfileDropdown({
  userName,
  isAdmin = false,
  onAddNote,
  onSelectMood,
  onSelectTheme,
  onSelectAvatar, // ADD THIS PARAMETER
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user, setUser } = useUser()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    setUser(null)
    router.push("/")
  }

  const handleAdmin = () => {
    router.push("/admin")
  }

  const handleDashboard = () => {
    router.push("/dashboard")
  }

  const handleUserPage = () => {
    router.push("/userpage?id=" + user?.id)
  }

  const handleRedeemPoints = () => {
    router.push("/store")
  }

  const handleGetPremium = () => {
    router.push("/subscription")
  }

  const menuItems = [
    { label: "Add/Update Notes", action: onAddNote },
    { label: "Select Mood", action: onSelectMood },
    { label: "Select Theme", action: onSelectTheme },
    { label: "Select Avatar", action: onSelectAvatar }, // ADD THIS LINE
    { label: "Dashboard", action: handleDashboard },
    { label: "User Page", action: handleUserPage },
    { label: "Redeem Your Mood Points", action: handleRedeemPoints },
    { label: "Get Moodly Premium", action: handleGetPremium },
  ]
  if (isAdmin) {
    menuItems.push({ label: "Admin Panel", action: handleAdmin })
  }
  menuItems.push({ label: "Log Out", action: handleLogout })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div
      className="relative flex justify-center items-center h-full w-full"
      ref={dropdownRef}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center  space-x-2 hover:cursor-pointer  transition-all rounded-lg "
      >
        <span>
          <DisplayUser />
        </span>
      </button>

      {isOpen && (
        <div className="theme-card-variant-3-no-hover rounded-b-2xl border-none absolute right-0 top-12 mt-2 w-56 items-left p-3 rounded-lg shadow-lg z-[9999] overflow-hidden">
          <div className="space-y-1 p-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.action()
                  setIsOpen(false)
                }}
                className={`block w-full text-left px-4 py-2 text-[var(--foreground)] hover:bg-[var(--secondary)] hover:cursor-pointer transition-colors rounded-2xl ${
                  index === menuItems.length - 1 ? "!bg-[var(--secondary)]" : ""
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
