'use client'

import { useState } from 'react'
import './addtoplaylist.css'
import PlaylistComponent from './PlaylistComponent'
interface AddMusictoPlaylistProps {
  type: string,
  itemId: string
}

export default function AddMusicToPlaylistComponent({ itemId, type }:  AddMusictoPlaylistProps) {
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
        {showPlaylist && <PlaylistComponent type = "SONG" itemId= {itemId} onClose={() => {setShowPlaylist(false)}}/>}
        <button className="action-button" title="Add to favorites" onClick={handlePlaylist}>
                        +
                    </button>
        <button className="action-button" title="Like" onClick={handleFavourites}>
                        ♡
                    </button>
        
        </>

    )
}