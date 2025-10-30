import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    // Get the current user's session
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get the user's current note
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        note: true,
        anonymousName: true
      }
    })

    return NextResponse.json({ 
      note: user?.note || '',
      userName: user?.anonymousName
    })
    
  } catch (error) {
    console.error('Error fetching note:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const contentType = req.headers.get('content-type')
    if (contentType !== 'application/json') {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

    const body = await req.json()
    
    if (!body?.content || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { note: body.content },
      select: {
        id: true,
        email: true,
        note: true,
        anonymousName: true
      }
    })

    console.log('User note updated:', {
      user: updatedUser.anonymousName,
      note: updatedUser.note
    })

    await prisma.note.create({
      data: {
        content: body.content
      }
    })
    
    return NextResponse.json({
      success: true,
      note: updatedUser.note,
      message: 'Note saved successfully',
      user: updatedUser.anonymousName
    }, { status: 200 })
    
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    )
  }
}