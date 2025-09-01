
const { Server } = require('socket.io')

let io


function initSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "http://localhost:9513",
        methods: ["GET", "POST"]
      }
    })

    
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)


      socket.on('join-stream', (data) => {
        const { streamId, username } = data
        socket.join(streamId)
        socket.username = username
        
  
        socket.to(streamId).emit('user-joined', {
          message: `${username} joined the chat`,
          type: 'system'
        })
        
        console.log(`${username} joined stream: ${streamId}`)
      })


      socket.on('send-message', (data) => {
        const { streamId, message, username } = data
        

        io.to(streamId).emit('new-message', {
          message: message,
          username: username,
          timestamp: new Date(),
          type: 'user'
        })
        
        console.log(`Message in ${streamId} by ${username}: ${message}`)
      })


      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })
  }
  
  return io
}

module.exports = { initSocket }