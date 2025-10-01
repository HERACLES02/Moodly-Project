'use client'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'


function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { setTheme } = useTheme()




  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get('message')


  useEffect( () => {
    setTheme("default")
  }, [])


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
      router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="">
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="moodlyImage mb-5 h-50 w-75">
                    <img
                        src="/images/moodly-logo.gif"
                        alt="Moodly Logo"
                        className="logo-gif"
                    />
                </div>
      <div className=" p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Login</h1>
        
        {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        
        <form onSubmit={handleEmailLogin}>
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
            placeholder="Password"
            required
            className="w-full p-2 mb-3 border rounded text-black"
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
            Don&apos;t have an account? Register
          </Link>
        </div>
      </div>
    </div>
    </div>
    
  )
}

// Loading component for Suspense fallback
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Login</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}