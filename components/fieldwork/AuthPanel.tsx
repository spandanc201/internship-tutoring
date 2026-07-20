export default function AuthPanel() {
  return (
    <div
      style={{
        background: 'var(--color-ink)',
        color: '#eae4da',
        padding: '56px 60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          fontSize: 21,
          letterSpacing: '0.02em',
        }}
      >
        Fieldwork
      </div>
      <div>
        <div style={{ width: 44, height: 1, background: 'var(--color-accent)', marginBottom: 26 }} />
        <h1
          style={{
            color: '#f4efe6',
            fontSize: 58,
            fontWeight: 400,
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
            margin: '0 0 20px',
          }}
        >
          The whole internship season,
          <br />
          set on one page.
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: '#b2aa9d', maxWidth: '34ch', margin: 0 }}>
          Discover roles matched to your résumé, track every application, and follow a prep schedule
          timed to your interviews.
        </p>
      </div>
      <div
        style={{
          fontSize: 12,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#7a7266',
        }}
      >
        Sourcing · Tracking · Preparation
      </div>
    </div>
  )
}
