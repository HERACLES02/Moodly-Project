'use client'
import { useState, useEffect } from 'react'
import { LiveChatComponent } from './LiveChatComponenet'
import './LiveStreamComponent.css'

interface LiveStreamComponentProps {
  mood: string
  user: any
}

export default function LiveStreamComponent({ mood, user }: LiveStreamComponentProps) {



  // Generate stream URL based on mood
  const getStreamUrl = () => {
    const streamUrls = {
      happy: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=1&loop=1',
      sad: 'https://www.youtube.com/embed/P6Segk8cr-c?autoplay=1&mute=1&controls=1&loop=1',
      default: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1&controls=1&loop=1'
    }
    return streamUrls[mood] || streamUrls.default
  }



  return (
    <div className="live-stream-container">
     

      <div className="stream-content">
        <div className="video-section">
          <iframe
            src={getStreamUrl()}

            className="stream-video"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>

        <div className="chat-section">
          <LiveChatComponent 
            streamId={`${mood}-stream`} 
            user={user}
            mood={mood}
          />
        </div>
      </div>
    </div>
  )
}