// Create: src/app/api/users/[userId]/route.ts

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

    // Find the user with their avatar
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        anonymousName: true,
        note: true,
        currentAvatarId: true,
        currentAvatar: {
          select: {
            id: true,
            name: true,
            imagePath: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return user data in the same format as /api/getUser
    return NextResponse.json({
      id: user.id,
      anonymousName: user.anonymousName,
      note: user.note,
      currentAvatarId: user.currentAvatarId,
      currentAvatar: user.currentAvatar
    })

  } catch (error) {
    console.error('Error fetching user by ID:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}