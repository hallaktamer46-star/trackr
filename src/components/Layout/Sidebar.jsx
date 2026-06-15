import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Home, Briefcase, Building2, User, Users,
  Settings, Zap, X,
  LayoutDashboard, Telescope, Rocket,
  CalendarDays, BarChart3, Clock, BookOpen, Map, Newspaper,
  LayoutList, Flame, Brain, PenLine, FileText, Mail,
  DollarSign,
} from 'lucide-react'

const SANS = 'Geist, Inter, sans-serif'
const MONO = 'Consolas, Menlo, Monaco, monospace'

const GAP = 8
const W   = 64
export const SIDEBAR_W = W + GAP

const TOP    = 56 + GAP
const BOTTOM = GAP
const BG     = '#0d1b2e'

function GridIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      {[2, 8, 14].flatMap(cx =>
        [2, 8, 14].map(cy => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.4} fill={color} />
        ))
      )}
    </svg>
  )
}

const MAIN_NAV = [
  { label: 'Home',      icon: Home,      to: '/',       end: true,  matches: null },
  { label: 'Jobs',      icon: Briefcase, to: '/board',  end: false, matches: ['/board', '/jobs', '/ai', '/cv', '/stats', '/time-report'] },
  { label: 'Business',  icon: Building2, to: '/growth', end: false, matches: ['/growth', '/startup', '/pitch'] },
  { label: 'Personal',  icon: User,      to: '/life',   end: false, matches: ['/life', '/debrief', '/clarity', '/roundtable', '/calendar'] },
  { label: 'Community', icon: Users,     to: '/blog',   end: false, matches: ['/blog', '/roadmap', '/library', '/plans'] },
]

const MORE_SECTIONS = [
  {
    label: 'Jobs',
    items: [
      { to: '/board',           icon: LayoutDashboard, label: 'Dashboard'     },
      { to: '/jobs',            icon: Briefcase,       label: 'Jobs'          },
      { to: '/ai',              icon: Briefcase,       label: 'Job Toolkit'   },
      { to: '/cv/builder',      icon: PenLine,         label: 'CV Builder'    },
      { to: '/cv/reviewer',     icon: FileText,        label: 'CV Reviewer'   },
      { to: '/cv/cover-letter', icon: Mail,            label: 'Cover Letter'  },
      { to: '/stats',           icon: BarChart3,       label: 'Stats'         },
      { to: '/time-report',     icon: Clock,           label: 'Time Report'   },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/growth',  icon: Telescope, label: 'Growth Lab'     },
      { to: '/startup', icon: Rocket,    label: 'Startup Studio' },
      { to: '/pitch',   icon: Building2, label: 'Pitch Lab'      },
    ],
  },
  {
    label: 'Personal',
    items: [
      { to: '/life',       icon: LayoutList,   label: 'Life Plan'      },
      { to: '/debrief',    icon: Flame,        label: 'Daily Debrief'  },
      { to: '/clarity',    icon: Brain,        label: 'Mental Clarity' },
      { to: '/roundtable', icon: Users,        label: 'Round Table'    },
      { to: '/calendar',   icon: CalendarDays, label: 'Calendar'       },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/blog',    icon: Newspaper,  label: 'Community' },
      { to: '/roadmap', icon: Map,        label: 'Roadmap'   },
      { to: '/library', icon: BookOpen,   label: 'Library'   },
      { to: '/plans',   icon: DollarSign, label: 'Pricing'   },
    ],
  },
]

function iconBoxStyle(isActive, hovered) {
  if (isActive) return {
    background: 'rgba(255,255,255,0.16)',
    boxShadow: '0 0 22px rgba(255,255,255,0.22), inset 0 0 10px rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.22)',
    transform: 'scale(1.07)',
  }
  if (hovered) return {
    background: 'rgba(255,255,255,0.09)',
    boxShadow: '0 0 14px rgba(255,255,255,0.13)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    transform: 'scale(1)',
  }
  return {
    background: 'transparent',
    boxShadow: 'none',
    border: '0.5px solid transparent',
    transform: 'scale(1)',
  }
}

function NavItem({ label, icon: Icon, to, end, matches }) {
  const { pathname } = useLocation()
  const isActive = end
    ? pathname === to
    : (matches || [to]).some(m => pathname === m || pathname.startsWith(m + '/'))
  const [hovered, setHovered] = useState(false)

  return (
    <NavLink to={to} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 0', cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{
          width: 40, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 9, transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
          ...iconBoxStyle(isActive, hovered),
        }}>
          <Icon size={16} color="#ffffff" />
        </div>
        <span style={{
          fontFamily: SANS, fontSize: 9, fontWeight: isActive ? 700 : 400,
          color: '#ffffff', letterSpacing: '0.01em', userSelect: 'none',
        }}>{label}</span>
      </div>
    </NavLink>
  )
}

function MoreButton({ onClick, isOpen }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer' }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 0' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{
          width: 40, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 9, transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
          ...iconBoxStyle(isOpen, hovered),
        }}>
          <GridIcon size={15} color="#ffffff" />
        </div>
        <span style={{
          fontFamily: SANS, fontSize: 9, fontWeight: isOpen ? 700 : 400,
          color: '#ffffff', letterSpacing: '0.01em', userSelect: 'none',
        }}>More</span>
      </div>
    </button>
  )
}

function BottomItem({ label, icon: Icon, to, onClick, accent }) {
  const { pathname } = useLocation()
  const isActive = to ? (pathname === to || pathname.startsWith(to + '/')) : false
  const [hovered, setHovered] = useState(false)
  const col = accent || '#ffffff'

  const inner = (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 0', cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width: 40, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 9, transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
        ...iconBoxStyle(isActive, hovered),
      }}>
        <Icon size={16} color={col} />
      </div>
      <span style={{
        fontFamily: SANS, fontSize: 9, fontWeight: isActive ? 700 : 400,
        color: col, letterSpacing: '0.01em', userSelect: 'none',
      }}>{label}</span>
    </div>
  )

  if (to) return <NavLink to={to} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>{inner}</NavLink>
  return <button onClick={onClick} style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer' }}>{inner}</button>
}

export default function Sidebar() {
  const [moreOpen, setMoreOpen] = useState(false)
  const panelRef = useRef(null)
  const moreRef  = useRef(null)

  useEffect(() => {
    if (!moreOpen) return
    function onDown(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        moreRef.current  && !moreRef.current.contains(e.target)
      ) setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [moreOpen])

  return (
    <>
      <div style={{
        position: 'fixed',
        top: TOP, left: GAP, bottom: BOTTOM,
        width: W,
        background: BG,
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        zIndex: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 8,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 1, flex: 1 }}>
          {MAIN_NAV.map(item => <NavItem key={item.to} {...item} />)}
          <div ref={moreRef} style={{ width: '100%' }}>
            <MoreButton onClick={() => setMoreOpen(v => !v)} isOpen={moreOpen} />
          </div>
        </div>

        <div style={{
          width: '100%', paddingBottom: 10, paddingTop: 6,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}>
          <BottomItem label="Settings" icon={Settings} onClick={() => {}} />
          <BottomItem label="Upgrade"  icon={Zap}      to="/plans" accent="#a78bfa" />
        </div>
      </div>

      {moreOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            top: TOP, left: W + GAP * 2, bottom: BOTTOM,
            width: 220,
            background: BG,
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            zIndex: 19,
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 8px' }}>
            <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>All Tools</span>
            <button
              onClick={() => setMoreOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 2, transition: 'color 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
            >
              <X size={13} />
            </button>
          </div>

          {MORE_SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: 4 }}>
              <p style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 16px 4px', margin: 0 }}>
                {section.label}
              </p>
              {section.items.map(item => (
                <NavLink
                  key={item.to} to={item.to}
                  onClick={() => setMoreOpen(false)}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  {({ isActive }) => (
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 9,
                        padding: '7px 16px',
                        background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                        borderLeft: `2px solid ${isActive ? '#ffffff' : 'transparent'}`,
                        transition: 'background 0.12s', cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <item.icon size={12} color="#ffffff" />
                      <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: isActive ? 600 : 400, color: '#ffffff', opacity: isActive ? 1 : 0.7 }}>
                        {item.label}
                      </span>
                    </div>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  )
}
