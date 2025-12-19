"use client"
import React, { useState } from "react"
import "./playlist.css"
import { useUser } from "@/contexts/UserContext"
import { toast } from "sonner"

interface Playlist {
  id: string
  name: string
  type: string
  isShared?: boolean
  isPrivate?: boolean
}

interface PlaylistModalProps {
  itemId: string
  onClose: () => void
  type: string
  playlists: Playlist[]
  isLoadingPlaylists: boolean
  onPlaylistsChange: (playlists: Playlist[]) => void
}

const PlaylistComponent: React.FC<PlaylistModalProps> = ({
  onClose,
  itemId,
  type,
  playlists,
  isLoadingPlaylists,
  onPlaylistsChange,
}) => {
  const { user } = useUser()
  const [showNewPlaylist, setShowNewPlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  /**
   * Creates a new playlist synchronously and updates state
   * Returns immediately with playlist data so user can use it right away
   */
  const handleCreatePlaylist = async (name: string) => {
    if (!user?.id || !name.trim()) return

    setIsCreating(true)
    try {
      const response = await fetch("/api/playlist/create-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: user.id, name: name, type: type }),
      })

      if (!response.ok) {
        toast.error("Failed to create playlist")
        return
      }

      const data = await response.json()

      // Update state immediately with new playlist
      // User sees it appear in the list right away (no delay)
      const newPlaylist: Playlist = {
        id: data.playlist.id,
        name: data.playlist.name,
        type: data.playlist.type,
      }

      onPlaylistsChange([...playlists, newPlaylist])
      toast.success("Playlist created!")

      // Reset form
      setShowNewPlaylist(false)
      setNewPlaylistName("")
    } catch (error) {
      console.error("Error creating playlist:", error)
      toast.error("Error creating playlist")
    } finally {
      setIsCreating(false)
    }
  }

  /**
   * Adds item to playlist asynchronously via Inngest
   * User sees immediate feedback (toast), DB write happens in background
   */
  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      // Send to Inngest immediately, don't wait
      await fetch("/api/playlist/add-to-playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playlistId: playlistId,
          itemId: itemId,
        }),
      })

      // Show instant feedback to user
      const playlist = playlists.find((p) => p.id === playlistId)
      toast.success(`Added to "${playlist?.name}"`)

      // Close modal after successful feedback
      onClose()
    } catch (error) {
      console.error("Error adding to playlist:", error)
      toast.error("Failed to add to playlist")
    }
  }

  return (
    <div className="playlist-modal-overlay">
      <div className="playlist-modal">
        {/* Header */}
        <div className="playlist-header">
          <h2 className="playlist-title">Save to...</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Loading State */}
        {isLoadingPlaylists ? (
          <div className="playlist-loading">
            <p>Loading playlists...</p>
          </div>
        ) : (
          <>
            {/* Playlist List */}
            <div className="playlist-list">
              {playlists && playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <div
                    className="playlist-item"
                    key={playlist.id}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    <div className="playlist-left">
                      <input type="checkbox" className="playlist-checkbox" />
                      <span className="playlist-name">{playlist.name}</span>
                    </div>
                    <div className="playlist-icon">
                      {playlist.isShared
                        ? "🔗"
                        : playlist.isPrivate
                          ? "🔒"
                          : ""}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-playlists">
                  <p>No playlists yet. Create one!</p>
                </div>
              )}
            </div>

            {/* Add New Playlist Button */}
            {!showNewPlaylist && (
              <div
                className="new-playlist-btn"
                onClick={() => setShowNewPlaylist(true)}
              >
                + New playlist
              </div>
            )}

            {/* New Playlist Form */}
            {showNewPlaylist && (
              <div className="new-playlist-form">
                <input
                  type="text"
                  placeholder="Enter playlist name"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="playlist-input"
                  autoFocus
                />

                <div className="form-actions">
                  <button
                    className="cancel-btn"
                    onClick={() => {
                      setShowNewPlaylist(false)
                      setNewPlaylistName("")
                    }}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    className="create-btn"
                    onClick={() => handleCreatePlaylist(newPlaylistName)}
                    disabled={!newPlaylistName.trim() || isCreating}
                  >
                    {isCreating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default PlaylistComponent
