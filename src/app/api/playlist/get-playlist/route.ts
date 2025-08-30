import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request){

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userid')
    const playlistType = searchParams.get('type')

    if (userId){
        const playlists = await prisma.Playlist.findMany({
        where: { userId: userId,
            type: playlistType
         }
        });
    
    console.log(playlists)
    return NextResponse.json(playlists)
        
    }
    



    return NextResponse.json("error")
}