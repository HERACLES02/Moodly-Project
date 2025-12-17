"use client"

import React, { useEffect, useRef, useState } from "react"

export type SearchMode = "movie" | "song"

export type SearchBarProps = {
  placeholder?: string
  className?: string
  mode?: SearchMode
  onModeChange?: (mode: SearchMode) => void
  onSubmit?: (value: string, mode: SearchMode) => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search…",
  className = "",
  mode,
  onModeChange,
  onSubmit,
}) => {
  const [value, setValue] = useState<string>("")
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [internalMode, setInternalMode] = useState<SearchMode>("movie")

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const currentMode = mode ?? internalMode

  // --- Outside click: use pointerdown so it's consistent; close bar & menu
  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setIsMenuOpen(false)
      }
    }
    document.addEventListener("pointerdown", handleOutside)
    return () => document.removeEventListener("pointerdown", handleOutside)
  }, [])

  // "/" to focus, "Esc" to clear/close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement as HTMLElement | null
      const isTyping =
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        active?.getAttribute("contenteditable") === "true"

      if (!isTyping && e.key === "/") {
        e.preventDefault()
        setIsOpen(true)
        inputRef.current?.focus()
      }
      if (active === inputRef.current && e.key === "Escape") {
        setValue("")
        inputRef.current?.blur()
        setIsOpen(false)
        setIsMenuOpen(false)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const setMode = (m: SearchMode) => {
    if (mode === undefined) setInternalMode(m)
    onModeChange?.(m)
    setIsMenuOpen(false)
  }

  // Ensure the menu item handler fires BEFORE the outside-click listener
  const pick =
    (m: SearchMode) => (e: React.MouseEvent | React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setMode(m)
    }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit?.(value, currentMode)
    inputRef.current?.blur()
    setIsOpen(false)
    setIsMenuOpen(false)
  }

  return (
    <div ref={wrapperRef} className={`searchbar-wrapper ${className || ""}`}>
      <form
        onSubmit={handleSubmit}
        className={`searchbar ${isOpen ? "open" : ""}`}
        role="search"
        aria-label="Search"
      >
        {/* Mode selector */}
        <div className="searchbar-selector-wrap">
          <button
            type="button"
            className="searchbar-selector"
            aria-haspopup="listbox"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            <span className="searchbar-selector-dot" aria-hidden="true" />
            <span className="searchbar-selector-label">
              {currentMode === "movie" ? "Movies" : "Songs"}
            </span>
            <svg
              className="searchbar-selector-chevron"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.207l3.71-2.976a.75.75 0 111.06 1.06l-4.24 3.4a.75.75 0 01-.94 0l-4.24-3.4a.75.75 0 01-.02-1.06z"
              />
            </svg>
          </button>

          {isMenuOpen && (
            <div
              ref={menuRef}
              role="listbox"
              className="searchbar-menu"
              tabIndex={-1}
            >
              <button
                type="button"
                role="option"
                aria-selected={currentMode === "movie"}
                className={`searchbar-menu-item ${currentMode === "movie" ? "searchbar-menu-item-active" : ""}`}
                onMouseDown={pick("movie")} // use onMouseDown so it runs before document pointerdown
              >
                Movies
              </button>
              <button
                type="button"
                role="option"
                aria-selected={currentMode === "song"}
                className={`searchbar-menu-item ${currentMode === "song" ? "searchbar-menu-item-active" : ""}`}
                onMouseDown={pick("song")}
              >
                Songs
              </button>
            </div>
          )}
        </div>

        <svg
          className="searchbar-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 0 0 1.57-4.23A6.5 6.5 0 1 0 9.5 15.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
          />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="searchbar-input"
          aria-label={`${currentMode === "movie" ? "Movies" : "Songs"} search`}
        />

        <button
          type="submit"
          className="searchbar-submit"
          aria-label="Submit search"
        >
          Search
        </button>
      </form>
    </div>
  )
}

export default SearchBar
