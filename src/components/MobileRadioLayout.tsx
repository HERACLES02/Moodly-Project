"use client"
import { Message } from "@/components/SyncedRadioPlayer"
import CustomAudioPlayer from "@/components/CustomAudioPlayer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UserProfileDialog from "@/components/IserProfileDialog"
import PartySocket from "partysocket"
import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface MobileRadioLayoutProps {
  ws: PartySocket
  songState: {
    name: string
    audioUrl: string | null
    starttime: number
    duration: number
  }
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  message: string
  setMessage: (s: string) => void
  livetime: number | null
}

const MobileRadioLayout = ({
  ws,
  songState,
  messages,
  setMessages,
  message,
  setMessage,
  livetime,
}: MobileRadioLayoutProps) => {
  const router = useRouter()
  const [chatExpanded, setChatExpanded] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    const userMessage: Message = {
      message: message,
      anonymousName: "Listener",
      avatar_img_path: "",
      note: "",
      userId: "",
    }
    ws.send(JSON.stringify(userMessage))
    setMessages((prev) => [...prev, userMessage])
    setMessage("")
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-transparent overflow-hidden">
      {/* MINIMAL HEADER */}
      <header className="px-4 py-3 border-b border-white/10 bg-black/20 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-3 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider transition-transform active:scale-95"
          >
            ← Back
          </button>
          <div className="text-center flex-1 mx-4">
            <h1 className="text-xs font-black uppercase tracking-[0.3em] theme-text-accent">
              Radio
            </h1>
            <p className="text-[9px] opacity-60 uppercase tracking-wider mt-0.5 truncate">
              ENERGETIC MORNING
            </p>
          </div>
          <button
            onClick={() => setChatExpanded(!chatExpanded)}
            className="relative px-3 py-1.5 rounded-full bg-[var(--accent)] text-[var(--background)] text-[10px] font-bold uppercase tracking-wider transition-transform active:scale-95"
          >
            💬
            {messages.length > 0 && !chatExpanded && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[8px] flex items-center justify-center">
                {messages.length > 9 ? "9+" : messages.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT: VISUALIZER ALWAYS VISIBLE */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* AUDIO VISUALIZER - ALWAYS VISIBLE, TAKES MOST SPACE */}
        <div
          className={`flex-1 transition-all duration-300 ${
            chatExpanded ? "flex-[0.6]" : "flex-1"
          }`}
        >
          <CustomAudioPlayer
            audioUrl={songState.audioUrl}
            livetime={livetime}
            onEnd={() => {
              ws.send("songend")
            }}
          />
        </div>

        {/* COMPACT CHAT DRAWER - SLIDES UP FROM BOTTOM */}
        <div
          className={`bg-black/60 backdrop-blur-xl border-t border-white/10 transition-all duration-300 flex flex-col ${
            chatExpanded ? "flex-[0.4] min-h-[40vh]" : "h-auto"
          }`}
        >
          {/* CHAT TOGGLE BAR */}
          <button
            onClick={() => setChatExpanded(!chatExpanded)}
            className="w-full py-3 flex items-center justify-center gap-2 border-b border-white/5 active:bg-white/5"
          >
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </button>

          {/* COLLAPSED VIEW: Just show latest message */}
          {!chatExpanded && messages.length > 0 && (
            <div className="px-4 py-3" onClick={() => setChatExpanded(true)}>
              <div className="flex items-center gap-2 opacity-60">
                <Avatar className="size-5 border border-[var(--glass-border)] rounded-full">
                  <AvatarImage
                    src={messages[messages.length - 1].avatar_img_path}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-[7px]">👤</AvatarFallback>
                </Avatar>
                <span className="text-[9px] font-bold uppercase">
                  {messages[messages.length - 1].anonymousName}
                </span>
                <span className="text-xs text-white/60 truncate flex-1">
                  {messages[messages.length - 1].message}
                </span>
              </div>
            </div>
          )}

          {/* EXPANDED VIEW: Full chat */}
          {chatExpanded && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center opacity-20">
                    <span className="text-xs uppercase tracking-widest font-bold">
                      No messages yet
                    </span>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div
                      key={idx}
                      className="animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <UserProfileDialog user={m}>
                          <Avatar className="size-5 border border-[var(--glass-border)] rounded-full">
                            <AvatarImage
                              src={m.avatar_img_path}
                              className="object-cover"
                            />
                            <AvatarFallback className="text-[7px]">
                              👤
                            </AvatarFallback>
                          </Avatar>
                        </UserProfileDialog>
                        <span className="text-[9px] font-bold opacity-60 uppercase">
                          {m.anonymousName}
                        </span>
                      </div>
                      <div className="theme-text-contrast text-xs leading-relaxed pl-7">
                        {m.message}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messageRef} />
              </div>

              {/* Input */}
              <div className="p-3 bg-black/40 border-t border-white/10">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-[var(--accent)]"
                    placeholder="Send a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-[var(--accent)] text-[var(--background)] rounded-xl transition-transform active:scale-90"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default MobileRadioLayout
