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

  const currentMode = mode ?? internalMode

  // --- Logic: Outside click ---
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

  // Logic: Shortcuts
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
    return () => window.addEventListener("keydown", handler)
  }, [])

  const setMode = (m: SearchMode) => {
    if (mode === undefined) setInternalMode(m)
    onModeChange?.(m)
    setIsMenuOpen(false)
  }

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
    <div
      ref={wrapperRef}
      className={`relative w-full max-w-2xl transition-all duration-300 ${className}`}
    >
      <form
        onSubmit={handleSubmit}
        className={`
          flex items-center gap-2 p-1.5 rounded-full transition-all duration-300
          border border-white/40 shadow-lg backdrop-blur-md
          ${isOpen ? "bg-white/80 ring-2 ring-pink-200" : "bg-white/40 hover:bg-white/60"}
        `}
      >
        {/* Mode selector */}

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={isOpen ? "Type your mood..." : placeholder}
          className="flex-1 bg-transparent px-2 text-[#1a1a1a] font-medium placeholder-gray-500 focus:outline-none"
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-[#2a2a2a] text-white px-6 py-2 rounded-full font-bold text-sm tracking-wide shadow-md hover:bg-black transition-all active:scale-95"
        >
          SEARCH
        </button>
      </form>

      {/* Keyboard Shortcut Hint */}
      {!isOpen && (
        <div className="absolute right-4 -bottom-8 pointer-events-none"></div>
      )}
    </div>
  )
}

export default SearchBar
