import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSidebar } from '../../contexts/SidebarContext'
import {
  Home, Briefcase, Building2, User, Users, Settings, Activity,
  LayoutDashboard, Telescope, Rocket, CalendarDays, BarChart3,
  Clock, BookOpen, Map, Newspaper, LayoutList, Flame, Brain,
  PenLine, FileText, Mail, DollarSign,
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

const NAV_ITEMS = [
  {
    label: 'Home', icon: Home, to: '/',
    matches: ['/'],
    items: null,
  },
  {
    label: 'Jobs', icon: Briefcase, to: null,
    matches: ['/board', '/jobs', '/ai', '/cv', '/stats'],
    items: [
      { to: '/board',           icon: LayoutDashboard, label: 'Dashboard'    },
      { to: '/jobs',            icon: Briefcase,       label: 'Jobs'         },
      { to: '/ai',              icon: Briefcase,       label: 'Job Toolkit'  },
      { to: '/cv/builder',      icon: PenLine,         label: 'CV Builder'   },
      { to: '/cv/reviewer',     icon: FileText,        label: 'CV Reviewer'  },
      { to: '/cv/cover-letter', icon: Mail,            label: 'Cover Letter' },
      { to: '/stats',           icon: BarChart3,       label: 'Stats'        },
    ],
  },
  {
    label: 'Business', icon: Building2, to: null,
    matches: ['/growth', '/startup', '/pitch'],
    items: [
      { to: '/growth',  icon: Telescope, label: 'Growth Lab'     },
      { to: '/startup', icon: Rocket,    label: 'Startup Studio' },
      { to: '/pitch',   icon: Building2, label: 'Pitch Lab'      },
    ],
  },
  {
    label: 'Personal', icon: User, to: null,
    matches: ['/life', '/debrief', '/clarity', '/roundtable', '/calendar'],
    items: [
      { to: '/life',       icon: LayoutList,   label: 'Life Plan'      },
      { to: '/debrief',    icon: Flame,        label: 'Daily Debrief'  },
      { to: '/clarity',    icon: Brain,        label: 'Mental Clarity' },
      { to: '/roundtable', icon: Users,        label: 'Round Table'    },
      { to: '/calendar',   icon: CalendarDays, label: 'Calendar'       },
    ],
  },
  {
    label: 'Community', icon: Users, to: null,
    matches: ['/blog', '/roadmap', '/library', '/plans'],
    items: [
      { to: '/blog',    icon: Newspaper,  label: 'Community' },
      { to: '/roadmap', icon: Map,        label: 'Roadmap'   },
      { to: '/library', icon: BookOpen,   label: 'Library'   },
      { to: '/plans',   icon: DollarSign, label: 'Pricing'   },
    ],
  },
  {
    label: 'More', icon: null, to: null,
    matches: ['/time-report'],
    items: [
      { to: '/time-report', icon: Clock, label: 'Time Report' },
    ],
  },
]

function iconBoxStyle(isActive, flyoutOpen, hovered) {
  if (isActive) return {
    background: 'rgba(255,255,255,0.16)',
    boxShadow: '0 0 22px rgba(255,255,255,0.22), inset 0 0 10px rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.22)',
    transform: 'scale(1.07)',
  }
  if (flyoutOpen) return {
    background: 'rgba(255,255,255,0.06)',
    boxShadow: 'none',
    border: '0.5px solid rgba(255,255,255,0.14)',
    transform: 'scale(1)',
  }
  if (hovered) return {
    background: 'rgba(255,255,255,0.09)',
    boxShadow: '0 0 14px rgba(255,255,255,0.13)',
    border: '0.5px solid rgba(255,255,255,0.1)',
    transform: 'scale(1)',
  }
  return {
    background: 'transparent', boxShadow: 'none',
    border: '0.5px solid transparent', transform: 'scale(1)',
  }
}

function NavItem({ item, openFlyout, onToggle }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  const isActive = item.matches
    ? item.matches.some(m => pathname === m || pathname.startsWith(m + '/'))
    : pathname === item.to
  const flyoutOpen = openFlyout === item.label

  function handleClick() {
    if (item.to) {
      navigate(item.to)
      onToggle(null)
    } else {
      onToggle(flyoutOpen ? null : item.label)
    }
  }

  return (
    <button onClick={handleClick} style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer' }}>
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '5px 0' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{
          width: 40, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 9, transition: 'all 0.18s cubic-bezier(0.22,1,0.36,1)',
          ...iconBoxStyle(isActive, flyoutOpen, hovered),
        }}>
          {item.icon
            ? <item.icon size={16} color="#ffffff" />
            : <GridIcon size={15} color="#ffffff" />
          }
        </div>
        <span style={{
          fontFamily: SANS, fontSize: 9, fontWeight: isActive ? 700 : flyoutOpen ? 600 : 400,
          color: '#ffffff', letterSpacing: '0.01em', userSelect: 'none',
        }}>{item.label}</span>
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
      <span style={{ fontFamily: SANS, fontSize: 9, fontWeight: isActive ? 700 : 400, color: col, letterSpacing: '0.01em', userSelect: 'none' }}>
        {label}
      </span>
    </div>
  )

  if (to) return <NavLink to={to} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>{inner}</NavLink>
  return <button onClick={onClick} style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer' }}>{inner}</button>
}

function Flyout({ item, panelRef, onClose }) {
  if (!item?.items) return null
  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: TOP,
        bottom: BOTTOM,
        left: W + GAP * 2,
        width: 200,
        background: BG,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        zIndex: 19,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', flexShrink: 0 }}>
        <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: '0 0 12px', lineHeight: 1 }}>
          {item.label}
        </p>
        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, paddingBottom: 16 }}>
        {item.items.map(sub => (
          <NavLink
            key={sub.to} to={sub.to}
            onClick={onClose}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            {({ isActive }) => (
              <FlyoutItem sub={sub} isActive={isActive} />
            )}
          </NavLink>
        ))}
      </div>
    </div>
  )
}

function FlyoutItem({ sub, isActive }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 20px',
        margin: '2px 8px',
        borderRadius: 9,
        background: isActive
          ? 'rgba(255,255,255,0.1)'
          : hovered ? 'rgba(255,255,255,0.055)' : 'transparent',
        transition: 'background 0.14s',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <sub.icon
        size={14}
        color={isActive ? '#ffffff' : hovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.55)'}
        strokeWidth={isActive ? 2.2 : 1.8}
      />
      <span style={{
        fontFamily: SANS,
        fontSize: 13.5,
        fontWeight: isActive ? 650 : 430,
        color: isActive ? '#ffffff' : hovered ? '#ffffff' : 'rgba(255,255,255,0.82)',
        letterSpacing: '-0.01em',
        lineHeight: 1,
        transition: 'color 0.14s',
      }}>
        {sub.label}
      </span>
    </div>
  )
}

export default function Sidebar() {
  const { openFlyout, setOpenFlyout } = useSidebar()
  const sidebarRef = useRef(null)
  const panelRef   = useRef(null)

  const openItem = NAV_ITEMS.find(n => n.label === openFlyout) || null

  useEffect(() => {
    if (!openFlyout) return
    function onDown(e) {
      if (
        sidebarRef.current && !sidebarRef.current.contains(e.target) &&
        panelRef.current   && !panelRef.current.contains(e.target)
      ) setOpenFlyout(null)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openFlyout])

  return (
    <>
      <div
        ref={sidebarRef}
        style={{
          position: 'fixed', top: TOP, left: GAP, bottom: BOTTOM,
          width: W,
          background: BG,
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          zIndex: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: 8,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 1, flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.label} item={item} openFlyout={openFlyout} onToggle={setOpenFlyout} />
          ))}
        </div>

        <div style={{
          width: '100%', paddingBottom: 10, paddingTop: 6, flexShrink: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <BottomItem label="Settings" icon={Settings} onClick={() => {}} />
          <BottomItem label="Report"   icon={Activity}  to="/time-report" />
        </div>
      </div>

      <Flyout item={openItem} panelRef={panelRef} onClose={() => setOpenFlyout(null)} />
    </>
  )
}
