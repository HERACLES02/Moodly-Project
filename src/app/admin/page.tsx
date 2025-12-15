'use client'
import { useState, useEffect } from 'react'
import './admin.css'
import NavbarComponent from '@/components/NavbarComponent'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bannedWords, setBannedWords] = useState<string[]>([])
  const [newBannedWord, setNewBannedWord] = useState('')
  const [banLoading, setBanLoading] = useState(false)
  const [banError, setBanError] = useState<string | null>(null)

  // Fetch banned words on mount
  useEffect(() => {
    const fetchBannedWords = async () => {
      try {
        const response = await fetch('/api/admin/filter')
        if (response.ok) {
          const data = await response.json()
          setBannedWords(data.words || [])
        }
      } catch (error) {
        // Optionally handle error
      }
    }
    fetchBannedWords()
  }, [])

  const handleAddBannedWord = async (e: React.FormEvent) => {
    e.preventDefault()
    setBanLoading(true)
    setBanError(null)
    try {
      const response = await fetch('/api/admin/filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: newBannedWord })
      })
      const data = await response.json()
      
      if (response.ok) {
        setBannedWords(prev => [...prev, newBannedWord.toLowerCase()])
        setNewBannedWord('')
      } else {
        setBanError(data.error || 'Failed to ban word')
      }
    } catch (error) {
      setBanError('Error banning word')
    }
    setBanLoading(false)
  }

  const handleRemoveBannedWord = async (word: string) => {
    setBanLoading(true)
    setBanError(null)
    try {
      const response = await fetch('/api/admin/filter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
      })
      const data = await response.json()
      
      if (response.ok) {
        setBannedWords(prev => prev.filter(w => w !== word))
      } else {
        setBanError(data.error || 'Failed to remove word')
      }
    } catch (error) {
      setBanError('Error removing word')
    }
    setBanLoading(false)
  }
  // Fetch users when component loads
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/getuser')
        const userData = await response.json()
        setUsers(userData)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching users:', error)
        setLoading(false)
      }
    }
   
    fetchUsers()
  }, [])
 
  const handleUserUpdate = async (userId: string) => {
    const input = document.getElementById(`input-${userId}`) as HTMLInputElement
    const newName = input.value
   
    try {
      const response = await fetch('/api/admin/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, anonymousName: newName })
      })
     
      if (response.ok) {
        // Update the display immediately
        setUsers(users.map(user =>
          user.id === userId
            ? { ...user, anonymousName: newName }
            : user
        ))
      }
    } catch (error) {
      alert('Error updating user')
    }
  }
  
  const handleBan = async(userId: string) => {
    try {
      const response = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
     
      if (response.ok) {
        // Update the ban status immediately
        setUsers(users.map(user =>
          user.id === userId
            ? { ...user, isBanned: !user.isBanned }
            : user
        ))
      }
    } catch (error) {
      alert('Error banning user')
    }
  }
 
  if (loading) {
    return (
      
      <div className="admin-container">
        <div className="loading-message">Loading users...</div>
      </div>
    )
  }
 
  return (
    <>
    {/* <NavbarComponent/> */}
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <div className="user-count">
          <span>👥</span>
          <span>{users.length} Users</span>
        </div>
      </div>
      
      {/* Banned Words Section */}
      <div className="banned-words-section">
        <h2 className="section-title">Banned Words Filter</h2>
        <div className="banned-words-container">
          <form onSubmit={handleAddBannedWord} className="add-word-form">
            <input
              type="text"
              value={newBannedWord}
              onChange={(e) => setNewBannedWord(e.target.value)}
              placeholder="Enter word to ban"
              className="word-input"
              required
            />
            <button 
              type="submit" 
              className="action-button add-button"
              disabled={banLoading}
            >
              {banLoading ? 'Adding...' : 'Add Word'}
            </button>
          </form>
          
          {banError && (
            <div className="error-message">{banError}</div>
          )}
          
          <div className="banned-words-list">
            <h3 className="list-title">Currently Banned Words ({bannedWords.length})</h3>
            {bannedWords.length === 0 ? (
              <p className="no-words">No banned words yet</p>
            ) : (
              <div className="words-grid">
                {bannedWords.map((word, index) => (
                  <div key={index} className="word-item">
                    <span className="word-text">{word}</span>
                    <button
                      onClick={() => handleRemoveBannedWord(word)}
                      className="remove-word-button"
                      disabled={banLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead className="table-header">
            <tr>
              <th className="table-cell header-cell">Email</th>
              <th className="table-cell header-cell">Username</th>
              <th className="table-cell header-cell">Status</th>
              <th className="table-cell header-cell">Update Name</th>
              {/* <th className="table-cell header-cell">Actions</th> */}
            </tr>
          </thead>
          <tbody className="table-body">
            {users.map(user => (
              <tr key={user.id} className="table-row">
                <td className="table-cell">{user.email}</td>
                <td className="table-cell username-cell">{user.anonymousName}</td>
                <td className="table-cell status-cell">
                  <span className={`status-badge ${user.isBanned ? 'banned' : 'active'} mr-5`}>
                    {user.isBanned ? 'Banned' : 'Active'}
                  </span>
                   <button 
                      onClick={() => handleBan(user.id)}
                      className={`action-button ${user.isBanned ? 'unban-button' : 'ban-button'}`}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
                    </button>
                </td>
                <td className="table-cell actions-cell">
                  <div className="action-group">
                    <input 
                      id={`input-${user.id}`} 
                      defaultValue={user.anonymousName} 
                      className="username-input"
                    />
                    <button 
                      onClick={() => handleUserUpdate(user.id)}
                      className="action-button update-button"
                    >
                      Update
                    </button>
                   
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
  
}