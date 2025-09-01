import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request){
    try {
        const { playlistId, itemId } = await request.json()
        
        // Check if item already exists in this playlist
        const existingItem = await prisma.playlistItem.findFirst({
            where: {
                playlistId: playlistId,
                itemId: itemId
            }
        })
        
        if (existingItem) {
            return NextResponse.json({ message: "Item already in playlist" }, { status: 200 })
        }
        
        // For now, we'll save with a simple itemName - you can improve this later
        const playlistItem = await prisma.playlistItem.create({
            data: {
                itemId: itemId,
                playlistId: playlistId,
                itemName: `Item ${itemId}` // Simple name for now
            }
        })

        return NextResponse.json({ 
            success: true, 
            item: playlistItem,
            message: "Added to playlist successfully" 
        })
        
    } catch (error) {
        console.error('Error adding to playlist:', error)
        return NextResponse.json({ error: 'Failed to add to playlist' }, { status: 500 })
    }
}