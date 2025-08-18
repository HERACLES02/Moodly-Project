import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json()
    const hashedPassword = bcrypt.hashSync(password, 10)
    
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    )
  }
}