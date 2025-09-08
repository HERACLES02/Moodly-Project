// src/app/api/users/[userId]/note/route.ts

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

// Fix the typing - params should be awaited in Next.js 15
export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Await the params - this is the key fix for Next.js 15
    const { userId } = await context.params

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