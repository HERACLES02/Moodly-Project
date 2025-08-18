'use client'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleGitHubLogin = () => {
    signIn('github', { callbackUrl: '/dashboard' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        
        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        
        <button
          onClick={handleGitHubLogin}
          className="w-full p-2 mb-4 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          Continue with GitHub
        </button>
        
        <div className="text-center mb-4 text-gray-500">OR</div>
        
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-2 mb-3 border rounded"
          />
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-2 mb-3 border rounded"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <Link href="/register" className="text-purple-600 hover:underline">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  )
}