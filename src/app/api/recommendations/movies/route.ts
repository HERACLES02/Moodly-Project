import { NextResponse } from "next/server"

// Mood → TMDB genre mapping
// Mood → TMDB genre mapping (more complex, same structure)
const moodToGenres: Record<string, number[]> = {
  happy: [
    35, // Comedy (core happy)
    12, // Adventure (fun / energetic)
    10751, // Family (cozy / wholesome)
    10749, // Romance (light feel-good)
    18, // Drama (slice-of-life)
    16, // Animation (comfort, occasional)
  ],

  sad: [
    18, // Drama (core sad)
    10749, // Romance (heartbreak)
    36, // History (reflective / melancholic)
    10402, // Music (emotional)
    35, // Comedy (bittersweet coping)
  ],
}

// Genre weights (higher = more frequent)
// Genre weights (higher = more frequent)
const genreWeights: Record<number, number> = {
  // HAPPY
  35: 4, // Comedy → main happy driver
  12: 3, // Adventure → fun
  10751: 3, // Family → cozy
  10749: 2, // Romance → warm
  18: 2, // Drama → slice-of-life
  16: 1, // Animation → rare comfort

  // SAD
  36: 2, // History → reflective
  10402: 2, // Music → emotional
}

// Pick one genre using weights
function pickWeightedGenre(genres: number[]): number {
  const pool: number[] = []

  for (const genre of genres) {
    const weight = genreWeights[genre] ?? 1
    for (let i = 0; i < weight; i++) {
      pool.push(genre)
    }
  }

  return pool[Math.floor(Math.random() * pool.length)]
}

// Shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moodRaw = searchParams.get("mood") || ""
    const mood = moodRaw.toLowerCase()

    if (!mood || !moodToGenres[mood]) {
      return NextResponse.json(
        { error: "Invalid or unsupported mood" },
        { status: 400 },
      )
    }

    const apiKey = process.env.TMDB_API_KEY
    if (!apiKey) {
      console.error("TMDB API key not found")
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 },
      )
    }

    // 🎯 Pick ONE weighted genre
    const genre = pickWeightedGenre(moodToGenres[mood])

    // Randomize page for variety
    const randomPage = Math.floor(Math.random() * 5) + 1

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie` +
        `?api_key=${apiKey}` +
        `&with_genres=${genre}` +
        `&sort_by=popularity.desc` +
        `&vote_average.gte=6` +
        `&language=en-US` +
        `&page=${randomPage}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from TMDB")
    }

    const data = await response.json()

    const validMovies = data.results.filter((movie: any) => movie.poster_path)

    const movies = shuffleArray(validMovies)
      .slice(0, 30)
      .map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        overview: movie.overview,
        releaseDate: movie.release_date,
        rating: movie.vote_average,
      }))

    return NextResponse.json({
      mood,
      genreUsed: genre, // helpful for debugging
      movies,
      message: `Found ${movies.length} movie recommendations for ${mood} mood`,
    })
  } catch (err) {
    console.error("TMDB API Error:", err)
    return NextResponse.json(
      { error: "Failed to fetch movie recommendations" },
      { status: 500 },
    )
  }
}
