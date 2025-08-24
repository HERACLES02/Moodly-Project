import { NextResponse } from 'next/server'

const moodToSearchParams: Record<string, any> = {
  happy: {
    genres: ['pop', 'dance', 'happy'],
    audioFeatures: { min_valence: 0.6, min_energy: 0.6, target_tempo: 120 },
    searchKeywords: ['happy upbeat positive', 'feel good vibes', 'energetic']
  },
  sad: {
    genres: ['acoustic', 'sad', 'blues', 'heartbreak lonely'],
    audioFeatures: { max_valence: 0.4, max_energy: 0.5, target_tempo: 80 },
    searchKeywords: 'sad melancholy emotional'
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}


async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) throw new Error('Failed to get Spotify token')
  const data = await response.json()
  return data.access_token
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moodRaw = searchParams.get('mood') || ''
    const mood = moodRaw.toLowerCase()

    if (!mood || !moodToSearchParams[mood]) {
      return NextResponse.json({ error: 'Invalid or unsupported mood' }, { status: 400 })
    }

    const moodParams = moodToSearchParams[mood]
    const accessToken = await getSpotifyToken()

    const randomKeyword = moodParams.searchKeywords[
      Math.floor(Math.random() * moodParams.searchKeywords.length)
    ]

    const ramdomOffset = Math.floor(Math.random() * 100)




    const searchResponse = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(randomKeyword)}&type=track&limit=50&offset=${ramdomOffset}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (!searchResponse.ok) throw new Error('Failed to search Spotify tracks')

    const searchData = await searchResponse.json()

    const validTracks = searchData.tracks.items.filter((t: any) => t.album.images.length > 0)
    const shuffledTracks = shuffleArray(validTracks)

    const tracks = shuffledTracks
      .filter((t: any) => t.album.images.length > 0)
      .slice(0, 4)
      .map((t: any) => ({
        id: t.id,
        name: t.name,
        artist: t.artists.map((a: any) => a.name).join(', '),
        album: t.album.name,
        albumArt: t.album.images[0]?.url || '/images/music-placeholder.jpg',
        preview_url: t.preview_url,
        external_url: t.external_urls.spotify
      }))

    return NextResponse.json({ mood, tracks, message: `Found ${tracks.length} music recommendations for ${mood} mood` })
  } catch (err) {
    console.error('Spotify API Error:', err)
    return NextResponse.json({ error: 'Failed to fetch music recommendations' }, { status: 500 })
  }
}
