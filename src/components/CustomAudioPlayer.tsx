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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number | null>(null)

  // 1. Sync Logic (Strict - No Seeking)
  useEffect(() => {
    const syncTime = () => {
      if (audioRef.current && livetime) {
        const targetTime = (Date.now() - livetime) / 1000
        // Only sync if drift is > 1 second to avoid stutter
        if (Math.abs(audioRef.current.currentTime - targetTime) > 1) {
          audioRef.current.currentTime = targetTime
        }
      }
    }
    const interval = setInterval(syncTime, 2000)
    return () => clearInterval(interval)
  }, [livetime])

  // 2. Real-time Equalizer Logic
  const startVisualizer = () => {
    if (!audioRef.current || !canvasRef.current) return

    // Create Context if it doesn't exist
    if (!audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext
      const ctx = new AudioContextClass()
      const analyser = ctx.createAnalyser()

      // Connect Source -> Analyser -> Destination
      try {
        const source = ctx.createMediaElementSource(audioRef.current)
        source.connect(analyser)
        analyser.connect(ctx.destination)

        analyser.fftSize = 128 // Lower for cleaner bars
        analyserRef.current = analyser
        audioContextRef.current = ctx
      } catch (err) {
        console.error("Audio Connection Error:", err)
      }
    }

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const analyser = analyserRef.current
    if (!ctx || !analyser) return

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArray)

      // Get colors from your theme
      const accent =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--accent")
          .trim() || "#3b82f6"

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barWidth = (canvas.width / bufferLength) * 2
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height

        ctx.fillStyle = accent
        ctx.globalAlpha = 0.7
        // Draw rounded bars
        ctx.beginPath()
        ctx.roundRect(
          x,
          canvas.height - barHeight,
          barWidth - 4,
          barHeight,
          [10, 10, 0, 0],
        )
        ctx.fill()

        x += barWidth
      }
    }
    draw()
  }

  const handleToggleMute = async () => {
    if (!audioRef.current) return

    // Browser Requirement: Resume context on user click
    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume()
    }

    if (!hasInteracted) {
      startVisualizer()
      setHasInteracted(true)
    }

    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)

    // Auto-play attempt if stopped
    audioRef.current.play().catch((e) => console.log("Play blocked", e))
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-12">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          autoPlay
          muted={isMuted}
          onEnded={onEnd}
          crossOrigin="anonymous" // CRITICAL for R2/Cloudflare
        />
      )}

      {/* Visualizer Stage */}
      <div className="w-full max-w-5xl h-[400px] relative bg-black/5 rounded-[40px] border border-white/5 flex items-center justify-center overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={1000}
          height={400}
          className="w-full h-full opacity-80"
        />

        {isMuted && (
          <div className="absolute inset-0 backdrop-blur-md bg-black/20 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin mb-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.6em] theme-text-accent">
              Stream Encrypted & Ready
            </p>
          </div>
        )}
      </div>

      {/* Hero Control Bar */}
      <div className="w-full max-w-3xl flex flex-col items-center space-y-6">
        <button
          onClick={handleToggleMute}
          className="group relative flex items-center gap-6 px-12 py-6 bg-[var(--accent)] text-[var(--background)] rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_var(--shadow-color)]"
        >
          <span className="text-sm font-black uppercase tracking-[0.2em]">
            {isMuted ? "Connect to Audio Feed" : "Disconnect Audio"}
          </span>
          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors">
            {isMuted ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </div>
        </button>

        <div className="flex items-center gap-8 opacity-40">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest">
              Latency
            </span>
            <span className="text-[10px] font-mono">24ms</span>
          </div>
          <div className="w-[1px] h-4 bg-white/20" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest">
              Bitrate
            </span>
            <span className="text-[10px] font-mono">320kbps</span>
          </div>
          <div className="w-[1px] h-4 bg-white/20" />
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-widest">
              Codec
            </span>
            <span className="text-[10px] font-mono">MPEG-4</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomAudioPlayer
