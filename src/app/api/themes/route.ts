import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

const AVAILABLE_THEMES = {
  'van-gogh': { pointsRequired: 3, name: 'Van Gogh' },
  'cat': { pointsRequired: 6, name: 'Cat' }
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

    const { themeId, action } = await req.json()
    
    if (!themeId || !AVAILABLE_THEMES[themeId as keyof typeof AVAILABLE_THEMES]) {
      return NextResponse.json(
        { error: 'Invalid theme ID' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, points: true, currentTheme: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const theme = AVAILABLE_THEMES[themeId as keyof typeof AVAILABLE_THEMES]

    if (action === 'redeem') {
      // Check if user has enough points
      if (user.points < theme.pointsRequired) {
        return NextResponse.json(
          { error: `Not enough points. Need ${theme.pointsRequired}, have ${user.points}` },
          { status: 400 }
        )
      }

      // Deduct points and apply theme
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          points: { decrement: theme.pointsRequired },
          currentTheme: themeId
        }
      })

      // Record point history
      await prisma.pointHistory.create({
        data: {
          userId: user.id,
          points: -theme.pointsRequired,
          reason: `theme_unlock_${themeId}`
        }
      })

      return NextResponse.json({
        success: true,
        message: `${theme.name} theme unlocked and applied!`,
        newPoints: updatedUser.points,
        currentTheme: themeId
      })

    } else if (action === 'apply') {
      // Just apply the theme (user already unlocked it)
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { currentTheme: themeId }
      })

      return NextResponse.json({
        success: true,
        message: `${theme.name} theme applied!`,
        currentTheme: themeId
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Theme API error:', error)
    return NextResponse.json(
      { error: 'Failed to process theme request' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { currentTheme: true, points: true }
    })

    return NextResponse.json({
      currentTheme: user?.currentTheme || 'default',
      points: user?.points || 0
    })

  } catch (error) {
    console.error('Error fetching theme:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theme' },
      { status: 500 }
    )
  }
}