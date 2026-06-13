import { useState, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import ProfileDropdown from './ProfileDropdown'
import {
  LayoutDashboard, Sparkles, Telescope, Rocket, Building2,
  BarChart3, CalendarDays, BriefcaseBusiness, Map, BookOpen,
  Clock, Users, DollarSign,
} from 'lucide-react'

function ActivityIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <polyline points="1,10 5,10 7,4 10,16 13,8 15,11 19,11"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const SANS = 'Geist, Inter, -apple-system, sans-serif'
const MONO = '"Geist Mono", monospace'

const PRODUCT_ITEMS = [
  { to: '/board',   icon: LayoutDashboard,   label: 'Dashboard',      desc: 'Kanban job tracker'         },
  { to: '/ai',      icon: Sparkles,           label: 'AI Tools',       desc: 'Interview, salary & market' },
  { to: '/growth',  icon: Telescope,          label: 'Growth Lab',     desc: 'Career acceleration'        },
  { to: '/startup', icon: Rocket,             label: 'Startup Studio', desc: 'Launch your own venture'    },
  { to: '/pitch',   icon: Building2,          label: 'Pitch Lab',      desc: 'Investor pitch builder'     },
  { to: '/stats',   icon: BarChart3,          label: 'Stats',          desc: 'Application analytics'      },
  { to: '/calendar',icon: CalendarDays,       label: 'Calendar',       desc: 'Tasks, goals & sessions'    },
  { to: '/jobs',    icon: BriefcaseBusiness,  label: 'Jobs',           desc: 'Browse open roles'          },
]

const RESOURCES_ITEMS = [
  { to: '/blog',        icon: Users,   label: 'Community',   desc: 'Connect with other job seekers' },
  { to: '/roadmap',     icon: Map,     label: 'Roadmap',     desc: "What we're building next"       },
  { to: '/time-report', icon: Clock,   label: 'Time Report', desc: 'Track your working hours'       },
]

function DropdownMenu({ items, onClose }) {
  return (
    <div
      onMouseLeave={onClose}
      style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 8,
        background: '#0d1117',
        border: '1px solid rgba(48,54,61,0.9)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
        padding: '8px',
        minWidth: 280,
        zIndex: 100,
        display: 'grid',
        gridTemplateColumns: items.length > 4 ? '1fr 1fr' : '1fr',
        gap: 2,
      }}
    >
      {items.map(({ to, icon: Icon, label, desc }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onClose}
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: '9px 11px',
            textDecoration: 'none',
            background: isActive ? 'rgba(0,212,255,0.06)' : 'transparent',
            border: isActive ? '1px solid rgba(0,212,255,0.12)' : '1px solid transparent',
            transition: 'background 0.12s',
          })}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(96,165,250,0.07)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
        >
          <div style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.12)', flexShrink: 0,
          }}>
            <Icon size={13} style={{ color: '#00d4ff' }}/>
          </div>
          <div>
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 600, color: '#e2e2e8', marginBottom: 1 }}>{label}</p>
            <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(96,140,200,0.65)', lineHeight: 1.3 }}>{desc}</p>
          </div>
        </NavLink>
      ))}
    </div>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(null) // 'product' | 'resources' | null
  const closeTimer = useRef(null)

  function enter(key) {
    clearTimeout(closeTimer.current)
    setOpen(key)
  }
  function leave() {
    closeTimer.current = setTimeout(() => setOpen(null), 80)
  }

  const NAV_ITEM = (label, key) => ({
    onMouseEnter: () => enter(key),
    onMouseLeave: leave,
    style: {
      fontFamily: SANS,
      fontSize: 13,
      fontWeight: 400,
      color: open === key ? '#e2e2e8' : 'rgba(180,200,230,0.65)',
      background: 'none',
      border: 'none',
      padding: '6px 14px',
      cursor: 'pointer',
      letterSpacing: '-0.01em',
      whiteSpace: 'nowrap',
      transition: 'color 0.15s',
    },
  })

  return (
    <header style={{
      height: 52,
      background: '#07090f',
      borderBottom: '1px solid rgba(48,54,61,0.7)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 1240,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        height: '100%',
      }}>

        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" fill="#0c1a2e"/>
            <polyline points="4,17 8,17 10.5,10 14,24 17,12 20,20 23,20 26,17 30,17"
              stroke="#00d4ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#e2e2e8', letterSpacing: '-0.02em' }}>
            Trackr
          </span>
        </NavLink>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', height: '100%', position: 'relative' }}>

          {/* Product */}
          <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
            <button {...NAV_ITEM('Product', 'product')}>Product</button>
            {open === 'product' && (
              <DropdownMenu items={PRODUCT_ITEMS} onClose={() => setOpen(null)} />
            )}
          </div>

          {/* Resources */}
          <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
            <button {...NAV_ITEM('Resources', 'resources')}>Resources</button>
            {open === 'resources' && (
              <DropdownMenu items={RESOURCES_ITEMS} onClose={() => setOpen(null)} />
            )}
          </div>

          {/* Pricing — direct link */}
          <NavLink
            to="/plans"
            style={({ isActive }) => ({
              fontFamily: SANS, fontSize: 13, fontWeight: 400,
              color: isActive ? '#e2e2e8' : 'rgba(180,200,230,0.65)',
              textDecoration: 'none',
              padding: '6px 14px',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            })}
            onMouseEnter={e => e.currentTarget.style.color = '#e2e2e8'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(180,200,230,0.65)'}
          >
            Pricing
          </NavLink>

          {/* Roadmap — direct link */}
          <NavLink
            to="/roadmap"
            style={({ isActive }) => ({
              fontFamily: SANS, fontSize: 13, fontWeight: 400,
              color: isActive ? '#e2e2e8' : 'rgba(180,200,230,0.65)',
              textDecoration: 'none',
              padding: '6px 14px',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              transition: 'color 0.15s',
            })}
            onMouseEnter={e => e.currentTarget.style.color = '#e2e2e8'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(180,200,230,0.65)'}
          >
            Roadmap
          </NavLink>

        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => navigate('/time-report')}
            title="Time Report"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px',
              background: 'transparent', border: 'none',
              cursor: 'pointer',
              color: 'rgba(96,140,200,0.5)',
              fontFamily: MONO, fontSize: 9, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(96,140,200,0.5)'}
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
