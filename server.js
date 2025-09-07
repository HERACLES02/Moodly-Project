const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initSocket } = require('./src/lib/socket-server')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 9513

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Initialize Socket.IO for synchronization
  initSocket(server)

  server.listen(port, () => {
    console.log(`🚀 Server running on http://${hostname}:${port}`)
    console.log(`📺 Synchronized watch parties available!`)
    console.log(`💬 Real-time chat enabled`)
  })
})