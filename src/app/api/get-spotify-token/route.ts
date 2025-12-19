// src/app/api/get-spotify-token/route.ts
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

export async function GET() {
  try {
    const accessToken = await getSpotifyToken()

    return NextResponse.json(
      { access_token: accessToken },
      {
        headers: {
          // Cache token for 50 minutes (Spotify tokens last 1 hour)
          "Cache-Control": "private, max-age=3000",
        },
      },
    )
  } catch (err) {
    console.error("Spotify Token API Error:", err)
    return NextResponse.json(
      { error: "Failed to fetch Spotify token" },
      { status: 500 },
    )
  }
}
