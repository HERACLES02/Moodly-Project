import ChatComponent from "@/app/stream/[mood]/ChatComponent"
import CustomVideoPlayer from "@/components/CustomVideoPlayer"
import PartySocket from "partysocket"
import { VideoState } from "../../../../../party"
import { Message } from "@/components/SyncedRadioPlayer"
import { CopyButton } from "@/components/CopyButton"

interface MobileLayoutProps {
  ws: PartySocket
  videoState: VideoState
  messages: Message[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  message: string
  setMessage: React.Dispatch<React.SetStateAction<string>>
  livetime: number | null
  groupId?: string
}

const MobileLayout = (props: MobileLayoutProps) => (
  <div className="flex flex-col h-[100dvh] w-full bg-black overflow-hidden fixed inset-0">
    {/* 1. VIDEO SECTION */}
    <div className="relative w-full aspect-video bg-black z-30 shrink-0">
      <CustomVideoPlayer
        videoUrl={props.videoState.videoUrl}
        onVideoEnd={() => {}}
        livetime={props.livetime}
      />

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/90 to-transparent pointer-events-none flex justify-between items-center">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">
              Live
            </span>
          </div>
          <h1 className="text-[11px] font-bold text-white truncate max-w-[200px]">
            {props.videoState.name || "Loading Stream..."}
          </h1>
        </div>
        <div className="pointer-events-auto scale-75">
          {props.groupId && (
            <CopyButton groupId={props.groupId} type="stream" />
          )}
        </div>
      </div>
    </div>

    {/* 2. CHAT SECTION */}
    <div className="flex-1 relative bg-[var(--background)] min-h-0">
      {/* Decorative Handle */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/10 rounded-full mt-1.5 z-20" />

      <div className="h-full pt-1">
        <ChatComponent
          ws={props.ws}
          message={props.message}
          messages={props.messages}
          setMessage={props.setMessage}
          setMessages={props.setMessages}
        />
      </div>
    </div>
  </div>
)

export default MobileLayout
