import { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Sparkles, Rocket, Building2, Telescope, Map, Menu } from 'lucide-react'
import ProfileDropdown from './ProfileDropdown'
import { cn } from '../../lib/cn'
import { useSidebar } from '../../contexts/SidebarContext'

const CHECKIN_KEY = 'trackr_checkin_pending'
const MONO = 'Consolas, Menlo, Monaco, monospace'

function fmtCountdown(ms) {
  if (!ms || ms <= 0) return '0:00'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Custom pulse / activity icon — bespoke, not from any icon library
function ActivityIcon({ size = 17, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
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
  { to: '/',        label: 'Home',          icon: Home,      end: true },
  { to: '/growth',  label: 'Growth Lab',    icon: Telescope           },
  { to: '/roadmap', label: 'Roadmap',       icon: Map                 },
  { to: '/ai/cv',   label: 'Job Toolkit',   icon: Sparkles            },
  { to: '/startup', label: 'Startup Studio',icon: Rocket              },
  { to: '/pitch',   label: 'Pitch Lab',     icon: Building2           },
]

export default function Header() {
  const navigate = useNavigate()
  const { open, toggle } = useSidebar()
  const [checkInData, setCheckInData] = useState(null)
  const [, setTick] = useState(0)
  const tickRef = useRef(null)

  // On mount: check for persisted pending check-in
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKIN_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (Date.now() < data.deadline) setCheckInData(data)
    } catch {}
  }, [])

  // Listen for check-in events from EngageWidget
  useEffect(() => {
    const onStart = (e) => setCheckInData(e.detail)
    const onClear = () => setCheckInData(null)
    window.addEventListener('trackr-checkin-start', onStart)
    window.addEventListener('trackr-checkin-clear', onClear)
    return () => {
      window.removeEventListener('trackr-checkin-start', onStart)
      window.removeEventListener('trackr-checkin-clear', onClear)
    }
  }, [])

  // Live countdown tick
  useEffect(() => {
    if (checkInData) {
      tickRef.current = setInterval(() => setTick(t => t + 1), 1000)
    } else {
      clearInterval(tickRef.current)
    }
    return () => clearInterval(tickRef.current)
  }, [checkInData])

  function confirmFromHeader() {
    window.dispatchEvent(new Event('trackr-checkin-confirm'))
  }

  const msLeft = checkInData ? Math.max(0, checkInData.deadline - Date.now()) : 0

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-30 flex items-center">
      <div className="w-full max-w-screen-xl mx-auto px-4 flex items-center justify-between gap-4">

        {/* Menu toggle + Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={toggle}
            title={open ? 'Close sidebar' : 'Open sidebar'}
            style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, background: open ? 'rgba(96,165,250,0.1)' : 'transparent', border:'none', cursor:'pointer', color: open ? '#60a5fa' : 'rgba(148,163,184,0.6)', transition:'all 0.15s', flexShrink:0 }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(96,165,250,0.1)'; e.currentTarget.style.color='#60a5fa' }}
            onMouseLeave={e => { e.currentTarget.style.background=open?'rgba(96,165,250,0.1)':'transparent'; e.currentTarget.style.color=open?'#60a5fa':'rgba(148,163,184,0.6)' }}
          >
            <Menu size={16}/>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex items-end gap-1 h-14">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => cn(
                'flex flex-col items-center justify-end gap-1 px-4 pb-2 h-full text-xs font-medium transition-colors border-b-2',
                isActive
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} className={isActive ? 'opacity-100' : 'opacity-60'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/time-report')}
            title="Time Report"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              color: 'rgba(148,163,184,0.7)',
              transition: 'color 0.15s, background 0.15s',
              fontFamily: 'Consolas, Menlo, Monaco, monospace',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#38bdf8'
              e.currentTarget.style.background = 'rgba(56,189,248,0.07)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'rgba(148,163,184,0.7)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <ActivityIcon size={15}/>
            <span style={{ letterSpacing: '0.1em' }}>Report</span>
          </button>

          {/* Avatar wrapper with check-in badge */}
          <div style={{ position: 'relative' }}>
            <ProfileDropdown />
            {checkInData && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                width: 10, height: 10, borderRadius: '50%',
                background: '#ff6b6b',
                border: '2px solid #0d1117',
                boxShadow: '0 0 8px #ff6b6b',
                animation: 'checkin-pulse 1.4s ease-in-out infinite',
                pointerEvents: 'none',
              }}/>
            )}
          </div>
        </div>

      </div>

      {/* Sliding check-in notification */}
      {checkInData && (
        <div style={{
          position: 'fixed', top: 60, right: 12, width: 288, zIndex: 9997,
          background: '#07090f',
          border: '1px solid rgba(255,107,107,0.45)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,107,0.15)',
          animation: 'checkin-slide-in 0.22s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily:MONO, fontSize:9, fontWeight:800, color:'#ff6b6b', letterSpacing:'0.12em' }}>STILL WORKING?</span>
              <span style={{ fontFamily:MONO, fontSize:14, fontWeight:800, color:'#ff6b6b' }}>{fmtCountdown(msLeft)}</span>
            </div>
            <p style={{ fontSize:11, color:'rgba(255,140,140,0.6)', fontFamily:'Geist, sans-serif', margin:'0 0 10px', lineHeight:1.5 }}>
              No response in 30 min → 30 min deducted &amp; auto clock-out.
            </p>
            <button
              onClick={confirmFromHeader}
              style={{
                width:'100%', padding:'9px 0',
                background:'rgba(78,222,163,0.1)', border:'1px solid rgba(78,222,163,0.35)',
                color:'#4edea3', fontSize:11, fontFamily:'Geist, sans-serif', fontWeight:700,
                cursor:'pointer', letterSpacing:'0.04em', transition:'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(78,222,163,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(78,222,163,0.1)'}
            >
              ✓ &nbsp;I'm still here
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes checkin-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes checkin-slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}
