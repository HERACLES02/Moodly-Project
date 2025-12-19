import { inngest } from "@/inngest/client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { playlistId, itemId, itemName } = await request.json()

    // Validate required fields
    if (!playlistId || !itemId) {
      return NextResponse.json(
        { error: "Missing required fields: playlistId, itemId" },
        { status: 400 },
      )
    }

    // Queue the add-to-playlist operation to Inngest
    // User gets immediate response (toast shows "Added!"), DB write happens in background
    await inngest.send({
      name: "add-to-playlist-trigger",
      data: {
        playlistId: playlistId,
        itemId: itemId,
        itemName: itemName || `Item ${itemId}`,
      },
    })

    // Return success immediately - user doesn't wait for DB write
    return NextResponse.json(
      {
        success: true,
        message: "Item addition queued successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Error adding to playlist:", error)
    return NextResponse.json(
      { error: "Failed to add to playlist" },
      { status: 500 },
    )
  }
}
