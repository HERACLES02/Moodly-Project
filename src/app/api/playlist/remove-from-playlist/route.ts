import { inngest } from "@/inngest/client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { playlistId, itemId } = await request.json()

    // Validate required fields
    if (!playlistId || !itemId) {
      return NextResponse.json(
        { error: "Missing required fields: playlistId, itemId" },
        { status: 400 },
      )
    }

    // Queue the remove-from-playlist operation to Inngest
    // User gets immediate response, DB deletion happens in background
    await inngest.send({
      name: "remove-from-playlist-trigger",
      data: {
        playlistId: playlistId,
        itemId: itemId,
      },
    })

    // Return success immediately - user doesn't wait for DB deletion
    return NextResponse.json(
      {
        success: true,
        message: "Item removal queued successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error removing from playlist:", error)
    return NextResponse.json(
      { error: "Failed to remove from playlist" },
      { status: 500 },
    )
  }
}
