"use client"
import React, { useRef, useState, useEffect } from "react"

interface CustomAudioPlayerProps {
  audioUrl: string | null
  livetime: number | null
  onEnd?: () => void
}

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({
  audioUrl,
  livetime,
  onEnd,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const syncTime = () => {
      if (audioRef.current && livetime) {
        const targetTime = (Date.now() - livetime) / 1000
        if (Math.abs(audioRef.current.currentTime - targetTime) > 0.5) {
          audioRef.current.currentTime = targetTime
        }
      }
    }
    syncTime()
    const interval = setInterval(syncTime, 2000)
    return () => clearInterval(interval)
  }, [livetime, audioUrl])

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted
      setIsMuted(!isMuted)
      if (audioRef.current.paused) {
        audioRef.current.play().catch(console.error)
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-12 space-y-12">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          autoPlay
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={onEnd}
          className="hidden"
        />
      )}

      {/* UNIFIED FLOW WAVE VISUALIZER */}
      <div className="relative w-full max-w-4xl h-64 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 800 200"
          className={`w-full h-full transition-opacity duration-1000 ${isPlaying && !isMuted ? "opacity-100" : "opacity-20"}`}
        >
          {/* Wave 1: Primary Thick Wave - Now using the 'Flow' animation */}
          <path
            className={`wave-path ${isPlaying && !isMuted ? "animate-wave-primary" : ""}`}
            d="M0 100 Q 200 40, 400 100 T 800 100"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Wave 2: Semi-transparent Overlay */}
          <path
            className={`wave-path opacity-50 ${isPlaying && !isMuted ? "animate-wave-secondary" : ""}`}
            d="M0 100 Q 200 160, 400 100 T 800 100"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Wave 3: Subtle Background */}
          <path
            className={`wave-path opacity-20 ${isPlaying && !isMuted ? "animate-wave-tertiary" : ""}`}
            d="M0 100 Q 200 10, 400 100 T 800 100"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />

          <circle
            cx="400"
            cy="100"
            r="45"
            fill="var(--accent)"
            className={`opacity-5 ${isPlaying && !isMuted ? "animate-pulse-slow" : "hidden"}`}
          />
        </svg>

        {/* Center Bars Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-[var(--accent)] rounded-full transition-all duration-500"
              style={{
                height:
                  isPlaying && !isMuted
                    ? `${25 + Math.random() * 50}px`
                    : "6px",
                opacity: isPlaying && !isMuted ? 0.8 : 0.2,
                animation:
                  isPlaying && !isMuted
                    ? `bar-bounce 0.7s ease-in-out infinite alternate ${i * 0.08}s`
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* INTERFACE CONTROLS */}
      <div className="w-full max-w-xl flex flex-col items-center gap-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span
              className={`w-1.5 h-1.5 rounded-full ${!isMuted ? "bg-[var(--accent)] animate-pulse" : "bg-white/10"}`}
            />
            <span className="theme-text-muted text-[9px] font-bold uppercase tracking-[0.3em]">
              {isMuted ? "Audio Offline" : "Live Sync"}
            </span>
          </div>
        </div>

        <button
          onClick={toggleMute}
          className="group relative px-14 py-5 bg-[var(--accent)] text-[var(--background)] rounded-2xl flex items-center gap-5 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_var(--shadow-color)]"
        >
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">
            {isMuted ? "Enable Monitor" : "Mute Stream"}
          </span>
          <div className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center">
            {isMuted ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </div>
        </button>
      </div>

      <style jsx>{`
        .wave-path {
          transition: transform 1s ease-in-out;
        }

        /* All waves now use ease-in-out alternate for a flowy, jitter-free look */
        @keyframes flow-primary {
          0% {
            transform: translateX(-80px) scaleY(0.9);
          }
          100% {
            transform: translateX(80px) scaleY(1.1);
          }
        }

        @keyframes flow-secondary {
          0% {
            transform: translateX(100px) scaleY(1.2);
          }
          100% {
            transform: translateX(-100px) scaleY(0.8);
          }
        }

        @keyframes flow-tertiary {
          0% {
            transform: translateX(-150px) rotate(-1deg);
          }
          100% {
            transform: translateX(150px) rotate(1deg);
          }
        }

        @keyframes bar-bounce {
          0% {
            transform: scaleY(1);
            opacity: 0.5;
          }
          100% {
            transform: scaleY(2);
            opacity: 1;
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.05;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.1;
          }
        }

        .animate-wave-primary {
          animation: flow-primary 5s ease-in-out infinite alternate;
        }
        .animate-wave-secondary {
          animation: flow-secondary 7s ease-in-out infinite alternate;
        }
        .animate-wave-tertiary {
          animation: flow-tertiary 9s ease-in-out infinite alternate;
        }
      `}</style>
    </div>
  )
}

export default CustomAudioPlayer
