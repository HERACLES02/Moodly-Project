import { NextResponse } from 'next/server'

type AudioFeatureRule = {
  min_valence?: number
  max_valence?: number
  min_energy?: number
  max_energy?: number
  target_tempo?: number
  tempo_tolerance?: number
}

type MoodRule = {
  searchKeywords: string[]
  genres: string[]                 // loose hints added to the text query
  audioFeatures: AudioFeatureRule  // validated via /audio-features
}

const MOOD_RULES: Record<string, MoodRule> = {
  happy: {
    genres: ['pop', 'dance', 'feel-good', 'summer'],
    searchKeywords: ['happy upbeat positive', 'feel good vibes', 'dance pop cheerful', 'sunny anthems'],
    audioFeatures: { min_valence: 0.6, min_energy: 0.6, target_tempo: 120, tempo_tolerance: 20 },
  },
  calm: {
    genres: ['lofi', 'ambient', 'piano', 'chill'],
    searchKeywords: ['ambient calm', 'lofi study', 'piano relaxing', 'chill instrumental'],
    audioFeatures: { max_energy: 0.5, min_valence: 0.4, max_valence: 0.8, target_tempo: 70, tempo_tolerance: 16 },
  },
  energetic: {
    genres: ['electronic', 'hip hop', 'pop anthems', 'fitness'],
    searchKeywords: ['high energy workout', 'driving electronic', 'motivational anthem', 'hip hop bangers'],
    audioFeatures: { min_energy: 0.6, max_energy: 0.95, min_valence: 0.5, max_valence: 0.9, target_tempo: 125, tempo_tolerance: 22 },
  },
  anxious: {
    genres: ['lofi', 'ambient', 'piano', 'chill'],
    searchKeywords: ['lofi study', 'ambient calm', 'piano relaxing', 'chill instrumental'],
    audioFeatures: { max_energy: 0.5, min_valence: 0.4, max_valence: 0.8, target_tempo: 70, tempo_tolerance: 16 },
  },
  sad: {
    genres: ['acoustic', 'indie folk', 'soul', 'soft rock', 'uplifting'],
    searchKeywords: ['motivational pop', 'hopeful acoustic', 'inspirational ballad', 'soulful uplifting'],
    audioFeatures: { min_valence: 0.45, max_energy: 0.75, target_tempo: 90, tempo_tolerance: 18 },
  },
  excited: {
    genres: ['pop', 'dance', 'party', 'feel-good'],
    searchKeywords: ['party pop upbeat', 'dance hits feel good', 'feel good pop', 'festival anthems'],
    audioFeatures: { min_energy: 0.65, max_energy: 0.98, min_valence: 0.55, target_tempo: 122, tempo_tolerance: 20 },
  },
  tired: {
    genres: ['lofi', 'acoustic', 'soft pop', 'piano'],
    searchKeywords: ['soft acoustic', 'sleepy lofi', 'gentle piano', 'calm pop'],
    audioFeatures: { max_energy: 0.55, min_valence: 0.4, max_valence: 0.85, target_tempo: 80, tempo_tolerance: 16 },
  },
  grateful: {
    genres: ['r&b', 'soft pop', 'acoustic', 'soul'],
    searchKeywords: ['warm r&b', 'soft pop love', 'acoustic gratitude', 'soulful gratitude'],
    audioFeatures: { min_valence: 0.6, max_energy: 0.8, target_tempo: 90, tempo_tolerance: 18 },
  },
}

function shuffleArray<T>(array: T[]): T[] {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error('Spotify credentials not configured')

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })
  if (!res.ok) throw new Error('Failed to get Spotify token')
  const data = await res.json()
  return data.access_token
}

function matchesAudioFeatures(feat: any, rule: AudioFeatureRule): boolean {
  if (!feat) return false
  const { energy, valence, tempo } = feat

  if (rule.min_energy !== undefined && energy < rule.min_energy) return false
  if (rule.max_energy !== undefined && energy > rule.max_energy) return false
  if (rule.min_valence !== undefined && valence < rule.min_valence) return false
  if (rule.max_valence !== undefined && valence > rule.max_valence) return false

  if (rule.target_tempo !== undefined && typeof tempo === 'number') {
    const tol = rule.tempo_tolerance ?? 20
    if (tempo < rule.target_tempo - tol || tempo > rule.target_tempo + tol) return false
  }
  return true
}

function canonicalizeMood(input: string) {
  return input.toLowerCase().trim().replace(/\s+/g, '_')
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mood = canonicalizeMood(searchParams.get('mood') || '')
    const moodParams = MOOD_RULES[mood]
    if (!mood || !moodParams) {
      return NextResponse.json({ error: 'Invalid or unsupported mood' }, { status: 400 })
    }

    const accessToken = await getSpotifyToken()

    // Build compact query: random keyword + 2–3 genre words
    const randKw = moodParams.searchKeywords[Math.floor(Math.random() * moodParams.searchKeywords.length)]
    const genreHint = moodParams.genres.slice(0, 3).join(' ')
    const q = `${randKw} ${genreHint}`

    const offset = Math.floor(Math.random() * 100)
    const searchRes = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=50&offset=${offset}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    if (!searchRes.ok) throw new Error('Failed to search Spotify tracks')

    const searchData = await searchRes.json()
    const candidates = (searchData?.tracks?.items ?? []).filter((t: any) => t?.album?.images?.length > 0)
    if (!candidates.length) {
      return NextResponse.json({ mood, tracks: [], message: `Found 0 music recommendations for ${mood} mood` })
    }

    // Batch get audio features and filter
    const ids = candidates.map((t: any) => t.id).slice(0, 100)
    const featRes = await fetch(
      `https://api.spotify.com/v1/audio-features?ids=${ids.join(',')}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    let features: Record<string, any> = {}
    if (featRes.ok) {
      const featData = await featRes.json()
      for (const f of featData?.audio_features ?? []) {
        if (f?.id) features[f.id] = f
      }
    }

    const filtered = candidates.filter((t: any) => matchesAudioFeatures(features[t.id], moodParams.audioFeatures))
    const pool = filtered.length ? filtered : candidates
    const tracks = shuffleArray(pool).slice(0, 4).map((t: any) => ({
      id: t.id,
      name: t.name,
      artist: t.artists?.map((a: any) => a.name).join(', ') ?? 'Unknown',
      album: t.album?.name ?? '',
      albumArt: t.album?.images?.[0]?.url || '/images/music-placeholder.jpg',
      preview_url: t.preview_url,
      external_url: t.external_urls?.spotify
    }))

    return NextResponse.json({ mood, tracks, message: `Found ${tracks.length} music recommendations for ${mood} mood` })
  } catch (err) {
    console.error('Spotify API Error:', err)
    return NextResponse.json({ error: 'Failed to fetch music recommendations' }, { status: 500 })
  }
}
