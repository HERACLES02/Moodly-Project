"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/contexts/UserContext"
import { Movie } from "@/components/MoodMovies/MoodMovies"
import { Track } from "@/components/MoodMusic/MoodMusicComponent"
import { Search, User, Store, Play, Star } from "lucide-react"
import Image from "next/image"
import "./MobileDashboard.css"
import MobileSearchModal from "./MobileSearchModal"
import ProfileDropdown from "./ProfileDropdown"
import MoodSelector from "./MoodSelector"
import ThemeSelector from "./ThemeSelector"
import AvatarSelector from "./AvatarSelector"
import NotesSection from "./NotesSection"

interface MobileDashboardProps {
  movies: Movie[]
  songs: Track[]
}

export default function MobileDashboard({
  movies,
  songs,
}: MobileDashboardProps) {
  const { user, updateUserMood, updateUserTheme, updateUserAvatar } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"movies" | "songs">("movies")
  const [showSearch, setShowSearch] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [featuredItem, setFeaturedItem] = useState<Movie | Track | null>(null)

  // Modal states
  const [showMoodSelector, setShowMoodSelector] = useState(false)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  // Set random featured item when movies/songs change or tab switches
  useEffect(() => {
    if (activeTab === "movies" && movies.length > 0) {
      const randomMovie = movies[Math.floor(Math.random() * movies.length)]
      setFeaturedItem(randomMovie)
    } else if (activeTab === "songs" && songs.length > 0) {
      const randomSong = songs[Math.floor(Math.random() * songs.length)]
      setFeaturedItem(randomSong)
    }
  }, [activeTab, movies, songs])

  const handleItemClick = (id: number | string) => {
    if (activeTab === "movies") {
      router.push(`/movie/watch/${id}`)
    } else {
      router.push(`/song/listen/${id}`)
    }
  }

  const handleWatchNow = () => {
    if (featuredItem) {
      if (activeTab === "movies") {
        handleItemClick((featuredItem as Movie).id)
      } else {
        handleItemClick((featuredItem as Track).id)
      }
    }
  }

  const handleToggleTab = () => {
    setActiveTab(activeTab === "movies" ? "songs" : "movies")
  }

  // Get poster image
  const getFeaturedPoster = () => {
    if (!featuredItem) return "/images/placeholder.jpg"
    if (activeTab === "movies") {
      return (featuredItem as Movie).poster || "/images/movie-placeholder.jpg"
    } else {
      return (featuredItem as Track).albumArt || "/images/music-placeholder.jpg"
    }
  }

  // Get featured title
  const getFeaturedTitle = () => {
    if (!featuredItem) return ""
    if (activeTab === "movies") {
      return (featuredItem as Movie).title
    } else {
      return (featuredItem as Track).name
    }
  }

  const currentItems = activeTab === "movies" ? movies : songs

  return (
    <div className="mobile-dashboard">
      {/* Top Navbar */}
      <nav className="mobile-navbar">
        <div className="mobile-logo">
          <img
            src="/images/moodly-logo.gif"
            alt="Moodly"
            className="mobile-logo-img"
          />
        </div>
        <div className="mobile-points">
          <span className="mobile-points-value">{user?.points || 0}</span>
          <span className="mobile-points-icon">
            <Star style={{ color: "var(--accent)" }} fill="currentColor" />
          </span>
        </div>
      </nav>

      {/* Curated For You Section with Background Poster */}
      <section className="mobile-hero">
        {/* Background Image with Gradient Overlay */}
        <div className="mobile-hero-background">
          <Image
            src={getFeaturedPoster()}
            alt={getFeaturedTitle()}
            fill
            className="mobile-hero-image"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="mobile-hero-overlay" />
        </div>

        {/* Content */}
        <div className="mobile-hero-content">
          <div className="mobile-hero-text">
            <p className="mobile-hero-label">Curated for you</p>
            <h1 className="mobile-hero-title" onClick={handleToggleTab}>
              {activeTab === "movies" ? "Movies" : "Songs"}
            </h1>
          </div>

          <button className="mobile-watch-button" onClick={handleWatchNow}>
            <Play size={20} fill="currentColor" />
            Watch Live
          </button>
        </div>
      </section>

      {/* Recommendation Sections */}
      <div className="mobile-recommendations">
        {/* Mellow Dreams Section */}
        <section className="mobile-rec-section">
          <h2 className="mobile-rec-title">Mellow Dreams</h2>
          <div className="mobile-rec-scroll">
            {currentItems.slice(0, 6).map((item) => {
              const isMovie = activeTab === "movies"
              const id = isMovie ? (item as Movie).id : (item as Track).id
              const poster = isMovie
                ? (item as Movie).poster
                : (item as Track).albumArt
              const title = isMovie
                ? (item as Movie).title
                : (item as Track).name

              return (
                <div
                  key={id}
                  className="mobile-rec-card"
                  onClick={() => handleItemClick(id)}
                >
                  <div className="mobile-rec-card-image">
                    <Image
                      src={poster || "/images/placeholder.jpg"}
                      alt={title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Love is Simple Section */}
        <section className="mobile-rec-section">
          <h2 className="mobile-rec-title">Love is Simple</h2>
          <div className="mobile-rec-scroll">
            {currentItems.slice(6, 12).map((item) => {
              const isMovie = activeTab === "movies"
              const id = isMovie ? (item as Movie).id : (item as Track).id
              const poster = isMovie
                ? (item as Movie).poster
                : (item as Track).albumArt
              const title = isMovie
                ? (item as Movie).title
                : (item as Track).name

              return (
                <div
                  key={id}
                  className="mobile-rec-card"
                  onClick={() => handleItemClick(id)}
                >
                  <div className="mobile-rec-card-image">
                    <Image
                      src={poster || "/images/placeholder.jpg"}
                      alt={title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <button
          className="mobile-nav-button"
          onClick={() => setShowProfile(!showProfile)}
        >
          <User size={24} />
        </button>

        <button
          className="mobile-nav-button"
          onClick={() => setShowSearch(true)}
        >
          <Search size={28} />
        </button>

        <button
          className="mobile-nav-button"
          onClick={() => router.push("/themes")}
        >
          <Store size={24} />
        </button>
      </nav>

      {/* Profile Dropdown */}
      {showProfile && (
        <div
          className="mobile-profile-overlay"
          onClick={() => setShowProfile(false)}
        >
          <div
            className="mobile-profile-container"
            onClick={(e) => e.stopPropagation()}
          >
            <ProfileDropdown
              userName={user?.anonymousName}
              isAdmin={user?.isAdmin}
              onAddNote={() => {
                setShowProfile(false)
                setShowNotes(true)
              }}
              onSelectMood={() => {
                setShowProfile(false)
                setShowMoodSelector(true)
              }}
              onSelectTheme={() => {
                setShowProfile(false)
                setShowThemeSelector(true)
              }}
              onSelectAvatar={() => {
                setShowProfile(false)
                setShowAvatarSelector(true)
              }}
            />
          </div>
        </div>
      )}

      {/* Search Modal */}
      {showSearch && <MobileSearchModal onClose={() => setShowSearch(false)} />}

      {/* Modals */}
      {showNotes && <NotesSection onClose={() => setShowNotes(false)} />}
      {showMoodSelector && (
        <MoodSelector
          onClose={() => setShowMoodSelector(false)}
          onMoodSelect={(mood) => {
            updateUserMood(mood)
            setShowMoodSelector(false)
          }}
        />
      )}
      {showThemeSelector && (
        <ThemeSelector
          onClose={() => setShowThemeSelector(false)}
          onThemeSelect={(theme) => {
            updateUserTheme(theme)
            setShowThemeSelector(false)
          }}
        />
      )}
      {showAvatarSelector && (
        <AvatarSelector
          onClose={() => setShowAvatarSelector(false)}
          onAvatarSelect={(avatarId) => {
            updateUserAvatar(avatarId === "default" ? null : avatarId)
            setShowAvatarSelector(false)
          }}
        />
      )}
    </div>
  )
}
