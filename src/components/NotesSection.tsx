'use client'
import { useState, useEffect } from 'react'

export default function NotesSection() {
  const [notes, setNotes] = useState<any[]>([])
  const [isWriting, setIsWriting] = useState(false)
  const [content, setContent] = useState('')

  useEffect(() => {
    fetch('/api/notes')
      .then(res => res.json())
      .then(data => setNotes(data))
  }, [])

  const handleSubmit = async () => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })
    
    if (response.ok) {
      const newNote = await response.json()
      setNotes([newNote, ...notes])
      setIsWriting(false)
      setContent('')
    }
  }

  return (
    <div>
      <button
        onClick={() => setIsWriting(true)}
        className="mb-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        Add Note
      </button>

      {isWriting && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            className="w-full h-32 p-2 border rounded"
          />
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => setIsWriting(false)}
              className="px-4 py-2 text-gray-700 border rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {notes.map(note => (
          <div key={note.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg">{note.title}</h3>
            <p className="text-gray-700">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}