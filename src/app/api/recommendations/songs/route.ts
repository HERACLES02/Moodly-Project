// src/app/api/recommendations/songs/route.ts
import { NextResponse } from 'next/server'

export const runtime = 'nodejs' // ensure Buffer is available

type MoodProfile = {
  /** Keywords used when NO q (default mood picks) */
  defaultKeywords: string[]
  /** Anchors added when q IS present, to keep search within the mood */
  searchAnchors: string[]
}

const MOOD_PROFILES: Record<string, MoodProfile> = {
  happy: {
    defaultKeywords: [
      'happy upbeat positive',
      'feel good pop',
      'good vibes only',
      'dance pop uplifting',
      'sunny day anthem',
    ],
    searchAnchors: ['happy', 'upbeat', 'feel good', 'dance pop', 'positive'],
  },
  sad: {
    // default is UPLIFTING (as requested earlier)
    defaultKeywords: [
      'motivational pop',
      'hopeful acoustic',
      'inspirational ballad',
      'soulful uplifting',
      'rise up',
    ],
    // when searching, keep it truly sad/emotional
    searchAnchors: ['sad', 'melancholy', 'heartbreak', 'emotional', 'lonely', 'blue'],
  },
  anxious: {
    defaultKeywords: [
      'calm lofi beats',
      'soothing acoustic',
      'relaxing background',
      'chill ambient',
      'peaceful instrumental',
    ],
    searchAnchors: ['calm', 'soothing', 'relax', 'chill', 'lofi', 'ambient', 'peaceful'],
  },
  calm: {
    defaultKeywords: [
      'peaceful acoustic',
      'soft relaxing instrumental',
      'gentle piano',
      'quiet evening',
      'calming playlist',
    ],
    searchAnchors: ['peaceful', 'soft', 'relaxing', 'gentle', 'piano', 'acoustic'],
  },
  energetic: {
    defaultKeywords: [
      'workout pump up',
      'high energy edm',
      'party anthems',
      'hype tracks',
      'adrenaline rush',
    ],
    searchAnchors: ['high energy', 'workout', 'edm', 'hype', 'party', 'banger'],
  },
  excited: {
    defaultKeywords: [
      'upbeat party',
      'festival vibes',
      'dance pop hits',
      'feel great anthems',
      'celebration songs',
    ],
    searchAnchors: ['upbeat', 'party', 'festival', 'dance', 'anthem'],
  },
  tired: {
    defaultKeywords: [
      'sleepy chill',
      'wind down acoustic',
      'late night lofi',
      'soft cozy tunes',
      'gentle unwind',
    ],
    searchAnchors: ['sleep', 'wind down', 'lofi', 'gentle', 'cozy', 'soft'],
  },
  grateful: {
    defaultKeywords: [
      'heartfelt warm',
      'thankful songs',
      'uplifting heartfelt',
      'soulful gratitude',
      'warm indie folk',
    ],
    searchAnchors: ['heartfelt', 'warm', 'thankful', 'gratitude', 'uplifting', 'soulful'],
  },
}

const MOOD_SECTIONS: Record<
  string,
  { key: string; title: string; defaultKeywords: string[] }[]
> = {
  happy: [
    {
      key: 'mellow_dreams',
      title: 'Mellow Dreams',
      defaultKeywords: ['chill happy indie', 'soft feel good', 'sunny acoustic', 'easygoing pop'],
    },
    {
      key: 'romanticism_galore',
      title: 'Romanticism Galore',
      defaultKeywords: ['romantic pop', 'love songs upbeat', 'feel good romance', 'romantic indie pop'],
    },
    {
      key: 'dancefloor_joy',
      title: 'Dancefloor Joy',
      defaultKeywords: ['dance pop upbeat', 'feel good dance hits', 'party pop', 'uplifting edm pop'],
    },
    {
      key: 'sunlit_adventures',
      title: 'Sunlit Adventures',
      defaultKeywords: [
        'summer road trip songs',
        'sunny upbeat indie',
        'happy travel playlist',
        'feel good adventure pop',
        'outdoor vibes music',
      ],
    },
    {
      key: 'feel_good_classics',
      title: 'Feel-Good Classics',
      defaultKeywords: [
        'feel good classics',
        'classic feel good songs',
        'happy oldies',
        'timeless upbeat hits',
        'best feel good anthems',
      ],
    },

  ],
  sad: [
    {
      key: 'broken_hearts',
      title: 'Broken Hearts',
      defaultKeywords: ['sad heartbreak songs', 'breakup ballads', 'crying playlist', 'heartache acoustic'],
    },
    {
      key: 'hard_truths',
      title: "Life’s Hard Truths",
      defaultKeywords: ['emotional storytelling', 'raw emotional tracks', 'pain and struggle songs', 'songs about life'],
    },
    {
      key: 'healing_through_pain',
      title: 'Healing Through Pain',
      defaultKeywords: ['cathartic sad songs', 'sad but comforting songs', 'emotional release playlist', 'healing breakup songs'],
    },
    {
      key: 'lonely_nights',
      title: 'Lonely Nights',
      defaultKeywords: ['lonely night songs', 'sad lofi night', 'melancholic ambient', 'quiet sad songs','late night loneliness',],
    },
    {
    key: 'bittersweet_memories',
    title: 'Bittersweet Memories',
    defaultKeywords: ['nostalgic sad songs', 'bittersweet memories music', 'reflective indie', 'sad nostalgia playlist', 'soft acoustic memories',],
    },
  ],
}


// ─────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
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

  const basicAuth =
    typeof Buffer !== 'undefined'
      ? 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      : // @ts-ignore Edge fallback
        'Basic ' + btoa(`${clientId}:${clientSecret}`)

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuth,
    },
    body: 'grant_type=client_credentials',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Token error ${res.status}: ${body}`)
  }
  const data = await res.json()
  return data.access_token as string
}

/**
 * Build a search query:
 * - If `q` present: `(userQuery) (anchor1 OR anchor2 ...)`
 * - Else: pick a random default keyword for the mood.
 */
function buildQuery(mood: string, qRaw: string | null, sectionKey?: string | null, kind: 'track' | 'album' = 'track') {

  const profile = MOOD_PROFILES[mood]
  if (!profile) return null

  const q = (qRaw || '').trim()
  if (!q) {
          if (kind === 'album') {
            const m = mood.toLowerCase()

            if (m === 'sad') {
              const sadAlbums = [
                'melancholic album',
                'sad emotional album',
                'heartbreak album',
                'introspective indie album',
                'slow sad acoustic album',
              ]
              return sadAlbums[Math.floor(Math.random() * sadAlbums.length)]
            }

            if (m === 'happy') {
              const happyAlbums = [
                'feel good album',
                'upbeat pop album',
                'happy summer album',
                'dance pop album',
                'good vibes album',
              ]
              return happyAlbums[Math.floor(Math.random() * happyAlbums.length)]
            }
            const fallback = profile.defaultKeywords
            return fallback[Math.floor(Math.random() * fallback.length)]
          }

          const sections = MOOD_SECTIONS[mood] || []
          const section = sectionKey ? sections.find((s) => s.key === sectionKey) : null

          const source =
            section?.defaultKeywords?.length ? section.defaultKeywords : profile.defaultKeywords

          const kw = source[Math.floor(Math.random() * source.length)]
          return kw
        }



  const anchors = profile.searchAnchors
    .map((a) => a.trim())
    .filter(Boolean)
    .map((a) => `"${a}"`) // quote multi-word anchors
  const anchorExpr = anchors.length ? `(${anchors.join(' OR ')})` : ''
  // Bias the search toward the mood anchors while keeping the user's words
  return anchorExpr ? `${q} ${anchorExpr}` : q
}

/** Fetch 1 or 2 pages of Spotify search results */
async function searchSpotifyTracks(token: string, q: string, pages = 1) {
  const LIMIT = 50
  const offsets = Array.from({ length: pages }, () => Math.floor(Math.random() * 100))

  const results = await Promise.all(
    offsets.map(async (offset) => {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=${LIMIT}&offset=${offset}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const text = await res.text().catch(() => '')
      if (!res.ok) throw new Error(`Spotify /search ${res.status}: ${text}`)
      try {
        return JSON.parse(text)
      } catch {
        return { tracks: { items: [] } }
      }
    })
  )

  const items = results.flatMap((r: any) => r?.tracks?.items || [])
  // Deduplicate by id and require album art
  const seen = new Set<string>()
  const deduped = []
  for (const t of items) {
    if (!t?.id || seen.has(t.id)) continue
    if (!t?.album?.images?.length) continue
    seen.add(t.id)
    deduped.push(t)
  }
  return deduped
}

async function searchSpotifyAlbums(token: string, q: string, pages = 1) {
  const LIMIT = 30
  const offsets = Array.from({ length: pages }, () => Math.floor(Math.random() * 60))

  const results = await Promise.all(
    offsets.map(async (offset) => {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=${LIMIT}&offset=${offset}`
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const text = await res.text().catch(() => '')
      if (!res.ok) throw new Error(`Spotify /search(album) ${res.status}: ${text}`)
      try {
        return JSON.parse(text)
      } catch {
        return { albums: { items: [] } }
      }
    })
  )

  const items = results.flatMap((r: any) => r?.albums?.items || [])
  const seen = new Set<string>()
  const deduped = []
  for (const a of items) {
    if (!a?.id || seen.has(a.id)) continue
    if (!a?.images?.length) continue
    seen.add(a.id)
    deduped.push(a)
  }
  return deduped
}



export async function GET(request: Request) {
  try {
        const { searchParams } = new URL(request.url)
        const mood = (searchParams.get('mood') || '').toLowerCase().trim()
        const q = (searchParams.get('q') || '').trim()

        const kindParam = (searchParams.get('kind') || 'track').toLowerCase().trim()
        const kind: 'track' | 'album' = kindParam === 'album' ? 'album' : 'track'

        const sectionKey = (searchParams.get('section') || '').trim() || null

        if (!mood || !MOOD_PROFILES[mood]) {
          return NextResponse.json(
            { error: 'Invalid or unsupported mood', detail: { mood } },
            { status: 400 }
          )
        }

        const token = await getSpotifyToken()

        const query = buildQuery(mood, q, sectionKey, kind)



    if (!query) {
      return NextResponse.json(
        { error: 'Failed to build search query', detail: { mood, q } },
        { status: 400 }
      )
    }

    // More candidates when searching; your client can re-rank & slice to 4
    const pages = q ? 2 : 1

    if (kind === 'album') {
      const items = await searchSpotifyAlbums(token, query, pages)

      const mapped = items.map((a: any) => ({
        id: a.id,
        name: a.name,
        artist: (a.artists || []).map((x: any) => x?.name).filter(Boolean).join(', '),
        albumArt: a.images?.[0]?.url || '/images/music-placeholder.jpg',
        external_url: a.external_urls?.spotify || '',
      }))

      const albums = shuffle(mapped).slice(0, 12)

      return NextResponse.json({
        mood,
        q: q || null,
        kind: 'album',
        queryUsed: query,
        albums,
        message: `Found ${albums.length} albums for mood "${mood}"`,
      })
    }

    const items = await searchSpotifyTracks(token, query, pages)

    const mapped = items.map((t: any) => ({
      id: t.id,
      name: t.name,
      artist: (t.artists || []).map((a: any) => a?.name).filter(Boolean).join(', '),
      album: t.album?.name || '',
      albumArt: t.album?.images?.[0]?.url || '/images/music-placeholder.jpg',
      preview_url: t.preview_url || null,
      external_url: t.external_urls?.spotify || '',
    }))

    const OUT = q ? 40 : 24
    const tracks = shuffle(mapped).slice(0, OUT)

    return NextResponse.json({
      mood,
      q: q || null,
      kind: 'track',
      queryUsed: query,
      tracks,
      message: `Found ${tracks.length} tracks for mood "${mood}"`,
    })

  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to fetch music recommendations', detail: err?.message || String(err) },
      { status: 500 }
    )
  }
}
