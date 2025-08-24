import { NextResponse } from 'next/server'

// Mood → TMDB genre mapping
const moodToGenres: Record<string, number[]> = {
  happy: [35, 12, 16], // Comedy, Adventure, Animation
  sad: [14, 10749]     // Drama, Romance
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const moodRaw = searchParams.get('mood') || ''
    const mood = moodRaw.toLowerCase()

    if (!mood || !moodToGenres[mood]) {
      return NextResponse.json({ error: 'Invalid or unsupported mood' }, { status: 400 })
    }

    const apiKey = process.env.TMDB_API_KEY
    if (!apiKey) {
      console.error('TMDB API key not found')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const genres = moodToGenres[mood]
    const genreString = genres.join(',')

    const randomPage = Math.floor(Math.random() * 5) + 1 

    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreString}&sort_by=popularity.desc&vote_average.gte=6&language=en-US&page=${randomPage}`
    )

    if (!response.ok) throw new Error('Failed to fetch from TMDB')

    const data = await response.json()

    const validMovies = data.results.filter((movie: any) => movie.poster_path)
    const shuffledMovies = shuffleArray(validMovies)



    const movies = shuffledMovies.slice(0, 4).map((movie: any) => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '/images/movie-placeholder.jpg',
      overview: movie.overview,
      releaseDate: movie.release_date,
      rating: movie.vote_average
    }))

    return NextResponse.json({ 
      mood,
      movies,
      message: `Found ${movies.length} movie recommendations for ${mood} mood`
    })

  } catch (err) {
    console.error('TMDB API Error:', err)
    return NextResponse.json({ error: 'Failed to fetch movie recommendations' }, { status: 500 })
  }
}
