'use client'

import { useState, useEffect } from 'react'

interface ApplicationData {
  id?: string
  company: string
  role: string
  description?: string
  status?: string
  interviewNotes?: string
  personalNotes?: string
}

interface ApplicationFormProps {
  onSuccess: () => void
  editingApplication?: ApplicationData | null
  onCancel?: () => void
}

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offered', label: 'Offered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'declined', label: 'Declined' },
]

export default function ApplicationForm({
  onSuccess,
  editingApplication,
  onCancel,
}: ApplicationFormProps) {
  const [formData, setFormData] = useState<ApplicationData>({
    company: '',
    role: '',
    description: '',
    status: 'applied',
    interviewNotes: '',
    personalNotes: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Populate form when editing
  useEffect(() => {
    if (editingApplication) {
      setFormData({
        id: editingApplication.id,
        company: editingApplication.company,
        role: editingApplication.role,
        description: editingApplication.description || '',
        status: editingApplication.status || 'applied',
        interviewNotes: editingApplication.interviewNotes || '',
        personalNotes: editingApplication.personalNotes || '',
      })
    }
  }, [editingApplication])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate required fields
    if (!formData.company.trim() || !formData.role.trim()) {
      setError('Company and role are required fields.')
      return
    }

    setLoading(true)

    try {
      const method = editingApplication ? 'PUT' : 'POST'
      const url = editingApplication
        ? `/api/applications/${editingApplication.id}`
        : '/api/applications'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: formData.company.trim(),
          role: formData.role.trim(),
          description: formData.description?.trim() || null,
          status: formData.status,
          interviewNotes: formData.interviewNotes?.trim() || null,
          personalNotes: formData.personalNotes?.trim() || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save application')
      }

      setSuccess(
        editingApplication
          ? 'Application updated successfully!'
          : 'Application created successfully!'
      )
      setFormData({
        company: '',
        role: '',
        description: '',
        status: 'applied',
        interviewNotes: '',
        personalNotes: '',
      })

      setTimeout(() => {
        setSuccess('')
        onSuccess()
      }, 1500)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">
        {editingApplication ? 'Edit Application' : 'Create New Application'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., Google, Microsoft, Amazon"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              placeholder="e.g., Software Engineer Intern"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Job description, responsibilities, or other details..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interview Notes
          </label>
          <textarea
            name="interviewNotes"
            value={formData.interviewNotes}
            onChange={handleChange}
            placeholder="Notes about interviews, rounds, feedback, etc."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Personal Notes
          </label>
          <textarea
            name="personalNotes"
            value={formData.personalNotes}
            onChange={handleChange}
            placeholder="Your personal notes, thoughts, or follow-ups..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {loading
              ? editingApplication
                ? 'Updating...'
                : 'Creating...'
              : editingApplication
                ? 'Update Application'
                : 'Create Application'}
          </button>
          {editingApplication && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 font-semibold"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
