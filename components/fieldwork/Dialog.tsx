'use client'

export default function Dialog({
  onClose,
  width,
  children,
}: {
  onClose: () => void
  width?: number
  children: React.ReactNode
}) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        className="dialog"
        onClick={(e) => e.stopPropagation()}
        style={width ? { width: `min(${width}px, 100%)` } : undefined}
      >
        {children}
      </div>
    </div>
  )
}
