'use client'

import { useMemo, useState } from 'react'

interface PrepCalendarEvent {
  id: string
  userId: string
  title: string
  description?: string
  dueDate: string | Date
  estimatedHours: number
  eventType: string
  isCompleted: boolean
  isSnoozed: boolean
  snoozeUntil?: string | Date | null
  source: string
  createdAt: string | Date
  updatedAt: string | Date
  applicationId?: string
}

interface CalendarViewProps {
  events: PrepCalendarEvent[]
  selectedView: 'monthly' | 'weekly' | 'list'
  onEventClick: (event: PrepCalendarEvent) => void
  onMarkComplete: (eventId: string, isCompleted: boolean) => Promise<void>
  currentDate: Date
  onDateChange: (date: Date) => void
}

// Helper functions for date formatting
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateFull(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getEventColor(eventType: string): string {
  if (eventType === 'interview') return 'bg-blue-100 text-blue-900 border-blue-300'
  if (eventType === 'general') return 'bg-green-100 text-green-900 border-green-300'
  return 'bg-gray-100 text-gray-900 border-gray-300'
}

function getEventBgColor(eventType: string): string {
  if (eventType === 'interview') return 'bg-blue-50'
  if (eventType === 'general') return 'bg-green-50'
  return 'bg-gray-50'
}

function getEventBorderColor(eventType: string): string {
  if (eventType === 'interview') return 'border-blue-300'
  if (eventType === 'general') return 'border-green-300'
  return 'border-gray-300'
}

// Helper to check if event is snoozed
function isEventSnoozed(event: PrepCalendarEvent): boolean {
  if (!event.isSnoozed || !event.snoozeUntil) {
    return false
  }
  return new Date(event.snoozeUntil) > new Date()
}

// Monthly View Component
function MonthlyView({
  events,
  currentDate,
  onEventClick,
  onMarkComplete,
}: {
  events: PrepCalendarEvent[]
  currentDate: Date
  onEventClick: (event: PrepCalendarEvent) => void
  onMarkComplete: (eventId: string, isCompleted: boolean) => Promise<void>
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  // Create event map for quick lookup (excluding snoozed events)
  const eventsByDate: Record<string, PrepCalendarEvent[]> = {}
  events.forEach((event) => {
    // Skip snoozed events that haven't been unsnoozed yet
    if (isEventSnoozed(event)) {
      return
    }
    const eventDate = new Date(event.dueDate)
    const dateKey = eventDate.toISOString().split('T')[0]
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = []
    }
    eventsByDate[dateKey].push(event)
  })

  // Create calendar grid
  const calendarDays = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Month header */}
      <h2 className="text-2xl font-bold mb-6">
        {firstDay.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })}
      </h2>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-bold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div key={`empty-${index}`} className="bg-gray-50 rounded p-2 min-h-24" />
            )
          }

          const currentDateObj = new Date(year, month, day)
          const dateKey = currentDateObj.toISOString().split('T')[0]
          const dayEvents = eventsByDate[dateKey] || []
          const isToday =
            currentDateObj.toISOString().split('T')[0] ===
            today.toISOString().split('T')[0]

          return (
            <div
              key={day}
              className={`rounded p-2 min-h-24 border-2 ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="font-bold text-gray-700 mb-2">{day}</div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`block w-full text-left text-xs px-2 py-1 rounded border truncate hover:opacity-80 ${getEventColor(
                      event.eventType
                    )}`}
                    title={event.title}
                  >
                    {event.isCompleted && <span className="line-through">✓ </span>}
                    {event.title}
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 px-2">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Weekly View Component
function WeeklyView({
  events,
  currentDate,
  onEventClick,
  onMarkComplete,
}: {
  events: PrepCalendarEvent[]
  currentDate: Date
  onEventClick: (event: PrepCalendarEvent) => void
  onMarkComplete: (eventId: string, isCompleted: boolean) => Promise<void>
}) {
  // Get Monday of the current week
  const date = new Date(currentDate)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date.setDate(diff))

  // Generate week days
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    weekDays.push(d)
  }

  // Group events by date (excluding snoozed events)
  const eventsByDate: Record<string, PrepCalendarEvent[]> = {}
  events.forEach((event) => {
    // Skip snoozed events that haven't been unsnoozed yet
    if (isEventSnoozed(event)) {
      return
    }
    const eventDate = new Date(event.dueDate)
    eventDate.setHours(0, 0, 0, 0)
    const dateKey = eventDate.toISOString().split('T')[0]
    if (!eventsByDate[dateKey]) {
      eventsByDate[dateKey] = []
    }
    eventsByDate[dateKey].push(event)
  })

  // Calculate total hours per day
  const totalHoursByDay = weekDays.map((day) => {
    const dateKey = day.toISOString().split('T')[0]
    const dayEvents = eventsByDate[dateKey] || []
    return dayEvents.reduce((sum, e) => sum + e.estimatedHours, 0)
  })

  const weekTotal = totalHoursByDay.reduce((sum, hours) => sum + hours, 0)
  const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Week header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Week of {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
        </h2>
        <p className="text-gray-600 mt-2">Total hours: {weekTotal.toFixed(1)}h</p>
      </div>

      {/* Prep intensity bar */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-gray-700">Prep Intensity</span>
          <span className="text-sm font-bold">
            {weekTotal < 5
              ? '🟢 Low'
              : weekTotal < 15
                ? '🟡 Medium'
                : weekTotal < 25
                  ? '🟠 High'
                  : '🔴 Very High'}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all ${
              weekTotal < 5
                ? 'bg-green-500'
                : weekTotal < 15
                  ? 'bg-yellow-500'
                  : weekTotal < 25
                    ? 'bg-orange-500'
                    : 'bg-red-500'
            }`}
            style={{ width: `${Math.min((weekTotal / 30) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Daily breakdown */}
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          const dateKey = day.toISOString().split('T')[0]
          const dayEvents = eventsByDate[dateKey] || []
          const dayHours = totalHoursByDay[index]

          return (
            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="font-bold text-center text-sm mb-2">
                {weekDayNames[index]}
              </div>
              <div className="text-xs text-gray-600 text-center mb-3">
                {formatDate(day)}
              </div>
              <div className="space-y-2">
                {dayEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onEventClick(event)}
                    className={`block w-full text-left text-xs px-2 py-1 rounded border hover:opacity-80 ${getEventColor(
                      event.eventType
                    )}`}
                    title={event.title}
                  >
                    {event.isCompleted && <span>✓ </span>}
                    <span className="truncate">{event.title}</span>
                  </button>
                ))}
              </div>
              <div className="text-xs font-bold text-gray-700 text-center mt-2 pt-2 border-t border-gray-300">
                {dayHours}h
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// List View Component
function ListView({
  events,
  onEventClick,
  onMarkComplete,
}: {
  events: PrepCalendarEvent[]
  onEventClick: (event: PrepCalendarEvent) => void
  onMarkComplete: (eventId: string, isCompleted: boolean) => Promise<void>
}) {
  const [sortBy, setSortBy] = useState<'date' | 'category' | 'status'>('date')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAndSorted = useMemo(() => {
    let filtered = events.filter(
      (e) =>
        !isEventSnoozed(e) &&
        (e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description?.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (sortBy === 'date') {
      filtered.sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
    } else if (sortBy === 'category') {
      filtered.sort((a, b) => a.eventType.localeCompare(b.eventType))
    } else if (sortBy === 'status') {
      filtered.sort(
        (a, b) =>
          Number(a.isCompleted) - Number(b.isCompleted)
      )
    }

    return filtered
  }, [events, sortBy, searchTerm])

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <h2 className="text-2xl font-bold mb-6">Upcoming Tasks</h2>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSortBy('date')}
            className={`px-4 py-2 rounded ${
              sortBy === 'date'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sort by Date
          </button>
          <button
            onClick={() => setSortBy('category')}
            className={`px-4 py-2 rounded ${
              sortBy === 'category'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sort by Type
          </button>
          <button
            onClick={() => setSortBy('status')}
            className={`px-4 py-2 rounded ${
              sortBy === 'status'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sort by Status
          </button>
        </div>
      </div>

      {/* Events Table */}
      {filteredAndSorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {events.length === 0
            ? 'No tasks scheduled. Create one to get started!'
            : 'No tasks match your search.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-gray-700">
                  Task
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">
                  Due Date
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">
                  Type
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">
                  Hours
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">
                  Status
                </th>
                <th className="px-4 py-3 text-left font-bold text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((event, index) => (
                <tr
                  key={event.id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${
                    event.isCompleted ? 'bg-gray-50 opacity-75' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onEventClick(event)}
                      className="text-left hover:text-blue-600 hover:underline font-medium"
                    >
                      {event.isCompleted && (
                        <span className="line-through text-gray-500">
                          {event.title}
                        </span>
                      )}
                      {!event.isCompleted && event.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(event.dueDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded text-xs font-bold ${getEventColor(
                        event.eventType
                      )}`}
                    >
                      {event.eventType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {event.estimatedHours}h
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-bold ${
                        event.isCompleted
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {event.isCompleted ? '✓ Done' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={event.isCompleted}
                      onChange={() =>
                        onMarkComplete(event.id, !event.isCompleted)
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Main CalendarView Component
export default function CalendarView({
  events,
  selectedView,
  onEventClick,
  onMarkComplete,
  currentDate,
  onDateChange,
}: CalendarViewProps) {
  return (
    <div>
      {selectedView === 'monthly' && (
        <MonthlyView
          events={events}
          currentDate={currentDate}
          onEventClick={onEventClick}
          onMarkComplete={onMarkComplete}
        />
      )}

      {selectedView === 'weekly' && (
        <WeeklyView
          events={events}
          currentDate={currentDate}
          onEventClick={onEventClick}
          onMarkComplete={onMarkComplete}
        />
      )}

      {selectedView === 'list' && (
        <ListView
          events={events}
          onEventClick={onEventClick}
          onMarkComplete={onMarkComplete}
        />
      )}
    </div>
  )
}
