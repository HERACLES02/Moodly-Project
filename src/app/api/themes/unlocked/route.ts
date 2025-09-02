import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
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

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Convert comma-separated string to array
    const unlockedThemesArray = user.unlockedThemes 
      ? user.unlockedThemes.split(',').filter(theme => theme.trim() !== '')
      : []

    return NextResponse.json({
      unlockedThemes: unlockedThemesArray
    })

  } catch (error) {
    console.error('Error fetching unlocked themes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unlocked themes' },
      { status: 500 }
    )
  }
}