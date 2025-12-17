"use client"
import { redirect, useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"

const MoodlyLanding = () => {
  const [movies, setMovies] = useState([])
  const router = useRouter()

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          "https://api.themoviedb.org/3/movie/popular?api_key=8265bd1679663a7ea12ac168da84d2e8&language=en-US&page=1",
        )
        const data = await response.json()
        setMovies(data.results.slice(0, 6))
      } catch (error) {
        console.error("Error fetching movies:", error)
      }
    }
    fetchMovies()
  }, [])

  return (
    <div className="w-full bg-white flex flex-col items-center overflow-x-hidden font-sans relative min-h-screen">
      {/* ========== UNIFIED BACKGROUND SYSTEM - FLOWS ACROSS ENTIRE PAGE ========== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Layer 1: Main gradient - pink at top fading to white */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fce7f3] via-[#fdf2f8] via-40% to-white to-70%"></div>

        {/* Layer 2: Richer pink concentrated at very top */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#fbcfe8] to-transparent opacity-35"></div>

        {/* Layer 3: The horizontal pink band for device section - positioned absolutely */}
        <div
          className="absolute left-0 right-0 h-44 bg-[#fdf2f8]"
          style={{ top: "calc(50% + 80px)" }}
        ></div>

        {/* Layer 4: Soft top edge of pink band */}
        <div
          className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#fdf2f8]"
          style={{ top: "calc(50% + 56px)" }}
        ></div>

        {/* Layer 5: Soft bottom edge of pink band */}
        <div
          className="absolute left-0 right-0 h-24 bg-gradient-to-t from-transparent to-[#fdf2f8]"
          style={{ top: "calc(50% + 200px)" }}
        ></div>

        {/* Layer 6: Darker pink accent within the band */}
        <div
          className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-[#fce7f3] to-transparent opacity-40"
          style={{ top: "calc(50% + 96px)" }}
        ></div>

        {/* Layer 7: Radial spotlight behind devices */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-gradient-radial from-white/60 via-transparent to-transparent"
          style={{ top: "calc(50% + 80px)" }}
        ></div>

        {/* Layer 8: Subtle radial glow at top for hero section */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-radial from-[#fce7f3]/40 to-transparent"></div>

        {/* Layer 9: Very subtle texture over everything */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          }}
        ></div>

        {/* Layer 10: Light pink vignette from sides */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fdf2f8]/15 via-transparent to-[#fdf2f8]/15"></div>

        {/* Layer 11: Bottom section subtle tint */}
        <div className="absolute bottom-0 left-0 right-0 h-[600px] bg-gradient-to-t from-[#faf5ff]/60 to-transparent"></div>

        {/* Layer 12: Radial glow around bottom CTA area */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-radial from-[#fdf2f8]/25 to-transparent"
          style={{ bottom: "300px" }}
        ></div>
      </div>

      {/* ========== CONTENT - ALL RELATIVE Z-INDEX ========== */}
      <nav className="w-full flex justify-between items-center px-8 py-6 relative z-20 bg-[#ffe6f6] shadow shadow-[#dfb7d2] ">
        <div className="moodlyImage">
          <img
            src="/images/moodly-logo.gif"
            alt="Moodly Logo"
            className="logo-gif"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/login")}
            className="text-[#2a2a2a] bg-white px-8 py-3 rounded-full font-bold text-base tracking-wide shadow-lg hover:bg-gray-300 transition-all hover:cursor-pointer"
          >
            LOGIN
          </button>
          <button
            onClick={() => router.push("/register")}
            className="bg-[#2a2a2a] text-white px-8 py-3 rounded-full font-bold text-base tracking-wide shadow-lg hover:bg-black transition-colors hover:cursor-pointer"
          >
            CREATE ACCOUNT
          </button>
        </div>
      </nav>

      {/* TOP SECTION: HERO WITH MOVIE POSTERS */}
      <section className="w-full flex justify-center pt-16 pb-12 relative z-10">
        <div className="w-full max-w-6xl flex items-center gap-12 px-8">
          <div className="flex-1 text-left">
            <h1 className="text-[52px] font-black text-[#1a1a1a] leading-[1.05] mb-6 tracking-tight">
              Your Mood Picks
              <br />
              The Playlist & The Popcorn
            </h1>
            <p className="text-[#7c3a8f] text-xl font-medium leading-relaxed max-w-md">
              Your mood is more than a feeling — it's a vibe waiting to be heard
              and seen. Moodly curates movies and melodies that match you, while
              connecting you with a community that feels the same.
            </p>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-2 p-2">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="aspect-[2/3] bg-pink-200 relative overflow-hidden rounded-sm shadow-lg"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                  style={{
                    filter:
                      "sepia(0.25) saturate(1.4) hue-rotate(-5deg) brightness(0.92) contrast(1.05)",
                    mixBlendMode: "multiply",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 via-transparent to-purple-400/20"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MIDDLE SECTION: DEVICE SHOWCASE */}
      <section className="relative w-full flex justify-center py-28 z-10">
        <div className="relative w-full max-w-5xl flex justify-center items-end px-6">
          {/* Smartphone (Left) */}
          <div className="relative -mr-16 mb-[-30px] z-30 w-[17%] aspect-[9/19] border-[8px] border-[#1a1a1a] rounded-[2.8rem] bg-[#1a1a1a] shadow-2xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-[#fce7f3] via-[#fdf2f8] to-white flex flex-col pt-8 px-3">
              <div className="text-[9px] font-black leading-tight mb-2 text-[#1a1a1a] ">
                Your Mood Picks
                <br />
                The Playlist & The Popcorn
              </div>
              <div className="text-[5px] text-gray-600 mb-3 leading-relaxed">
                Your mood is more than a feeling — it's a vibe waiting to be
                heard and seen.
              </div>
              <div className="grid grid-cols-2 gap-1 flex-1">
                {movies.slice(0, 4).map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-pink-200 relative overflow-hidden rounded"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      style={{
                        filter:
                          "sepia(0.25) saturate(1.4) hue-rotate(-5deg) brightness(0.92)",
                        mixBlendMode: "multiply",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-transparent"></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-gray-700 rounded-full"></div>
          </div>

          {/* Laptop (Center) */}
          <div className="relative z-20 w-[68%] flex flex-col items-center">
            <div className="w-full border-[16px] border-[#1a1a1a] rounded-t-3xl bg-[#1a1a1a] overflow-hidden shadow-2xl">
              <div className="aspect-[16/10] bg-white relative">
                <div className="w-full h-full bg-gradient-to-b from-[#fce7f3] via-[#fdf2f8] to-white p-8 flex">
                  {/* Left side - Text content */}
                  <div className="w-1/2 flex flex-col justify-center pr-4">
                    <h2 className="text-2xl font-black mb-2 leading-tight text-[#1a1a1a] ">
                      Your Mood Picks
                      <br />
                      The Playlist & The Popcorn
                    </h2>
                    <p className="text-[7px] text-gray-600 leading-relaxed">
                      Your mood is more than a feeling — it's a vibe waiting to
                      be heard and seen. Moodly curates movies and melodies that
                      match you, while connecting you with a community that
                      feels the same.
                    </p>
                  </div>

                  {/* Right side - Movie posters grid */}
                  <div className="w-1/2 grid grid-cols-3 gap-1">
                    {movies.map((movie) => (
                      <div
                        key={movie.id}
                        className="bg-pink-200 relative overflow-hidden rounded-sm"
                      >
                        <img
                          src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                          style={{
                            filter:
                              "sepia(0.25) saturate(1.4) hue-rotate(-5deg) brightness(0.92)",
                            mixBlendMode: "multiply",
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-transparent"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-[104%] h-5 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-b-2xl shadow-2xl"></div>
            <div className="w-32 h-1 bg-[#2a2a2a] rounded-b-lg shadow-lg"></div>
          </div>

          {/* Tablet (Right) */}
          <div className="relative -ml-16 mb-[-30px] z-30 w-[19%] aspect-[9/16] border-[8px] border-[#1a1a1a] rounded-[2.8rem] bg-[#1a1a1a] shadow-2xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-b from-[#fce7f3] via-[#fdf2f8] to-white p-5">
              <div className="text-[11px] font-black leading-tight mb-2 text-[#1a1a1a] ">
                Your Mood Picks
                <br />
                The Playlist & The Popcorn
              </div>
              <div className="text-[6px] text-gray-600 mb-3 leading-relaxed">
                Your mood is more than a feeling — it's a vibe waiting to be
                heard and seen.
              </div>
              <div className="grid grid-cols-2 gap-2">
                {movies.slice(0, 4).map((movie) => (
                  <div
                    key={movie.id}
                    className="aspect-square bg-pink-200 relative overflow-hidden rounded-lg"
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      style={{
                        filter:
                          "sepia(0.25) saturate(1.4) hue-rotate(-5deg) brightness(0.92)",
                        mixBlendMode: "multiply",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-transparent"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM SECTION: CONTENT & CTA */}
      <section className="w-full flex flex-col items-center text-center px-6 py-20 space-y-16 relative z-10">
        <div className="space-y-5">
          <h2 className="text-5xl font-black text-black leading-tight">
            Where moods meet people
          </h2>
          <p className="text-[#7c3a8f] text-xl font-medium leading-relaxed">
            Join live mood streams, chat in real time, and make
            <br />
            every emotion an experience.
          </p>
        </div>
      </section>

      {/* BOTTOM BAR */}
      <div className="w-full h-65 relative z-10 mt-16 mb-10">
        <div className="absolute inset-0 bg-[#ffe6f6] p-5">
          <div className="space-y-8 flex flex-col items-center justify-center">
            <div className="space-y-3">
              <h3 className="text-4xl font-black text-black">
                Thanks for feeling with us. Now dive in.
              </h3>
              <p className="text-[#7c3a8f] text-xl font-medium">
                Watch movies, listen to music, and chat live — all based on your
                mood.
              </p>
            </div>

            <div className="flex flex-col items-center gap-5">
              <button className="bg-[#2a2a2a] text-white px-16 py-5 rounded-full font-bold text-base tracking-wider shadow-xl hover:bg-black transition-colors">
                CREATE ACCOUNT
              </button>
              <p className="text-black text-lg font-medium">
                Already have an account?{" "}
                <span className="font-black cursor-pointer hover:underline">
                  LOGIN
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#ede9fe]/30 to-[#e9d5ff]/20"></div>
      </div>
    </div>
  )
}

export default MoodlyLanding
