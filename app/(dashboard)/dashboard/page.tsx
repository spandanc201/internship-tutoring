'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Compass, Briefcase, Calendar, FileText } from 'lucide-react'
import { dayKey, greeting, nameFromEmail, todayKicker } from '@/lib/format'

interface Application {
  id: string
  status: string
  interviewDates?: string[]
}

interface PrepEvent {
  id: string
  title: string
  dueDate: string
  estimatedHours: number
  eventType: string
  isCompleted: boolean
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function weekBounds(now: Date): { start: Date; end: Date } {
  const start = new Date(now)
  start.setDate(now.getDate() - ((now.getDay() + 6) % 7)) // Monday
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 7)
  return { start, end }
}

export default function DashboardPage() {
  const [firstName, setFirstName] = useState('there')
  const [apps, setApps] = useState<Application[]>([])
  const [events, setEvents] = useState<PrepEvent[]>([])
  const [goodFitCount, setGoodFitCount] = useState(0)
  const [resumeCount, setResumeCount] = useState(0)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.email) setFirstName(nameFromEmail(data.user.email).name.split(' ')[0])
      })
      .catch(() => {})
    fetch('/api/applications?limit=100')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setApps(data?.applications ?? []))
      .catch(() => {})
    fetch('/api/calendar?limit=200')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setEvents(data?.events ?? []))
      .catch(() => {})
    fetch('/api/recommendations')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setGoodFitCount(data?.summary?.goodFitCount ?? 0))
      .catch(() => {})
    fetch('/api/resume/versions')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setResumeCount(data?.resumes?.length ?? 0))
      .catch(() => {})
  }, [])

  const interviewing = apps.filter((a) => a.status === 'interviewing').length
  const offers = apps.filter((a) => a.status === 'offer').length

  const { start, end } = weekBounds(new Date())
  const prepThisWeek = events
    .filter((e) => {
      const d = new Date(e.dueDate)
      return d >= start && d < end
    })
    .reduce((sum, e) => sum + e.estimatedHours, 0)

  const todayK = dayKey(new Date())
  const agenda = events
    .filter((e) => !e.isCompleted && dayKey(e.dueDate) >= todayK)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4)

  const stats = [
    { value: apps.length, label: 'Applications' },
    { value: interviewing, label: 'Interviewing' },
    { value: goodFitCount, label: 'Good-fit roles', accent: true },
    { value: offers, label: 'Offers' },
  ]

  const shortcuts = [
    {
      href: '/find-internships',
      Icon: Compass,
      title: 'Find internships',
      body: `${goodFitCount} good-fit roles matched to your résumé this week.`,
    },
    {
      href: '/applications',
      Icon: Briefcase,
      title: 'Track applications',
      body: `${apps.length} logged. ${interviewing} awaiting or in interviews.`,
    },
    {
      href: '/prep-calendar',
      Icon: Calendar,
      title: 'Prep calendar',
      body: `${prepThisWeek}h scheduled this week across your interviews.`,
    },
    {
      href: '/resume',
      Icon: FileText,
      title: 'Résumé',
      body: `${resumeCount} versions on file. Recommendations use your active one.`,
    },
  ]

  return (
    <div className="fw-fade" style={{ maxWidth: 1060, margin: '0 auto' }}>
      <div className="kicker" style={{ marginBottom: 8 }}>{todayKicker()}</div>
      <h1 style={{ fontSize: 44, fontWeight: 400, letterSpacing: '-0.02em', margin: '0 0 6px' }}>
        {greeting()}, {firstName}.
      </h1>
      <p className="text-muted" style={{ fontSize: 16, margin: '0 0 32px' }}>
        You have{' '}
        <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>
          {interviewing} interview{interviewing === 1 ? '' : 's'}
        </strong>{' '}
        coming up and{' '}
        <strong style={{ color: 'var(--color-text)', fontWeight: 600 }}>{prepThisWeek}h</strong> of
        prep scheduled this week.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
          background: 'var(--color-divider)',
          border: '1px solid var(--color-divider)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          marginBottom: 38,
        }}
      >
        {stats.map((s) => (
          <div key={s.label} style={{ background: 'var(--color-bg)', padding: '22px 24px' }}>
            <div
              className="tnum"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 40,
                fontWeight: 400,
                lineHeight: 1,
                color: s.accent ? 'var(--color-accent-700)' : undefined,
              }}
            >
              {s.value}
            </div>
            <div className="text-muted" style={{ fontSize: 12.5, marginTop: 4 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 36 }}>
        <div>
          <h3 className="section-head">Continue where you left off</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {shortcuts.map(({ href, Icon, title, body }) => (
              <Link
                key={href}
                href={href}
                className="card elev-sm"
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  alignItems: 'flex-start',
                  background: 'var(--color-bg)',
                  textDecoration: 'none',
                  color: 'var(--color-text)',
                }}
              >
                <Icon size={22} strokeWidth={1.6} style={{ color: 'var(--color-accent)' }} />
                <div className="card-title">{title}</div>
                <p className="card-body">{body}</p>
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="section-head">Next up</h3>
          <div className="card" style={{ background: 'var(--color-bg)', gap: 0, padding: 0 }}>
            {agenda.length === 0 && (
              <p className="text-muted" style={{ fontSize: 13, margin: 0, padding: '16px' }}>
                Nothing scheduled ahead. Add a task from the prep calendar.
              </p>
            )}
            {agenda.map((item) => {
              const d = new Date(item.dueDate)
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: 14,
                    padding: '14px 16px',
                    borderBottom: '1px solid var(--color-divider)',
                  }}
                >
                  <div style={{ textAlign: 'center', flex: 'none', width: 38 }}>
                    <div
                      className="tnum"
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 20,
                        fontWeight: 600,
                        lineHeight: 1,
                      }}
                    >
                      {d.getDate()}
                    </div>
                    <div
                      className="text-muted"
                      style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                    >
                      {MON[d.getMonth()]}
                    </div>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 600,
                        fontSize: 14.5,
                        lineHeight: 1.2,
                      }}
                    >
                      {item.title}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
                      {item.estimatedHours}h ·{' '}
                      {item.eventType === 'interview'
                        ? 'interview prep'
                        : item.eventType === 'general'
                          ? 'general prep'
                          : 'custom task'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
