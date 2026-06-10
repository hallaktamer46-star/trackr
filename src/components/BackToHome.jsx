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
        gap: 8,
        padding: '4px 2px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: 28,
      }}
    >
      {/* arrow — slides left on hover */}
      <svg
        width="15" height="15" viewBox="0 0 16 16" fill="none"
        style={{
          transform: hov ? 'translateX(-4px)' : 'translateX(0)',
          transition: 'transform 0.25s cubic-bezier(0.34,1.4,0.64,1)',
          flexShrink: 0,
        }}
      >
        <path d="M10 3L5 8L10 13" stroke={hov ? '#93c5fd' : '#3a5878'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="5" y1="8" x2="13" y2="8" stroke={hov ? '#93c5fd' : '#3a5878'} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>

      <span style={{
        fontFamily: "'Syne', 'Geist', sans-serif",
        fontSize: 13,
        fontWeight: 700,
        color: hov ? '#93c5fd' : '#3d5a7a',
        letterSpacing: '0.04em',
        transition: 'color 0.2s',
        lineHeight: 1,
        textDecoration: hov ? 'underline' : 'none',
        textDecorationColor: 'rgba(147,197,253,0.4)',
        textUnderlineOffset: 4,
      }}>
        Home
      </span>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700&display=swap');`}</style>
    </button>
  )
}
