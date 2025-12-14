"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Home,
  Compass,
  Radio,
  User,
  Film,
  Music,
  TrendingUp,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import Image from "next/image"
import "./MobileDashboard.css"

export interface Movie {
  id: number
  title: string
  poster: string
  overview: string
  releaseDate: string
  rating: number
}

export interface Track {
  id: string
  name: string
  artist: string
  album: string
  albumArt: string
  preview_url: string | null
  external_url: string
}

interface MobileDashboardProps {
  movies: Movie[]
  songs: Track[]
}

export default function MobileDashboard({
  movies,
  songs,
}: MobileDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "home" | "explore" | "live" | "profile"
  >("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [contentType, setContentType] = useState<"movies" | "songs">("movies")
  const { user } = useUser()
  const router = useRouter()

  const normalizedMood = user?.mood?.toLowerCase()
  const supportedMoods = ["happy", "sad"]
  const showRecommendations =
    normalizedMood && supportedMoods.includes(normalizedMood)

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "explore", label: "Explore", icon: Compass },
    { id: "live", label: "Live", icon: Radio },
    { id: "profile", label: "You", icon: User },
  ]

  const handleMovieClick = (movieId: number) => {
    router.push(`/movie/watch/${movieId}`)
  }

  const handleSongClick = (songId: string) => {
    router.push(`/song/listen/${songId}`)
  }

  const handleLiveClick = () => {
    router.push(
      contentType === "movies"
        ? `/stream/${normalizedMood}`
        : `/radio/${normalizedMood}`,
    )
  }

  if (!showRecommendations) {
    return (
      <div className="mobile-dashboard">
        <div className="mobile-coming-soon">
          <div className="coming-soon-card">
            <h2>Coming Soon for {user?.mood} mood!</h2>
            <p>We're currently curating personalized recommendations.</p>
            <p className="highlight">
              Currently available for: Happy and Sad moods
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-dashboard">
      {/* Fixed Header with Search */}
      <header className="mobile-header">
        <div className="mobile-search-bar">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search your mood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </header>

      {/* Content Type Tabs */}
      <div className="content-type-tabs">
        <button
          className={`tab-button ${contentType === "movies" ? "active" : ""}`}
          onClick={() => setContentType("movies")}
        >
          <Film size={18} />
          <span>Movies</span>
        </button>
        <button
          className={`tab-button ${contentType === "songs" ? "active" : ""}`}
          onClick={() => setContentType("songs")}
        >
          <Music size={18} />
          <span>Songs</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="mobile-content">
        {/* Hero Banner */}
        <div className="mobile-hero-banner">
          <div className="hero-content">
            <span className="hero-label">Curated for you</span>
            <h1 className="hero-title">
              {contentType === "movies" ? "Movies" : "Songs"}
            </h1>
            <p className="hero-description">
              {contentType === "movies"
                ? `Handpicked films that match your ${normalizedMood} mood today.`
                : `Songs selected to complement your ${normalizedMood} state of mind.`}
            </p>
            <button onClick={handleLiveClick} className="hero-cta">
              <Radio size={18} />
              <span>
                {contentType === "movies"
                  ? "Join Live Session"
                  : "Join Radio Station"}
              </span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="mobile-content-grid">
          {/* Trending Section */}
          <section className="content-section">
            <div className="section-header">
              <TrendingUp size={20} />
              <h2>Trending Now</h2>
            </div>
            <div className="content-cards">
              {contentType === "movies"
                ? movies.slice(0, 6).map((movie) => (
                    <div
                      key={movie.id}
                      className="content-card"
                      onClick={() => handleMovieClick(movie.id)}
                    >
                      <div className="card-image">
                        <Image
                          src={movie.poster || "/images/movie-placeholder.jpg"}
                          alt={movie.title}
                          width={160}
                          height={240}
                          className="card-img"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/images/movie-placeholder.jpg"
                          }}
                        />
                        <div className="card-overlay">
                          <span className="rating">
                            ⭐ {movie.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="card-info">
                        <h3 className="card-title">{movie.title}</h3>
                      </div>
                    </div>
                  ))
                : songs.slice(0, 6).map((song) => (
                    <div
                      key={song.id}
                      className="content-card"
                      onClick={() => handleSongClick(song.id)}
                    >
                      <div className="card-image square">
                        <Image
                          src={song.albumArt || "/images/music-placeholder.jpg"}
                          alt={song.name}
                          width={160}
                          height={160}
                          className="card-img"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/images/music-placeholder.jpg"
                          }}
                        />
                      </div>
                      <div className="card-info">
                        <h3 className="card-title">{song.name}</h3>
                        <p className="card-subtitle">{song.artist}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </section>

          {/* Recommended Section */}
          <section className="content-section">
            <div className="section-header">
              <h2>Recommended for You</h2>
            </div>
            <div className="content-cards">
              {contentType === "movies"
                ? movies.slice(6, 12).map((movie) => (
                    <div
                      key={movie.id}
                      className="content-card"
                      onClick={() => handleMovieClick(movie.id)}
                    >
                      <div className="card-image">
                        <Image
                          src={movie.poster || "/images/movie-placeholder.jpg"}
                          alt={movie.title}
                          width={160}
                          height={240}
                          className="card-img"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/images/movie-placeholder.jpg"
                          }}
                        />
                        <div className="card-overlay">
                          <span className="rating">
                            ⭐ {movie.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="card-info">
                        <h3 className="card-title">{movie.title}</h3>
                      </div>
                    </div>
                  ))
                : songs.slice(6, 12).map((song) => (
                    <div
                      key={song.id}
                      className="content-card"
                      onClick={() => handleSongClick(song.id)}
                    >
                      <div className="card-image square">
                        <Image
                          src={song.albumArt || "/images/music-placeholder.jpg"}
                          alt={song.name}
                          width={160}
                          height={160}
                          className="card-img"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/images/music-placeholder.jpg"
                          }}
                        />
                      </div>
                      <div className="card-info">
                        <h3 className="card-title">{song.name}</h3>
                        <p className="card-subtitle">{song.artist}</p>
                      </div>
                    </div>
                  ))}
            </div>
          </section>
        </div>

        {/* Bottom padding for navigation */}
        <div className="bottom-spacer" style={{ height: "2rem" }} />
      </main>

      {/* Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                setActiveTab(item.id as any)
                if (item.id === "profile") router.push("/userpage")
                if (item.id === "live") handleLiveClick()
              }}
            >
              <Icon size={24} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
