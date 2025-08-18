import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const FALLBACK_WORDS = ['Strawberry', 'Tofu', 'Mango', 'Cookie', 'Panda', 'Ocean', 'Cloud', 'Star', 'Moon', 'River']

async function getRandomWord(): Promise<string> {
  try {
    // Try external API first
    const response = await fetch('https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&minLength=4&maxLength=10')
    if (response.ok) {
      const data = await response.json()
      if (data?.word) {
        return data.word.charAt(0).toUpperCase() + data.word.slice(1).toLowerCase()
      }
    }
  } catch (error) {
    console.log('API failed, using fallback')
  }
  
  // Fallback to database or hardcoded words
  try {
    const words = await prisma.randomWord.findMany()
    if (words.length === 0) {
      // Seed database
      await prisma.randomWord.createMany({
        data: FALLBACK_WORDS.map(word => ({ word })),
        skipDuplicates: true
      })
      return FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
    }
    return words[Math.floor(Math.random() * words.length)].word
  } catch (error) {
    return FALLBACK_WORDS[Math.floor(Math.random() * FALLBACK_WORDS.length)]
  }
}

async function generateUniqueUsername(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const word = await getRandomWord()
    const username = `Anon${word}`
    
    const existing = await prisma.user.findUnique({ where: { anonymousName: username } })
    if (!existing) return username
  }
  
  // Fallback with number
  const word = await getRandomWord()
  return `Anon${word}${Math.floor(Math.random() * 1000)}`
}

export async function GET() {
  try {
    const username = await generateUniqueUsername()
    return NextResponse.json({ anonymousName: username })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate username' }, { status: 500 })
  }
}