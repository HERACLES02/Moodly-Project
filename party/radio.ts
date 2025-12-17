import type * as Party from "partykit/server"
import { getRandomIndex, sadSongQueue, happySongQueue } from "./catvideos"

export interface SongState {
  name: string
  audioUrl: string | null
  starttime: number
  duration: number
}

export default class RadioServer implements Party.Server {
  songState: SongState | null = null
  songTimer: ReturnType<typeof setTimeout> | null = null
  currentMood: string = ""

  constructor(readonly room: Party.Room) {
    // Extract mood from room ID (e.g., "happy-radio" -> "happy")
    this.currentMood = room.id.replace("-radio", "")
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // Start first song if not already playing
    if (!this.songState) {
      this.startNewSong()
    }

    console.log(
      `Connected to ${this.currentMood} radio:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    )
    console.log(`Current Song Time: ${this.songState?.starttime}`)

    // Send current song state to new connection
    conn.send(JSON.stringify(this.songState))
  }

  onMessage(message: string, sender: Party.Connection) {
    if (message === "songend") {
      // Client notified that song ended - switch to next
      // Note: This is backup, server timer should handle it
      console.log(`${this.currentMood} radio: Client reported song end`)
    } else {
      const data = JSON.parse(message)
      console.log(data)

      console.log(`connection ${sender.id} sent message: ${data.message}`)
      // Broadcast chat messages to all except sender
      this.room.broadcast(
        JSON.stringify({
          id: `${sender.id}`,
          data: data.message,
          userData: data,
          type: "message",
        }),
        [sender.id],
      )
    }
  }

  private startNewSong() {
    // Get appropriate song queue based on mood
    const songQueue =
      this.currentMood === "happy" ? happySongQueue : sadSongQueue

    const idx: number = getRandomIndex(songQueue)
    this.songState = {
      name: songQueue[idx].name,
      audioUrl: songQueue[idx].url,
      starttime: Date.now(),
      duration: songQueue[idx].duration,
    }

    // Clear any existing timer
    if (this.songTimer) {
      clearTimeout(this.songTimer)
    }

    // Schedule next song (duration in seconds, convert to ms + 100ms buffer)
    const timeoutDuration: number = this.songState.duration * 1000 + 100

    this.songTimer = setTimeout(() => {
      this.startNewSong()
      // Broadcast song change to all connected clients
      this.room.broadcast(
        JSON.stringify({
          data: this.songState,
          type: "song-change",
        }),
        [],
      )
    }, timeoutDuration)

    console.log(
      `${this.currentMood} radio: Now playing "${this.songState.name}" (${this.songState.duration}s)`,
    )
  }
}

RadioServer satisfies Party.Worker
