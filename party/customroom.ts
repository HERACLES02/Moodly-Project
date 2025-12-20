import type * as Party from "partykit/server"
import { getRandomIndex, allMovieQueue, allSongQueue } from "./catvideos"
import { SongState } from "./radio"
import { VideoState } from "."

export default class CustomServer implements Party.Server {
  videoState: VideoState | null = null
  videoTimer: ReturnType<typeof setTimeout> | null = null
  songState: SongState | null = null
  songTimer: ReturnType<typeof setTimeout> | null = null
  currentMood: string = ""
  type: string = ""
  queueLength: number = 0

  constructor(readonly room: Party.Room) {
    // Extract mood from room ID (e.g., "happy-radio" -> "happy")
    this.currentMood = room.id.includes("-happy") ? "happy" : "sad"
    this.type = room.id.includes("-customroom-video")
      ? "video"
      : room.id.includes("-customroom-radio")
        ? "radio"
        : ""
  }

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    //check if radio or video
    if (this.type === "radio") {
      // Start first song if not already playing
      if (!this.songState) {
        this.startNewSong()
      }
    } else {
      // Start first video if not already playing
      if (!this.videoState) {
        this.startNewVideo()
      }
    }
    // Start first song if not already playing

    console.log(
      `Connected to ${this.currentMood} radio:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    )

    // Send current song state to new connection
    conn.send(
      JSON.stringify(this.type === "radio" ? this.songState : this.videoState),
    )
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

    const idx: number = getRandomIndex(allSongQueue)
    this.songState = {
      name: allSongQueue[idx].name,
      audioUrl: allSongQueue[idx].url,
      starttime: Date.now(),
      duration: allSongQueue[idx].duration,
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
  private startNewVideo() {
    const idx: number = getRandomIndex(allMovieQueue)
    this.videoState = {
      name: allMovieQueue[idx].name,
      videoUrl: allMovieQueue[idx].url,
      starttime: Date.now(),
      duration: allMovieQueue[idx].duration,
    }

    if (this.videoTimer) {
      clearTimeout(this.videoTimer)
    }

    const timeoutDuration: number = this.videoState.duration * 1000 + 100

    this.videoTimer = setTimeout(() => {
      this.startNewVideo()
    }, timeoutDuration)
    this.room.broadcast(
      JSON.stringify({
        data: this.videoState,
        type: "video-change",
      }),

      [],
    )
  }
}

CustomServer satisfies Party.Worker
