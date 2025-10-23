import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { UserProvider } from "@/contexts/UserContext";  // ← ADD THIS IMPORT
import '@/components/SearchBar.css';



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moodly",
  description: "Mood based media hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="vangogh" suppressHydrationWarning> 
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning 
      >
        <div></div>

        <UserProvider>  {/* ← ADD THIS */}
          <ThemeProvider
            attribute="class"
            defaultTheme=""
            themes={['vangogh', 'cat', "default", "happy", "sad"]}
          >
            {children}
          </ThemeProvider>
        </UserProvider>  {/* ← ADD THIS */}
      </body>
    </html>
  )
}