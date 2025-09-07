import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

const AVAILABLE_THEMES = {
  'van-gogh': { pointsRequired: 3, name: 'Van Gogh' },
  'cat': { pointsRequired: 6, name: 'Cat' },
  'default': { pointsRequired: 0, name: 'Default' },
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

    const body = await req.json()
    const { themeId, avatarId, action } = body
    
    // Determine if this is a theme or avatar request
    const isTheme = !!themeId
    const isAvatar = !!avatarId
    
    if (!isTheme && !isAvatar) {
      return NextResponse.json(
        { error: 'Either themeId or avatarId required' },
        { status: 400 }
      )
    }
    
    // Get user data with relations
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        unlockedAvatars: {
          include: {
            avatar: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    if (isTheme) {
      // Handle theme logic (same as before)
      const itemId = themeId
      
      if (!AVAILABLE_THEMES[itemId as keyof typeof AVAILABLE_THEMES]) {
        return NextResponse.json(
          { error: 'Invalid theme ID' },
          { status: 400 }
        )
      }
      
      const theme = AVAILABLE_THEMES[itemId as keyof typeof AVAILABLE_THEMES]
      const currentUnlockedThemes = user.unlockedThemes ? user.unlockedThemes.split(',') : []
      
      if (action === 'redeem') {
        if (currentUnlockedThemes.includes(itemId)) {
          return NextResponse.json(
            { error: 'You already own this theme!' },
            { status: 400 }
          )
        }

        if (user.points < theme.pointsRequired) {
          return NextResponse.json(
            { error: `Not enough points. Need ${theme.pointsRequired}, have ${user.points}` },
            { status: 400 }
          )
        }

        const newUnlockedThemes = currentUnlockedThemes.length > 0 
          ? `${user.unlockedThemes},${itemId}`
          : itemId

        await prisma.user.update({
          where: { email: session.user.email },
          data: {
            points: user.points - theme.pointsRequired,
            unlockedThemes: newUnlockedThemes,
            currentTheme: itemId
          }
        })

        await prisma.pointHistory.create({
          data: {
            userId: user.id,
            points: -theme.pointsRequired,
            reason: `theme_unlock_${itemId}`
          }
        })

        return NextResponse.json({
          success: true,
          message: `Successfully redeemed and applied ${theme.name} theme!`,
          pointsSpent: theme.pointsRequired
        })

      } else if (action === 'apply') {
        if (!currentUnlockedThemes.includes(itemId) && itemId !== 'default') {
          return NextResponse.json(
            { error: 'You do not own this theme' },
            { status: 400 }
          )
        }

        await prisma.user.update({
          where: { email: session.user.email },
          data: { currentTheme: itemId }
        })

        return NextResponse.json({
          success: true,
          message: `Applied ${theme.name} theme!`
        })
      }
    }
    
    if (isAvatar) {
      // Handle avatar logic with proper relations
      const avatar = await prisma.avatar.findUnique({
        where: { name: avatarId }
      })
      
      if (!avatar) {
        return NextResponse.json(
          { error: 'Invalid avatar ID' },
          { status: 400 }
        )
      }
      
      // Check if user already owns this avatar
      const userOwnsAvatar = user.unlockedAvatars.some(ua => ua.avatar.name === avatarId)
      
      if (action === 'redeem') {
        if (userOwnsAvatar) {
          return NextResponse.json(
            { error: 'You already own this avatar!' },
            { status: 400 }
          )
        }

        if (user.points < avatar.pointsRequired) {
          return NextResponse.json(
            { error: `Not enough points. Need ${avatar.pointsRequired}, have ${user.points}` },
            { status: 400 }
          )
        }

        // Create UserAvatar relationship and update user
        await prisma.$transaction([
          prisma.userAvatar.create({
            data: {
              userId: user.id,
              avatarId: avatar.id
            }
          }),
          prisma.user.update({
            where: { id: user.id },
            data: {
              points: user.points - avatar.pointsRequired,
              currentAvatar: avatar.name
            }
          }),
          prisma.pointHistory.create({
            data: {
              userId: user.id,
              points: -avatar.pointsRequired,
              reason: `avatar_unlock_${avatar.name}`
            }
          })
        ])

        return NextResponse.json({
          success: true,
          message: `Successfully redeemed and applied ${avatar.displayName} avatar!`,
          pointsSpent: avatar.pointsRequired
        })

      } else if (action === 'apply') {
        if (!userOwnsAvatar && avatarId !== 'default') {
          return NextResponse.json(
            { error: 'You do not own this avatar' },
            { status: 400 }
          )
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { currentAvatar: avatar.name }
        })

        return NextResponse.json({
          success: true,
          message: `Applied ${avatar.displayName} avatar!`
        })
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Redeemable API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}