"use client"
import { useUser } from "@/contexts/UserContext"
import usePartySocket from "partysocket/react"
import React, { useEffect, useRef, useState } from "react"
import ChatComponent from "./ChatComponent"
import { VideoState } from "../../../../party"
import CustomVideoPlayer from "@/components/CustomVideoPlayer"
import { useRouter } from "next/navigation"
import { Message } from "@/components/SyncedRadioPlayer"
import MobileStreamLayout from "./MobileStreamLayout"

interface watchProps {
  mood: string
}

const WatchPage = ({ mood }: watchProps) => {
  const { user } = useUser()
  const router = useRouter()
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
    room: `${mood}`,
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
              userId: parsed?.userData?.userId || "",
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

  const sharedProps = {
    ws,
    videoState,
    messages,
    setMessages,
    message,
    setMessage,
    livetime,
  }

  return (
    <>
      {/* MOBILE & TABLET LAYOUT (< 1024px) */}
      <div className="lg:hidden">
        <MobileStreamLayout {...sharedProps} />
      </div>

      {/* DESKTOP LAYOUT (>= 1024px) */}
      <div className="hidden lg:flex flex-col h-screen w-screen bg-transparent overflow-hidden">
        {/* MINIMAL FLOATING HEADER */}
        <header className="z-20 flex items-center justify-center px-10 py-6 shrink-0">
          <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.4em] theme-text-accent opacity-80">
              LIVE TV
            </h1>
            <p className="theme-text-contrast text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1"></p>
          </div>
          <div className="w-[80px]" />
        </header>

        {/* GRID: Player + Chat */}
        <main className="flex-1 flex px-10 pb-10 gap-10 min-h-0">
          {/* PLAYER SECTION */}
          <div className="flex-[2.5] flex flex-col min-h-0 min-w-0">
            <div className="flex-1 w-full relative group">
              {/* Outer Glow */}
              <div className="absolute -inset-1 bg-[var(--accent)] opacity-5 blur-2xl rounded-2xl group-hover:opacity-10 transition-opacity" />
              {/* Container */}
              <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 bg-black">
                <CustomVideoPlayer
                  videoUrl={videoState.videoUrl}
                  onVideoEnd={() => {}}
                  livetime={livetime}
                />
              </div>
            </div>
          </div>

          {/* CHAT SECTION */}
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

export default WatchPage
