import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request){
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const type = searchParams.get('type')

        if (!userId || !type) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        // Find the user's default favorites playlist for this type
        const favoritesPlaylist = await prisma.playlist.findFirst({
            where: {
                userId: userId,
                type: type,
                isDefault: true,
                name: "Favorites"
            }
        })

        if (!favoritesPlaylist) {
            return NextResponse.json({ isFavorited: false })
        }

        console.log(favoritesPlaylist.id)
        return NextResponse.json({ 
            playlistId: favoritesPlaylist.id 
        })
    } catch (error) {
        console.error("Error checking favorite status:", error)
        return NextResponse.json({ error: "Failed to check favorite status" }, { status: 500 })
    }
}