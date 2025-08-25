import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request){
    
    const { playlistId, itemId } = await request.json()
    
    const movie = await prisma.PlaylistItem.create(
       { data: {
            itemId: itemId,
            playlistId: playlistId,
            itemName: ""
        }}
    )



    return NextResponse.json(itemId);
}