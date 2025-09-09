import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
   
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        currentAvatar: true  // This includes the avatar relation
      }
    })
    

      return NextResponse.json(user)
  } else {
    return NextResponse.json("Not Logged in")  // Added missing return
  }
}