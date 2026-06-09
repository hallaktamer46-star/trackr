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
        gap: 9,
        padding: '7px 14px 7px 9px',
        background: hov ? 'rgba(96,165,250,0.07)' : 'transparent',
        border: `1px solid ${hov ? 'rgba(96,165,250,0.28)' : 'rgba(48,54,61,0.7)'}`,
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* left glow bar on hover */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
        background: 'linear-gradient(180deg, #60a5fa, #a78bfa)',
        opacity: hov ? 1 : 0,
        transition: 'opacity 0.2s',
      }}/>

      {/* arrow SVG — slides left on hover */}
      <svg
        width="16" height="16" viewBox="0 0 16 16" fill="none"
        style={{
          transform: hov ? 'translateX(-3px)' : 'translateX(0)',
          transition: 'transform 0.22s cubic-bezier(0.34,1.4,0.64,1)',
          flexShrink: 0,
        }}
      >
        <path d="M10 3L5 8L10 13" stroke={hov ? '#a3c9ff' : '#3a5878'} strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter"/>
        <line x1="5" y1="8" x2="13" y2="8" stroke={hov ? '#a3c9ff' : '#3a5878'} strokeWidth="1.5" strokeLinecap="square"/>
      </svg>

      <span style={{
        fontFamily: 'Geist Mono, monospace',
        fontSize: 10,
        fontWeight: 700,
        color: hov ? '#a3c9ff' : '#3a5878',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        transition: 'color 0.2s',
        lineHeight: 1,
      }}>
        Home
      </span>
    </button>
  )
}
