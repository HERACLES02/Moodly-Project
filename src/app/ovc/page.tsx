"use client"
import React, { useState } from "react"

const MoodlyExperience = () => {
  const [showNotification, setShowNotification] = useState(true)
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [selectedMood, setSelectedMood] = useState(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [colorWaveOrigin, setColorWaveOrigin] = useState({ x: 0, y: 0 })
  const [showColorWave, setShowColorWave] = useState(false)

  // ============================================
  // RIPPLE EFFECT CUSTOMIZATION VARIABLES
  // ============================================
  const RIPPLE_SPEED = 2.0 // Animation duration in seconds (try 1.5-3.0)
  const RIPPLE_SCALE = 35 // How far the ripple expands (try 25-40)

  // Debug: Log the values when component renders
  console.log("Ripple Settings:", { RIPPLE_SPEED, RIPPLE_SCALE })

  // Mood configurations with colors and themes
  const moods = [
    { id: "anxious", label: "Anxious", color: "#805AD5", theme: "purple" },
    { id: "happy", label: "Happy", color: "#F6AD55", theme: "orange" },
    { id: "sad", label: "Sad", color: "#4299E1", theme: "blue" },
    { id: "restless", label: "Restless", color: "#191970", theme: "indigo" },
    { id: "nostalgic", label: "Nostalgic", color: "#ED64A6", theme: "pink" },
    { id: "focused", label: "Focused", color: "#48BB78", theme: "green" },
  ]

  // Movie recommendations based on mood (using TMDB IDs)
  const movieRecommendations = {
    restless: [
      {
        tmdbId: 153,
        title: "Lost in Translation",
        tagline: "Quiet. Introspective.",
        description: "For restless minds.",
        poster:
          "https://image.tmdb.org/t/p/w500/wv9IXO8gYKNs1hDPwj7PCmzBlpa.jpg",
      },
      {
        tmdbId: 194662,
        title: "Before Sunrise",
        tagline: "Conversational. Escapist.",
        description: "For 3 AM thoughts.",
        poster:
          "https://image.tmdb.org/t/p/w500/4RKMSXIngXO2Y3hUD96F43r405E.jpg",
      },
      {
        tmdbId: 590223,
        title: "Paterson",
        tagline: "Contemplative. Gentle.",
        description: "When sleep feels impossible.",
        poster:
          "https://image.tmdb.org/t/p/w500/2nXdJXG7IlxKLBAZEPysZCPgVCS.jpg",
      },
    ],
    anxious: [
      {
        tmdbId: 244786,
        title: "Whiplash",
        tagline: "Intense. Focused.",
        description: "Channel the energy.",
        poster:
          "https://image.tmdb.org/t/p/w500/7fn624j5lj3xTme2SgiLCeuedmO.jpg",
      },
      {
        tmdbId: 550,
        title: "Fight Club",
        tagline: "Raw. Cathartic.",
        description: "For racing thoughts.",
        poster:
          "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      },
      {
        tmdbId: 13,
        title: "Forrest Gump",
        tagline: "Gentle. Grounding.",
        description: "When you need calm.",
        poster:
          "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      },
    ],
    happy: [
      {
        tmdbId: 293660,
        title: "Deadpool",
        tagline: "Fun. Energetic.",
        description: "Keep the vibe going.",
        poster:
          "https://image.tmdb.org/t/p/w500/3E53WEZJqP6aM84D8CckXx4pIHw.jpg",
      },
      {
        tmdbId: 862,
        title: "Toy Story",
        tagline: "Joyful. Nostalgic.",
        description: "Pure happiness.",
        poster:
          "https://image.tmdb.org/t/p/w500/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
      },
      {
        tmdbId: 19404,
        title: "The Grand Budapest Hotel",
        tagline: "Whimsical. Delightful.",
        description: "For good moods.",
        poster:
          "https://image.tmdb.org/t/p/w500/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg",
      },
    ],
    sad: [
      {
        tmdbId: 389,
        title: "The Green Mile",
        tagline: "Moving. Cathartic.",
        description: "Let it out.",
        poster:
          "https://image.tmdb.org/t/p/w500/8VG8fDNiy50H4FedGwdSVUPoaJe.jpg",
      },
      {
        tmdbId: 313369,
        title: "La La Land",
        tagline: "Bittersweet. Beautiful.",
        description: "For melancholy moments.",
        poster:
          "https://image.tmdb.org/t/p/w500/uDO8zWDhfWwoFdKS4fzkUJt0Rf0.jpg",
      },
      {
        tmdbId: 920,
        title: "Cars",
        tagline: "Gentle. Comforting.",
        description: "When you need warmth.",
        poster:
          "https://image.tmdb.org/t/p/w500/qa6HCwP4Z15l3hpsASz3auugEW6.jpg",
      },
    ],
    nostalgic: [
      {
        tmdbId: 863,
        title: "Toy Story 2",
        tagline: "Warm. Familiar.",
        description: "Revisit the past.",
        poster:
          "https://image.tmdb.org/t/p/w500/2MFIhZAW0CVlEQrFyqwa4U6NWP.jpg",
      },
      {
        tmdbId: 109445,
        title: "Frozen",
        tagline: "Magical. Heartwarming.",
        description: "Remember simpler times.",
        poster:
          "https://image.tmdb.org/t/p/w500/kgwjIb2JDHRhNk13lmSxiClFjVk.jpg",
      },
      {
        tmdbId: 278,
        title: "The Shawshank Redemption",
        tagline: "Timeless. Hopeful.",
        description: "A classic for reflection.",
        poster:
          "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      },
    ],
    focused: [
      {
        tmdbId: 27205,
        title: "Inception",
        tagline: "Complex. Engaging.",
        description: "For sharp minds.",
        poster:
          "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      },
      {
        tmdbId: 155,
        title: "The Dark Knight",
        tagline: "Intense. Gripping.",
        description: "Total immersion.",
        poster:
          "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      },
      {
        tmdbId: 496243,
        title: "Parasite",
        tagline: "Sharp. Thought-provoking.",
        description: "For focused viewing.",
        poster:
          "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      },
    ],
  }

  const handleNotificationClick = () => {
    setShowNotification(false)
    setTimeout(() => setShowMoodSelector(true), 300)
  }

  const handleMoodSelect = (mood, event) => {
    // Get the button's position for the ripple effect origin
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2

    setColorWaveOrigin({ x, y })
    setSelectedMood(mood)
    setShowColorWave(true)
    setIsTransitioning(true)

    // Fade out mood selector while ripple expands
    setTimeout(() => {
      setShowMoodSelector(false)
    }, 800)

    // Show recommendations after ripple completes
    setTimeout(() => {
      setShowRecommendations(true)
      setShowColorWave(false)
      setIsTransitioning(false)
    }, RIPPLE_SPEED * 1000)
  }

  const getMoodColor = () => {
    if (!selectedMood) return "#1F2937"
    const mood = moods.find((m) => m.id === selectedMood)
    return mood?.color || "#1F2937"
  }

  const currentRecommendations = selectedMood
    ? movieRecommendations[selectedMood]
    : []

  return (
    <div
      className="relative w-full min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        backgroundColor: showRecommendations ? getMoodColor() : "#1F2937",
      }}
    >
      {/* SOLID COLOR BLOB - NO FEATHERING - CLEAN EXPANSION */}
      {showColorWave && (
        <div
          className="fixed inset-0 z-30 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${colorWaveOrigin.x}px ${colorWaveOrigin.y}px, 
              ${getMoodColor()} 0%, 
              ${getMoodColor()} 48%, 
              transparent 48.1%)`,
            animation: `ripple-expand ${RIPPLE_SPEED}s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
            // @ts-ignore
            "--ripple-scale": RIPPLE_SCALE,
          }}
        />
      )}

      {/* iOS-Style Push Notification */}
      {showNotification && (
        <div
          className="fixed top-0 left-0 right-0 animate-notification-slide cursor-pointer z-50"
          onClick={handleNotificationClick}
        >
          <div className="mx-4 mt-4 bg-gray-900 bg-opacity-95 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden">
            {/* Notification Header */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🌙</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold">Moodly</p>
                <p className="text-gray-400 text-xs">now</p>
              </div>
            </div>

            {/* Notification Content */}
            <div className="px-5 pb-4">
              <p className="text-white text-base font-medium mb-1">
                How are you feeling tonight?
              </p>
              <p className="text-gray-300 text-sm">
                Tap to discover content that matches your mood
              </p>
            </div>

            {/* Subtle notification indicator line */}
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />
          </div>
        </div>
      )}

      {/* Mood Selector - Floating Card Design */}
      {showMoodSelector && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-40 ${
            isTransitioning ? "animate-bubble-out" : "animate-fade-in"
          }`}
          style={{
            background:
              "radial-gradient(circle at center, rgba(76, 81, 191, 0.15) 0%, rgba(0, 0, 0, 0.85) 100%)",
          }}
        >
          <div
            className={`relative max-w-2xl w-full mx-4 ${
              isTransitioning ? "animate-scale-out" : "animate-scale-in"
            }`}
          >
            {/* Glowing backdrop effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-[3rem] blur-3xl opacity-20 animate-pulse-glow" />

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-gray-900 to-black border border-white border-opacity-10 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-block mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-indigo-500/50">
                    <span className="text-4xl">✨</span>
                  </div>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                  How are you feeling?
                </h2>
                <p className="text-gray-400 text-lg">
                  Choose your vibe for tonight
                </p>
              </div>

              {/* Mood Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
                {moods.map((mood, index) => (
                  <button
                    key={mood.id}
                    onClick={(e) => handleMoodSelect(mood.id, e)}
                    className="group relative overflow-hidden rounded-3xl p-6 md:p-8 transition-all duration-500 hover:scale-105 active:scale-95"
                    style={{
                      background: `linear-gradient(135deg, ${mood.color}15 0%, ${mood.color}05 100%)`,
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    {/* Animated gradient on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${mood.color}30 0%, ${mood.color}10 100%)`,
                      }}
                    />

                    {/* Glow effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
                      style={{ backgroundColor: `${mood.color}40` }}
                    />

                    {/* Content */}
                    <div className="relative z-10 text-center">
                      <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                        {mood.id === "restless" && "🌊"}
                        {mood.id === "anxious" && "⚡"}
                        {mood.id === "happy" && "☀️"}
                        {mood.id === "sad" && "🌧️"}
                        {mood.id === "nostalgic" && "🎞️"}
                        {mood.id === "focused" && "🎯"}
                      </div>
                      <p
                        className="text-lg md:text-xl font-bold tracking-wide"
                        style={{ color: mood.color }}
                      >
                        {mood.label}
                      </p>
                    </div>

                    {/* Border glow */}
                    <div
                      className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        boxShadow: `inset 0 0 20px ${mood.color}40, 0 0 20px ${mood.color}20`,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Movie Recommendations - Cinematic Layout */}
      {showRecommendations && (
        <div className="w-full h-full flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-7xl mx-auto">
            {/* Header with animated gradient text */}
            <div className="text-center mb-16">
              <div className="inline-block mb-6">
                <div className="flex items-center gap-3 px-6 py-3 bg-white bg-opacity-10 backdrop-blur-md rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white text-sm font-medium">
                    {currentRecommendations.length} matches found
                  </span>
                </div>
              </div>

              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60 animate-gradient">
                  Perfect for {selectedMood}
                </span>
              </h2>
              <p className="text-white text-opacity-70 text-xl max-w-2xl mx-auto">
                Curated content that matches your energy right now
              </p>
            </div>

            {/* Movie Cards - Staggered Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-16">
              {currentRecommendations.map((movie, index) => (
                <div
                  key={movie.tmdbId}
                  className="group relative animate-slide-up"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animationFillMode: "backwards",
                  }}
                >
                  {/* Card backdrop glow */}
                  <div
                    className="absolute -inset-1 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${getMoodColor()}80, ${getMoodColor()}40)`,
                    }}
                  />

                  {/* Main card */}
                  <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/20 hover:border-white/40 transition-all duration-500 group-hover:scale-[1.02]">
                    {/* Movie poster */}
                    <div className="aspect-[2/3] relative overflow-hidden">
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />

                      {/* TMDB badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full">
                        <p className="text-yellow-400 text-xs font-bold">
                          ★ TMDB
                        </p>
                      </div>

                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 group-hover:scale-110 transition-transform">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-white text-2xl font-bold mb-3 tracking-tight">
                        {movie.title}
                      </h3>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-px flex-1 bg-gradient-to-r from-white/40 to-transparent" />
                      </div>

                      <p className="text-white/90 font-medium mb-2 italic">
                        "{movie.tagline}"
                      </p>
                      <p className="text-white/60 text-sm leading-relaxed">
                        {movie.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="text-center">
              <button
                onClick={() => {
                  setShowRecommendations(false)
                  setSelectedMood(null)
                  setTimeout(() => setShowNotification(true), 300)
                }}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg overflow-hidden hover:scale-105 transition-transform duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 group-hover:text-white transition-colors">
                  Choose Different Mood
                </span>
                <span className="relative z-10 text-2xl group-hover:text-white transition-colors">
                  ✨
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* Single ripple animation that uses the scale variable */
        @keyframes ripple-expand {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          8% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale(var(--ripple-scale));
          }
        }

        @keyframes notification-slide {
          0% {
            opacity: 0;
            transform: translateY(-100%);
          }
          60% {
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes scale-out {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.9);
          }
          100% {
            opacity: 0;
            transform: scale(0.8);
          }
        }

        @keyframes bubble-out {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        @keyframes pulse-glow {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.25;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-notification-slide {
          animation: notification-slide 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-scale-out {
          animation: scale-out 1.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .animate-bubble-out {
          animation: bubble-out 1.5s ease-out;
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }

        /* Custom play button triangle */
        .border-l-12 {
          border-left-width: 12px;
        }
      `}</style>
    </div>
  )
}

export default MoodlyExperience
