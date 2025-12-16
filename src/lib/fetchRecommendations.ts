// src/lib/fetchRecommendations.ts
// Server-side helper to fetch recommendations for initial page load

export interface Movie {
  id: number
  title: string
  poster: string
  overview: string
  releaseDate: string
  rating: number
}

export interface Track {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  preview_url: string | null
  external_url: string
}

export async function fetchRecommendations(mood?: string) {
  // Use default mood or provided mood
  const normalizedMood = (mood || "happy").toLowerCase()

  try {
    // Fetch movies
    const moviesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/recommendations/movies?mood=${normalizedMood}`,
      { cache: "no-store" },
    )

    const moviesData = await moviesResponse.json()
    const movies: Movie[] = moviesData.movies || []

    // Fetch songs
    const songsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/recommendations/songs?mood=${normalizedMood}`,
      { cache: "no-store" },
    )

    const songsData = await songsResponse.json()
    const songs: Track[] = songsData.tracks || []

    return {
      movies,
      songs,
    }
  } catch (error) {
    console.error("Error fetching recommendations:", error)
    return {
      movies: [],
      songs: [],
    }
  }
}
