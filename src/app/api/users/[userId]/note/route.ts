// Create: src/app/api/users/[userId]/note/route.ts

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { userId } = params

    // Find the user and their note
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        anonymousName: true,
        note: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      userId: user.id,
      username: user.anonymousName,
      note: user.note || ''
    })

  } catch (error) {
    console.error('Error fetching user note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user note' },
      { status: 500 }
    )
  }
}