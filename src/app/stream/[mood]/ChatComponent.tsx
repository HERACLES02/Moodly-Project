import { Button } from "@/components/ui/button"
import { useUser } from "@/contexts/UserContext"
import PartySocket from "partysocket"
import React, { useEffect, useRef, useState } from "react"

interface ChatComponentProps {
  ws: PartySocket
  message: string
  messages: string[]
  setMessage: (s: string) => void
  setMessages: React.Dispatch<React.SetStateAction<string[]>>
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
    ws.send(message)
    setMessages((prev: string[]) => [...prev, message])

    setMessage("")
  }
  return (
    <div className="theme-container bg-transparent gap-2 flex flex-col h-[75%] justify-between border-transparent">
      <div className="theme-card">
        <div className="theme-text-contrast flex justify-center items-center">
          Live Chat
        </div>
      </div>

      <div className="theme-card h-[100%] overflow-y-auto">
        {messages &&
          messages.map((m, idx) => (
            <div key={idx} className="theme-text-contrast">
              {m}
              <div ref={messageRef} />
            </div>
          ))}
      </div>

      <div className="theme-card">
        <div className="">
          <form
            onSubmit={handleSubmit}
            className="flex -p-5 justify-between gap-3 h-[100%] w-[100%]"
          >
            <input
              className="theme-input bg-transparent flex-wrap"
              value={message ?? ""}
              onChange={(e) => {
                setMessage(e.target.value)
              }}
            />
            <button type="submit" className="theme-button">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChatComponent
