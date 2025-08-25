'use client'

import { useState } from 'react'
import './addtoplaylist.css'
import PlaylistComponent from './PlaylistComponent'
interface AddtoPlaylistProps {
  type: string,
  itemId: string
}

export default function MoodSelector({ itemId, type }:  AddtoPlaylistProps) {
  const [showPlaylist, setShowPlaylist ] = useState(false)

  const handlePlaylist = async () =>{
    setShowPlaylist(true)

    console.log("added")
  }

  const handleFavourites = async () =>{
    console.log("added")
  }


    return (
        <>
        {showPlaylist && <PlaylistComponent itemId= {itemId} onClose={() => {setShowPlaylist(false)}}/>}
        <button className="action-button" title="Add to favorites" onClick={handlePlaylist}>
                        +
                    </button>
        <button className="action-button" title="Like" onClick={handleFavourites}>
                        ♡
                    </button>
        
        </>

    )
}