'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  Calendar,
  FileText,
  LogOut,
} from 'lucide-react'
import { nameFromEmail } from '@/lib/format'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/find-internships', label: 'Find Internships', Icon: Compass },
  { href: '/applications', label: 'My Applications', Icon: Briefcase },
  { href: '/prep-calendar', label: 'Prep Calendar', Icon: Calendar },
  { href: '/resume', label: 'Résumé', Icon: FileText },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setEmail(data?.user?.email ?? null))
      .catch(() => {})
  }, [])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const { name, monogram } = nameFromEmail(email)

  return (
    <aside
      style={{
        width: 250,
        flex: 'none',
        borderRight: '1px solid var(--color-divider)',
        background: 'var(--color-bg)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '26px 0',
      }}
    >
      <div style={{ padding: '0 24px 22px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 26,
            height: 26,
            border: '1.5px solid var(--color-accent)',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div style={{ width: 8, height: 8, background: 'var(--color-accent)', borderRadius: '50%' }} />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: '0.01em',
          }}
        >
          Fieldwork
        </span>
      </div>
      <div className="hr" style={{ margin: '0 0 14px' }} />
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 12 }}>
        {NAV.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className="navitem" data-active={pathname.startsWith(href)}>
            <Icon strokeWidth={1.75} />
            {label}
          </Link>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', padding: '0 12px' }}>
        <div className="hr" style={{ margin: '0 0 12px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '0 12px 12px' }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 14,
              color: 'var(--color-accent)',
            }}
          >
            {monogram}
          </div>
          <div style={{ lineHeight: 1.25, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-heading)' }}>{name}</div>
            <div
              className="text-muted"
              style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {email ?? 'Student'}
            </div>
          </div>
        </div>
        <button className="navitem" onClick={handleLogout} style={{ borderRadius: 'var(--radius-md)' }}>
          <LogOut strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
