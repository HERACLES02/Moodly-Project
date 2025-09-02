const { Server } = require('socket.io')
const { getSyncManager } = require('./simple-sync-manager')

let io

function initSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "http://localhost:9513",
        methods: ["GET", "POST"]
      }
    })

    const syncManager = getSyncManager()

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Join live sync session
      socket.on('join-sync-session', async (data) => {
        const { streamId, username, mood } = data
        socket.join(streamId)
        socket.username = username
        socket.mood = mood
        
        // Initialize session if it's the first viewer
        if (!syncManager.isActive) {
          await syncManager.initializeQueue(mood)
          syncManager.startSession(mood)
        }
        
        // Add viewer and get current session info
        const sessionInfo = syncManager.addViewer(socket.id, username, mood)
        
        // Send current session to new viewer
        socket.emit('session-sync', sessionInfo)
        
        // Notify others
        socket.to(streamId).emit('user-joined', {
          message: `${username} joined the watch party`,
          type: 'system',
          timestamp: new Date()
        })
        
        // Update viewer count for everyone
        io.to(streamId).emit('viewer-count-update', {
          count: syncManager.viewers.size
        })
        
        console.log(`📺 ${username} joined sync session: ${streamId}`)
      })

      // Handle chat messages (your existing chat system)
      socket.on('send-message', (data) => {
        const { streamId, message, username } = data
        
        io.to(streamId).emit('new-message', {
          message: message,
          username: username,
          timestamp: new Date(),
          type: 'user'
        })
        
        console.log(`💬 Message in ${streamId} by ${username}: ${message}`)
      })

      // Request current session info
      socket.on('get-session-info', () => {
        const sessionInfo = syncManager.getCurrentSessionInfo()
        socket.emit('session-sync', sessionInfo)
      })

      // Admin controls
      socket.on('admin-skip-movie', (data) => {
        const { streamId } = data
        // TODO: Add admin verification here
        
        const newSessionInfo = syncManager.skipToNextMovie()
        io.to(streamId).emit('movie-changed', newSessionInfo)
        
        console.log('🔧 Admin skipped movie')
      })

      socket.on('admin-change-duration', (data) => {
        const { duration, streamId } = data
        // TODO: Add admin verification here
        
        syncManager.changeMovieDuration(duration)
        io.to(streamId).emit('duration-changed', { newDuration: duration })
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        syncManager.removeViewer(socket.id)
        
        if (socket.username) {
          socket.broadcast.emit('viewer-count-update', {
            count: syncManager.viewers.size
          })
        }
        
        console.log('User disconnected:', socket.id)
      })
    })

    // Auto-broadcast movie changes to all connected clients
    setInterval(() => {
      const sessionInfo = syncManager.getCurrentSessionInfo()
      if (sessionInfo && syncManager.viewers.size > 0) {
        // Check if movie should change (fallback in case timer fails)
        const now = Date.now()
        if (sessionInfo.remainingTime <= 0) {
          const newSessionInfo = syncManager.switchToNextMovie()
          io.emit('movie-changed', newSessionInfo)
        }
      }
    }, 10000) // Check every 10 seconds

    console.log('🔌 Socket.IO server initialized with sync support')
  }
  
  return io
}

module.exports = { initSocket }