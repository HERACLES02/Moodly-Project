"use client"
import { useUser } from "@/contexts/UserContext"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { useEffect } from "react"

export const ThemeProvider = ({ children, ...props }: ThemeProviderProps) => {
  const { user } = useUser()

  useEffect(() => {
    if (!user?.id) {
      // No user logged in - reset to normal
      document.documentElement.style.removeProperty("--color-saturation-shift")
      document.documentElement.style.removeProperty("--color-brightness-shift")
      return
    }

    // Generate unique number from user ID
    let hash = 0
    for (let i = 0; i < user.id.length; i++) {
      hash = user.id.charCodeAt(i) + ((hash << 5) - hash)
    }

    // Get TWO different shifts from the same hash
    hash = Math.abs(hash)

    // Saturation: 0% to +10% (never goes below 100%)
    const saturationShift = hash % 11 // 0 to +10

    // Brightness: -3% to +10%

    const brightnessShift = hash % 6 // -3 to +10
    const hueHash = Math.abs(hash * 13)
    const hueShift = (hueHash % 11) - 5 // Changed from 21 to 7

    document.documentElement.style.setProperty(
      "--color-saturation-shift",
      `${saturationShift}%`,
    )
    document.documentElement.style.setProperty(
      "--color-brightness-shift",
      `${brightnessShift}%`,
    )
    document.documentElement.style.setProperty(
      "--color-hue-shift",
      `${hueShift}deg`,
    )
  }, [user?.id])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
