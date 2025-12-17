import type * as Party from "partykit/server"
import { getRandomIndex, movieQueue } from "./catvideos"

export interface VideoState {
  name: string
  videoUrl: string | null
  starttime: number
  duration: number
}

export default class Server implements Party.Server {
  videoState: VideoState | null = null
  videoTimer: ReturnType<typeof setTimeout> | null = null

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    if (!this.videoState) {
      this.startNewVideo()
    } else {
      console.log("video already started")
    }

    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    )
    console.log("Current Video Time " + this.videoState?.starttime)

    // let's send a message to the connection
    conn.send(JSON.stringify(this.videoState))
  }

  onMessage(message: string, sender: Party.Connection) {
    if (message == "videoend") {
      // const idx: number = getRandomIndex(movieQueue)
      // this.videoState = {
      //   name: movieQueue[idx].name,
      //   videoUrl: movieQueue[idx].url,
      //   starttime: Date.now(),
      //   duration: movieQueue[idx].duration,
      // }
      // this.room.broadcast(
      //   JSON.stringify({
      //     data: this.videoState,
      //     type: "video-change",
      //   }),
      //   [],
      // )
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
    // let's log the message
  }
  private startNewVideo() {
    const idx: number = getRandomIndex(movieQueue)
    this.videoState = {
      name: movieQueue[idx].name,
      videoUrl: movieQueue[idx].url,
      starttime: Date.now(),
      duration: movieQueue[idx].duration,
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

Server satisfies Party.Worker
