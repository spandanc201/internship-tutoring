'use client'

import { useState, useEffect } from 'react'
import CalendarView from '@/components/CalendarView'
import CalendarEventForm from '@/components/CalendarEventForm'

interface PrepCalendarEvent {
  id: string
  userId: string
  title: string
  description?: string
  dueDate: string | Date
  estimatedHours: number
  eventType: string
  isCompleted: boolean
  source: string
  createdAt: string | Date
  updatedAt: string | Date
  applicationId?: string
}

interface EventDetailsModalProps {
  event: PrepCalendarEvent | null
  onClose: () => void
  onEdit: (event: PrepCalendarEvent) => void
  onDelete: (eventId: string) => Promise<void>
  onMarkComplete: (eventId: string, isCompleted: boolean) => Promise<void>
}

// Helper function to format date
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

// Event Details Modal Component
function EventDetailsModal({
  event,
  onClose,
  onEdit,
  onDelete,
  onMarkComplete,
}: EventDetailsModalProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!event) return null

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(event.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete event:', error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Event Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-gray-600 text-sm">Title</p>
            <p className="text-lg font-bold">
              {event.isCompleted && <span className="line-through">✓ </span>}
              {event.title}
            </p>
          </div>

          {event.description && (
            <div>
              <p className="text-gray-600 text-sm">Description</p>
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Due Date</p>
              <p className="font-bold">{formatDateFull(event.dueDate)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Hours</p>
              <p className="font-bold">{event.estimatedHours}h</p>
            </div>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Type</p>
            <span
              className={`inline-block px-3 py-1 rounded text-xs font-bold ${
                event.eventType === 'interview'
                  ? 'bg-blue-100 text-blue-900'
                  : event.eventType === 'general'
                    ? 'bg-green-100 text-green-900'
                    : 'bg-gray-100 text-gray-900'
              }`}
            >
              {event.eventType}
            </span>
          </div>

          <div>
            <p className="text-gray-600 text-sm">Status</p>
            <p className="font-bold">
              {event.isCompleted ? '✓ Completed' : 'Pending'}
            </p>
          </div>

          {event.source === 'student_created' && (
            <div className="text-xs text-gray-500">
              Created: {formatDate(event.createdAt)}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 space-y-2">
          <button
            onClick={() => {
              onMarkComplete(event.id, !event.isCompleted)
              onClose()
            }}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium text-sm"
          >
            {event.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
          </button>

          {event.source === 'student_created' && (
            <>
              <button
                onClick={() => onEdit(event)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm"
              >
                Edit
              </button>

              {showDeleteConfirm ? (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-700 mb-3 font-medium">
                    Are you sure? This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium disabled:opacity-50"
                      disabled={isDeleting}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm font-medium"
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium text-sm"
                >
                  Delete
                </button>
              )}
            </>
          )}

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 font-medium text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PrepCalendarPage() {
  const [events, setEvents] = useState<PrepCalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedView, setSelectedView] = useState<'monthly' | 'weekly' | 'list'>(
    'monthly'
  )
  const [filterType, setFilterType] = useState<'all' | 'interview' | 'general'>(
    'all'
  )
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState<PrepCalendarEvent | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<PrepCalendarEvent | null>(null)

  // Fetch events from API
  const fetchEvents = async () => {
    setIsLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (filterType !== 'all') {
        params.append('type', filterType)
      }

      const response = await fetch(`/api/calendar?${params}`)

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your calendar')
        }
        throw new Error('Failed to load calendar events')
      }

      const data = await response.json()
      setEvents(data.events || [])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Load events on mount and when filter changes
  useEffect(() => {
    fetchEvents()
  }, [filterType])

  // Filter events for display
  const filteredEvents = events.filter((e) => {
    if (filterType === 'all') return true
    return e.eventType === filterType
  })

  // Handle mark complete
  const handleMarkComplete = async (eventId: string, isCompleted: boolean) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isCompleted }),
      })

      if (!response.ok) {
        throw new Error('Failed to update event')
      }

      // Update local state
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, isCompleted } : e
        )
      )

      // Update selected event if it's being viewed
      if (selectedEvent?.id === eventId) {
        setSelectedEvent({ ...selectedEvent, isCompleted })
      }
    } catch (err) {
      console.error('Failed to mark complete:', err)
      setError('Failed to update event status')
    }
  }

  // Handle create/update event
  const handleSubmitEvent = async (eventData: any) => {
    try {
      if (editingEvent) {
        // Update existing event
        const response = await fetch(`/api/calendar/${editingEvent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(eventData),
        })

        if (!response.ok) {
          throw new Error('Failed to update event')
        }

        const updatedEvent = await response.json()
        setEvents((prev) =>
          prev.map((e) => (e.id === editingEvent.id ? updatedEvent : e))
        )
      } else {
        // Create new event
        const response = await fetch('/api/calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...eventData,
            type: 'custom',
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create event')
        }

        const newEvent = await response.json()
        setEvents((prev) => [...prev, newEvent])
      }

      setShowEventForm(false)
      setEditingEvent(null)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save event'
      throw new Error(errorMessage)
    }
  }

  // Handle delete event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete event')
      }

      setEvents((prev) => prev.filter((e) => e.id !== eventId))
      setSelectedEvent(null)
    } catch (err) {
      console.error('Failed to delete event:', err)
      setError('Failed to delete event')
    }
  }

  // Handle edit event
  const handleEditEvent = (event: PrepCalendarEvent) => {
    if (event.source === 'student_created') {
      setEditingEvent(event)
      setShowEventForm(true)
      setSelectedEvent(null)
    }
  }

  // Handle event click
  const handleEventClick = (event: PrepCalendarEvent) => {
    setSelectedEvent(event)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Prep Calendar</h1>
            <p className="text-gray-600 mt-2">
              Manage your interview and general prep tasks
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEvent(null)
              setShowEventForm(true)
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-bold text-lg"
          >
            + Add Event
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            <p>{error}</p>
            <button
              onClick={() => setError('')}
              className="text-red-600 underline text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* View Toggle */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                View
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedView('monthly')}
                  className={`px-4 py-2 rounded font-bold ${
                    selectedView === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedView('weekly')}
                  className={`px-4 py-2 rounded font-bold ${
                    selectedView === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSelectedView('list')}
                  className={`px-4 py-2 rounded font-bold ${
                    selectedView === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Filter by Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Filter
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-4 py-2 rounded font-bold ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('interview')}
                  className={`px-4 py-2 rounded font-bold ${
                    filterType === 'interview'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Interview
                </button>
                <button
                  onClick={() => setFilterType('general')}
                  className={`px-4 py-2 rounded font-bold ${
                    filterType === 'general'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  General
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex justify-center items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce delay-200"></div>
            </div>
            <p className="text-center text-gray-600 mt-4">Loading calendar...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              No events scheduled for the selected filter
            </p>
            <button
              onClick={() => {
                setEditingEvent(null)
                setShowEventForm(true)
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-bold"
            >
              Create First Event
            </button>
          </div>
        )}

        {/* Calendar Display */}
        {!isLoading && filteredEvents.length > 0 && (
          <CalendarView
            events={filteredEvents}
            selectedView={selectedView}
            onEventClick={handleEventClick}
            onMarkComplete={handleMarkComplete}
            currentDate={currentDate}
            onDateChange={setCurrentDate}
          />
        )}

        {/* Sidebar - Summary Stats */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-700 mb-2">Total Events</h3>
              <p className="text-3xl font-bold text-blue-600">
                {filteredEvents.length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-700 mb-2">Completed</h3>
              <p className="text-3xl font-bold text-green-600">
                {filteredEvents.filter((e) => e.isCompleted).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-bold text-gray-700 mb-2">Total Hours</h3>
              <p className="text-3xl font-bold text-orange-600">
                {filteredEvents
                  .reduce((sum, e) => sum + e.estimatedHours, 0)
                  .toFixed(1)}
                h
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
        onMarkComplete={handleMarkComplete}
      />

      {/* Event Form Modal */}
      {showEventForm && (
        <CalendarEventForm
          onSubmit={handleSubmitEvent}
          onCancel={() => {
            setShowEventForm(false)
            setEditingEvent(null)
          }}
          initialEvent={editingEvent || undefined}
        />
      )}
    </div>
  )
}
