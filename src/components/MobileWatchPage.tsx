"use client"
import React from "react"
import CustomVideoPlayer from "@/components/CustomVideoPlayer"

import { CopyButton } from "@/components/CopyButton"
import { Message } from "@/components/SyncedRadioPlayer"

import PartySocket from "partysocket"
import ChatComponent from "@/app/stream/[mood]/ChatComponent"
import { VideoState } from "../../party"

interface MobileWatchPageProps {
  groupId: string
  videoState: VideoState
  livetime: number | null
  messages: Message[]
  message: string
  setMessage: (s: string) => void
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ws: PartySocket
}

const MobileWatchPage = ({
  groupId,
  videoState,
  livetime,
  messages,
  message,
  setMessage,
  setMessages,
  ws
}: MobileWatchPageProps) => {
  return (
    <div className="flex flex-col h-[100dvh] w-full bg-black overflow-hidden">
      {/* 1. VIDEO SECTION (Fixed Top) */}
      <div className="relative w-full aspect-video bg-black z-30 shadow-2xl">
        <CustomVideoPlayer
          videoUrl={videoState.videoUrl}
          onVideoEnd={() => {}}
          livetime={livetime}
        />
        
        {/* Mobile Header Overlay (Small) */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-red-600 rounded text-[8px] font-black text-white">LIVE</div>
            <h1 className="text-[10px] font-bold text-white uppercase tracking-widest opacity-80">
              {videoState.name || "Live Stream"}
            </h1>
          </div>
          <div className="pointer-events-auto scale-75 origin-right">
            <CopyButton groupId={groupId} type="stream" />
          </div>
        </div>
      </div>

      {/* 2. CHAT SECTION (Flexible Bottom) */}
      <div className="flex-1 flex flex-col min-h-0 bg-[var(--background)]">
        {/* Subtle separator/drag handle look */}
        <div className="h-1 w-12 bg-white/10 rounded-full mx-auto my-2 shrink-0" />
        
        <div className="flex-1 px-2 pb-2 overflow-hidden">
           <ChatComponent
            ws={ws}
            message={message}
            messages={messages}
            setMessage={setMessage}
            setMessages={setMessages}
          />
        </div>
      </div>
    </div>
  )
}

export default MobileWatchPage