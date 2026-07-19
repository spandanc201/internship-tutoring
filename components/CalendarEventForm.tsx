'use client'

import { useState, useEffect } from 'react'

interface CalendarEventFormProps {
  onSubmit: (event: any) => Promise<void>
  onCancel: () => void
  initialEvent?: {
    id: string
    title: string
    description?: string
    dueDate: string | Date
    estimatedHours: number
    isCompleted?: boolean
  } | null
}

export default function CalendarEventForm({
  onSubmit,
  onCancel,
  initialEvent,
}: CalendarEventFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    estimatedHours: 1,
  })

  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize form with existing event data
  useEffect(() => {
    if (initialEvent) {
      const dueDate = new Date(initialEvent.dueDate)
      const dueDateString = dueDate.toISOString().split('T')[0]

      setFormData({
        title: initialEvent.title,
        description: initialEvent.description || '',
        dueDate: dueDateString,
        estimatedHours: initialEvent.estimatedHours,
      })
      setIsCompleted(initialEvent.isCompleted || false)
    } else {
      // Reset form for new event
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const dueDateString = tomorrow.toISOString().split('T')[0]

      setFormData({
        title: '',
        description: '',
        dueDate: dueDateString,
        estimatedHours: 1,
      })
      setIsCompleted(false)
    }
  }, [initialEvent])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    if (name === 'estimatedHours') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.dueDate) {
      setError('Due date is required')
      return
    }

    if (formData.estimatedHours <= 0 || formData.estimatedHours > 10) {
      setError('Estimated hours must be between 0.5 and 10')
      return
    }

    const dueDateObj = new Date(formData.dueDate)
    if (isNaN(dueDateObj.getTime())) {
      setError('Invalid due date')
      return
    }

    try {
      setLoading(true)

      const eventData = {
        ...formData,
        dueDate: dueDateObj.toISOString(),
        estimatedHours: formData.estimatedHours,
        ...(initialEvent && { isCompleted }),
      }

      await onSubmit(eventData)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save event'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {initialEvent ? 'Edit Event' : 'Create Event'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add details (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Hours *
            </label>
            <input
              type="number"
              name="estimatedHours"
              value={formData.estimatedHours}
              onChange={handleChange}
              min="0.5"
              max="10"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">Between 0.5 and 10 hours</p>
          </div>

          {initialEvent && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isCompleted"
                checked={isCompleted}
                onChange={(e) => setIsCompleted(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <label
                htmlFor="isCompleted"
                className="ml-2 block text-sm text-gray-700"
              >
                Mark as completed
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : initialEvent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
