import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const notes = await prisma.note.findMany()
    return NextResponse.json(notes)
    
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}
export async function POST(req: Request) {
  try {
    // 1. Check content type
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

    console.log('Creating note with content:', body.content)
    const note = await prisma.note.create({
      data: {
        content: body.content
      }
    })
    console.log('Note created:', note)

    return NextResponse.json(note, { status: 201 })

  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    )
  }
}