// Socket configuration file
const SOCKET_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com'  
  : 'http://localhost:9513'

export { SOCKET_URL }