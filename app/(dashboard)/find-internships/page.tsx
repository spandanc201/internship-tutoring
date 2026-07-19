'use client'

import { useState, useEffect } from 'react'
import RecommendationFilters, { FilterState } from '@/components/RecommendationFilters'
import RecommendationList from '@/components/RecommendationList'
import { useRouter } from 'next/navigation'

interface Recommendation {
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
}

interface RecommendationsResponse {
  goodFit: Recommendation[]
  stretch: Recommendation[]
  longShot: Recommendation[]
  summary: {
    total: number
    goodFitCount: number
    stretchCount: number
    longShotCount: number
  }
}

type TabType = 'good_fit' | 'stretch' | 'long_shot'

const DEFAULT_FILTERS: FilterState = {
  location: '',
  company: '',
  skills: [],
  sortBy: 'score',
}

function filterAndSortRecommendations(
  recommendations: Recommendation[],
  filters: FilterState
): Recommendation[] {
  // Apply filters
  let filtered = recommendations.filter((rec) => {
    const locationMatch =
      !filters.location ||
      (rec.location &&
        rec.location
          .toLowerCase()
          .includes(filters.location.toLowerCase()))

    const companyMatch =
      !filters.company ||
      rec.company.toLowerCase().includes(filters.company.toLowerCase())

    const skillsMatch =
      filters.skills.length === 0 ||
      filters.skills.some((skill) =>
        rec.requiredSkills.some(
          (s) => s.toLowerCase() === skill.toLowerCase()
        )
      )

    return locationMatch && companyMatch && skillsMatch
  })

  // Apply sort
  return filtered.sort((a, b) => {
    switch (filters.sortBy) {
      case 'date':
        return (
          new Date(b.postedDate).getTime() -
          new Date(a.postedDate).getTime()
        )
      case 'salary':
        const aSalary = a.salaryRange?.max || a.salaryRange?.min || 0
        const bSalary = b.salaryRange?.max || b.salaryRange?.min || 0
        return bSalary - aSalary
      case 'company':
        return a.company.localeCompare(b.company)
      case 'score':
      default:
        return b.score - a.score
    }
  })
}

function getAllAvailableFilters(data: RecommendationsResponse) {
  const allRecs = [...data.goodFit, ...data.stretch, ...data.longShot]

  const locations = Array.from(
    new Set(allRecs.map((r) => r.location).filter(Boolean))
  ).sort()

  const companies = Array.from(new Set(allRecs.map((r) => r.company))).sort()

  const skills = Array.from(
    new Set(allRecs.flatMap((r) => r.requiredSkills))
  ).sort()

  return { locations, companies, skills }
}

export default function FindInternshipsPage() {
  const router = useRouter()
  const [data, setData] = useState<RecommendationsResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [activeTab, setActiveTab] = useState<TabType>('good_fit')
  const [loggingApplicationId, setLoggingApplicationId] = useState<
    string | null
  >(null)

  // Fetch recommendations
  const fetchRecommendations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/recommendations')

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to view recommendations')
        }
        if (response.status === 404) {
          throw new Error('No active resume found. Please upload a resume first.')
        }
        throw new Error('Failed to load recommendations')
      }

      const json = await response.json()
      setData(json)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // Load recommendations on mount
  useEffect(() => {
    fetchRecommendations()
  }, [])

  // Handle log application
  const handleLogApplication = async (
    id: string,
    company: string,
    roleTitle: string
  ) => {
    setLoggingApplicationId(id)
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company,
          role: roleTitle,
          source: 'recommendations',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to log application')
      }

      // Show success message and navigate to applications
      alert('Application logged successfully!')
      router.push('/applications')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to log application'
      alert(errorMessage)
    } finally {
      setLoggingApplicationId(null)
    }
  }

  // Get filtered recommendations for active tab
  const getTabRecommendations = (): Recommendation[] => {
    if (!data) return []

    const tabData: Record<TabType, Recommendation[]> = {
      good_fit: data.goodFit,
      stretch: data.stretch,
      long_shot: data.longShot,
    }

    return filterAndSortRecommendations(
      tabData[activeTab],
      filters
    )
  }

  const filteredRecs = getTabRecommendations()
  const availableFilters = data ? getAllAvailableFilters(data) : { locations: [], companies: [], skills: [] }

  // Handle tab changes - reset to top
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Internships
          </h1>
          <p className="text-gray-600 text-lg">
            Personalized recommendations based on your resume and skills
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{error}</p>
              </div>
              <button
                onClick={fetchRecommendations}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!error && (
          <>
            {/* Filters */}
            <RecommendationFilters
              onFilterChange={setFilters}
              availableLocations={availableFilters.locations as any}
              availableCompanies={availableFilters.companies as any}
              availableSkills={availableFilters.skills as any}
              initialFilters={filters}
            />

            {/* Tabs */}
            <div className="bg-white rounded-t-lg border-b border-gray-200 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 p-4 sm:p-0">
                {[
                  {
                    id: 'good_fit' as TabType,
                    label: 'Good Fit',
                    count: data?.summary.goodFitCount ?? 0,
                    description: '75+ match',
                  },
                  {
                    id: 'stretch' as TabType,
                    label: 'Stretch',
                    count: data?.summary.stretchCount ?? 0,
                    description: '50-74 match',
                  },
                  {
                    id: 'long_shot' as TabType,
                    label: 'Long Shot',
                    count: data?.summary.longShotCount ?? 0,
                    description: '<50 match',
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 sm:flex-initial px-6 py-4 font-medium border-b-2 transition ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <span>{tab.label}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700 font-semibold">
                        {tab.count}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-left">
                      {tab.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="mb-8">
              <RecommendationList
                recommendations={filteredRecs.map((rec) => ({
                  ...rec,
                }))}
                isLoading={isLoading}
                isEmpty={filteredRecs.length === 0}
                emptyMessage={
                  data && (data.goodFit.length + data.stretch.length + data.longShot.length) === 0
                    ? 'No recommendations available. This might be because your resume data is still being processed.'
                    : 'No recommendations match your filters. Try adjusting your search criteria.'
                }
                onLogApplication={handleLogApplication}
                loggingApplicationId={loggingApplicationId}
              />
            </div>

            {/* Summary */}
            {data && !isLoading && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {data.summary.total}
                    </div>
                    <div className="text-sm text-gray-600">Total Postings</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {data.summary.goodFitCount}
                    </div>
                    <div className="text-sm text-gray-600">Good Fit</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {data.summary.stretchCount}
                    </div>
                    <div className="text-sm text-gray-600">Stretch</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {data.summary.longShotCount}
                    </div>
                    <div className="text-sm text-gray-600">Long Shot</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
