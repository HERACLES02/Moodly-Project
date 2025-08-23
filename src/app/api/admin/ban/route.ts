import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  const { userId } = await req.json()
  const user = await prisma.user.findUnique({ where: { id: userId } })
  
  const banStatus = !user?.isBanned 

  await prisma.user.update({
    where: { id: userId },
    data: { isBanned:banStatus}
  })
  
  if (banStatus){

    return NextResponse.json({ success: "User unbanned" })


  }else{

    return NextResponse.json({ success: "User banned" })

  }

}