import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { userid, name, type } = await request.json()

    // Validate required fields
    if (!userid || !name || !type) {
      return NextResponse.json(
        { error: "Missing required fields: userid, name, type" },
        { status: 400 },
      )
    }

    // Validate type is either SONG or MOVIE
    if (!["SONG", "MOVIE"].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "SONG" or "MOVIE"' },
        { status: 400 },
      )
    }

    // Create playlist synchronously and return data immediately
    // This is fast (~5-10ms) and user needs the ID immediately if they want to add items
    const playlist = await prisma.playlist.create({
      data: {
        name: name,
        type: type,
        userId: userid,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Playlist created successfully",
        playlist: {
          id: playlist.id,
          name: playlist.name,
          type: playlist.type,
          createdAt: playlist.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating playlist:", error)
    return NextResponse.json(
      { error: "Failed to create playlist" },
      { status: 500 },
    )
  }
}
