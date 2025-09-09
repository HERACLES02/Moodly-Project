'use client'
import { useState, useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import ChatUserDisplay from './ChatUserDisplay'  // ADD THIS IMPORT
import './LiveChatComponent.css'
import { SOCKET_URL } from '@/lib/socket-config'

interface ChatMessage {
  message: string
  username: string
  userId?: string        // ADD THIS FIELD
  timestamp: Date
  type: 'user' | 'system'
}

interface LiveChatComponentProps {
  streamId: string
  user: any
  mood: string
  sharedSocket?: Socket | null
  isSocketConnected?: boolean
}

export function LiveChatComponent({ 
  streamId, 
  user, 
  mood, 
  sharedSocket, 
  isSocketConnected 
}: LiveChatComponentProps) {
  const userName = user?.anonymousName
  const userId = user?.id  // ADD THIS LINE
  const [socket, setSocket] = useState<Socket | null>(sharedSocket || null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(isSocketConnected || false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    setShowScrollButton(false)
  }

  // Check if user has scrolled up and show scroll button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50
    setShowScrollButton(!isAtBottom && messages.length > 0)
  }

  useEffect(() => {
    // If we have a shared socket, use it instead of creating a new one
    if (sharedSocket) {
      console.log('💬 Using shared socket for chat')
      setSocket(sharedSocket)
      setIsConnected(isSocketConnected || false)
      
      // Set up chat-specific event listeners on the shared socket
      const handleNewMessage = (messageData: ChatMessage) => {
        console.log('📩 New chat message received:', messageData)
        setMessages(prevMessages => [...prevMessages, messageData])
      }

      const handleUserJoined = (messageData: any) => {
        console.log('👋 User joined chat:', messageData)
        setMessages(prevMessages => [...prevMessages, messageData])
      }

      sharedSocket.on('new-message', handleNewMessage)
      // sharedSocket.on('user-joined', handleUserJoined)

      // Cleanup function to remove listeners
      return () => {
        sharedSocket.off('new-message', handleNewMessage)
        sharedSocket.off('user-joined', handleUserJoined)
      }
    } 
    // Only create a new socket if no shared socket is provided (fallback)
    else if (!socket) {
      console.log('💬 Creating standalone chat socket connection...')
      const newSocket = io(SOCKET_URL, {
        forceNew: false,
        transports: ['websocket', 'polling']
      })

      newSocket.on('connect', () => {
        console.log('💬 Standalone chat socket connected')
        setIsConnected(true)
        
        newSocket.emit('join-sync-session', {
          streamId: streamId,
          username: userName || 'Anonymous',
          userId: userId,  // ADD THIS LINE - send userId to server
          mood: mood
        })
      })

      newSocket.on('connect_error', (error) => {
        console.error('💬 Chat socket connection error:', error)
        setIsConnected(false)
      })

      newSocket.on('disconnect', () => {
        console.log('❌ Chat socket disconnected')
        setIsConnected(false)
      })

      newSocket.on('new-message', (messageData: ChatMessage) => {
        console.log('📩 New chat message received:', messageData)
        setMessages(prevMessages => [...prevMessages, messageData])
      })

      newSocket.on('user-joined', (messageData) => {
        console.log('👋 User joined chat:', messageData)
        setMessages(prevMessages => [...prevMessages, messageData])
      })

      newSocket.on('session-sync', (sessionData) => {
        console.log('✅ Chat confirmed sync session connection')
      })

      newSocket.on('chat-ready', (data) => {
        console.log('💬 Chat is ready for messages')
      })

      newSocket.on('session-error', (error) => {
        console.error('❌ Session error:', error)
        setIsConnected(false)
      })

      setSocket(newSocket)

      return () => {
        if (newSocket) {
          console.log('🧹 Cleaning up standalone chat socket')
          newSocket.close()
        }
      }
    }
  }, [sharedSocket, isSocketConnected, streamId, userName, userId, mood])  // ADD userId to deps

  // Update connection status when shared socket changes
  useEffect(() => {
    if (sharedSocket && isSocketConnected !== undefined) {
      setIsConnected(isSocketConnected)
    }
  }, [isSocketConnected, sharedSocket])

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputMessage.trim() || !socket || !isConnected) {
      console.log('Cannot send message:', { 
        hasMessage: !!inputMessage.trim(), 
        hasSocket: !!socket, 
        isConnected 
      })
      return
    }

    console.log('📤 Sending message:', inputMessage)
    socket.emit('send-message', {
      streamId: streamId,
      message: inputMessage.trim(),
      username: userName || 'Anonymous User',
      userId: userId  // ADD THIS LINE - send userId with message
    })

    setInputMessage('')
    
    // Only scroll to bottom when YOU send a message, not when others do
    setTimeout(() => scrollToBottom(), 100)
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

      <div className="messages-container" onScroll={handleScroll}>
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Welcome</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.type === 'system' ? (
                <span className="system-message-text">{msg.message}</span>
              ) : (
                <>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                  {/* REPLACE this section with ChatUserDisplay */}
                  <ChatUserDisplay 
                    username={msg.username}
                    userId={msg.userId}
                    showNote={true}
                    className="message-user"
                  />
                  <span className="message-colon">:</span>
                  <span className="message-text">{msg.message}</span>
                </>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
        
        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="scroll-to-bottom"
            title="Scroll to latest messages"
          >
            ↓ New Messages
          </button>
        )}
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