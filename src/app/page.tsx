import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function Home() {

  const session = await auth()

  console.log(`Currently Logged in User ${session?.user?.email}`)

  if (session){redirect("/dashboard")}

  else{
  redirect("/login")
  }
}