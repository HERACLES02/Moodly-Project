import { serve } from "inngest/next"
import { inngest } from "../../../inngest/client"
import {
  trackEvent,
  addToPlaylistFunction,
  removeFromPlaylistFunction,
  logPointHistoryFunction,
  checkWeeklyBonusFunction,
} from "@/inngest/functions"

// Register all Inngest functions that should be served by this endpoint
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    trackEvent,
    addToPlaylistFunction,
    removeFromPlaylistFunction,
    logPointHistoryFunction,
    checkWeeklyBonusFunction,
    /* your functions will be passed here later! */
  ],
})
