import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { word } = await req.json()
    
    if (!word || typeof word !== 'string' || word.trim() === '') {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    // Check if word already exists
    const existingWord = await prisma.filteredWord.findFirst({
      where: { word: word.trim().toLowerCase() }
    })

    if (existingWord) {
      return NextResponse.json({ error: 'Word already exists' }, { status: 409 })
    }

    await prisma.filteredWord.create({
      data: { word: word.trim().toLowerCase() }
    })
    
    return NextResponse.json({ success: true, message: `Word "${word}" has been banned` })
  } catch (error) {
    console.error('Error adding banned word:', error)
    return NextResponse.json({ error: 'Failed to add banned word' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const filteredWords = await prisma.filteredWord.findMany({
      orderBy: { word: 'asc' }
    })

    return NextResponse.json({ 
      words: filteredWords.map(item => item.word),
      count: filteredWords.length 
    })
  } catch (error) {
    console.error('Error fetching banned words:', error)
    return NextResponse.json({ error: 'Failed to fetch banned words' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { word } = await req.json()
    
    if (!word || typeof word !== 'string') {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 })
    }

    const deletedWord = await prisma.filteredWord.deleteMany({
      where: { word: word.trim().toLowerCase() }
    })

    if (deletedWord.count === 0) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Word "${word}" has been removed from banned list` 
    })
  } catch (error) {
    console.error('Error removing banned word:', error)
    return NextResponse.json({ error: 'Failed to remove banned word' }, { status: 500 })
  }
}