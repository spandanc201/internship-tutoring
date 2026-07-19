'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ResumeUpload from '@/components/ResumeUpload'
import ResumeVersions from '@/components/ResumeVersions'
import Link from 'next/link'

export default function ResumePage() {
  const [refreshTrigger, setRefreshTrigger] = useState(false)
  const router = useRouter()

  const handleUploadSuccess = () => {
    setRefreshTrigger(!refreshTrigger)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Resume Management</h1>
            <p className="text-gray-600 mt-2">Upload, manage, and switch between resume versions</p>
          </div>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Dashboard
          </Link>
        </div>

        <ResumeUpload onUploadSuccess={handleUploadSuccess} />
        <ResumeVersions triggerRefresh={refreshTrigger} />
      </div>
    </div>
  )
}
