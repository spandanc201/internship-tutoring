'use client'

import { useState } from 'react'

export interface RecommendationCardProps {
  id: string
  company: string
  roleTitle: string
  description: string
  score: number
  reason: string
  location?: string
  salaryRange?: any
  requiredSkills: string[]
  postedDate: Date | string
  applicationDeadline?: Date | string
  onLogApplication: (id: string, company: string, roleTitle: string) => Promise<void>
  isLoggingApplication?: boolean
}

function getScoreBadgeColor(score: number): string {
  if (score >= 75) return 'bg-green-100 text-green-800'
  if (score >= 50) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

function getScoreCategory(score: number): string {
  if (score >= 75) return 'Good Fit'
  if (score >= 50) return 'Stretch'
  return 'Long Shot'
}

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatSalary(salaryRange: any): string {
  if (!salaryRange) return ''

  if (salaryRange.min && salaryRange.max) {
    return `$${salaryRange.min.toLocaleString()}-${salaryRange.max.toLocaleString()}`
  }

  if (salaryRange.min) {
    return `$${salaryRange.min.toLocaleString()}+`
  }

  if (salaryRange.max) {
    return `Up to $${salaryRange.max.toLocaleString()}`
  }

  return ''
}

export default function RecommendationCard({
  id,
  company,
  roleTitle,
  description,
  score,
  reason,
  location,
  salaryRange,
  requiredSkills,
  postedDate,
  applicationDeadline,
  onLogApplication,
  isLoggingApplication = false,
}: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false)

  const handleLogApplication = async () => {
    await onLogApplication(id, company, roleTitle)
  }

  const badgeColor = getScoreBadgeColor(score)
  const salaryText = formatSalary(salaryRange)

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
      {/* Card Header */}
      <div className="p-6">
        {/* Company and Score Row */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="text-sm text-gray-600 uppercase tracking-wide">
              {company}
            </h3>
            <h2 className="text-xl font-bold text-gray-900 mt-1">
              {roleTitle}
            </h2>
          </div>
          <div className={`px-3 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${badgeColor}`}>
            {score}% {getScoreCategory(score)}
          </div>
        </div>

        {/* Reason */}
        <p className="text-sm text-gray-700 mb-4 font-medium">{reason}</p>

        {/* Location and Salary Row */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
          {location && (
            <div className="flex items-center gap-1">
              <span>📍</span>
              <span>{location}</span>
            </div>
          )}
          {salaryText && (
            <div className="flex items-center gap-1">
              <span>💰</span>
              <span>{salaryText}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>Posted {formatDate(postedDate)}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {requiredSkills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
            >
              {skill}
            </span>
          ))}
          {requiredSkills.length > 5 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
              +{requiredSkills.length - 5} more
            </span>
          )}
        </div>

        {/* Deadline */}
        {applicationDeadline && (
          <div className="text-xs text-red-600 mb-4 font-medium">
            Clock Deadline: {formatDate(applicationDeadline)}
          </div>
        )}

        {/* Buttons Row */}
        <div className="flex gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
          <button
            onClick={handleLogApplication}
            disabled={isLoggingApplication}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingApplication ? 'Logging...' : 'Log Application'}
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <h4 className="font-bold text-gray-900 mb-3">Job Description</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {description}
          </p>
        </div>
      )}
    </div>
  )
}
