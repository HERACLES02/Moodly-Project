import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const playlistId = searchParams.get('id')
        
        if (!playlistId) {
            return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 })
        }

        // Get the playlist with all its items
        const playlist = await prisma.playlist.findUnique({
            where: { 
                id: playlistId 
            },
            include: {
                items: {
                    orderBy: {
                        addedAt: 'desc' // Show newest items first
                    }
                }
            }
        });

        if (!playlist) {
            return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
        }

        console.log(`Found playlist: ${playlist.name} with ${playlist.items.length} items`)
        
        return NextResponse.json(playlist)
        
    } catch (error) {
        console.error('Error fetching playlist:', error)
        return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 })
    }
}