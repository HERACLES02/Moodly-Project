import { url } from "inspector"
import { NextResponse, NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  const API_KEY = process.env.TMDB_API_KEY
  console.log("HI")

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&include_image_language=en-US,null`,
    )

    const movieData = await response.json()
    console.log(movieData)

    // ✅ OPTIMIZATION: Cache movie data aggressively (movies don't change)
    return NextResponse.json(movieData, {
      headers: {
        // Cache for 1 week (movie metadata rarely changes)
        "Cache-Control":
          "public, s-maxage=604800, stale-while-revalidate=2592000",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get movie data" },
      { status: 500 },
    )
  }
}
