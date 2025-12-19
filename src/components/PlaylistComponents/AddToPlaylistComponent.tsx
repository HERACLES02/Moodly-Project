"use client"

import { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"
import "./addtoplaylist.css"
import PlaylistComponent from "./PlaylistComponent"
import { useUser } from "@/contexts/UserContext"
import { usePoints } from "@/hooks/usePoints"

interface AddtoPlaylistProps {
  type: string
  itemId: string
}

export default function AddToPlaylistComponent({
  itemId,
  type,
}: AddtoPlaylistProps) {
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoritesPlaylistId, setFavoritesPlaylistId] = useState<string | null>(
    null,
  )
  // ✅ OPTIMIZATION: Prevent duplicate API calls with ref
  const hasFetchedFavoriteStatus = useRef(false)

  const { user } = useUser()
  const { addPoints, deductPoints, isAdding } = usePoints()

  // Check if item is already favorited when component loads
  useEffect(() => {
    // ✅ OPTIMIZATION: Only fetch once
    if (!user?.id || !itemId || hasFetchedFavoriteStatus.current) return

    hasFetchedFavoriteStatus.current = true
    checkFavoriteStatus()
  }, [user?.id, itemId, type])

  const checkFavoriteStatus = async () => {
    if (!user?.id || !itemId) return

    try {
      const response = await fetch(
        `/api/playlist/check-favorite?userId=${user.id}&itemId=${itemId}&type=${type}`,
      )
      const data = await response.json()

      setIsFavorited(data.isFavorited)
      setFavoritesPlaylistId(data.playlistId)
    } catch (error) {
      console.error("Error checking favorite status:", error)
    }
  }

  const handlePlaylist = async () => {
    setShowPlaylist(true)
  }

  const handleFavorite = async () => {
    if (!user?.id || isAdding) return

    if (isFavorited) {
      // Remove from favorites
      try {
        // ✅ OPTIMIZATION: Run in parallel with Promise.all
        await Promise.all([
          deductPoints(
            "unfavorite",
            itemId,
            type === "MOVIE" ? "movie" : "song",
          ),
          fetch("/api/playlist/remove-from-playlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              playlistId: favoritesPlaylistId,
              itemId: itemId,
            }),
          }),
        ])

        setIsFavorited(false)
        console.log("🚫 Removed from favorites and deducted points")
      } catch (error) {
        console.error("Error removing from favorites:", error)
      }
    } else {
      // Add to favorites
      try {
        // ✅ OPTIMIZATION: Run in parallel with Promise.all
        const [_, response] = await Promise.all([
          addPoints("favorite", itemId, type === "MOVIE" ? "movie" : "song"),
          fetch("/api/playlist/add-to-favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              itemId: itemId,
              type: type,
            }),
          }),
        ])

        if (response.ok) {
          const data = await response.json()
          setIsFavorited(true)
          setFavoritesPlaylistId(data.playlistId)
          console.log("❤️ Added to favorites and earned points")
        }
      } catch (error) {
        console.error("Error adding to favorites:", error)
      }
    }
  }

  return (
    <div className="add-to-playlist-container">
      {/* Favorite Button */}
      <button
        onClick={() => {
          setIsFavorited(!isFavorited)
          handleFavorite()
        }}
        disabled={isAdding}
        className={`favorite-button ${isFavorited ? "favorited" : ""}`}
        title={
          isFavorited ? "Remove from Favorites" : "Add to Favorites (+5 points)"
        }
      >
        <Heart
          className={`heart-icon ${isFavorited ? "filled" : ""}`}
          fill={isFavorited ? "currentColor" : "none"}
        />
      </button>

      {/* Add to Playlist Button */}
      <button
        className="action-button"
        title="Add to playlist"
        onClick={handlePlaylist}
      >
        +
      </button>

      {/* Playlist Modal */}
      {showPlaylist && (
        <PlaylistComponent
          itemId={itemId}
          type={type}
          onClose={() => setShowPlaylist(false)}
        />
      )}
    </div>
  )
}
