"use client"

import { useState, useEffect } from "react"
import "./PointHistory.css"

// Define what each point history entry looks like
interface PointHistoryEntry {
  id: string
  points: number // Can be positive or negative
  reason: string // "Favorited a movie", "Redeemed theme: Van Gogh", etc.
  createdAt: string // ISO date string
}

// Component props - no props needed since it shows current user's history
interface PointHistoryProps {
  className?: string // Optional additional CSS classes
}

export default function PointHistory({ className = "" }: PointHistoryProps) {
  // Component state - manages all data internally
  const [history, setHistory] = useState<PointHistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // When component mounts, fetch the point history
  useEffect(() => {
    fetchPointHistory()
  }, [])

  const fetchPointHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      // Call our new API endpoint
      const response = await fetch("/api/points/history")
      const data = await response.json()

      if (data.success) {
        setHistory(data.history || [])
      } else {
        setError(data.error || "Failed to load point history")
      }
    } catch (error) {
      console.error("Error fetching point history:", error)
      setError("Failed to load point history")
    } finally {
      setLoading(false)
    }
  }

  // Function to format the date nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Same day - show time
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      // Older than a week - show actual date
      return date.toLocaleDateString()
    }
  }

  // Function to format points with + or - sign
  const formatPoints = (points: number) => {
    if (points > 0) {
      return `+${points}`
    } else {
      return `${points}` // Already has negative sign
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className={`point-history-container loading ${className}`}>
        <div className="point-history-header">
          <h3 className="point-history-title">Point History</h3>
        </div>
        <div className="point-history-loading">
          <div className="loading-spinner"></div>
          <p>Loading your point history...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={`point-history-container error ${className}`}>
        <div className="point-history-header">
          <h3 className="">Point Histoy</h3>
        </div>
        <div className="point-history-error">
          <p>❌ {error}</p>
          <button onClick={fetchPointHistory} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Show empty state if no history
  if (history.length === 0) {
    return (
      <div className={`point-history-container empty ${className}`}>
        <div className="point-history-header">
          <h3 className="point-history-title">Point History</h3>
        </div>
        <div className="point-history-empty">
          <p>📈 No point history yet!</p>
          <p>Start earning points by watching content and favoriting media.</p>
        </div>
      </div>
    )
  }

  // Main render - show the table
  return (
    <div className={`point-history-container ${className}`}>
      <div className="point-history-header">
        <h3 className="theme-title">Point History</h3>
        <p className="point-history-subtitle">Your recent point activity</p>
      </div>

      <div className="point-history-table-wrapper">
        <table className="point-history-table">
          <thead>
            <tr>
              <th className="col-action">Action/Reason</th>
              <th className="col-points">Points</th>
              <th className="col-time">Time</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.id} className="history-row">
                <td className="col-action">
                  <span className="action-text">{entry.reason}</span>
                </td>
                <td className="col-points">
                  <span
                    className={`points-badge ${entry.points > 0 ? "positive" : "negative"}`}
                  >
                    {formatPoints(entry.points)}
                  </span>
                </td>
                <td className="col-time">
                  <span className="time-text">
                    {formatDate(entry.createdAt)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
