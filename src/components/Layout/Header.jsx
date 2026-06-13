import { NavLink, useNavigate } from 'react-router-dom'
import { Home, Sparkles, Rocket, Building2, Telescope, Map, Menu } from 'lucide-react'
import ProfileDropdown from './ProfileDropdown'
import { cn } from '../../lib/cn'
import { useSidebar } from '../../contexts/SidebarContext'

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
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="34" height="34" rx="9" fill="#0c1220"/>
            <polyline
              points="4,17 8,17 10.5,10 14,24 17,12 20,20 23,20 26,17 30,17"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="hidden sm:block text-slate-900 dark:text-white" style={{ fontFamily: 'Inter, -apple-system, sans-serif', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
            Trackr
          </span>
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
              fontFamily: '"Geist Mono", monospace',
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
          <ProfileDropdown />
        </div>

      </div>
    </header>
  )
}
