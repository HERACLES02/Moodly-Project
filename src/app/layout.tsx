import type { Metadata } from "next"
import { Geist, Geist_Mono, Cinzel, Quicksand, Nunito } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/providers/theme-provider"
import { UserProvider } from "@/contexts/UserContext" // ← ADD THIS IMPORT
import NavbarComponent from "@/components/NavbarComponent"

import { auth } from "@/auth"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
})
const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
})
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Moodly",
  description: "Mood based media hub",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth() // ✅ server-side session

  const isLoggedIn = !!session?.user

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${nunito.variable} ${quicksand.variable} antialiased`}
        suppressHydrationWarning
      >
        <div></div>
        <UserProvider>
          {" "}
          {/* ← ADD THIS */}
          <ThemeProvider
            attribute="class"
            defaultTheme=""
            themes={["vangogh", "cat", "default", "happy", "sad", "test"]}
          >
            {isLoggedIn && <NavbarComponent />}

            {children}
            <Toaster position="bottom-right" />
          </ThemeProvider>
        </UserProvider>{" "}
        {/* ← ADD THIS */}
      </body>
    </html>
  )
}
