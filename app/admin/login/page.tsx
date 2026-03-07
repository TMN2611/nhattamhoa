'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { validateAdminCredentials, setAdminSession } from '@/lib/admin-utils'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (validateAdminCredentials(username, password)) {
      setAdminSession(true)
      router.push('/admin/dashboard')
    } else {
      setError('Thông tin đăng nhập không hợp lệ')
    }

    setIsLoading(false)
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-light font-display text-[#F5E6C8] mb-2">
            Nhất Tâm Hoa
          </h1>
          <p className="text-[#D4AF37] tracking-[0.2em] text-xs uppercase">
            Admin Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#C5A55A] text-sm mb-2 tracking-wide">
              Tên người dùng
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên người dùng"
              className="w-full border border-[#D4AF37]/20 bg-[#0d0b09] px-4 py-3 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-[#C5A55A] text-sm mb-2 tracking-wide">
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full border border-[#D4AF37]/20 bg-[#0d0b09] px-4 py-3 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 transition-colors"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="p-3 bg-[#A52525]/20 border border-[#A52525]/40 text-[#F5A6A6] text-sm rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] font-medium tracking-wider uppercase text-sm transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-50"
          >
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-[#0d0b09] border border-[#D4AF37]/10 rounded text-center">
          <p className="text-[#8A7D65] text-xs">Demo Credentials:</p>
          <p className="text-[#D4AF37] text-sm font-mono mt-1">adm1 / 123</p>
        </div>
      </div>
    </main>
  )
}
