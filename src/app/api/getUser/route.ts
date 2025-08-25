import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
    
  if (session?.user?.email){

    const user = await prisma.user.findUnique(
        {where : {email: session.user.email},
        select: {
        id: true,
        email: true,
        anonymousName: true,
        isBanned: true ,
        mood: true,
        note: true,
        isAdmin: true,
        }
    })
    if (!user?.isBanned){
    return NextResponse.json({
            id: user?.id,
            email: user?.email,
            anonymousName: user?.anonymousName,
            note: user?.note,
            mood: user?.mood,
            isAdmin: user?.isAdmin,

            
        })
    }
    else{
        return NextResponse.json("User Banned")
    }
    
    

  }else{
    NextResponse.json("Not Logged in")
  }
}