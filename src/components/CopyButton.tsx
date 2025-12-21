import { useState } from "react"

export function CopyButton({ groupId, type }: { groupId: string, type: 'radio' | 'stream' }) {
  'use client'
  
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    try {
        const windowLocation = window.location.origin + `/custom-party/${type}/${groupId}`
      await navigator.clipboard.writeText(windowLocation)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <button
      onClick={handleCopy}
      className="theme-button-variant-3 px-3 py-1 text-xs"
      title="Copy Group ID"
    >
      {copied ? '✓ Copied' : 'Copy Link'}
    </button>
  )
}
