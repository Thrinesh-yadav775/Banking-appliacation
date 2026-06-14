'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { logoutUser } from '../lib/api'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  // Check login state when component loads
  useEffect(() => {
    function syncAuth() {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      if (token) {
        setIsLoggedIn(true)
        if (user) {
          try { setUserName(JSON.parse(user).name) } catch { localStorage.removeItem('user') }
        }
      } else {
        setIsLoggedIn(false)
        setUserName('')
      }
    }
    syncAuth()
    window.addEventListener('storage', syncAuth)
    return () => window.removeEventListener('storage', syncAuth)
  }, [])

  async function handleLogout() {
    try {
      await logoutUser()  // blacklists the token on the server
    } catch {
      // continue logout even if server request fails
    }
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    router.push('/login')
  }

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold tracking-wide">
        BankApp
      </Link>

      {/* Nav links */}
      <div className="flex gap-4 items-center">
        {isLoggedIn ? (
          <>
            <span className="text-blue-200 text-sm">Hi, {userName}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-blue-200 font-medium transition">
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
