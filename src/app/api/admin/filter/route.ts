import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const { word } = await req.json()
  
  await prisma.filteredWord.create({
    data: { word }
  })
  
  return NextResponse.json({ success: `Filtered ${word}` })
}

export async function GET(req: Request){
    const filter= await prisma.filteredWord.findMany()

    return NextResponse.json(filter)
}