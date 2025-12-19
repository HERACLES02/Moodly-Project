import { NextResponse } from "next/server"

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error("Spotify credentials not configured")
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
    },
    body: "grant_type=client_credentials",
  })

  if (!response.ok) throw new Error("Failed to get Spotify token")
  const data = await response.json()
  return data.access_token
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    const accessToken = await getSpotifyToken()

    const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) throw new Error("Failed to search Spotify track")

    const song = await response.json()

    // ✅ OPTIMIZATION: Cache song data (song metadata doesn't change)
    return NextResponse.json(song, {
      headers: {
        // Cache for 1 week (song metadata rarely changes)
        "Cache-Control":
          "public, s-maxage=604800, stale-while-revalidate=2592000",
      },
    })
  } catch (err) {
    console.error("Spotify API Error:", err)
    return NextResponse.json(
      { error: "Failed to fetch music recommendations" },
      { status: 500 },
    )
  }
}
