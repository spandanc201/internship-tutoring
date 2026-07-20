'use client'

import { useEffect, useMemo, useState } from 'react'
import { MapPin, Banknote, Clock, Plus } from 'lucide-react'
import { useFlash } from '@/components/fieldwork/Flash'
import { fmtDate, relDate, salaryText } from '@/lib/format'

interface Recommendation {
  id: string
  company: string
  roleTitle: string
  description: string
  score: number
  reason: string
  location?: string
  salaryRange?: any
  requiredSkills: string[]
  postedDate: string
  applicationDeadline?: string
  sourceBoards?: string[]
}

interface RecommendationsResponse {
  goodFit: Recommendation[]
  stretch: Recommendation[]
  longShot: Recommendation[]
  summary: {
    total: number
    goodFitCount: number
    stretchCount: number
    longShotCount: number
  }
}

type TabType = 'good_fit' | 'stretch' | 'long_shot'

const TABS: { id: TabType; label: string; pillStyle: React.CSSProperties }[] = [
  {
    id: 'good_fit',
    label: 'Good Fit',
    pillStyle: { background: 'var(--color-accent-100)', color: 'var(--color-accent-800)' },
  },
  {
    id: 'stretch',
    label: 'Stretch',
    pillStyle: { background: 'var(--color-neutral-100)', color: 'var(--color-neutral-800)' },
  },
  {
    id: 'long_shot',
    label: 'Long Shot',
    pillStyle: { border: '1px solid var(--color-divider)', padding: '1px 7px' },
  },
]

function scoreColor(score: number): string {
  if (score >= 75) return 'var(--color-accent-700)'
  if (score >= 50) return 'var(--color-neutral-700)'
  return 'var(--color-neutral-500)'
}

export default function FindInternshipsPage() {
  const flash = useFlash()
  const [data, setData] = useState<RecommendationsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<TabType>('good_fit')
  const [filters, setFilters] = useState({ location: '', skill: '', company: '', sort: 'score' })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loggedKeys, setLoggedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/recommendations')
        if (!res.ok) {
          if (res.status === 404) throw new Error('No active résumé found. Upload one on the Résumé page first.')
          if (res.status === 401) throw new Error('Please sign in to view recommendations.')
          throw new Error('Failed to load recommendations.')
        }
        setData(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    load()
    fetch('/api/applications?limit=100')
      .then((res) => (res.ok ? res.json() : null))
      .then((d) =>
        setLoggedKeys(new Set((d?.applications ?? []).map((a: any) => `${a.company}|${a.role}`)))
      )
      .catch(() => {})
  }, [])

  const allRecs = useMemo(
    () => (data ? [...data.goodFit, ...data.stretch, ...data.longShot] : []),
    [data]
  )
  const locationOptions = useMemo(
    () => Array.from(new Set(allRecs.map((r) => r.location).filter(Boolean))).sort() as string[],
    [allRecs]
  )
  const skillOptions = useMemo(
    () => Array.from(new Set(allRecs.flatMap((r) => r.requiredSkills))).sort(),
    [allRecs]
  )

  const tierList: Recommendation[] = !data
    ? []
    : tab === 'good_fit'
      ? data.goodFit
      : tab === 'stretch'
        ? data.stretch
        : data.longShot

  const recs = tierList
    .filter(
      (r) =>
        (!filters.location || r.location === filters.location) &&
        (!filters.skill || r.requiredSkills.includes(filters.skill)) &&
        (!filters.company || r.company.toLowerCase().includes(filters.company.toLowerCase()))
    )
    .sort((a, b) => {
      if (filters.sort === 'date')
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()
      if (filters.sort === 'salary')
        return (b.salaryRange?.max || 0) - (a.salaryRange?.max || 0)
      if (filters.sort === 'company') return a.company.localeCompare(b.company)
      return b.score - a.score
    })

  async function logApplication(rec: Recommendation) {
    const key = `${rec.company}|${rec.roleTitle}`
    if (loggedKeys.has(key)) {
      flash('Already in your tracker')
      return
    }
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: rec.company,
          role: rec.roleTitle,
          source: 'recommendations',
        }),
      })
      if (!res.ok) throw new Error()
      setLoggedKeys((prev) => new Set(prev).add(key))
      flash(`Logged ${rec.company} — ${rec.roleTitle}`)
    } catch {
      flash('Failed to log application')
    }
  }

  const counts: Record<TabType, number> = {
    good_fit: data?.summary?.goodFitCount ?? data?.goodFit?.length ?? 0,
    stretch: data?.summary?.stretchCount ?? data?.stretch?.length ?? 0,
    long_shot: data?.summary?.longShotCount ?? data?.longShot?.length ?? 0,
  }

  return (
    <div className="fw-fade" style={{ maxWidth: 1060, margin: '0 auto' }}>
      <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
        Find Internships
      </h1>
      <p className="text-muted" style={{ fontSize: 15, margin: '0 0 26px' }}>
        Personalised recommendations, scored against your active résumé and interests.
      </p>

      {error ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            border: '1px dashed var(--color-divider)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p className="text-muted" style={{ margin: 0 }}>{error}</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 14,
              alignItems: 'flex-end',
              padding: '16px 18px',
              border: '1px solid var(--color-divider)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 22,
            }}
          >
            <div className="field" style={{ flex: 1, minWidth: 150, margin: 0 }}>
              <label>Location</label>
              <select
                className="input"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              >
                <option value="">All locations</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 150, margin: 0 }}>
              <label>Skill</label>
              <select
                className="input"
                value={filters.skill}
                onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
              >
                <option value="">Any skill</option>
                {skillOptions.map((sk) => (
                  <option key={sk} value={sk}>{sk}</option>
                ))}
              </select>
            </div>
            <div className="field" style={{ flex: 1, minWidth: 150, margin: 0 }}>
              <label>Company</label>
              <input
                className="input"
                placeholder="Search company"
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
              />
            </div>
            <div className="field" style={{ flex: 1, minWidth: 150, margin: 0 }}>
              <label>Sort by</label>
              <select
                className="input"
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
              >
                <option value="score">Match score</option>
                <option value="date">Most recent</option>
                <option value="salary">Salary</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 28,
              borderBottom: '1px solid var(--color-divider)',
              marginBottom: 24,
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.id}
                className="tabbtn"
                data-active={tab === t.id}
                onClick={() => {
                  setTab(t.id)
                  setExpanded(null)
                }}
              >
                {t.label}{' '}
                <span
                  className="tnum"
                  style={{ fontSize: 11, padding: '2px 8px', borderRadius: 9, ...t.pillStyle }}
                >
                  {counts[t.id]}
                </span>
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-muted" style={{ fontSize: 14 }}>Scoring postings against your résumé…</p>
          ) : recs.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                border: '1px dashed var(--color-divider)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <p className="text-muted" style={{ margin: 0 }}>
                {(data?.summary.total ?? 0) === 0
                  ? 'No internship postings are available yet. Check back soon — recommendations will appear once roles are listed.'
                  : 'No roles match your filters in this tier. Try widening the filters.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {recs.map((rec) => {
                const logged = loggedKeys.has(`${rec.company}|${rec.roleTitle}`)
                const isOpen = expanded === rec.id
                return (
                  <div
                    key={rec.id}
                    className="card elev-sm"
                    style={{ background: 'var(--color-bg)', gap: 0, padding: 0, overflow: 'hidden' }}
                  >
                    <div style={{ padding: '20px 22px' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 20,
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 11,
                              letterSpacing: '0.1em',
                              textTransform: 'uppercase',
                              color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
                            }}
                          >
                            {rec.company}
                            {rec.sourceBoards?.length ? ` · ${rec.sourceBoards[0]}` : ''}
                          </div>
                          <h3 style={{ fontSize: 23, fontWeight: 600, margin: '3px 0 0', letterSpacing: '-0.01em' }}>
                            {rec.roleTitle}
                          </h3>
                        </div>
                        <div style={{ flex: 'none', textAlign: 'right' }}>
                          <div
                            className="tnum"
                            style={{
                              fontFamily: 'var(--font-heading)',
                              fontSize: 30,
                              fontWeight: 600,
                              lineHeight: 1,
                              color: scoreColor(rec.score),
                            }}
                          >
                            {Math.round(rec.score)}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'color-mix(in srgb, var(--color-text) 50%, transparent)',
                              marginTop: 2,
                            }}
                          >
                            match
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: 14, margin: '12px 0 14px', maxWidth: '62ch' }}>{rec.reason}</p>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 18,
                          fontSize: 12.5,
                          color: 'color-mix(in srgb, var(--color-text) 60%, transparent)',
                          marginBottom: 14,
                        }}
                      >
                        {rec.location && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            <MapPin size={14} strokeWidth={1.75} />
                            {rec.location}
                          </span>
                        )}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Banknote size={14} strokeWidth={1.75} />
                          {salaryText(rec.salaryRange)}
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Clock size={14} strokeWidth={1.75} />
                          Posted {relDate(rec.postedDate)}
                        </span>
                        {rec.applicationDeadline && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              color: 'var(--color-accent-700)',
                            }}
                          >
                            Deadline {fmtDate(rec.applicationDeadline)}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 16 }}>
                        {rec.requiredSkills.map((sk) => (
                          <span key={sk} className="tag tag-neutral">{sk}</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setExpanded(isOpen ? null : rec.id)}
                        >
                          {isOpen ? 'Hide posting' : 'View posting'}
                        </button>
                        <button className="btn btn-primary" onClick={() => logApplication(rec)}>
                          {logged ? 'Logged ✓' : (
                            <>
                              <Plus size={15} strokeWidth={1.9} />
                              Log application
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    {isOpen && (
                      <div
                        style={{
                          background: 'var(--color-surface)',
                          borderTop: '1px solid var(--color-divider)',
                          padding: '18px 22px',
                        }}
                      >
                        <h4 className="detail-head" style={{ fontSize: 13 }}>The posting</h4>
                        <p
                          style={{
                            fontSize: 13.5,
                            lineHeight: 1.65,
                            margin: 0,
                            maxWidth: '70ch',
                            textAlign: 'justify',
                          }}
                        >
                          {rec.description}
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
