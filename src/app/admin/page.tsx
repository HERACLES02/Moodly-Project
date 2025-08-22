'use client'
import { useState, useEffect } from 'react'
import './admin.css'
import NavbarComponent from '@/components/NavbarComponent'

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
 
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
    <NavbarComponent/>
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <div className="user-count">
          <span>👥</span>
          <span>{users.length} Users</span>
        </div>
      </div>
      
      <div className="table-container">
        <table className="admin-table">
          <thead className="table-header">
            <tr>
              <th className="table-cell header-cell">Email</th>
              <th className="table-cell header-cell">Username</th>
              <th className="table-cell header-cell">Status</th>
              <th className="table-cell header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {users.map(user => (
              <tr key={user.id} className="table-row">
                <td className="table-cell">{user.email}</td>
                <td className="table-cell username-cell">{user.anonymousName}</td>
                <td className="table-cell status-cell">
                  <span className={`status-badge ${user.isBanned ? 'banned' : 'active'}`}>
                    {user.isBanned ? 'Banned' : 'Active'}
                  </span>
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
                    <button 
                      onClick={() => handleBan(user.id)}
                      className={`action-button ${user.isBanned ? 'unban-button' : 'ban-button'}`}
                    >
                      {user.isBanned ? "Unban" : "Ban"}
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