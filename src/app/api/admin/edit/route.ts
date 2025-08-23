import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId, anonymousName } = await req.json()
  await prisma.user.update({
    where: { id: userId },
    data: { anonymousName }
  })
  return NextResponse.json({ success: true })
}