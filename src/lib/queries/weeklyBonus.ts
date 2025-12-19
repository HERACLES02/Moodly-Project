import prisma from "../prisma"
import { getWeekStart } from "./user"

/**
 * Checks if user has earned weekly bonus and awards it
 * Called by Inngest function asynchronously
 * This is a complex operation that doesn't need to block the main interaction
 */
export const checkAndAwardWeeklyBonus = async (
  userId: string,
): Promise<{
  bonusAwarded: boolean
  points?: number
  message?: string
}> => {
  const weekStart = getWeekStart(new Date())

  // Get current weekly activity
  const weeklyActivity = await prisma.weeklyActivity.findUnique({
    where: {
      userId_weekStart: {
        userId: userId,
        weekStart: weekStart,
      },
    },
  })

  // If no activity record or bonus already claimed, return
  if (!weeklyActivity || weeklyActivity.bonusClaimed) {
    return { bonusAwarded: false }
  }

  // Check if user met the challenge (3 movies AND 3 songs)
  if (weeklyActivity.moviesWatched >= 3 && weeklyActivity.songsListened >= 3) {
    const bonusPoints = 50

    // Award the bonus in a transaction
    await prisma.$transaction(async (tx) => {
      // Update user points
      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: bonusPoints } },
      })

      // Mark bonus as claimed
      await tx.weeklyActivity.update({
        where: { id: weeklyActivity.id },
        data: { bonusClaimed: true },
      })
    })

    return {
      bonusAwarded: true,
      points: bonusPoints,
      message: "Weekly challenge complete! +50 bonus points!",
    }
  }

  return { bonusAwarded: false }
}
