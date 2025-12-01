import { NextResponse } from "next/server"

// TMDB Genres reference:
// 28 Action, 12 Adventure, 16 Animation, 35 Comedy, 80 Crime, 99 Documentary,
// 18 Drama, 10751 Family, 14 Fantasy, 36 History, 27 Horror, 10402 Music,
// 9648 Mystery, 10749 Romance, 878 Science Fiction, 53 Thriller, 10752 War

type Target =
  | "balanced"
  | "peaceful"
  | "flow"
  | "motivated"
  | "joyful"
  | "rested"
  | "connected"

const MOOD_RULES: Record<
  string,
  {
    target: Target
    genreCombos: number[][] // each request picks one combo at random
    withoutGenres?: number[] // hard avoid via TMDB query
  }
> = {
  happy: {
    target: "balanced",
    genreCombos: [
      [35, 12], // Comedy + Adventure
      [35, 10749], // Comedy + Romance
      [16, 10751], // Animation + Family
      [35, 10402], // Comedy + Music
    ],
    withoutGenres: [27, 53], // avoid Horror/Thriller
  },

  calm: {
    target: "peaceful",
    genreCombos: [
      [99, 12], // Documentary + Adventure (nature/travel)
      [99, 18], // Documentary + Drama (gentle stories)
      [16, 10751], // Animation + Family (soft tone)
      [10402, 18], // Music + Drama
    ],
    withoutGenres: [27, 53], // avoid high arousal
  },

  energetic: {
    target: "flow",
    genreCombos: [
      [28, 12], // Action + Adventure
      [80, 53], // Crime + Thriller (heist/strategy)
      [18, 99], // Drama + Documentary (sports/entrepreneurship)
      [36, 18], // History + Drama (greatness arcs)
    ],
    withoutGenres: [27], // avoid Horror
  },

  anxious: {
    target: "peaceful",
    genreCombos: [
      [99, 12],
      [99, 18],
      [16, 10751],
      [10402, 18],
    ],
    withoutGenres: [27, 53],
  },

  sad: {
    target: "motivated",
    genreCombos: [
      [18, 36], // Drama + History (biopics)
      [18, 10751], // Drama + Family (heartwarming)
      [12, 18], // Adventure + Drama (overcoming)
      [18, 99], // Drama + Documentary (true stories)
    ],
    withoutGenres: [27, 10752], // avoid Horror/War
  },

  excited: {
    target: "joyful",
    genreCombos: [
      [12, 35], // Adventure + Comedy
      [35, 10402], // Comedy + Music
      [16, 12], // Animation + Adventure
      [35, 10751], // Comedy + Family
    ],
    withoutGenres: [27], // keep it light
  },

  tired: {
    target: "rested",
    genreCombos: [
      [99, 18], // gentle docs/drama
      [16, 10751], // soft animation/family
      [10402, 10749], // Music + Romance
      [99, 36], // soothing historical docs
    ],
    withoutGenres: [27, 53], // skip intense content
  },

  grateful: {
    target: "connected",
    genreCombos: [
      [18, 10751], // Drama + Family (gratitude themes)
      [10749, 35], // Romance + Comedy (warmth)
      [18, 99], // Drama + Documentary (human stories)
      [36, 18], // History + Drama (appreciation/perspective)
    ],
    withoutGenres: [27],
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

function canonicalizeMood(input: string) {
  return input.toLowerCase().trim().replace(/\s+/g, "_")
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mood = canonicalizeMood(searchParams.get("mood") || "")
    const rules = MOOD_RULES[mood]
    if (!mood || !rules) {
      return NextResponse.json(
        { error: "Invalid or unsupported mood" },
        { status: 400 },
      )
    }

    const apiKey = process.env.TMDB_API_KEY
    if (!apiKey)
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      )

    const combo =
      rules.genreCombos[Math.floor(Math.random() * rules.genreCombos.length)]
    const withGenres = combo.join(",")
    const withoutGenres = rules.withoutGenres?.join(",")

    const randomPage = Math.floor(Math.random() * 5) + 1

    const url = new URL("https://api.themoviedb.org/3/discover/movie")
    url.searchParams.set("api_key", apiKey)
    url.searchParams.set("with_genres", withGenres)
    if (withoutGenres && withoutGenres.length > 0) {
      url.searchParams.set("without_genres", withoutGenres)
    }
    url.searchParams.set("sort_by", "popularity.desc")
    url.searchParams.set("vote_average.gte", "6.5")
    url.searchParams.set("vote_count.gte", "100")
    url.searchParams.set("include_adult", "false")

    url.searchParams.set("page", "1")

    console.log("Checking URL" + url)
    const response = await fetch(url.toString())
    if (!response.ok) throw new Error(`TMDB ${response.status}`)

    const data = await response.json()
    const valid = (data.results || []).filter((m: any) => m?.poster_path)
    const movies = shuffleArray(valid).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "/images/movie-placeholder.jpg",
      overview: movie.overview,
      releaseDate: movie.release_date,
      rating: movie.vote_average,
    }))
    console.log("checking movie length")
    console.log("Got Movies: " + movies.length)

    return NextResponse.json({
      mood,
      target: rules.target,
      movies,
      message: `Found ${movies.length} ${rules.target} movie recommendations for "${mood}"`,
      meta: { withGenres, withoutGenres: withoutGenres || null },
    })
  } catch (err) {
    console.error("TMDB API Error:", err)
    return NextResponse.json(
      { error: "Failed to fetch movie recommendations" },
      { status: 500 },
    )
  }
}
