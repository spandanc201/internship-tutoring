'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthPanel from '@/components/fieldwork/AuthPanel'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Login failed')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('An error occurred')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.05fr 1fr' }}>
      <AuthPanel />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <form onSubmit={handleLogin} style={{ width: 'min(360px, 100%)' }}>
          <div className="kicker" style={{ marginBottom: 8 }}>Welcome back</div>
          <h2 style={{ fontSize: 34, fontWeight: 600, margin: '0 0 6px' }}>Sign in to Fieldwork</h2>
          <p className="text-muted" style={{ fontSize: 14, margin: '0 0 26px' }}>
            Pick up where you left off.
          </p>
          {error && (
            <div style={{ fontSize: 12.5, color: 'var(--color-accent-700)', marginBottom: 14 }}>
              {error}
            </div>
          )}
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field" style={{ marginBottom: 16 }}>
            <label>Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" style={{ height: 42, marginTop: 8 }}>
            Sign in
          </button>
          <div className="hr" style={{ margin: '22px 0' }} />
          <p className="text-muted" style={{ fontSize: 13, textAlign: 'center', margin: 0 }}>
            New to Fieldwork?{' '}
            <Link href="/signup" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
