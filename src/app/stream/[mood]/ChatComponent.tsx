import { Message } from "@/components/SyncedRadioPlayer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/contexts/UserContext"
import Image from "next/image"
import PartySocket from "partysocket"
import React, { useEffect, useRef } from "react"

interface ChatComponentProps {
  ws: PartySocket
  message: string
  messages: Message[]
  setMessage: (s: string) => void
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

const ChatComponent = ({
  ws,
  message,
  messages,
  setMessage,
  setMessages,
}: ChatComponentProps) => {
  const { user } = useUser()
  const messageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    const userMessage: Message = {
      message: message,
      anonymousName: user?.anonymousName || "Listener",
      avatar_img_path: user?.currentAvatar?.imagePath || "",
    }
    ws.send(JSON.stringify(userMessage))
    setMessages((prev: Message[]) => [...prev, userMessage])
    setMessage("")
  }

  return (
    <div className="h-full flex flex-col theme-card !bg-black/20 !backdrop-blur-xl border-[var(--glass-border)] !p-0 rounded-3xl overflow-hidden shadow-2xl">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/5">
        <span className="theme-text-contrast text-[10px] font-black uppercase tracking-[0.2em]">
          Live Feed
        </span>
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
      </div>

      {/* MESSAGES WITH UPDATED SCROLLBAR */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-6 
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-[var(--accent)]
        [&::-webkit-scrollbar-thumb]:rounded-full
        [&::-webkit-scrollbar-thumb]:opacity-20
        hover:[&::-webkit-scrollbar-thumb]:bg-[var(--accent)]
        scrollbar-thin scrollbar-thumb-[var(--accent)] scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center opacity-20">
            <span className="text-[10px] uppercase tracking-widest font-bold italic">
              Silence
            </span>
          </div>
        ) : (
          messages.map((m, idx) => (
            <div key={idx} className="animate-in fade-in slide-in-from-right-2">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-40" />
                <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter">
                  {m.anonymousName}
                </span>
              </div>
              <div className="theme-text-contrast text-sm leading-relaxed pl-3 border-l border-white/10 group-hover:border-[var(--accent)] transition-colors flex gap-3">
                <div className="max-h-5 max-w-5 h-full w-full rounded-full">
                  <Avatar className="rounded-full size-6 ">
                    <AvatarImage src={m.avatar_img_path} />
                    <AvatarFallback>{"👤"}</AvatarFallback>
                  </Avatar>
                </div>

                {m.message}
              </div>
            </div>
          ))
        )}
        <div ref={messageRef} />
      </div>

      {/* INPUT */}
      <div className="p-6 bg-white/5">
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            className="theme-input !bg-black/20 !border-white/10 h-11 !rounded-xl !text-xs italic"
            placeholder="Share a thought..."
            value={message ?? ""}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="theme-button-primary !p-3 !rounded-xl transition-transform active:scale-90 flex items-center justify-center"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatComponent
