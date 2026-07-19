'use client'

import { useState } from 'react'

export interface FilterState {
  location: string
  company: string
  skills: string[]
  sortBy: 'score' | 'date' | 'salary' | 'company'
}

interface RecommendationFiltersProps {
  onFilterChange: (filters: FilterState) => void
  availableLocations: string[]
  availableCompanies: string[]
  availableSkills: string[]
  initialFilters?: FilterState
}

const DEFAULT_FILTERS: FilterState = {
  location: '',
  company: '',
  skills: [],
  sortBy: 'score',
}

export default function RecommendationFilters({
  onFilterChange,
  availableLocations,
  availableCompanies,
  availableSkills,
  initialFilters = DEFAULT_FILTERS,
}: RecommendationFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [expandedMobile, setExpandedMobile] = useState(false)

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, location: e.target.value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, company: e.target.value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter((s) => s !== skill)
      : [...filters.skills, skill]

    const newFilters = { ...filters, skills: newSkills }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilters = {
      ...filters,
      sortBy: e.target.value as FilterState['sortBy'],
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    onFilterChange(DEFAULT_FILTERS)
  }

  const hasActiveFilters =
    filters.location !== '' ||
    filters.company !== '' ||
    filters.skills.length > 0 ||
    filters.sortBy !== 'score'

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
      {/* Mobile Toggle Button */}
      <div className="md:hidden p-4 border-b border-gray-200">
        <button
          onClick={() => setExpandedMobile(!expandedMobile)}
          className="w-full flex items-center justify-between font-medium text-gray-900"
        >
          <span>Filters & Sort</span>
          <span>{expandedMobile ? 'Up' : 'Down'}</span>
        </button>
      </div>

      {/* Filters Container */}
      <div
        className={`${
          expandedMobile ? 'block' : 'hidden'
        } md:block p-6 space-y-6`}
      >
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Location
          </label>
          <input
            type="text"
            placeholder="Search locations..."
            value={filters.location}
            onChange={handleLocationChange}
            list="locations"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <datalist id="locations">
            {availableLocations.map((loc) => (
              <option key={loc} value={loc} />
            ))}
          </datalist>
        </div>

        {/* Company Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Company
          </label>
          <input
            type="text"
            placeholder="Search companies..."
            value={filters.company}
            onChange={handleCompanyChange}
            list="companies"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <datalist id="companies">
            {availableCompanies.map((comp) => (
              <option key={comp} value={comp} />
            ))}
          </datalist>
        </div>

        {/* Skills Filter */}
        {availableSkills.length > 0 && (
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSkills.map((skill) => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                    filters.skills.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
            {filters.skills.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                Selected: {filters.skills.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Sort Options */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={handleSortChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="score">Relevance (Score)</option>
            <option value="date">Most Recent</option>
            <option value="salary">Salary (High to Low)</option>
            <option value="company">Company (A-Z)</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
