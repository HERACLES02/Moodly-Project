import prisma from "../prisma"

/**
 * Logs a point history entry for audit trail and analytics
 * Called by Inngest function asynchronously
 * This is NOT critical for user experience - just for record keeping
 */
export const logPointHistory = async (
  userId: string,
  points: number,
  reason: string,
) => {
  const pointHistoryEntry = await prisma.pointHistory.create({
    data: {
      userId: userId,
      points: points,
      reason: reason,
    },
  })

  return pointHistoryEntry
}
