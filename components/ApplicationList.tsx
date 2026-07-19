'use client'

import { useState, useEffect } from 'react'

// Helper functions for date formatting
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getRelativeTime(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(months / 12)
  return `${years}y ago`
}

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

interface ApplicationListProps {
  applications: Application[]
  isLoading: boolean
  onEdit: (app: Application) => void
  onRefresh: () => void
}

const STATUS_COLORS: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-800',
  interviewing: 'bg-yellow-100 text-yellow-800',
  offered: 'bg-green-100 text-green-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  declined: 'bg-red-100 text-red-800',
}

export default function ApplicationList({
  applications,
  isLoading,
  onEdit,
  onRefresh,
}: ApplicationListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'company' | 'status'>('date')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  // Filter and sort applications
  const filteredApps = applications.filter(
    (app) => filterStatus === 'all' || app.status === filterStatus
  )

  const sortedApps = [...filteredApps].sort((a, b) => {
    switch (sortBy) {
      case 'company':
        return a.company.localeCompare(b.company)
      case 'status':
        return a.status.localeCompare(b.status)
      case 'date':
      default:
        return (
          new Date(b.appliedDate).getTime() -
          new Date(a.appliedDate).getTime()
        )
    }
  })

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete application')
      }

      setDeleteConfirm(null)
      onRefresh()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete application')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      applied: 'Applied',
      interviewing: 'Interviewing',
      offered: 'Offered',
      accepted: 'Accepted',
      rejected: 'Rejected',
      declined: 'Declined',
    }
    return labels[status] || status
  }

  const getUniqueStatuses = () => {
    const statuses = new Set(applications.map((app) => app.status))
    return Array.from(statuses).sort()
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">Loading applications...</div>
        </div>
      </div>
    )
  }

  if (sortedApps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <p className="text-gray-500 text-lg mb-2">No applications yet</p>
            <p className="text-gray-400 text-sm">
              Create your first application to get started
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Your Applications</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              {getUniqueStatuses().map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date Applied (Newest)</option>
              <option value="company">Company Name</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-700">Company</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                Applied Date
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedApps.map((app) => (
              <tbody key={app.id}>
                <tr className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <button
                      onClick={() =>
                        setExpandedId(
                          expandedId === app.id ? null : app.id
                        )
                      }
                      className="font-medium text-gray-900 hover:text-blue-600 transition flex items-center gap-2"
                    >
                      <span className="text-lg">
                        {expandedId === app.id ? '▼' : '▶'}
                      </span>
                      {app.company}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{app.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        STATUS_COLORS[app.status] ||
                        'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getStatusLabel(app.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(app.appliedDate)}
                    <div className="text-xs text-gray-500">
                      {getRelativeTime(app.appliedDate)}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(app)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(app.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expandable row with full details */}
                {expandedId === app.id && (
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {app.description && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Description
                            </h4>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">
                              {app.description}
                            </p>
                          </div>
                        )}

                        {app.interviewNotes && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Interview Notes
                            </h4>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">
                              {app.interviewNotes}
                            </p>
                          </div>
                        )}

                        {app.personalNotes && (
                          <div className="md:col-span-2">
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Personal Notes
                            </h4>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">
                              {app.personalNotes}
                            </p>
                          </div>
                        )}

                        {app.interviewDates && app.interviewDates.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Interview Dates
                            </h4>
                            <ul className="text-gray-600 text-sm space-y-1">
                              {app.interviewDates.map((date, idx) => (
                                <li key={idx}>
                                  • {formatDateTime(date)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {app.offerDetails && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Offer Details
                            </h4>
                            <pre className="text-gray-600 text-xs bg-white p-2 rounded border border-gray-200 overflow-auto max-h-40">
                              {JSON.stringify(app.offerDetails, null, 2)}
                            </pre>
                          </div>
                        )}

                        <div className="md:col-span-2 text-xs text-gray-500">
                          Last updated: {formatDateTime(app.updatedAt)}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Delete confirmation row */}
                {deleteConfirm === app.id && (
                  <tr className="bg-red-50 border-b border-red-200">
                    <td colSpan={5} className="px-4 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-red-900">
                            Delete this application?
                          </p>
                          <p className="text-sm text-red-700">
                            This action cannot be undone.
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            disabled={deleting === app.id}
                            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50 font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            disabled={deleting === app.id}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-medium"
                          >
                            {deleting === app.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {sortedApps.length} of {applications.length} applications
        {filterStatus !== 'all' &&
          ` (filtered by ${getStatusLabel(filterStatus)})`}
      </div>
    </div>
  )
}
