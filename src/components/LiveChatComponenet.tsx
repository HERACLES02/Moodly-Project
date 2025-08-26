'use client'
import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import './LiveChatComponent.css'

interface ChatMessage {
  message: string
  username: string
  timestamp: Date
  type: 'user' | 'system'
}

interface LiveChatComponentProps {
  streamId: string
  user: any
  mood: string
}

export function LiveChatComponent({ streamId, user, mood }: LiveChatComponentProps) {
    const userName = user?.anonymousName
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const newSocket = io('http://localhost:9513')

    newSocket.on('connect', () => {
      console.log('Connected to chat server')
      setIsConnected(true)
      
      newSocket.emit('join-stream', {
        streamId: streamId,
        username: userName
      })
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from chat server')
      setIsConnected(false)
    })

    newSocket.on('new-message', (messageData: ChatMessage) => {
      setMessages(prevMessages => [...prevMessages, messageData])
    })

    newSocket.on('user-joined', (messageData) => {
      setMessages(prevMessages => [...prevMessages, messageData])
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [streamId, userName])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || !socket || !isConnected) {
      return
    }

    socket.emit('send-message', {
      streamId: streamId,
      message: inputMessage.trim(),
      username: userName || 'Anonymous User'
    })

    setInputMessage('')
  }

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Live Chat</h3>
        <div className="connection-status">
          <span className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`}>●</span>
          <span className="connection-text">{isConnected ? 'Connected' : 'Connecting...'}</span>
        </div>
      </div>

      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="no-messages">
            Be the first to say something! 👋
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.type === 'system' ? (
                <span className="system-message-text">{msg.message}</span>
              ) : (
                <>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                  <span className="username">{msg.username}:</span>
                  <span className="message-text">{msg.message}</span>
                </>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-input-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={isConnected ? "Type your message..." : "Connecting..."}
          disabled={!isConnected}
          className="message-input"
          maxLength={200}
        />
        <button 
          type="submit" 
          disabled={!isConnected || !inputMessage.trim()}
          className="send-button"
        >
          Send
        </button>
      </form>
    </div>
  )
}