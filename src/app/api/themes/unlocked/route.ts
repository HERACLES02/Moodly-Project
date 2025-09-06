import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { unlockedThemes: true }
    })

    // Convert comma-separated string to array
    const unlockedThemes = user?.unlockedThemes 
      ? user.unlockedThemes.split(',').filter(theme => theme !== '')
      : []

    return NextResponse.json({
      unlockedThemes: unlockedThemes
    })

  } catch (error) {
    console.error('Error fetching unlocked themes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unlocked themes' },
      { status: 500 }
    )
  }
}