import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request){
    
    const { userid, name} = await request.json()
    
    const playlist = await prisma.Playlist.create({
      data: {
        name: name,
        type: "MOVIE",
        userId: userid,
      },
    });



    return NextResponse.json({ success: true, playlist }, { status: 201 });
}