"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import "./MobileSearchModal.css"

interface MobileSearchModalProps {
  onClose: () => void
}

export default function MobileSearchModal({ onClose }: MobileSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="mobile-search-overlay" onClick={onClose}>
      <div
        className="mobile-search-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-search-header">
          <button className="mobile-search-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="mobile-search-input-wrapper">
          <Search className="mobile-search-icon" size={20} />
          <input
            type="text"
            placeholder="What's on your mood today?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mobile-search-input"
            autoFocus
          />
        </div>

        <div className="mobile-search-results">
          <p className="mobile-search-placeholder">
            Search functionality coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
