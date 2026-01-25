'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { checkAdminStatus } from '@/lib/actions/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      if (data.user) {
        // Check if user is admin using server action (bypasses RLS issues)
        const adminCheck = await checkAdminStatus()

        if (!adminCheck.success) {
          await supabase.auth.signOut()
          setError(adminCheck.error || 'Could not verify admin status. Please try again.')
          setLoading(false)
          return
        }

        if (!adminCheck.isAdmin) {
          await supabase.auth.signOut()
          setError('Access denied. Admin privileges required.')
          setLoading(false)
          return
        }

        // Redirect to dashboard - use window.location for full reload to ensure session is available
        window.location.href = '/admin/dashboard'
        return
      } else {
        // No user data - shouldn't happen but handle it
        setError('Login failed. No user data returned.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#5a4c46]">
            Admin Login
          </h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#5a4c46] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#5a4c46] mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5a4c46]"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full border border-gray-900 text-gray-900 uppercase tracking-wide text-xs py-3 px-4 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-normal"
            >
              {loading ? 'Logging in...' : 'LOGIN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

