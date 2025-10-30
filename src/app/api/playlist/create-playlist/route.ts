import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request){
    
    const { userid, name, type} = await request.json()
    
    const playlist = await prisma.playlist.create({
      data: {
        name: name,
        type: type,
        userId: userid,
      },
    });

    return NextResponse.json({ success: true, playlist }, { status: 201 });
}