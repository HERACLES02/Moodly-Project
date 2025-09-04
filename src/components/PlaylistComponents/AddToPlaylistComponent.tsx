'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import './addtoplaylist.css'
import PlaylistComponent from './PlaylistComponent'
import { useGetUser } from '@/hooks/useGetUser'
import { usePoints } from '@/hooks/usePoints'

interface AddtoPlaylistProps {
  type: string,
  itemId: string
}

export default function AddToPlaylistComponent({ itemId, type }:  AddtoPlaylistProps) {
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoritesPlaylistId, setFavoritesPlaylistId] = useState<string | null>(null)
  const { user } = useGetUser()
  const { addPoints, deductPoints, isAdding } = usePoints()

  // Check if item is already favorited when component loads
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user?.id || !itemId) return

      try {
        const response = await fetch(`/api/playlist/check-favorite?userId=${user.id}&itemId=${itemId}&type=${type}`)
        const data = await response.json()
        
        setIsFavorited(data.isFavorited)
        setFavoritesPlaylistId(data.playlistId)
      } catch (error) {
        console.error('Error checking favorite status:', error)
      }
    }

    checkFavoriteStatus()
  }, [user?.id, itemId, type])

  const handlePlaylist = async () => {
    setShowPlaylist(true)
  }

  const handleFavorite = async () => {
    if (!user?.id || isAdding) return

    if (isFavorited) {
      // Remove from favorites
      try {
        // First, deduct points


        await deductPoints("unfavorite", itemId, type === "MOVIE" ? "movie" : "song")
        
        // Then remove from favorites playlist
        const response = await fetch('/api/playlist/remove-from-playlist', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            playlistId: favoritesPlaylistId, 
            itemId: itemId 
          })
        })

        if (response.ok) {

          console.log('🚫 Removed from favorites and deducted points')
        }
      } catch (error) {
        console.error('Error removing from favorites:', error)
      }
    } else {
      // Add to favorites
      try {
        // First, add points
        await addPoints("favorite", itemId, type === "MOVIE" ? "movie" : "song")
        
        // Then add to favorites playlist
        const response = await fetch('/api/playlist/add-to-playlist', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            playlistId: favoritesPlaylistId, 
            itemId: itemId 
          })
        })

        if (response.ok) {

          console.log('💖 Added to favorites and earned points')
        }
      } catch (error) {
        console.error('Error adding to favorites:', error)
      }
    }
  }

  return (
    <>
      {showPlaylist && (
        <PlaylistComponent 
          type={type} 
          itemId={itemId} 
          onClose={() => setShowPlaylist(false)}
        />
      )}
      
      <button className="action-button" title="Add to playlist" onClick={handlePlaylist}>
        +
      </button>
      
      <button
        onClick={() => {
          setIsFavorited(!isFavorited)
          handleFavorite()}}
        disabled={isAdding}
        className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
        title={isFavorited ? 'Remove from Favorites' : 'Add to Favorites (+5 points)'}
      >
        <Heart 
          className={`heart-icon ${isFavorited ? 'filled' : ''}`}
          fill={isFavorited ? 'currentColor' : 'none'}
        />
      </button>
    </>
  )
}