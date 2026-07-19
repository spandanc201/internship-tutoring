'use client'

import { useState, useEffect } from 'react'
import ApplicationForm from '@/components/ApplicationForm'
import ApplicationList from '@/components/ApplicationList'

interface Application {
  id: string
  company: string
  role: string
  description?: string
  status: string
  appliedDate: string
  interviewDates?: string[]
  interviewNotes?: string
  offerDetails?: any
  personalNotes?: string
  updatedAt: string
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null)

  // Fetch applications
  const fetchApplications = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/applications')

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view your applications')
        }
        throw new Error('Failed to load applications')
      }

      const data = await response.json()
      setApplications(data.applications || [])
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Load applications on mount
  useEffect(() => {
    fetchApplications()
  }, [])

  const handleFormSuccess = () => {
    setEditingApplication(null)
    fetchApplications()
  }

  const handleEditClick = (app: Application) => {
    setEditingApplication(app)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingApplication(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Application Tracker</h1>
          <button
            onClick={() => setEditingApplication(null)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + New Application
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
            {error}
          </div>
        )}

        {/* Form Section */}
        {editingApplication && (
          <ApplicationForm
            onSuccess={handleFormSuccess}
            editingApplication={editingApplication}
            onCancel={handleCancelEdit}
          />
        )}

        {!editingApplication && (
          <ApplicationForm
            onSuccess={handleFormSuccess}
            editingApplication={null}
          />
        )}

        {/* List Section */}
        <ApplicationList
          applications={applications}
          isLoading={isLoading}
          onEdit={handleEditClick}
          onRefresh={fetchApplications}
        />
      </div>
    </div>
  )
}
