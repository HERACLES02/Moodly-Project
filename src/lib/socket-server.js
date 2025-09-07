const { Server } = require('socket.io')
const { getSyncManager } = require('./movie-sync-manager')
const { getSongSyncManager } = require('./song-sync-manager')

let io

function initSocket(server) {
  if (!io) {
    io = new Server(server, {
      cors: {
        origin: "http://localhost:9513",
        methods: ["GET", "POST"]
      }
    })

    // Callback function to handle movie changes
    const handleMovieChanged = (mood, sessionInfo) => {
      console.log(`📢 Broadcasting movie change for ${mood} mood: ${sessionInfo.currentMovie.title}`)
      io.to(`${mood}-sync-session`).emit('movie-changed', {
        ...sessionInfo,
        syncData: {
          elapsedSeconds: 0,
          shouldForceReload: false,
          timestamp: Date.now()
        }
      })
    }

    io.on('connection', (socket) => {
      console.log('🔌 User connected:', socket.id)

      // Handle sync session joining (for movie streams)
      socket.on('join-sync-session', async (data) => {
        const { streamId, username, mood } = data
        socket.join(streamId)
        socket.username = username
        socket.mood = mood
        socket.streamId = streamId
        socket.sessionType = 'movie'
        
        console.log(`${username} joining ${mood} sync session: ${streamId}`)
        
        try {
          // Get the sync manager for this specific mood with callback
          const moodSyncManager = getSyncManager(mood, handleMovieChanged)
          
          // Initialize session if it's the first viewer for this mood
          if (!moodSyncManager.isActive) {
            console.log(`Initializing new ${mood} session...`)
            const initSuccess = await moodSyncManager.initializeQueue()
            if (initSuccess) {
              moodSyncManager.startSession()
              console.log(`${mood} session started successfully`)
            } else {
              console.log(`Failed to start ${mood} session`)
              socket.emit('session-error', { message: `Failed to start ${mood} session` })
              return
            }
          }
          
          // Add viewer and get current session info
          const sessionInfo = moodSyncManager.addViewer(socket.id, username, mood)
          
          if (sessionInfo) {
            // FIXED: Only send session-sync to the NEW user, not everyone
            socket.emit('session-sync', sessionInfo)
            
            // Send a confirmation message specifically for chat
            socket.emit('chat-ready', { 
              message: 'Chat connected successfully',
              streamId: streamId
            })
            
            // FIXED: Send user-joined message only to OTHER users, not the new user
            socket.to(streamId).emit('user-joined', {
              message: `${username} joined the ${mood} watch party`,
              type: 'system',
              timestamp: new Date()
            })
            
            // FIXED: Send viewer count update to ALL users separately
            io.to(streamId).emit('viewer-count-update', {
              count: moodSyncManager.viewers.size
            })
            
            console.log(`${username} successfully joined ${mood} stream. Session info sent.`)
          } else {
            socket.emit('session-error', { message: `No active ${mood} session` })
          }
          
        } catch (error) {
          console.error(`Error joining ${mood} sync session:`, error)
          socket.emit('session-error', { message: `Failed to join ${mood} session` })
        }
      })

      socket.on('join-radio-session', async (data) => {
        const { streamId, username, mood } = data
        socket.join(streamId)
        socket.username = username
        socket.mood = mood
        socket.streamId = streamId
        socket.sessionType = 'radio'
        
        console.log(`${username} joining ${mood} radio session: ${streamId}`)
        
        try {
          // Get the song sync manager for this specific mood
          const radioSyncManager = getSongSyncManager(mood)
          
          // Initialize session if it's the first listener for this mood
          if (!radioSyncManager.isActive) {
            console.log(`🎵 Initializing new ${mood} radio session...`)
            const initSuccess = await radioSyncManager.initializeQueue()
            if (initSuccess) {
              radioSyncManager.startSession()
              console.log(`${mood} radio session started successfully`)
            } else {
              console.log(`Failed to start ${mood} radio session`)
              socket.emit('radio-session-error', { message: `Failed to start ${mood} radio session` })
              return
            }
          }
          
          // Add listener and get current session info
          const sessionInfo = radioSyncManager.addListener(socket.id, username, mood)
          
          if (sessionInfo) {
            // Send current radio session to new listener only
            socket.emit('radio-session-sync', sessionInfo)
            
            // Update listener count for everyone in this radio stream
            io.to(streamId).emit('listener-count-update', {
              count: radioSyncManager.listeners.size
            })
            
            console.log(`${username} successfully joined ${mood} radio`)
          } else {
            socket.emit('radio-session-error', { message: `No active ${mood} radio session` })
          }
          
        } catch (error) {
          console.error(`Error joining ${mood} radio session:`, error)
          socket.emit('radio-session-error', { message: `Failed to join ${mood} radio session` })
        }
      })

      // Handle chat messages for both movie and radio
      socket.on('send-message', (data) => {
        const { streamId, message, username } = data
        
        console.log(`Message in ${streamId} by ${username}: ${message}`)
        
        // Broadcast message to all users in the same stream
        io.to(streamId).emit('new-message', {
          message: message,
          username: username,
          timestamp: new Date(),
          type: 'user'
        })
      })

      // FIXED: Handle session info requests without affecting others
      socket.on('get-session-info', () => {
        if (socket.mood && socket.sessionType === 'movie') {
          const moodSyncManager = getSyncManager(socket.mood)
          const sessionInfo = moodSyncManager.getCurrentSessionInfo()
          if (sessionInfo) {
            // FIXED: Only send to the requesting user
            socket.emit('session-sync', sessionInfo)
            console.log(`${socket.mood} session info refreshed for user:`, socket.id)
          } else {
            socket.emit('session-error', { message: `No active ${socket.mood} session` })
          }
        }
      })

      // Handle requests for current radio session info
      socket.on('get-radio-info', () => {
        if (socket.mood && socket.sessionType === 'radio') {
          const radioSyncManager = getSongSyncManager(socket.mood)
          const sessionInfo = radioSyncManager.getCurrentSessionInfo()
          if (sessionInfo) {
            socket.emit('radio-session-sync', sessionInfo)
            console.log(`${socket.mood} radio info refreshed for user:`, socket.id)
          } else {
            socket.emit('radio-session-error', { message: `No active ${socket.mood} radio session` })
          }
        }
      })

      // Handle user disconnection
      socket.on('disconnect', () => {
        if (socket.username && socket.streamId && socket.mood) {
          if (socket.sessionType === 'radio') {
            // Handle radio session disconnection
            const radioSyncManager = getSongSyncManager(socket.mood)
            radioSyncManager.removeListener(socket.id)
            
            // Update listener count for remaining users in this radio
            io.to(socket.streamId).emit('listener-count-update', {
              count: radioSyncManager.listeners.size
            })
            
            console.log(`${socket.username} disconnected from ${socket.mood} radio`)
          } else {
            // Handle movie session disconnection
            const moodSyncManager = getSyncManager(socket.mood)
            moodSyncManager.removeViewer(socket.id)
            
            // FIXED: Only send viewer count update, not session-sync
            io.to(socket.streamId).emit('viewer-count-update', {
              count: moodSyncManager.viewers.size
            })
            
            console.log(`${socket.username} disconnected from ${socket.mood} movie stream`)
          }
        } else {
          console.log('User disconnected:', socket.id)
        }
      })
    })

    // Radio song switching (keep existing radio logic)
    setInterval(() => {
      ['happy', 'sad'].forEach(mood => {
        // Check radio streams only (movies now use callback system)
        const radioManager = getSongSyncManager(mood)
        const radioSessionInfo = radioManager.getCurrentSessionInfo()
        if (radioSessionInfo && radioManager.listeners.size > 0) {
          if (radioSessionInfo.remainingTime <= 0) {
            console.log(`${mood} radio: Song time expired, switching...`)
            const newSessionInfo = radioManager.switchToNextSong()
            io.to(`${mood}-radio-session`).emit('song-changed', newSessionInfo)
          }
        }
      })
    }, 1000)

    console.log('Socket.IO server initialized with sync support')
    console.log('Live stream synchronization ready')
    console.log('Radio synchronization ready')
    console.log('Real-time chat ready')
  }
  
  return io
}

module.exports = { initSocket }