'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import Dialog from '@/components/fieldwork/Dialog'
import { useFlash } from '@/components/fieldwork/Flash'
import { MONTHS, dayKey, fmtDate } from '@/lib/format'

interface PrepEvent {
  id: string
  title: string
  description?: string
  dueDate: string
  estimatedHours: number
  eventType: string
  isCompleted: boolean
  isSnoozed?: boolean
  snoozeUntil?: string | null
  source: string
}

type CalView = 'monthly' | 'weekly' | 'list'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEK_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function chipColors(type: string): { accent: string; bg: string } {
  if (type === 'interview')
    return { accent: 'var(--color-accent)', bg: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }
  if (type === 'general') return { accent: 'var(--color-neutral-500)', bg: 'var(--color-surface)' }
  return { accent: 'var(--color-accent-300)', bg: 'transparent' }
}

function typeLabel(type: string): string {
  if (type === 'interview') return 'Interview'
  if (type === 'general') return 'General'
  return 'Custom'
}

function EventChip({ event, onOpen }: { event: PrepEvent; onOpen: () => void }) {
  const { accent, bg } = chipColors(event.eventType)
  return (
    <button
      onClick={onOpen}
      title={event.title}
      style={{
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: 10.5,
        lineHeight: 1.25,
        padding: '3px 6px',
        border: 0,
        borderLeft: `2px solid ${accent}`,
        borderRadius: 2,
        background: bg,
        color: 'var(--color-text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        ...(event.isCompleted ? { textDecoration: 'line-through', opacity: 0.55 } : {}),
      }}
    >
      {event.title}
    </button>
  )
}

export default function PrepCalendarPage() {
  const flash = useFlash()
  const [events, setEvents] = useState<PrepEvent[]>([])
  const [calDate, setCalDate] = useState(() => new Date())
  const [view, setView] = useState<CalView>('monthly')
  const [openEventId, setOpenEventId] = useState<string | null>(null)
  const [taskOpen, setTaskOpen] = useState(false)
  const [taskDraft, setTaskDraft] = useState({ title: '', date: dayKey(new Date()), hours: '2' })

  async function fetchEvents() {
    try {
      const res = await fetch('/api/calendar?limit=500')
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events ?? [])
      }
    } catch {}
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  const eventsFor = (key: string) => events.filter((e) => dayKey(e.dueDate) === key)
  const todayK = dayKey(new Date())

  // ── Month grid ──
  const y = calDate.getFullYear()
  const m = calDate.getMonth()
  const firstDow = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  type Cell = { day: number | ''; key?: string; isToday?: boolean; events: PrepEvent[]; more: number }
  const cells: Cell[] = []
  for (let i = 0; i < firstDow; i++) cells.push({ day: '', events: [], more: 0 })
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const evs = eventsFor(key)
    cells.push({ day, key, isToday: key === todayK, events: evs.slice(0, 2), more: Math.max(evs.length - 2, 0) })
  }
  while (cells.length % 7 !== 0) cells.push({ day: '', events: [], more: 0 })
  const weeks: Cell[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  // ── Week cells ──
  const monday = new Date(calDate)
  monday.setDate(calDate.getDate() - ((calDate.getDay() + 6) % 7))
  const weekCells = [...Array(7)].map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const key = dayKey(d)
    const evs = eventsFor(key)
    return {
      wd: WEEK_NAMES[i],
      day: d.getDate(),
      isToday: key === todayK,
      events: evs,
      hours: evs.reduce((s, e) => s + e.estimatedHours, 0),
    }
  })
  const weekTotal = weekCells.reduce((s, c) => s + c.hours, 0)
  const intensity = weekTotal < 5 ? 'Light' : weekTotal < 12 ? 'Moderate' : weekTotal < 20 ? 'Heavy' : 'Intensive'

  const listEvents = [...events].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  const openEvent = events.find((e) => e.id === openEventId) ?? null

  async function toggleComplete(id: string, isCompleted: boolean) {
    try {
      const res = await fetch(`/api/calendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      })
      if (!res.ok) throw new Error()
      setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, isCompleted } : e)))
    } catch {
      flash('Failed to update task')
    }
  }

  async function snoozeEvent(event: PrepEvent) {
    const next = new Date(event.dueDate)
    next.setDate(next.getDate() + 1)
    try {
      const res = await fetch(`/api/calendar/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: next.toISOString() }),
      })
      if (!res.ok) throw new Error()
      setEvents((prev) =>
        prev.map((e) => (e.id === event.id ? { ...e, dueDate: next.toISOString() } : e))
      )
      setOpenEventId(null)
      flash('Snoozed to the next day')
    } catch {
      flash('Failed to snooze task')
    }
  }

  async function saveTask() {
    if (!taskDraft.title.trim()) return
    try {
      const res = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: taskDraft.title.trim(),
          dueDate: `${taskDraft.date}T00:00:00`,
          estimatedHours: parseFloat(taskDraft.hours) || 1,
          type: 'custom',
        }),
      })
      if (!res.ok) throw new Error()
      setTaskOpen(false)
      setTaskDraft({ title: '', date: dayKey(new Date()), hours: '2' })
      fetchEvents()
      flash('Task added')
    } catch {
      flash('Failed to add task')
    }
  }

  return (
    <div className="fw-fade" style={{ maxWidth: 1060, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 22,
          gap: 20,
        }}
      >
        <div>
          <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
            Prep Calendar
          </h1>
          <p className="text-muted" style={{ fontSize: 15, margin: 0 }}>
            A schedule built from your interview dates and available hours.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setTaskOpen(true)} style={{ height: 40 }}>
          <Plus size={15} strokeWidth={1.9} />
          Add task
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 18,
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            className="btn btn-icon btn-secondary"
            aria-label="Previous month"
            onClick={() => setCalDate(new Date(y, m - 1, 1))}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <h2 style={{ fontSize: 26, fontWeight: 600, margin: 0, minWidth: 200, textAlign: 'center' }}>
            {MONTHS[m]} {y}
          </h2>
          <button
            className="btn btn-icon btn-secondary"
            aria-label="Next month"
            onClick={() => setCalDate(new Date(y, m + 1, 1))}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
        <div className="seg">
          {(['monthly', 'weekly', 'list'] as CalView[]).map((v) => (
            <label key={v} className="seg-opt">
              <input type="radio" name="calview" checked={view === v} onChange={() => setView(v)} />
              {v === 'monthly' ? 'Month' : v === 'weekly' ? 'Week' : 'List'}
            </label>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 18,
          fontSize: 12,
          color: 'color-mix(in srgb, var(--color-text) 60%, transparent)',
          marginBottom: 14,
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-accent)' }} />
          Interview prep
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--color-neutral-500)' }} />
          General prep
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, border: '1.5px solid var(--color-accent)' }} />
          Custom
        </span>
      </div>

      {view === 'monthly' && (
        <div
          style={{
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'var(--color-surface)' }}>
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                style={{
                  padding: 9,
                  textAlign: 'center',
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
                  borderBottom: '1px solid var(--color-divider)',
                }}
              >
                {wd}
              </div>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {week.map((cell, ci) => (
                <div
                  key={ci}
                  style={{
                    minHeight: 104,
                    padding: '6px 7px',
                    borderRight: '1px solid var(--color-divider)',
                    borderBottom: '1px solid var(--color-divider)',
                    background:
                      cell.day === ''
                        ? 'var(--color-surface)'
                        : cell.isToday
                          ? 'color-mix(in srgb, var(--color-accent) 6%, transparent)'
                          : 'var(--color-bg)',
                  }}
                >
                  <div
                    className="tnum"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 13,
                      fontWeight: 600,
                      color: cell.isToday ? 'var(--color-accent)' : 'var(--color-text)',
                      marginBottom: 4,
                    }}
                  >
                    {cell.day}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {cell.events.map((ev) => (
                      <EventChip key={ev.id} event={ev} onOpen={() => setOpenEventId(ev.id)} />
                    ))}
                    {cell.more > 0 && (
                      <div className="text-muted" style={{ fontSize: 10, paddingLeft: 6 }}>
                        +{cell.more} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {view === 'weekly' && (
        <>
          <div
            style={{
              padding: '16px 18px',
              border: '1px solid var(--color-divider)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 9,
              }}
            >
              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 14 }}>
                Prep intensity · {weekTotal}h scheduled
              </span>
              <span style={{ fontSize: 12.5, color: 'var(--color-accent-700)', fontWeight: 600 }}>
                {intensity} week
              </span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--color-surface)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min((weekTotal / 25) * 100, 100)}%`,
                  background: 'var(--color-accent)',
                  borderRadius: 4,
                }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
            {weekCells.map((cell) => (
              <div
                key={cell.wd}
                style={{
                  border: '1px solid var(--color-divider)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 9px',
                  minHeight: 170,
                  background: cell.isToday
                    ? 'color-mix(in srgb, var(--color-accent) 6%, transparent)'
                    : 'var(--color-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: 'color-mix(in srgb, var(--color-text) 55%, transparent)',
                    }}
                  >
                    {cell.wd}
                  </div>
                  <div
                    className="tnum"
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      fontSize: 17,
                      color: cell.isToday ? 'var(--color-accent)' : 'var(--color-text)',
                    }}
                  >
                    {cell.day}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  {cell.events.map((ev) => (
                    <EventChip key={ev.id} event={ev} onOpen={() => setOpenEventId(ev.id)} />
                  ))}
                </div>
                <div
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'color-mix(in srgb, var(--color-text) 60%, transparent)',
                    marginTop: 8,
                    paddingTop: 6,
                    borderTop: '1px solid var(--color-divider)',
                  }}
                >
                  {cell.hours ? `${cell.hours}h` : '—'}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'list' && (
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
                <th style={{ width: 44, paddingLeft: 20 }}></th>
                <th>Task</th>
                <th>Due</th>
                <th>Type</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {listEvents.map((ev) => (
                <tr key={ev.id}>
                  <td style={{ paddingLeft: 20 }}>
                    <input
                      type="checkbox"
                      checked={ev.isCompleted}
                      onChange={() => toggleComplete(ev.id, !ev.isCompleted)}
                      style={{ width: 16, height: 16, accentColor: 'var(--color-accent)', cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => setOpenEventId(ev.id)}
                      style={{
                        background: 'none',
                        border: 0,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: 14,
                        color: 'var(--color-text)',
                        textAlign: 'left',
                        ...(ev.isCompleted ? { textDecoration: 'line-through', opacity: 0.55 } : {}),
                      }}
                    >
                      {ev.title}
                    </button>
                  </td>
                  <td style={{ fontSize: 13 }}>{fmtDate(ev.dueDate)}</td>
                  <td>
                    <span
                      className={
                        ev.eventType === 'interview'
                          ? 'tag tag-accent'
                          : ev.eventType === 'general'
                            ? 'tag tag-neutral'
                            : 'tag tag-outline'
                      }
                    >
                      {typeLabel(ev.eventType)}
                    </span>
                  </td>
                  <td className="tnum" style={{ fontSize: 13 }}>{ev.estimatedHours}h</td>
                </tr>
              ))}
            </tbody>
          </table>
          {listEvents.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px 20px' }}>
              <p className="text-muted" style={{ margin: 0 }}>
                Nothing scheduled yet. Add a task to get started.
              </p>
            </div>
          )}
        </div>
      )}

      {openEvent && (
        <Dialog onClose={() => setOpenEventId(null)}>
          <div className="kicker" style={{ letterSpacing: '0.1em' }}>
            {openEvent.eventType === 'interview'
              ? 'Interview prep'
              : openEvent.eventType === 'general'
                ? 'General prep'
                : 'Custom task'}{' '}
            · {fmtDate(openEvent.dueDate)}
          </div>
          <div
            className="dialog-title"
            style={openEvent.isCompleted ? { textDecoration: 'line-through', opacity: 0.6 } : undefined}
          >
            {openEvent.title}
          </div>
          <div className="dialog-body">
            {openEvent.description ||
              (openEvent.eventType === 'interview'
                ? 'Timed against an upcoming interview in your tracker.'
                : openEvent.eventType === 'general'
                  ? 'Part of your rolling maintenance schedule.'
                  : 'A task you added yourself.')}
            <br />
            <br />
            Estimated {openEvent.estimatedHours}h of focused work.
          </div>
          <div className="dialog-actions">
            <button className="btn btn-secondary" onClick={() => snoozeEvent(openEvent)}>
              Snooze a day
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                toggleComplete(openEvent.id, !openEvent.isCompleted)
                setOpenEventId(null)
              }}
            >
              {openEvent.isCompleted ? 'Mark not done' : 'Mark complete'}
            </button>
          </div>
        </Dialog>
      )}

      {taskOpen && (
        <Dialog onClose={() => setTaskOpen(false)}>
          <div className="dialog-title">Add a prep task</div>
          <div className="field" style={{ margin: 0 }}>
            <label>Task</label>
            <input
              className="input"
              value={taskDraft.title}
              placeholder="e.g. Practice SQL joins"
              onChange={(e) => setTaskDraft({ ...taskDraft, title: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Date</label>
              <input
                className="input"
                type="date"
                value={taskDraft.date}
                onChange={(e) => setTaskDraft({ ...taskDraft, date: e.target.value })}
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Hours</label>
              <input
                className="input"
                type="number"
                min={0.5}
                step={0.5}
                value={taskDraft.hours}
                onChange={(e) => setTaskDraft({ ...taskDraft, hours: e.target.value })}
              />
            </div>
          </div>
          <div className="dialog-actions">
            <button className="btn btn-secondary" onClick={() => setTaskOpen(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={saveTask}>
              Add task
            </button>
          </div>
        </Dialog>
      )}
    </div>
  )
}
