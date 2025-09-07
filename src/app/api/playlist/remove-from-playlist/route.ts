import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request){
    try {
        const { playlistId, itemId } = await request.json()
        
        // Find the playlist item to remove
        const playlistItem = await prisma.playlistItem.findFirst({
            where: {
                playlistId: playlistId,
                itemId: itemId
            }
        })

        if (!playlistItem) {
            return NextResponse.json({ error: "Item not found in playlist" }, { status: 404 })
        }

        // Remove the item from the playlist
        await prisma.playlistItem.delete({
            where: {
                id: playlistItem.id
            }
        })

        return NextResponse.json({ success: true, message: "Item removed from playlist" })
    } catch (error) {
        console.error("Error removing from playlist:", error)
        return NextResponse.json({ error: "Failed to remove from playlist" }, { status: 500 })
    }
}