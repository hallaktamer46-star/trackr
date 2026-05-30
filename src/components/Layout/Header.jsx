import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Home, LayoutGrid, BarChart3, Sparkles, Briefcase, Newspaper, Sun, Moon, FileText, Mail, PenLine, ChevronDown } from 'lucide-react'
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
  { to: '/cv/builder',      label: 'CV Builder',   desc: 'Build a CV from scratch', icon: PenLine  },
  { to: '/cv/reviewer',     label: 'CV Reviewer',  desc: 'Score & fix your CV',     icon: FileText },
  { to: '/cv/cover-letter', label: 'Cover Letter', desc: 'Tailored letter drafts',  icon: Mail     },
]

export default function Header() {
  const { dark, toggle } = useTheme()
  const location = useLocation()
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
          <svg width="34" height="34" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" rx="22" fill="#4A1E8A"/>
            <line x1="30" y1="30" x2="30" y2="58" stroke="#C084FC" strokeWidth="5.5" strokeLinecap="round"/>
            <circle cx="30" cy="24" r="7.5" fill="#C084FC"/>
            <circle cx="30" cy="64" r="7.5" fill="#C084FC"/>
            <line x1="50" y1="22" x2="50" y2="66" stroke="#C084FC" strokeWidth="5.5" strokeLinecap="round"/>
            <circle cx="50" cy="16" r="7.5" fill="#C084FC"/>
            <circle cx="50" cy="72" r="7.5" fill="#C084FC"/>
            <line x1="70" y1="30" x2="70" y2="58" stroke="#C084FC" strokeWidth="5.5" strokeLinecap="round"/>
            <circle cx="70" cy="24" r="7.5" fill="#C084FC"/>
            <circle cx="70" cy="64" r="7.5" fill="#C084FC"/>
          </svg>
          <span className="font-extrabold text-lg tracking-tighter font-mono text-slate-900 dark:text-white hidden sm:block">
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

            {/* Dropdown panel */}
            {cvOpen && (
              <div className="absolute top-[calc(100%+1px)] left-1/2 -translate-x-1/2 w-64 z-50"
                style={{
                  background: '#0d1117',
                  border: '0.5px solid rgba(48,54,61,0.9)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                {CV_TOOLS.map((t, i) => {
                  const Icon = t.icon
                  const active = location.pathname === t.to || location.pathname.startsWith(t.to + '/')
                  return (
                    <NavLink
                      key={t.to}
                      to={t.to}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderBottom: i < CV_TOOLS.length - 1 ? '0.5px solid rgba(48,54,61,0.6)' : 'none',
                        background: active ? 'rgba(163,201,255,0.06)' : 'transparent',
                        borderLeft: active ? '2px solid #a3c9ff' : '2px solid transparent',
                        textDecoration: 'none',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{
                        width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: active ? 'rgba(163,201,255,0.1)' : 'rgba(138,145,159,0.07)',
                        border: `0.5px solid ${active ? 'rgba(163,201,255,0.3)' : 'rgba(138,145,159,0.15)'}`,
                        flexShrink: 0,
                      }}>
                        <Icon size={14} style={{ color: active ? '#a3c9ff' : '#8a919f' }} />
                      </div>
                      <div>
                        <p style={{
                          fontFamily: 'Geist, Inter, sans-serif',
                          fontSize: 12, fontWeight: 600,
                          color: active ? '#e2e2e8' : '#c0c7d5',
                          lineHeight: 1.2, marginBottom: 2,
                        }}>
                          {t.label}
                        </p>
                        <p style={{
                          fontFamily: 'Geist Mono, monospace',
                          fontSize: 9, color: active ? 'rgba(163,201,255,0.7)' : '#404753',
                          letterSpacing: '0.02em',
                        }}>
                          {t.desc}
                        </p>
                      </div>
                    </NavLink>
                  )
                })}
              </div>
            )}
          </div>
        </nav>

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
