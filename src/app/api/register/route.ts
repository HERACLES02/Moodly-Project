import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, password, anonymousName } = await req.json()
    
    if (!email || !password || !anonymousName) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be 6+ characters' }, { status: 400 })
    }
    
    // Check if email exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    
    // Check if username exists
    const existingUsername = await prisma.user.findUnique({ where: { anonymousName } })
    if (existingUsername) {
      return NextResponse.json({ error: 'Username taken, regenerate' }, { status: 400 })
    }
    
    // Create user
    const hashedPassword = bcrypt.hashSync(password, 10)
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, anonymousName }
    })

    // Create default "Favorites" playlists for both song and movie types
    await prisma.playlist.createMany({
      data: [
        {
          name: "Favorites",
          type: "SONG",
          isDefault: true,
          userId: user.id
        },
        {
          name: "Favorites", 
          type: "MOVIE",
          isDefault: true,
          userId: user.id
        }
      ]
    })

    return NextResponse.json({ message: 'Account created', userId: user.id })
  } catch (error) {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}