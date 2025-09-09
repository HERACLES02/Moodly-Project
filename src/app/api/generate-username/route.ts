import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'



async function getRandomWord(): Promise<string> {
  const words = await prisma.randomWord.findMany()
  return words[Math.floor(Math.random() * words.length)].word
}


async function generateUniqueUsername(): Promise<string> {
  const word = await getRandomWord()
  console.log(`word ${word}`)
  console.log( `Dektesi Anon${word}${Math.floor(Math.random() * 1000)}`)
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