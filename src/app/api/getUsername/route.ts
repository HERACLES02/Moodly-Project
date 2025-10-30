import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'




export async function GET(req: Request) {
    const username = await prisma.user.findMany()
    return NextResponse.json(username.anonymousName)
}