import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, BarChart3, Sparkles, Briefcase, Newspaper, Sun, Moon, FileText, Mail, PenLine, ChevronDown, ArrowRight } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import ProfileDropdown from './ProfileDropdown'
import { cn } from '../../lib/cn'

const nav = [
  { to: '/',      label: 'Home',      icon: Home,       end: true },
  { to: '/board', label: 'Board',     icon: LayoutGrid            },
  { to: '/stats', label: 'Stats',     icon: BarChart3             },
  { to: '/ai/cv', label: 'AI Tools',  icon: Sparkles              },
  { to: '/jobs',  label: 'Jobs',      icon: Briefcase             },
  { to: '/blog',  label: 'Community', icon: Newspaper             },
]

const CV_TOOLS = [
  { to: '/cv/builder',      label: 'CV Builder',   desc: 'Build a polished CV from scratch in minutes', icon: PenLine,  accent: '#a3c9ff', gradient: 'linear-gradient(135deg,#1493ff22,#6366f110)', tag: 'PRO'  },
  { to: '/cv/reviewer',     label: 'CV Reviewer',  desc: 'Get an AI score and fix your CV fast',        icon: FileText, accent: '#4edea3', gradient: 'linear-gradient(135deg,#4edea322,#10b98110)', tag: 'FREE' },
  { to: '/cv/cover-letter', label: 'Cover Letter', desc: 'Generate a tailored cover letter instantly',  icon: Mail,     accent: '#ffb689', gradient: 'linear-gradient(135deg,#ffb68922,#f59e0b10)', tag: 'PRO'  },
]

/* ─── Magazine tile ─── */
function CVTile({ tool, active, onClick }) {
  const [hov, setHov] = useState(false)
  const [pressed, setPressed] = useState(false)
  const Icon = tool.icon
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setPressed(false) }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        flex: 1, position: 'relative', overflow: 'hidden',
        background: active ? tool.gradient : hov ? tool.gradient : 'rgba(255,255,255,0.02)',
        border: `0.5px solid ${active ? tool.accent + '50' : hov ? tool.accent + '35' : 'rgba(48,54,61,0.9)'}`,
        padding: '18px 16px 16px',
        cursor: 'pointer', textAlign: 'left',
        transform: pressed ? 'scale(0.97)' : hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 8px 28px rgba(0,0,0,0.4), 0 0 0 0.5px ${tool.accent}20` : 'none',
        transition: 'all 0.2s cubic-bezier(0.34,1.4,0.64,1)',
      }}
    >
      {/* flood fill from bottom on hover */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: hov ? '100%' : '0%',
        background: `linear-gradient(0deg, ${tool.accent}10, transparent)`,
        transition: 'height 0.35s ease',
        pointerEvents: 'none',
      }}/>

      {/* top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${tool.accent}, ${tool.accent}00)`,
        opacity: hov || active ? 1 : 0,
        transition: 'opacity 0.2s',
      }}/>

      {/* icon */}
      <div style={{
        width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: hov || active ? `${tool.accent}18` : 'rgba(138,145,159,0.07)',
        border: `0.5px solid ${hov || active ? tool.accent + '40' : 'rgba(138,145,159,0.12)'}`,
        marginBottom: 14,
        boxShadow: hov ? `0 0 16px ${tool.accent}30` : 'none',
        transition: 'all 0.2s',
        position: 'relative',
      }}>
        <Icon size={18} style={{ color: hov || active ? tool.accent : '#5a6478', transition: 'color 0.2s', transform: hov ? 'scale(1.1)' : 'scale(1)', transitionProperty: 'color, transform' }}/>
      </div>

      {/* tag */}
      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 7, fontWeight: 700, letterSpacing: '0.08em', color: tool.accent, background: `${tool.accent}15`, border: `0.5px solid ${tool.accent}30`, padding: '2px 5px', opacity: hov || active ? 1 : 0.5, transition: 'opacity 0.2s' }}>
          {tool.tag}
        </span>
      </div>

      <p style={{ fontFamily: 'Geist, Inter, sans-serif', fontSize: 13, fontWeight: 700, color: hov || active ? '#e2e2e8' : '#c0c7d5', letterSpacing: '-0.01em', marginBottom: 5, transition: 'color 0.2s', position: 'relative' }}>
        {tool.label}
      </p>
      <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: hov ? tool.accent + 'bb' : '#404753', lineHeight: 1.5, transition: 'color 0.25s', position: 'relative' }}>
        {tool.desc}
      </p>

      {/* arrow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 12, position: 'relative', opacity: hov ? 1 : 0, transform: hov ? 'translateX(0)' : 'translateX(-6px)', transition: 'all 0.2s' }}>
        <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 8, fontWeight: 700, color: tool.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Open</span>
        <ArrowRight size={10} style={{ color: tool.accent }}/>
      </div>
    </button>
  )
}

export default function Header() {
  const { dark, toggle } = useTheme()
  const location = useLocation()
  const navigate = useNavigate()
  const [cvOpen, setCvOpen] = useState(false)
  const cvRef = useRef(null)

  // close on outside click
  useEffect(() => {
    const h = (e) => { if (cvRef.current && !cvRef.current.contains(e.target)) setCvOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // close on route change
  useEffect(() => { setCvOpen(false) }, [location.pathname])

  const isCvActive = location.pathname.startsWith('/cv')

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-30 flex items-center">
      <div className="w-full max-w-screen-xl mx-auto px-4 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <svg width="36" height="36" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1a0533"/>
                <stop offset="100%" stopColor="#0d0020"/>
              </linearGradient>
            </defs>
            <rect width="100" height="100" rx="18" fill="url(#tBg)"/>
            <text
              x="50" y="79"
              textAnchor="middle"
              fontFamily="Georgia, 'Times New Roman', serif"
              fontSize="80"
              fontWeight="bold"
              fill="white"
              letterSpacing="-2"
            >T</text>
          </svg>
          <span className="hidden sm:block text-slate-900 dark:text-white" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
            TRACKR
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

          {/* CV Builder dropdown */}
          <div className="relative h-full flex items-end" ref={cvRef}>
            <button
              onClick={() => setCvOpen(v => !v)}
              className={cn(
                'flex flex-col items-center justify-end gap-1 px-4 pb-2 h-full text-xs font-medium transition-colors border-b-2',
                isCvActive
                  ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              <div className="flex items-center gap-1">
                <PenLine size={20} className={isCvActive ? 'opacity-100' : 'opacity-60'} />
                <ChevronDown
                  size={11}
                  className={cn('transition-transform', cvOpen && 'rotate-180')}
                  style={{ marginBottom: -1 }}
                />
              </div>
              <span>CV Builder</span>
            </button>

            {/* Dropdown panel — magazine tiles */}
            {cvOpen && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 1px)',
                  left: '50%', transform: 'translateX(-50%)',
                  width: 420, zIndex: 50,
                  background: '#0a0f1a',
                  border: '0.5px solid rgba(48,54,61,0.9)',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(163,201,255,0.06)',
                  padding: 8,
                  display: 'flex', gap: 6,
                  animation: 'dropIn 0.18s cubic-bezier(0.34,1.4,0.64,1)',
                }}
              >
                {/* top shimmer line */}
                <div style={{ position:'absolute', top:0, left:'10%', right:'10%', height:1, background:'linear-gradient(90deg,transparent,rgba(163,201,255,0.2),transparent)', pointerEvents:'none' }}/>

                {CV_TOOLS.map((t) => {
                  const active = location.pathname === t.to || location.pathname.startsWith(t.to + '/')
                  return (
                    <CVTile
                      key={t.to}
                      tool={t}
                      active={active}
                      onClick={() => { navigate(t.to); setCvOpen(false) }}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </nav>

        <style>{`
          @keyframes dropIn {
            from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.97); }
            to   { opacity: 1; transform: translateX(-50%) translateY(0)     scale(1);    }
          }
        `}</style>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <ProfileDropdown />
        </div>

      </div>
    </header>
  )
}
