import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const moods = await prisma.mood.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(moods);
}

export async function POST(req: Request) {
  try {
    const { moodName } = await req.json()
    
    if (!moodName || typeof moodName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid mood name' },
        { status: 400 }
      )
    }

    //update the mood
    const mood = await prisma.mood.upsert({
      where: { name: moodName },
      create: { 
        name: moodName,
        color: getColorForMood(moodName)
      },
      update: {}
    })

    console.log('Mood saved to DB:', mood)
    
    return NextResponse.json(mood, { status: 201 })
    
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
    'Anxious': 'bg-purple-300'
  }
  return colors[moodName] || 'bg-gray-300'
}