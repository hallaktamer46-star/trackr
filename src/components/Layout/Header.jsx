import { NavLink, useNavigate } from 'react-router-dom'
import ProfileDropdown from './ProfileDropdown'

function ActivityIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polyline
        points="1,10 5,10 7,4 10,16 13,8 15,11 19,11"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const nav = [
  { to: '/',        label: 'Home',           end: true },
  { to: '/growth',  label: 'Growth Lab'               },
  { to: '/roadmap', label: 'Roadmap'                  },
  { to: '/ai/cv',   label: 'Job Toolkit'              },
  { to: '/startup', label: 'Startup Studio'           },
  { to: '/pitch',   label: 'Pitch Lab'                },
]

const SANS = 'Geist, Inter, -apple-system, sans-serif'
const MONO = '"Geist Mono", monospace'

export default function Header() {
  const navigate = useNavigate()

  return (
    <header style={{
      height: 52,
      background: '#070a0f',
      borderBottom: '1px solid rgba(48,54,61,0.7)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <svg width="26" height="26" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="34" height="34" fill="#0c1a2e"/>
            <polyline
              points="4,17 8,17 10.5,10 14,24 17,12 20,20 23,20 26,17 30,17"
              stroke="#00d4ff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{
            fontFamily: SANS,
            fontSize: 15,
            fontWeight: 700,
            color: '#e2e2e8',
            letterSpacing: '-0.02em',
          }}>
            Trackr
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {nav.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                fontFamily: SANS,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#e2e2e8' : 'rgba(96,140,200,0.7)',
                textDecoration: 'none',
                padding: '6px 14px',
                letterSpacing: '-0.01em',
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
                borderBottom: isActive ? '1px solid rgba(0,212,255,0.5)' : '1px solid transparent',
              })}
              onMouseEnter={e => { if (e.currentTarget.style.fontWeight !== '600') e.currentTarget.style.color = '#c0cfe8' }}
              onMouseLeave={e => { if (e.currentTarget.style.fontWeight !== '600') e.currentTarget.style.color = 'rgba(96,140,200,0.7)' }}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => navigate('/time-report')}
            title="Time Report"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(96,140,200,0.6)',
              fontFamily: MONO,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(96,140,200,0.6)'}
          >
            <ActivityIcon size={14} />
            <span>Report</span>
          </button>

          <div style={{ width: 1, height: 18, background: 'rgba(48,54,61,0.9)', margin: '0 4px' }} />

          <ProfileDropdown />
        </div>

      </div>
    </header>
  )
}
