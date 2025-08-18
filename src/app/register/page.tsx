'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    generateUsername()
  }, [])

  const generateUsername = async () => {
    try {
      const response = await fetch('/api/generate-username')
      const data = await response.json()
      if (data.anonymousName) {
        setUsername(data.anonymousName)
      }
    } catch (error) {
      setError('Failed to generate username')
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, anonymousName: username }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        router.push('/login?message=Registration successful!')
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-7 text-center text-black">Create Account</h1>
        
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded ">{error}</div>}
        
        <form onSubmit={handleSubmit} >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-2 mb-3 border rounded text-black"
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (6+ chars)"
            required
            minLength={6}
            className="-full p-2 mb-3 border rounded text-black"
          />

          <div className="mb-4 p-3 bg-purple-50 border rounded">
            <label className="block text-sm font-medium mb-2 text-black">Your Anonymous Username</label>
            <div className="flex gap-2">
              <div className="flex-1 p-2 bg-white border rounded font-mono text-purple-600">
                {username || 'Loading...'}
              </div>
              <button
                type="button"
                onClick={generateUsername}

                className="px-3 py-2 bg-purple-600 text-white rounded disabled:bg-gray-400"
              >
               Regenerate
              </button>
            </div>
           
          </div>
          
          <button
            type="submit"
            disabled={loading || !username}
            className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400"
          >
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link href="/login" className="text-purple-600 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  )
}