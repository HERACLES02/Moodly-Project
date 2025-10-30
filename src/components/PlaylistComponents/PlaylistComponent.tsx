"use client";
import React, { useEffect, useState } from "react";
import "./playlist.css";

import { useUser } from "@/contexts/UserContext";



interface PlaylistModalProps {

  itemId: string;
  onClose: () => void;
  type: string
}

const PlaylistComponent: React.FC<PlaylistModalProps> = ({ onClose, itemId, type }) => {
    const { user } = useUser()
    const [playlists, setPlaylists] = useState(null)
    const [showNewPlaylist, setShowNewPlaylist] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");

    useEffect(() => {
  const getPlaylist = async () => {
    if (user?.id) {
      const response = await fetch(`/api/playlist/get-playlist?userid=${user.id}&type=${type}`)
      const returned_playlists = await response.json();
      setPlaylists(returned_playlists);
    }
  }

  getPlaylist();
}, [user?.id]); // run whenever user.id changes

  const getPlaylistAgain = async () => {
    if (user?.id) {
      const response = await fetch(`/api/playlist/get-playlist?userid=${user.id}&type=${type}`);
      const returned_playlists = await response.json();
      setPlaylists(returned_playlists);
    }
  }

    

    const handleCretePlaylist = async ( name: string ) => {
        const response = await fetch('/api/playlist/create-playlist',
            {   method : "POST",
                body: JSON.stringify({userid: user?.id, name, type: type })
            }
        )
        

    }

    const handleAddtoPlaylist = async (id : string ) => {
        await fetch('/api/playlist/add-to-playlist',
            {
                method: "POST",
                body: JSON.stringify({ playlistId: id, itemId: itemId })
            }
        )
    }


  return (
    <div className="playlist-modal-overlay">
      <div className="playlist-modal">
        {/* Header */}
        <div className="playlist-header">
          <h2 className="playlist-title">Save video to...</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Playlist List */}

        <div className="playlist-list">
          {playlists && playlists.map((playlist) => (
            <div className="playlist-item" key={playlist.id} onClick={() => handleAddtoPlaylist(playlist.id)}>
              <div className="playlist-left">
                <input type="checkbox" className="playlist-checkbox" />

                <span className="playlist-name">{playlist.name}</span>

                
              </div>
              <div className="playlist-icon">
                {playlist.isShared ? "🔗" : playlist.isPrivate ? "🔒" : ""}
              </div>
            </div>
          ))}
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
            />

           

            <div className="form-actions">
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowNewPlaylist(false);
                  setNewPlaylistName("");
                }}
              >
                Cancel
              </button>
              <button
                className="create-btn"
                onClick={() => {

                  setShowNewPlaylist(false);
                  setNewPlaylistName("");
                  handleCretePlaylist(newPlaylistName)
                  getPlaylistAgain();
                }}
                disabled={!newPlaylistName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaylistComponent;
