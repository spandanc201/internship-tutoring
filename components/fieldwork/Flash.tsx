'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { Check } from 'lucide-react'

const FlashContext = createContext<(message: string) => void>(() => {})

export function useFlash() {
  return useContext(FlashContext)
}

export function FlashProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flash = useCallback((msg: string) => {
    if (timer.current) clearTimeout(timer.current)
    setMessage(msg)
    timer.current = setTimeout(() => setMessage(null), 2600)
  }, [])

  return (
    <FlashContext.Provider value={flash}>
      {children}
      {message && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-ink)',
            color: '#f4efe6',
            padding: '12px 22px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: 13.5,
            fontFamily: 'var(--font-heading)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            zIndex: 50,
          }}
        >
          <Check size={16} strokeWidth={2.2} style={{ color: 'var(--color-accent-300)' }} />
          {message}
        </div>
      )}
    </FlashContext.Provider>
  )
}
