'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      })
      const data = await res.json()

      if (data.success) {
        setMessage(data.message)
        setUsername('')
      } else {
        setError(data.error || 'Có lỗi xảy ra. Vui lòng thử lại.')
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light font-display text-foreground mb-2">
            Nhất Tâm Hoa
          </h1>
          <p className="text-gold tracking-[0.2em] text-xs uppercase">
            Quên mật khẩu admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gold text-sm mb-2 tracking-wide">
              Tên đăng nhập
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              className="w-full border border-gold/20 bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/20 border border-destructive/40 text-destructive text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-emerald-900/20 border border-emerald-500/40 text-emerald-400 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#B8860B] via-[var(--gold)] to-[#B8860B] text-primary-foreground font-medium tracking-wider uppercase text-sm transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-50"
          >
            {isLoading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/admin/login" className="text-sm text-gold hover:text-foreground transition-colors">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </main>
  )
}
