'use client'

import { useEffect, useRef, useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { useFlash } from '@/components/fieldwork/Flash'
import { fmtDate } from '@/lib/format'

interface ResumeVersion {
  id: string
  filePath: string
  uploadedAt: string
  isActive: boolean
  extractedData?: {
    skills?: string[]
  } | null
}

function fileName(filePath: string): string {
  const base = filePath.split('/').pop() || filePath
  // Uploads are stored as "<timestamp>-<original name>"
  const dash = base.indexOf('-')
  return dash > 0 && /^\d+$/.test(base.slice(0, dash)) ? base.slice(dash + 1) : base
}

export default function ResumePage() {
  const flash = useFlash()
  const [versions, setVersions] = useState<ResumeVersion[]>([])
  const [interests, setInterests] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  async function fetchVersions() {
    setIsLoading(true)
    try {
      const res = await fetch('/api/resume/versions')
      if (res.ok) {
        const data = await res.json()
        setVersions(data.resumes ?? [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void fetchVersions()
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setInterests(data?.profile?.interests ?? []))
      .catch(() => {})
  }, [])

  const active = versions.find((v) => v.isActive) ?? versions[0]
  const skills = active?.extractedData?.skills ?? []

  async function handleUpload(file: File) {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/resume/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Upload failed')
      }
      await fetchVersions()
      flash('Résumé uploaded and set active')
    } catch (err) {
      flash(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  async function makeActive(resumeId: string) {
    try {
      const res = await fetch('/api/resume/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      })
      if (!res.ok) throw new Error()
      await fetchVersions()
      flash('Active résumé switched — recommendations refreshed')
    } catch {
      flash('Failed to switch résumé')
    }
  }

  return (
    <div className="fw-fade" style={{ maxWidth: 1060, margin: '0 auto' }}>
      <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: '-0.02em', margin: '0 0 4px' }}>
        Résumé
      </h1>
      <p className="text-muted" style={{ fontSize: 15, margin: '0 0 28px' }}>
        Your active résumé drives every recommendation. Upload a new version any time.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32 }}>
        <div>
          {active ? (
            <div
              style={{
                border: '1px solid var(--color-divider)',
                borderRadius: 'var(--radius-md)',
                padding: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 18,
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 44,
                      height: 54,
                      border: '1px solid var(--color-divider)',
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      background: 'var(--color-surface)',
                    }}
                  >
                    <FileText size={20} strokeWidth={1.5} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 600, fontSize: 17 }}>
                      {fileName(active.filePath)}
                    </div>
                    <div className="text-muted" style={{ fontSize: 12.5 }}>
                      Active · uploaded {fmtDate(active.uploadedAt)}
                    </div>
                  </div>
                </div>
                <span className="tag tag-accent">Active</span>
              </div>
              <div className="hr" style={{ margin: '0 0 18px' }} />
              <h4 className="detail-head" style={{ marginBottom: 10 }}>Extracted skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 20 }}>
                {skills.length ? (
                  skills.map((sk) => (
                    <span key={sk} className="tag tag-neutral">{sk}</span>
                  ))
                ) : (
                  <span className="text-muted" style={{ fontSize: 13 }}>No skills extracted yet.</span>
                )}
              </div>
              <h4 className="detail-head" style={{ marginBottom: 10 }}>Interests</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {interests.length ? (
                  interests.map((it) => (
                    <span key={it} className="tag tag-outline">{it}</span>
                  ))
                ) : (
                  <span className="text-muted" style={{ fontSize: 13 }}>No interests on file.</span>
                )}
              </div>
            </div>
          ) : (
            !isLoading && (
              <div
                style={{
                  border: '1px dashed var(--color-divider)',
                  borderRadius: 'var(--radius-md)',
                  padding: '40px 24px',
                  textAlign: 'center',
                  marginBottom: 24,
                }}
              >
                <p className="text-muted" style={{ margin: 0 }}>
                  No résumé on file yet. Upload one below to unlock recommendations.
                </p>
              </div>
            )
          )}

          <label
            style={{
              display: 'block',
              border: '1px dashed var(--color-divider)',
              borderRadius: 'var(--radius-md)',
              padding: 34,
              textAlign: 'center',
              cursor: isUploading ? 'wait' : 'pointer',
              opacity: isUploading ? 0.6 : 1,
            }}
          >
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.doc,.docx"
              disabled={isUploading}
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
            />
            <Upload
              size={26}
              strokeWidth={1.5}
              style={{ color: 'var(--color-accent)', margin: '0 auto 10px' }}
            />
            <div
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 3,
              }}
            >
              {isUploading ? 'Uploading…' : 'Upload a new version'}
            </div>
            <div className="text-muted" style={{ fontSize: 12.5 }}>
              PDF or DOCX, up to 10 MB. We&apos;ll re-run your recommendations.
            </div>
          </label>
        </div>

        <div>
          <h3 className="section-head">Version history</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {isLoading && (
              <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>Loading versions…</p>
            )}
            {!isLoading && versions.length === 0 && (
              <p className="text-muted" style={{ fontSize: 13, margin: 0 }}>
                No versions yet — your uploads will appear here.
              </p>
            )}
            {versions.map((v) => (
              <div
                key={v.id}
                style={{
                  border: `1px solid ${v.isActive ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 600,
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {fileName(v.filePath)}
                  </div>
                  <div className="text-muted" style={{ fontSize: 11.5 }}>
                    Uploaded {fmtDate(v.uploadedAt)}
                  </div>
                </div>
                {v.isActive ? (
                  <span className="tag tag-accent" style={{ flex: 'none' }}>Active</span>
                ) : (
                  <button
                    className="btn btn-secondary"
                    onClick={() => makeActive(v.id)}
                    style={{ flex: 'none', fontSize: 12 }}
                  >
                    Make active
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
