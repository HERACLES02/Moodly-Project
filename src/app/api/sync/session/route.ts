import { NextResponse } from 'next/server'

// This simulates getting session info from your sync manager
// In a real setup, you'd import and use your getSyncManager() here

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mood = searchParams.get('mood') || 'happy'

    // Simulate current session info
    const sessionInfo = {
      currentMovie: {
        id: '550',
        title: 'Fight Club',
        vidsrcUrl: 'https://vidsrc.xyz/embed/movie?tmdb=550',
        poster: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.'
      },
      startedAt: Date.now() - (30 * 60 * 1000), // Started 30 minutes ago
      elapsedTime: 30 * 60 * 1000,
      remainingTime: 90 * 60 * 1000, // 90 minutes remaining
      progress: 25,
      viewerCount: Math.floor(Math.random() * 20) + 5,
      isActive: true,
      nextMovie: {
        id: '13',
        title: 'Forrest Gump'
      }
    }

    return NextResponse.json(sessionInfo)
  } catch (error) {
    console.error('Error getting sync session:', error)
    return NextResponse.json(
      { error: 'Failed to get session info' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { action, mood, movieId } = await request.json()
    
    switch (action) {
      case 'start-session':
        console.log(`🎬 Starting sync session for ${mood} mood`)
        return NextResponse.json({ 
          success: true, 
          message: `Session started for ${mood} mood` 
        })
        
      case 'skip-movie':
        console.log('⏭️ Skipping to next movie')
        return NextResponse.json({ 
          success: true, 
          message: 'Skipped to next movie' 
        })
        
      case 'change-mood':
        console.log(`🎭 Changing session mood to ${mood}`)
        return NextResponse.json({ 
          success: true, 
          message: `Session mood changed to ${mood}` 
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error managing sync session:', error)
    return NextResponse.json(
      { error: 'Failed to manage session' },
      { status: 500 }
    )
  }
}