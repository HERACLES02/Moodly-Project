import { NextResponse } from "next/server"

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
    genreCombos: number[][]
    withoutGenres?: number[]
    sections?: {
      key: string
      title: string
      genreCombos: number[][]
      keywordCombos?: number[][]
      withoutGenres?: number[]
    }[]
  }
> = {
  happy: {
    target: "balanced",
    genreCombos: [
      [35, 12],
      [35, 10749],
      [16, 10751],
      [35, 10402],
    ],
    withoutGenres: [27, 53],

    sections: [
      {
        key: "mellow_dreams",
        title: "Mellow Dreams",
        genreCombos: [
          [16, 10751],
          [10402, 35],
        ],
        withoutGenres: [27, 53],
      },
      {
        key: "romanticism_galore",
        title: "Romanticism Galore",
        genreCombos: [
          [35, 10749],
          [10749, 10402],
        ],
        withoutGenres: [27, 53],
      },
      {
        key: "laugh_out_loud",
        title: "Laugh Out Loud",
        genreCombos: [[35], [35, 12]],
        withoutGenres: [27, 53],
      },
      {
        key: "sunlit_adventures",
        title: "Sunlit Adventures",
        genreCombos: [[12, 35], [12], [12, 10751]],
        withoutGenres: [27, 53, 80],
      },
      {
        key: "feel_good_classics",
        title: "Feel-Good Classics",
        genreCombos: [[35], [35, 10751], [18, 35]],
        keywordCombos: [],
        withoutGenres: [27, 53],
      },
    ],
  },

  calm: {
    target: "peaceful",
    genreCombos: [
      [99, 12],
      [99, 18],
      [16, 10751],
      [10402, 18],
    ],
    withoutGenres: [27, 53],
  },

  energetic: {
    target: "flow",
    genreCombos: [
      [28, 12],
      [80, 53],
      [18, 99],
      [36, 18],
    ],
    withoutGenres: [27],
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
    target: "balanced",
    genreCombos: [[18], [18, 10749], [18, 10402], [18, 9648]],
    withoutGenres: [27, 53, 16, 35, 10751, 12, 14],

    sections: [
      {
        key: "broken_hearts",
        title: "Broken Hearts",
        genreCombos: [
          [18, 10749],
          [10749, 18],
        ],
        keywordCombos: [[10048], [10703]],
        withoutGenres: [27, 53, 16, 35, 10751, 12, 14],
      },
      {
        key: "hard_truths",
        title: "Life's Hard Truths",
        genreCombos: [[18, 80], [18, 36], [18]],
        withoutGenres: [27, 53, 16, 35, 10751, 12, 14],
      },
      {
        key: "healing_through_pain",
        title: "Healing Through Pain",
        genreCombos: [[18, 10402], [18, 9648], [18]],
        withoutGenres: [27, 53, 16, 35, 10751, 12, 14],
      },
      {
        key: "shared_loneliness",
        title: "Shared Loneliness",
        genreCombos: [[18], [9648], [18, 9648], [18, 10402]],
        keywordCombos: [],
        withoutGenres: [27, 53, 16, 35, 10751, 12, 14],
      },
      {
        key: "bittersweet_memories",
        title: "Bittersweet Memories",
        genreCombos: [[18, 10749], [18, 10402], [18]],
        keywordCombos: [[278730, 4232, 10738]],
        withoutGenres: [27, 53, 16, 35, 10751, 12, 14],
      },
    ],
  },

  excited: {
    target: "joyful",
    genreCombos: [
      [12, 35],
      [35, 10402],
      [16, 12],
      [35, 10751],
    ],
    withoutGenres: [27],
  },

  tired: {
    target: "rested",
    genreCombos: [
      [99, 18],
      [16, 10751],
      [10402, 10749],
      [99, 36],
    ],
    withoutGenres: [27, 53],
  },

  grateful: {
    target: "connected",
    genreCombos: [
      [18, 10751],
      [10749, 35],
      [18, 99],
      [36, 18],
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

    const sectionKey = (searchParams.get("section") || "").trim()
    const section = rules.sections?.find((s) => s.key === sectionKey)

    const comboSource = section?.genreCombos ?? rules.genreCombos
    const combo = comboSource[Math.floor(Math.random() * comboSource.length)]
    const withGenres = combo.join(",")

    const without = section?.withoutGenres ?? rules.withoutGenres
    const withoutGenres = without?.join(",")

    const keywordSource = section?.keywordCombos
    const withKeywords =
      keywordSource && keywordSource.length > 0
        ? keywordSource[Math.floor(Math.random() * keywordSource.length)].join(
            "|",
          )
        : null

    const randomPage = Math.floor(Math.random() * 5) + 1

    const url = new URL("https://api.themoviedb.org/3/discover/movie")
    url.searchParams.set("api_key", apiKey)
    url.searchParams.set("with_genres", withGenres)
    if (withKeywords && withKeywords.length > 0) {
      url.searchParams.set("with_keywords", withKeywords)
    }
    if (withoutGenres && withoutGenres.length > 0) {
      url.searchParams.set("without_genres", withoutGenres)
    }
    url.searchParams.set("sort_by", "popularity.desc")
    url.searchParams.set("vote_average.gte", "6.0")
    url.searchParams.set("vote_count.gte", "90")
    url.searchParams.set("include_adult", "false")
    url.searchParams.set("page", "1")

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

    return NextResponse.json(
      {
        mood,
        target: rules.target,
        movies,
        message: `Found ${movies.length} ${rules.target} movie recommendations for "${mood}"`,
        meta: { withGenres, withoutGenres: withoutGenres || null },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
        },
      },
    )
  } catch (err) {
    console.error("TMDB API Error:", err)
    return NextResponse.json(
      { error: "Failed to fetch movie recommendations" },
      { status: 500 },
    )
  }
}
