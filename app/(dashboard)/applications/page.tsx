'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, Plus } from 'lucide-react'
import Dialog from '@/components/fieldwork/Dialog'
import { useFlash } from '@/components/fieldwork/Flash'
import { dayKey, fmtDate, relDate } from '@/lib/format'

interface Application {
  id: string
  company: string
  role: string
  status: string
  appliedDate: string
  interviewDates?: string[]
  personalNotes?: string | null
  updatedAt: string
}

const STATUS: Record<string, { label: string; cls: string }> = {
  applied: { label: 'Applied', cls: 'tag tag-neutral' },
  interviewing: { label: 'Interviewing', cls: 'tag tag-accent' },
  offer: { label: 'Offer', cls: 'tag tag-accent-2' },
  accepted: { label: 'Accepted', cls: 'tag tag-accent' },
  rejected: { label: 'Rejected', cls: 'tag tag-outline' },
  declined: { label: 'Declined', cls: 'tag tag-outline' },
}

interface Draft {
  company: string
  role: string
  status: string
  appliedDate: string
  notes: string
}

const emptyDraft = (): Draft => ({
  company: '',
  role: '',
  status: 'applied',
  appliedDate: dayKey(new Date()),
  notes: '',
})

export default function ApplicationsPage() {
  const flash = useFlash()
  const [apps, setApps] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState('date')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dialog, setDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; id: string | null }>(
    { open: false, mode: 'add', id: null }
  )
  const [draft, setDraft] = useState<Draft>(emptyDraft())
  const [draftError, setDraftError] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  async function fetchApps() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/applications?limit=100')
      if (res.ok) {
        const data = await res.json()
        setApps(data.applications ?? [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  const list = apps
    .filter((a) => statusFilter === 'all' || a.status === statusFilter)
    .sort((a, b) => {
      if (sortKey === 'company') return a.company.localeCompare(b.company)
      if (sortKey === 'status') return a.status.localeCompare(b.status)
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
    })

  const interviewing = apps.filter((a) => a.status === 'interviewing').length
  const offers = apps.filter((a) => a.status === 'offer').length

  function openAdd() {
    setDraft(emptyDraft())
    setDraftError(false)
    setDialog({ open: true, mode: 'add', id: null })
  }

  function openEdit(app: Application) {
    setDraft({
      company: app.company,
      role: app.role,
      status: app.status,
      appliedDate: dayKey(app.appliedDate),
      notes: app.personalNotes ?? '',
    })
    setDraftError(false)
    setDialog({ open: true, mode: 'edit', id: app.id })
  }

  async function saveApp() {
    if (!draft.company.trim() || !draft.role.trim()) {
      setDraftError(true)
      return
    }
    const payload = {
      company: draft.company.trim(),
      role: draft.role.trim(),
      status: draft.status,
      appliedDate: draft.appliedDate,
      personalNotes: draft.notes,
    }
    try {
      if (dialog.mode === 'add') {
        const res = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, source: 'manual' }),
        })
        if (!res.ok) throw new Error()
        flash('Application saved')
      } else {
        const res = await fetch(`/api/applications/${dialog.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) throw new Error()
        flash('Application updated')
      }
      setDialog({ open: false, mode: 'add', id: null })
      fetchApps()
    } catch {
      flash('Failed to save application')
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/applications/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setApps((prev) => prev.filter((a) => a.id !== deleteId))
      flash('Application deleted')
    } catch {
      flash('Failed to delete application')
    } finally {
      setDeleteId(null)
    }
  }

  const deleteTarget = apps.find((a) => a.id === deleteId)

  return (
    <div className="fw-fade" style={{ maxWidth: 1060, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 24,
          gap: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            My Applications
          </h1>
          <p className="text-muted" style={{ fontSize: 15, margin: 0 }}>
            {apps.length} tracked · {interviewing} in interviews · {offers} offer
            {offers === 1 ? '' : 's'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd} style={{ height: 40 }}>
          <Plus size={15} strokeWidth={1.9} />
          Log application
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
        <div className="field" style={{ margin: 0 }}>
          <label>Status</label>
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <option value="all">All statuses</option>
            <option value="applied">Applied</option>
            <option value="interviewing">Interviewing</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
        <div className="field" style={{ margin: 0 }}>
          <label>Sort by</label>
          <select
            className="input"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            style={{ minWidth: 150 }}
          >
            <option value="date">Date applied</option>
            <option value="company">Company</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--color-divider)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}
      >
        <table className="table">
          <thead>
            <tr>
              <th style={{ paddingLeft: 20 }}>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Applied</th>
              <th style={{ textAlign: 'right', paddingRight: 20 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((app) => {
              const st = STATUS[app.status] ?? { label: app.status, cls: 'tag tag-neutral' }
              const isOpen = expanded === app.id
              return (
                <FragmentRow
                  key={app.id}
                  app={app}
                  st={st}
                  isOpen={isOpen}
                  onToggle={() => setExpanded(isOpen ? null : app.id)}
                  onEdit={() => openEdit(app)}
                  onDelete={() => setDeleteId(app.id)}
                />
              )
            })}
          </tbody>
        </table>
        {!isLoading && list.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <p className="text-muted" style={{ margin: 0 }}>
              No applications in this view. Log one to get started.
            </p>
          </div>
        )}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <p className="text-muted" style={{ margin: 0 }}>Loading applications…</p>
          </div>
        )}
      </div>

      {dialog.open && (
        <Dialog onClose={() => setDialog({ open: false, mode: 'add', id: null })} width={460}>
          <div className="dialog-title">
            {dialog.mode === 'edit' ? 'Edit application' : 'Log an application'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Company *</label>
              <input
                className="input"
                value={draft.company}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Role *</label>
              <input
                className="input"
                value={draft.role}
                onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Status</label>
              <select
                className="input"
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Applied date</label>
              <input
                className="input"
                type="date"
                value={draft.appliedDate}
                onChange={(e) => setDraft({ ...draft, appliedDate: e.target.value })}
              />
            </div>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Notes</label>
            <textarea
              className="input"
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />
          </div>
          {draftError && (
            <div style={{ fontSize: 12.5, color: 'var(--color-accent-700)' }}>
              Company and role are required.
            </div>
          )}
          <div className="dialog-actions">
            <button
              className="btn btn-secondary"
              onClick={() => setDialog({ open: false, mode: 'add', id: null })}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={saveApp}>
              Save application
            </button>
          </div>
        </Dialog>
      )}

      {deleteId && (
        <Dialog onClose={() => setDeleteId(null)}>
          <div className="dialog-title">Delete this application?</div>
          <div className="dialog-body">
            {deleteTarget ? `${deleteTarget.company} — ${deleteTarget.role}` : 'This application'} will
            be removed. This can&apos;t be undone.
          </div>
          <div className="dialog-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={confirmDelete}
              style={{ color: 'var(--color-neutral-700)', borderColor: 'var(--color-neutral-500)' }}
            >
              Delete
            </button>
          </div>
        </Dialog>
      )}
    </div>
  )
}

function FragmentRow({
  app,
  st,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
}: {
  app: Application
  st: { label: string; cls: string }
  isOpen: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <>
      <tr>
        <td style={{ paddingLeft: 20 }}>
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 0,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-heading)',
              fontWeight: 600,
              fontSize: 14.5,
              color: 'var(--color-text)',
            }}
          >
            <ChevronRight
              size={14}
              strokeWidth={2}
              style={{
                color: 'var(--color-accent)',
                transform: isOpen ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.15s',
              }}
            />
            {app.company}
          </button>
        </td>
        <td style={{ fontSize: 13.5 }}>{app.role}</td>
        <td>
          <span className={st.cls}>{st.label}</span>
        </td>
        <td style={{ fontSize: 13 }}>
          <div>{fmtDate(app.appliedDate)}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>{relDate(app.appliedDate)}</div>
        </td>
        <td style={{ textAlign: 'right', paddingRight: 20 }}>
          <button className="btn btn-ghost" onClick={onEdit} style={{ fontSize: 12 }}>
            Edit
          </button>
          <button
            className="btn btn-ghost"
            onClick={onDelete}
            style={{ fontSize: 12, color: 'var(--color-neutral-600)' }}
          >
            Delete
          </button>
        </td>
      </tr>
      {isOpen && (
        <tr>
          <td colSpan={5} style={{ background: 'var(--color-surface)', padding: '18px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              <div>
                <h4 className="detail-head" style={{ marginBottom: 6 }}>Notes</h4>
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  {app.personalNotes || 'No notes yet.'}
                </p>
              </div>
              <div>
                <h4 className="detail-head" style={{ marginBottom: 6 }}>Interviews</h4>
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                  {app.interviewDates?.length
                    ? app.interviewDates.map((d) => fmtDate(d)).join(' · ')
                    : 'No interviews logged.'}
                </p>
                <div className="text-muted" style={{ fontSize: 11, marginTop: 10 }}>
                  Updated {fmtDate(app.updatedAt)}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
