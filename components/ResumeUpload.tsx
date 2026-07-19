'use client'

import { useState, useRef } from 'react'

interface ResumeUploadProps {
  onUploadSuccess: () => void
}

interface ExtractedData {
  skills?: string[]
  internships?: Array<{ company: string; role: string; duration?: string }>
  projects?: Array<{ name: string; description?: string }>
  [key: string]: any
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragOverRef = useRef(false)

  const acceptedFileTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

  const validateFile = (file: File): boolean => {
    if (!acceptedFileTypes.includes(file.type)) {
      setError('Invalid file type. Please upload PDF or DOC files.')
      return false
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.')
      return false
    }
    return true
  }

  const handleFileSelect = (selectedFile: File) => {
    setError('')
    setSuccess('')
    if (validateFile(selectedFile)) {
      setFile(selectedFile)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    dragOverRef.current = true
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    dragOverRef.current = false
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragOverRef.current = false
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a file first.')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')
    setExtractedData(null)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      setExtractedData(data.extractedData)
      setSuccess('Resume uploaded successfully!')
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setUploadProgress(100)
      setTimeout(() => {
        setSuccess('')
        onUploadSuccess()
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6">Upload Resume</h2>

      <form onSubmit={handleUpload} className="space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            dragOverRef.current
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) handleFileSelect(selectedFile)
            }}
            className="hidden"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50"
          >
            Click to select or drag and drop
          </button>
          <p className="text-gray-500 text-sm mt-2">Supported: PDF, DOC, DOCX (Max 10MB)</p>
          {file && (
            <p className="text-green-600 text-sm mt-2">
              Selected: {file.name}
            </p>
          )}
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

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="bg-gray-50 rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Uploading...' : 'Upload Resume'}
        </button>
      </form>

      {extractedData && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-lg mb-4">Extracted Information</h3>

          {extractedData.skills && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(extractedData.skills) && extractedData.skills.map((skill, i) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {extractedData.internships && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Internships</h4>
              <ul className="space-y-2">
                {Array.isArray(extractedData.internships) && extractedData.internships.map((internship, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    <strong>{internship.company}</strong> - {internship.role}
                    {internship.duration && ` (${internship.duration})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {extractedData.projects && (
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Projects</h4>
              <ul className="space-y-2">
                {Array.isArray(extractedData.projects) && extractedData.projects.map((project, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    <strong>{project.name}</strong>
                    {project.description && ` - ${project.description}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
