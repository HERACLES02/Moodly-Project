import type * as Party from "partykit/server"

interface VideoState {
  videoUrl: string
  starttime: number
  duration: number
}

export default class VideoRoom implements Party.Server {



  constructor(readonly room: Party.Room) {}
  onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
    // A websocket just connected!
    console.log(
      `Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
    )

    // let's send a message to the connection
    conn.send("hello from server")
  }
}
