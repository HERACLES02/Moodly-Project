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
      select: { mood: true }
    })

    return NextResponse.json({ mood: user?.mood || null })
  } catch (error) {
    console.error('Error fetching mood:', error)
    return NextResponse.json(
      { error: 'Failed to fetch mood' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    // Get the current user's session
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { moodName } = await req.json()
    
    if (!moodName || typeof moodName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid mood name' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { mood: moodName },
      select: {
        id: true,
        email: true,
        mood: true,
        anonymousName: true
      }
    })

    console.log('User mood updated:', {
      user: updatedUser.anonymousName,
      mood: updatedUser.mood
    })

    
    await prisma.mood.upsert({
      where: { name: moodName },
      create: { 
        name: moodName,
        color: getColorForMood(moodName)
      },
      update: {}
    })
    
    return NextResponse.json({
      success: true,
      mood: updatedUser.mood,
      message: `Mood updated to ${moodName}`
    }, { status: 200 })
    
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to save mood' },
      { status: 500 }
    )
  }
}

function getColorForMood(moodName: string): string {
  const colors: Record<string, string> = {
    'Happy': 'bg-yellow-300',
    'Calm': 'bg-blue-300',
    'Energetic': 'bg-red-300',
    'Anxious': 'bg-purple-300',
    'Sad': 'bg-gray-400',
    'Excited': 'bg-orange-300',
    'Tired': 'bg-indigo-300',
    'Grateful': 'bg-green-300'
  }
  return colors[moodName] || 'bg-gray-300'
}