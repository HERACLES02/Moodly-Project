import { NextResponse } from "next/server"
import prisma from "../prisma"

interface InteractionData {
  userId: string
  type: string
  itemId: string
  itemName: string
  mood: string
}
export const addInteraction = async (interactionData: InteractionData) => {
  const interaction = await prisma.userInteraction.create({
    data: {
      userId: interactionData.userId,
      type: interactionData.type,
      itemId: interactionData.itemId,
      itemName: interactionData.itemName,
      mood: interactionData.mood,
    },
  })

  return NextResponse.json({
    success: true,
    message: "Interaction added successfully",
  })
}
