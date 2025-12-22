"use client"
import usePartySocket from "partysocket/react"
import React, { useEffect, useRef, useState } from "react"

import CustomVideoPlayer from "@/components/CustomVideoPlayer"

import { Message } from "@/components/SyncedRadioPlayer"
import { VideoState } from "../../../../../party"
import ChatComponent from "../../../stream/[mood]/ChatComponent"
import { CopyButton } from "@/components/CopyButton"
import MobileLayout from "./MobileLayout"


interface watchProps {
  groupId: string
  isMobile: boolean
}

const CustomWatchPage = ({ groupId, isMobile }: watchProps) => {
  const [videoState, setVideoState] = useState<VideoState>({
    name: "",
    videoUrl: null,
    starttime: 0,
    duration: 0,
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState<string>("")
  const [mount, setMount] = useState<boolean>(false)
  const [livetime, setlivetime] = useState<number | null>(null)

  const ws = usePartySocket({
    host: "https://moodly-party.himel2010.partykit.dev/",
    room: `${groupId}-customroom-video`,
    party: "customroom",
    onMessage(e) {
      try {
        const parsed = JSON.parse(e.data)
        if (parsed.type === "message") {
          const newMessages: Message[] = [
            ...messages,
            {
              anonymousName: parsed?.userData?.anonymousName,
              message: parsed.data,
              avatar_img_path: parsed?.userData?.avatar_img_path,
              note: parsed?.userData?.note || "",
              userId: parsed?.userData?.userId || ""
            },
          ]
          setMessages(newMessages)
        } else if (parsed.type === "video-change") {
          const newVideoData = parsed.data
          setVideoState((prev) => ({
            ...prev,
            name: newVideoData.name,
            videoUrl: newVideoData.videoUrl,
            duration: newVideoData.duration,
          }))
          setlivetime(newVideoData.starttime)
        } else {
          setVideoState((prev) => ({
            ...prev,
            name: parsed.name,
            videoUrl: parsed.videoUrl,
          }))
          setlivetime(parsed.starttime)
        }
      } catch (error) {}
    },
  })

  useEffect(() => setMount(true), [])

  if (!mount) return null
  const sharedProps = { ws, videoState, messages, setMessages, message, setMessage, livetime, groupId }
  if (isMobile) return <MobileLayout {...sharedProps} />

  return (
   <>
      {/* 📱 MOBILE VERSION: Hidden on Desktop (md: 768px+) */}
      <div className="md:hidden">
        <MobileLayout {...sharedProps} />
      </div>

      {/* 💻 DESKTOP VERSION: Hidden on Mobile */}
      <div className="hidden md:flex flex-col h-screen w-screen bg-transparent overflow-hidden">
        <header className="z-20 flex items-center justify-center px-10 py-6 shrink-0">
          <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.4em] flex flex-col justify-center items-center theme-text-accent opacity-80">
              LIVE TV 
              <CopyButton groupId={groupId} type="stream" />
            </h1>
          </div>
        </header>

        <main className="flex-1 flex px-10 pb-10 gap-10 min-h-0">
          <div className="flex-[2.5] flex flex-col min-h-0 min-w-0">
            <div className="flex-1 w-full relative group">
              <div className="absolute -inset-1 bg-[var(--accent)] opacity-5 blur-2xl rounded-2xl group-hover:opacity-10 transition-opacity" />
              <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                <CustomVideoPlayer
                  videoUrl={videoState.videoUrl}
                  onVideoEnd={() => {}}
                  livetime={livetime}
                />
              </div>
            </div>
          </div>

          <aside className="flex-1 max-w-sm h-full">
            <ChatComponent
              ws={ws}
              message={message}
              messages={messages}
              setMessage={setMessage}
              setMessages={setMessages}
            />
          </aside>
        </main>
      </div>
    </>
  )
}

export default CustomWatchPage
