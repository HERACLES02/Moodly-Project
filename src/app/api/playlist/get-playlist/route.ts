import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request){

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userid')

    if (userId){
        const playlists = await prisma.Playlist.findMany({
        where: { userId: userId }
        });
    
    console.log(playlists)
    return NextResponse.json(playlists)
        
    }
    



    return NextResponse.json("error")
}