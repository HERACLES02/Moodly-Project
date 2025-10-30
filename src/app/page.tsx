// app/page.tsx - Simple approach
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"

export default async function Home() {
  const session = await auth()
  
  if (session) {
    const user = await prisma.user.findUnique({
      where: { email: session?.user?.email! },
      select: { mood: true }
    })

    // If no mood, treat as first-time setup
    if (!user?.mood) {
      redirect("/firstmoodselection")
    } else if (user?.mood) {
      redirect("/dashboard")
    }
  } else {
    redirect("/login")
  }
}