'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { SignOutButton } from '@/components/SignOutButton'

export function Nav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const hideNavPaths = ['/', '/login', '/register']
  if (hideNavPaths.includes(pathname)) return null

  return (
    <nav style={{
      height: 48,
      background: '#161b22',
      borderBottom: '1px solid #30363d',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 24,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link href="/dashboard" style={{
        color: '#f0f6fc',
        fontWeight: 700,
        fontSize: 15,
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        AI Builder
      </Link>

      <div style={{ display: 'flex', gap: 4, flex: 1 }} className="nav-links">
        {[
          { href: '/dashboard', label: 'Dashboard' },
          { href: '/projects', label: 'Projects' },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              padding: '4px 12px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: pathname === href ? 600 : 400,
              color: pathname === href ? '#f0f6fc' : '#8b949e',
              textDecoration: 'none',
              background: pathname === href ? 'rgba(99,102,241,0.15)' : 'transparent',
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {user && (
          <span style={{ fontSize: 13, color: '#8b949e' }}>{user.email}</span>
        )}
        <SignOutButton />
      </div>

      <style>{`
        @media (max-width: 767px) {
          .nav-links { display: none !important; }
        }
      `}</style>
    </nav>
  )
}
