import { getUserMood } from "./userActions"

interface fetchProps {
  moodprop?: string
}

export async function fetchRecommendations(moodprop?: fetchProps) {
  const mood = moodprop || (await getUserMood())
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL
  try {
    const [movieResponse, songResponse] = await Promise.all([
      fetch(`${baseURL}/api/recommendations/movies?mood=${mood}`),
      fetch(`${baseURL}/api/recommendations/songs?mood=${mood}`),
    ])

    if (!movieResponse.ok)
      throw new Error(`Failed to fetch movies: ${movieResponse.status}`)
    if (!songResponse.ok)
      throw new Error(`Failed to fetch songs ${songResponse.status}`)
    const movieData = await movieResponse.json()
    const songData = await songResponse.json()
    return {
      movies: movieData.movies,
      songs: songData.tracks,
    }
  } catch (error) {
    throw error
  }
}
