import { addInteraction } from "@/lib/queries/interactions"
import { addToPlaylist, removeFromPlaylist } from "@/lib/queries/playlists"
import { logPointHistory } from "@/lib/queries/pointHistory"
import { checkAndAwardWeeklyBonus } from "@/lib/queries/weeklyBonus"
import { inngest } from "./client"

export const trackEvent = inngest.createFunction(
  { id: "track-event" }, //function name
  { event: "track-event-trigger" }, //trigger
  async ({ event, step }) => {
    const response = await addInteraction(event.data.data)

    return { message: response }
  },
)

/**
 * Adds an item to a playlist asynchronously
 * Triggered when user clicks "Add to Playlist"
 * User sees immediate toast notification, DB write happens in background
 */
export const addToPlaylistFunction = inngest.createFunction(
  { id: "add-to-playlist" },
  { event: "add-to-playlist-trigger" },
  async ({ event, step }) => {
    const { playlistId, itemId, itemName } = event.data

    const result = await addToPlaylist(playlistId, itemId, itemName)

    return result
  },
)

/**
 * Removes an item from a playlist asynchronously
 * Triggered when user removes an item from a playlist
 * User sees immediate feedback, DB deletion happens in background
 */
export const removeFromPlaylistFunction = inngest.createFunction(
  { id: "remove-from-playlist" },
  { event: "remove-from-playlist-trigger" },
  async ({ event, step }) => {
    const { playlistId, itemId } = event.data

    const result = await removeFromPlaylist(playlistId, itemId)

    return result
  },
)

/**
 * Logs point history asynchronously for audit trail and analytics
 * Triggered after user earns points (watch, listen, favorite, login bonus)
 * User sees points updated immediately, history is logged in background
 * Not critical for UX - just record keeping
 */
export const logPointHistoryFunction = inngest.createFunction(
  { id: "log-point-history" },
  { event: "log-point-history-trigger" },
  async ({ event, step }) => {
    const { userId, points, reason } = event.data

    const result = await logPointHistory(userId, points, reason)

    return { success: true, result }
  },
)

/**
 * Checks and awards weekly bonus asynchronously
 * Triggered after user earns points (watch/listen counts increment)
 * Complex eligibility checking doesn't block the main interaction
 * User gets notified when bonus is earned (separate from points update)
 */
export const checkWeeklyBonusFunction = inngest.createFunction(
  { id: "check-weekly-bonus" },
  { event: "check-weekly-bonus-trigger" },
  async ({ event, step }) => {
    const { userId } = event.data

    const result = await checkAndAwardWeeklyBonus(userId)

    return result
  },
)
