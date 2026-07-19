'use client'

import RecommendationCard, { RecommendationCardProps } from './RecommendationCard'

interface RecommendationListProps {
  recommendations: Array<Omit<RecommendationCardProps, 'onLogApplication' | 'isLoggingApplication'>>
  isLoading: boolean
  isEmpty: boolean
  emptyMessage?: string
  onLogApplication: (id: string, company: string, roleTitle: string) => Promise<void>
  loggingApplicationId?: string | null
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="animate-pulse space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded flex-1"></div>
          <div className="h-4 bg-gray-200 rounded flex-1"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
          <div className="h-6 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
          <div className="h-10 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </div>
  )
}

export default function RecommendationList({
  recommendations,
  isLoading,
  isEmpty,
  emptyMessage = 'No recommendations match your filters.',
  onLogApplication,
  loggingApplicationId,
}: RecommendationListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12">
        <div className="text-center">
          <div className="text-4xl mb-4">Magnifier</div>
          <p className="text-lg font-medium text-gray-900 mb-1">
            No Results
          </p>
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.id}
          {...rec}
          onLogApplication={onLogApplication}
          isLoggingApplication={loggingApplicationId === rec.id}
        />
      ))}
    </div>
  )
}
