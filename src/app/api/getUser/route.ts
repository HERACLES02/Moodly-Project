import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/auth'

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}


export async function GET() {
  const session = await auth()
   
  if (session?.user?.email) {
    const weekStart = getWeekStart(new Date());


    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        currentAvatar: true,  // This includes the avatar relation
        unlockedAvatars: {
          include: {
            avatar: {
            select: {
              id: true,
              name: true,
              imagePath: true
            }
          }
          }
        },
        weeklyActvities: {
          where: {
            weekStart}
        }
      }
    })
    const cleanedUser = {
  ...user,
  unlockedAvatars: user?.unlockedAvatars.map(ua => ua.avatar),
  weeklyActivities: user?.weeklyActvities[0]
}

    console.log(cleanedUser)
    

      return NextResponse.json(cleanedUser)
  } else {
    return NextResponse.json("Not Logged in")  // Added missing return
  }
}