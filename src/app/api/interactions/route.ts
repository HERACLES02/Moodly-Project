import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/auth"
import { inngest } from "@/inngest/client"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { type, itemId, itemName, mood } = body

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const interactionData = {
      userId: user.id,
      type,
      itemId: itemId.toString(),
      itemName,
      mood,
    }

    await inngest.send({
      name: "track-event-trigger",
      data: {
        data: interactionData,
      },
    })

    console.log(
      `Tracked: ${itemName} (${type}) clicked by user in ${mood} mood`,
    )

    return NextResponse.json({
      success: true,
      message: `Tracked ${type}: ${itemName}`,
    })
  } catch (error) {
    console.error("Error tracking interaction:", error)
    return NextResponse.json(
      { error: "Failed to track interaction" },
      { status: 500 },
    )
  }
}
