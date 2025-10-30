"use client"
import { useUser } from "@/contexts/UserContext"
import usePartySocket from "partysocket/react"
import React, { useEffect, useRef, useState } from "react"
import ChatComponent from "./ChatComponent"
import { VideoState } from "../../../../party"
import CustomVideoPlayer from "@/components/CustomVideoPlayer"
import { redirect } from "next/navigation"

interface watchProps {
  mood: string
}

const WatchPage = ({ mood }: watchProps) => {
  const { user } = useUser()
  const [videoState, setVideoState] = useState<VideoState>({
    name: "",
    videoUrl: null,
    starttime: 0,
    duration: 0,
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [messages, setMessages] = useState<string[]>([])
  const [message, setMessage] = useState<string>("")
  const [mount, setMount] = useState<boolean>(false)
  const [livetime, setlivetime] = useState<number | null>(null)

  const ws = usePartySocket({
    // usePartySocket takes the same arguments as PartySocket.
    host: "moodly-party.himel2010.partykit.dev", // or localhost:1999 in dev
    room: `${mood}`,

    // in addition, you can provide socket lifecycle event handlers
    // (equivalent to using ws.addEventListener in an effect hook)
    onOpen() {
      console.log("connected")
    },
    onMessage(e) {
      try {
        const parsed = JSON.parse(e.data)
        if (parsed.type === "message") {
          setMessages((prev) => [...prev, parsed.data])
        } else if (parsed.type === "video-change") {
          console.log("This is parsed data")
          const newVideoData = parsed.data
          console.log(newVideoData)
          setVideoState((prev) => ({
            ...prev,
            name: newVideoData.name,
            videoUrl: newVideoData.videoUrl,
            duration: newVideoData.duration,
          }))
          setlivetime(newVideoData.starttime)
        } else {
          console.log(parsed)

          setVideoState((prev) => ({
            ...prev,
            name: parsed.name,
            videoUrl: parsed.videoUrl,
          }))
          setlivetime(parsed.starttime)
        }
      } catch (error) {}
    },
    onClose() {
      console.log("closed")
    },
    onError(e) {
      console.log("error")
    },
  })
  useEffect(() => setMount(true), [])

  useEffect(() => {
    const updateTime = () => {
      const video = videoRef.current
      if (!video) return null
      video.currentTime = (Date.now() - livetime) / 1000
    }
    updateTime()
  }, [livetime])

  const handleVideoEnd = () => {
    console.log("Video finished. Sending Message to server")
  }

  if (!mount) return null

  return (
    <div
      className="flex justify-between h-screen w-screen items-center "
      suppressHydrationWarning
    >
      <div className="w-[60%] grid grid-rows-[1fr_4fr] h-screen ml-10">
        <button
          className="theme-button place-self-start mt-5"
          onClick={() => redirect("/dashboard")}
        >
          Back to Dashboard
        </button>

        <div className="">
          <CustomVideoPlayer
            videoUrl={videoState.videoUrl}
            onVideoEnd={handleVideoEnd}
            livetime={livetime}
          />
        </div>
      </div>
      <div className="h-full flex justify-center items-center mr-10">
        <ChatComponent
          ws={ws}
          message={message}
          messages={messages}
          setMessage={setMessage}
          setMessages={setMessages}
        />
      </div>
    </div>
  )
}

export default WatchPage
