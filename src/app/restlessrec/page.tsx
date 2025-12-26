"use client"

import React, { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

const RECOMMENDED_MOVIES = [
  {
    id: "153",
    quote:
      "Quiet moments of shared loneliness and disconnection can still hold meaning.",
  },
  {
    id: "370755",
    quote: "Contemplative. Gentle. When sleep feels impossible.",
  },
  { id: "76", quote: "Conversational. Escapist. For 3 AM thoughts." },
]

export default function MovieVideoPage() {
  const [movieData, setMovieData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const results = await Promise.all(
          RECOMMENDED_MOVIES.map(async (movie) => {
            const res = await fetch(`/api/get-movie-data?id=${movie.id}`)
            const data = await res.json()
            return { ...data, customQuote: movie.quote }
          }),
        )
        setMovieData(results)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  if (loading) return <div className="restless min-h-screen bg-[#0f1223]" />

  return (
    <div className="restless bg-[var(--background)] min-h-screen overflow-hidden">
      <main className="h-screen w-full max-w-[430px] mx-auto overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative">
        {/* Cinematic Background Ambient Light */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--accent)] opacity-[0.05] blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--secondary)] opacity-[0.05] blur-[120px] rounded-full" />
        </div>

        {movieData.map((movie, index) => (
          <MovieSection key={movie.id} movie={movie} index={index} />
        ))}
      </main>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital@1&family=Inter:wght@400;700;900&display=swap");
      `}</style>
    </div>
  )
}

function MovieSection({ movie, index }: { movie: any; index: number }) {
  return (
    <section className="relative h-screen w-full snap-start flex flex-col justify-center px-8">
      {/* 1. CINEMATIC LANDSCAPE IMAGE WITH PARALLAX & GLOW */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 10 }}
        whileInView={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 group"
      >
        {/* Subtle Glow behind the image */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-[var(--secondary)] rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--card-surface)]">
          <motion.img
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6 }}
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="h-full w-full object-cover"
          />
          {/* Stylized Text Overlay on Image */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-brightness-75">
            <h2 className="text-white text-3xl font-serif italic tracking-[0.15em] text-center px-4 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
              {movie.title}
            </h2>
          </div>
        </div>
      </motion.div>

      {/* 2. STAGGERED TEXT CONTENT */}
      <div className="mt-10 space-y-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-[var(--accent)] opacity-20">
              0{index + 1}
            </span>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-[var(--foreground)]">
              {movie.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1 text-[var(--accent)] font-bold text-[10px] tracking-[0.2em] uppercase">
            <span>{new Date(movie.release_date).getFullYear()}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--glass-border)]" />
            <span>{movie.vote_average.toFixed(1)} Score</span>
          </div>
        </motion.div>

        {/* 3. THE QUOTE BLOCK */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative pl-6"
        >
          {/* Accent vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[var(--accent)] to-transparent" />

          <p className="text-lg leading-relaxed font-medium text-[var(--foreground)] opacity-90 italic">
            "{movie.customQuote}"
          </p>

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "40px" }}
            transition={{ delay: 1, duration: 1 }}
            className="h-[1px] bg-[var(--accent)] mt-6"
          />
        </motion.div>
      </div>

      {/* Background Index Number (Stylized Watermark) */}
      <div className="absolute bottom-10 right-10 pointer-events-none select-none">
        <span className="text-[12rem] font-black text-white/[0.02] leading-none">
          {index + 1}
        </span>
      </div>
    </section>
  )
}
