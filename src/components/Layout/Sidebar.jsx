import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useSidebar } from '../../contexts/SidebarContext'
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
export const SIDEBAR_W = 64

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
      { to: '/board',           icon: LayoutDashboard, label: 'Dashboard'      },
      { to: '/jobs',            icon: Briefcase,       label: 'Jobs'           },
      { to: '/ai',              icon: Briefcase,       label: 'Job Toolkit'    },
      { to: '/cv/builder',      icon: PenLine,         label: 'CV Builder'     },
      { to: '/cv/reviewer',     icon: FileText,        label: 'CV Reviewer'    },
      { to: '/cv/cover-letter', icon: Mail,            label: 'Cover Letter'   },
      { to: '/stats',           icon: BarChart3,       label: 'Stats'          },
      { to: '/time-report',     icon: Clock,           label: 'Time Report'    },
    ],
  },
  {
    label: 'Business',
    items: [
      { to: '/growth',  icon: Telescope, label: 'Growth Lab'      },
      { to: '/startup', icon: Rocket,    label: 'Startup Studio'  },
      { to: '/pitch',   icon: Building2, label: 'Pitch Lab'       },
    ],
  },
  {
    label: 'Personal',
    items: [
      { to: '/life',       icon: LayoutList,   label: 'Life Plan'       },
      { to: '/debrief',    icon: Flame,        label: 'Daily Debrief'   },
      { to: '/clarity',    icon: Brain,        label: 'Mental Clarity'  },
      { to: '/roundtable', icon: Users,        label: 'Round Table'     },
      { to: '/calendar',   icon: CalendarDays, label: 'Calendar'        },
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

function NavItem({ label, icon: Icon, to, end, matches }) {
  const { pathname } = useLocation()
  const isActive = end
    ? pathname === to
    : (matches || [to]).some(m => pathname === m || pathname.startsWith(m + '/'))

  return (
    <NavLink to={to} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0', cursor: 'pointer' }}>
        <div style={{
          width: 42, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 9,
          background: isActive ? 'rgba(163,201,255,0.12)' : 'transparent',
          border: `0.5px solid ${isActive ? 'rgba(163,201,255,0.2)' : 'transparent'}`,
          transition: 'all 0.14s',
        }}>
          <Icon size={17} color={isActive ? '#a3c9ff' : 'rgba(80,100,140,0.7)'} />
        </div>
        <span style={{
          fontFamily: SANS, fontSize: 9, fontWeight: isActive ? 600 : 400,
          color: isActive ? '#c8d8f0' : 'rgba(80,100,140,0.6)',
          letterSpacing: '0.01em', userSelect: 'none',
        }}>{label}</span>
      </div>
    </NavLink>
  )
}

function BottomItem({ label, icon: Icon, to, onClick, accent }) {
  const { pathname } = useLocation()
  const isActive = to ? (pathname === to || pathname.startsWith(to + '/')) : false
  const col = accent || (isActive ? '#a3c9ff' : 'rgba(80,100,140,0.6)')

  const inner = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0', cursor: 'pointer' }}>
      <div style={{
        width: 42, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 9,
        background: isActive ? 'rgba(163,201,255,0.12)' : 'transparent',
        border: `0.5px solid ${isActive ? 'rgba(163,201,255,0.2)' : 'transparent'}`,
        transition: 'all 0.14s',
      }}>
        <Icon size={17} color={col} />
      </div>
      <span style={{
        fontFamily: SANS, fontSize: 9, fontWeight: isActive ? 600 : 400,
        color: col, letterSpacing: '0.01em', userSelect: 'none',
      }}>{label}</span>
    </div>
  )

  if (to) return <NavLink to={to} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>{inner}</NavLink>
  return <button onClick={onClick} style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer' }}>{inner}</button>
}

export default function Sidebar() {
  const { open } = useSidebar()
  const [moreOpen, setMoreOpen] = useState(false)
  const panelRef = useRef(null)
  const moreRef = useRef(null)

  useEffect(() => {
    if (!moreOpen) return
    function onDown(e) {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        moreRef.current && !moreRef.current.contains(e.target)
      ) setMoreOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [moreOpen])

  return (
    <>
      <div style={{
        position: 'fixed', top: 56, left: 0, bottom: 0,
        width: SIDEBAR_W,
        background: '#07090f',
        borderRight: '1px solid rgba(48,54,61,0.55)',
        zIndex: 20,
        transform: `translateX(${open ? 0 : -SIDEBAR_W}px)`,
        transition: 'transform 0.22s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingTop: 8,
      }}>
        {/* Main nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 2, flex: 1 }}>
          {MAIN_NAV.map(item => (
            <NavItem key={item.to} {...item} />
          ))}

          {/* More */}
          <div ref={moreRef} style={{ width: '100%' }}>
            <button
              onClick={() => setMoreOpen(v => !v)}
              style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0' }}>
                <div style={{
                  width: 42, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 9,
                  background: moreOpen ? 'rgba(163,201,255,0.12)' : 'transparent',
                  border: `0.5px solid ${moreOpen ? 'rgba(163,201,255,0.2)' : 'transparent'}`,
                  transition: 'all 0.14s',
                }}>
                  <GridIcon size={16} color={moreOpen ? '#a3c9ff' : 'rgba(80,100,140,0.7)'} />
                </div>
                <span style={{
                  fontFamily: SANS, fontSize: 9, fontWeight: moreOpen ? 600 : 400,
                  color: moreOpen ? '#c8d8f0' : 'rgba(80,100,140,0.6)',
                  letterSpacing: '0.01em', userSelect: 'none',
                }}>More</span>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom: Settings above Upgrade */}
        <div style={{
          width: '100%', paddingBottom: 12, paddingTop: 8,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          borderTop: '1px solid rgba(48,54,61,0.4)',
        }}>
          <BottomItem label="Settings" icon={Settings} onClick={() => {}} />
          <BottomItem label="Upgrade"  icon={Zap}      to="/plans" accent="#a78bfa" />
        </div>
      </div>

      {/* More floating panel */}
      {moreOpen && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed', top: 56, left: SIDEBAR_W, bottom: 0,
            width: 220,
            background: '#07090f',
            borderRight: '1px solid rgba(48,54,61,0.55)',
            zIndex: 19,
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 8px' }}>
            <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, color: 'rgba(90,110,160,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>All Tools</span>
            <button
              onClick={() => setMoreOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(90,110,160,0.45)', display: 'flex', padding: 2, transition: 'color 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#8a919f'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(90,110,160,0.45)'}
            >
              <X size={13} />
            </button>
          </div>

          {MORE_SECTIONS.map(section => (
            <div key={section.label} style={{ marginBottom: 4 }}>
              <p style={{ fontFamily: MONO, fontSize: 7, fontWeight: 700, color: 'rgba(90,110,160,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '8px 16px 4px', margin: 0 }}>
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
                        background: isActive ? 'rgba(163,201,255,0.06)' : 'transparent',
                        borderLeft: `2px solid ${isActive ? '#a3c9ff' : 'transparent'}`,
                        transition: 'background 0.12s',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(163,201,255,0.03)' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <item.icon size={12} color={isActive ? '#a3c9ff' : 'rgba(80,100,140,0.6)'} />
                      <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? '#e2e2e8' : 'rgba(140,165,210,0.65)' }}>
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
