// src/lib/socket-server.js
const { Server } = require('socket.io')

let io

// This function initializes our WebSocket server
function initSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "http://localhost:9513",
        methods: ["GET", "POST"]
      }
    })

    // When a user connects to our WebSocket server
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // When user joins a specific stream chat room
      socket.on('join-stream', (data) => {
        const { streamId, username } = data
        socket.join(streamId)
        socket.username = username
        
        // Tell everyone in this room that someone joined
        socket.to(streamId).emit('user-joined', {
          message: `${username} joined the chat`,
          type: 'system'
        })
        
        console.log(`${username} joined stream: ${streamId}`)
      })

      // When user sends a chat message
      socket.on('send-message', (data) => {
        const { streamId, message, username } = data
        
        // Send message to everyone in this specific stream room
        io.to(streamId).emit('new-message', {
          message: message,
          username: username,
          timestamp: new Date(),
          type: 'user'
        })
        
        console.log(`Message in ${streamId} by ${username}: ${message}`)
      })

      // When user leaves/disconnects
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
  }
  
  return io
}

module.exports = { initSocket }