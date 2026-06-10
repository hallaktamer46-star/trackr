import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function BackToHome() {
  const navigate = useNavigate()
  const [hov, setHov] = useState(false)

  return (
    <button
      onClick={() => navigate('/')}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '3px 0',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        marginBottom: 28,
        opacity: hov ? 1 : 0.55,
        transition: 'opacity 0.2s ease',
      }}
    >
      <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        style={{
          transform: hov ? 'translateX(-3px)' : 'none',
          transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1)',
          flexShrink: 0,
        }}
      >
        <path d="M9 2.5L4.5 7L9 11.5" stroke="#a8c8f8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>

      <span style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
        fontSize: 13,
        fontWeight: 500,
        color: '#a8c8f8',
        letterSpacing: '0.01em',
        lineHeight: 1,
      }}>
        Home
      </span>
    </button>
  )
}
