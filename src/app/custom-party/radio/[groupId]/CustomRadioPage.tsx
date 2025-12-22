"use client"
import usePartySocket from "partysocket/react"
import React, { useEffect, useRef, useState } from "react"

import CustomAudioPlayer from "@/components/CustomAudioPlayer"
import { useRouter } from "next/navigation"
import ChatComponent from "@/app/stream/[mood]/ChatComponent"
import { CopyButton } from "@/components/CopyButton"
import { Message } from "@/components/SyncedRadioPlayer"

interface SongState {
  name: string
  audioUrl: string | null
  starttime: number
  duration: number
}

interface CustomRadioPageProps {
  groupId: string
}



const CustomRadioPage = ({ groupId }: CustomRadioPageProps) => {
  const router = useRouter()
  const [songState, setSongState] = useState<SongState>({
    name: "",
    audioUrl: null,
    starttime: 0,
    duration: 0,
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState<string>("")
  const [mount, setMount] = useState<boolean>(false)
  const [livetime, setLivetime] = useState<number | null>(null)

  const ws = usePartySocket({
    host: "https://moodly-party.himel2010.partykit.dev/",
    room: `${groupId}-customroom-radio`,
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
        } else if (parsed.type === "song-change") {
          const newSongData = parsed.data
          setSongState((prev) => ({
            ...prev,
            name: newSongData.name,
            audioUrl: newSongData.audioUrl,
            duration: newSongData.duration,
          }))
          setLivetime(newSongData.starttime)
        } else {
          // Initial state from server
          setSongState((prev) => ({
            ...prev,
            name: parsed.name,
            audioUrl: parsed.audioUrl,
            duration: parsed.duration,
          }))
          setLivetime(parsed.starttime)
        }
      } catch (error) {
        console.error("Error parsing message:", error)
      }
    },
  })

  useEffect(() => setMount(true), [])

  if (!mount) return null

  return (
    <div className="flex flex-col h-screen w-screen bg-transparent overflow-hidden">
      {/* MINIMAL FLOATING HEADER */}
      <header className="z-20 flex items-center justify-between px-10 py-6 shrink-0">
        <button
          onClick={() => router.push("/dashboard")}
          className="theme-button-variant-2 btn-small !px-4 !rounded-full transition-transform active:scale-95"
        >
          Back
        </button>
        <div className="text-center">
          <h1 className="text-xs font-black uppercase tracking-[0.4em] theme-text-accent opacity-80">
            Radio
          </h1>
          <p className="theme-text-contrast text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1 flex flex-col justify-center items-center">
            {songState.name || "Syncing..."}
            <CopyButton groupId={groupId} type="radio" />
          </p>
        </div>
        <div className="w-[80px]" />
      </header>

      {/* MAIN GRID: Audio Player + Chat */}
      <main className="flex-1 flex px-10 pb-10 gap-10 min-h-0">
        {/* AUDIO PLAYER SECTION */}
        <div className="flex-[2.5] flex flex-col min-h-0 min-w-0">
          <div className="flex-1 w-full relative group">
            {/* Subtle Outer Glow */}
            <div className="absolute -inset-1 bg-[var(--accent)] opacity-5 blur-2xl rounded-2xl group-hover:opacity-10 transition-opacity" />
            {/* The Container */}
            <div className="relative h-full w-full rounded-2xl overflow-hidden  ring-1 ring-white/10 bg-transparent">
              <CustomAudioPlayer
                audioUrl={songState.audioUrl}
                livetime={livetime}
                onEnd={() => {
                  // Optional: notify server that song ended
                  ws.send("songend")
                }}
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
  )
}

export default CustomRadioPage
