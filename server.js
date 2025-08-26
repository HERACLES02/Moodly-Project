// server.js (in project root)
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { initSocket } = require('./src/lib/socket-server.js')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 9513

// Create Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  // Create HTTP server
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  // Initialize WebSocket server
  initSocket(server)

  // Start the server
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log('> WebSocket server is also running')
  })
})