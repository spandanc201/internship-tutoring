'use client'

import { useState, useEffect } from 'react'

interface Resume {
  id: string
  filePath: string
  uploadedAt: string
  isActive: boolean
  extractedData?: any
}

interface ResumeVersionsProps {
  triggerRefresh?: boolean
}

export default function ResumeVersions({ triggerRefresh }: ResumeVersionsProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activating, setActivating] = useState<string | null>(null)

  const fetchResumes = async () => {
    try {
      setError('')
      const res = await fetch('/api/resume/versions')
      if (!res.ok) {
        throw new Error('Failed to fetch resume versions')
      }
      const data = await res.json()
      setResumes(data.resumes || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resumes'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResumes()
  }, [triggerRefresh])

  const handleMakeActive = async (resumeId: string) => {
    setActivating(resumeId)
    setError('')

    try {
      const res = await fetch('/api/resume/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      })

      if (!res.ok) {
        throw new Error('Failed to activate resume')
      }

      // Update local state
      setResumes(
        resumes.map((r) => ({
          ...r,
          isActive: r.id === resumeId,
        }))
      )

      // Show success message briefly
      setTimeout(() => {
        fetchResumes()
      }, 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to activate resume'
      setError(errorMessage)
    } finally {
      setActivating(null)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Resume Versions</h2>
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Loading resume versions...</div>
        </div>
      </div>
    )
  }

  if (resumes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Resume Versions</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No resume versions yet. Upload your first resume above.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Resume Versions</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {resumes.map((resume) => {
          const fileName = resume.filePath.split('/').pop() || 'Resume'
          const uploadedAt = new Date(resume.uploadedAt)
          const now = new Date()
          const daysAgo = Math.floor(
            (now.getTime() - uploadedAt.getTime()) / (1000 * 60 * 60 * 24)
          )
          const timeAgo =
            daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`

          return (
            <div
              key={resume.id}
              className={`border rounded-lg p-4 flex items-start justify-between ${
                resume.isActive
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-800">{fileName}</h3>
                  {resume.isActive && (
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-xs font-medium">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p>Uploaded {timeAgo} ({formatDate(resume.uploadedAt)})</p>
                  {resume.extractedData && (
                    <div className="mt-2 text-gray-700">
                      {resume.extractedData.skills && (
                        <p>
                          Skills:{' '}
                          {Array.isArray(resume.extractedData.skills)
                            ? resume.extractedData.skills.slice(0, 3).join(', ')
                            : 'N/A'}
                          {Array.isArray(resume.extractedData.skills) &&
                          resume.extractedData.skills.length > 3
                            ? `... and ${resume.extractedData.skills.length - 3} more`
                            : ''}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="ml-4 flex gap-2">
                {!resume.isActive && (
                  <button
                    onClick={() => handleMakeActive(resume.id)}
                    disabled={activating !== null}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                  >
                    {activating === resume.id ? 'Activating...' : 'Make Active'}
                  </button>
                )}
                <a
                  href={resume.filePath}
                  download
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-medium text-sm"
                >
                  Download
                </a>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Switching to a different resume version will affect your personalized
          recommendations based on your updated skills and experience.
        </p>
      </div>
    </div>
  )
}
