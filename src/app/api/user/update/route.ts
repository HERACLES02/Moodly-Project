import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get the updates from request body
    const updates = await req.json()
    console.log('🔄 API: Received user updates:', updates)

    // Validate that we have something to update
    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No updates provided' },
        { status: 400 }
      )
    }

    // Define allowed fields that can be updated
    const allowedFields = [
      'mood',
      'note', 
      'currentTheme',
      'unlockedThemes',
      'points',
      'anonymousName'
    ]

    // Filter updates to only include allowed fields
    const filteredUpdates: any = {}
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = value
      }
    }

    // If no valid fields to update
    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: filteredUpdates,
      select: {
        id: true,
        email: true,
        anonymousName: true,
        mood: true,
        note: true,
        isAdmin: true,
        isBanned: true,
        currentTheme: true,
        unlockedThemes: true,
        points: true
      }
    })

    console.log('✅ API: User updated successfully:', updatedUser)

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('❌ API: Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}