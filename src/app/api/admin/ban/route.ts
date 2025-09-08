import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  try {
    // Check authentication and admin status
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isAdmin: true }
    })

    if (!adminUser?.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    const { userId } = await req.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Find the user to ban/unban
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { isBanned: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const newBanStatus = !user.isBanned

    // Update the ban status
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: newBanStatus }
    })
    
    return NextResponse.json({ 
      success: true,
      message: newBanStatus ? 'User banned successfully' : 'User unbanned successfully',
      isBanned: newBanStatus
    })

  } catch (error) {
    console.error('Error in admin ban route:', error)
    return NextResponse.json(
      { error: 'Failed to update ban status' }, 
      { status: 500 }
    )
  }
}