import { useLocation } from 'react-router-dom'
import { Bell, Sun, Moon } from 'lucide-react'
import { useApplications } from '../../contexts/ApplicationContext'
import { useTheme } from '../../contexts/ThemeContext'
import { isToday, isPast, parseISO } from 'date-fns'
import ProfileDropdown from './ProfileDropdown'

const ROUTE_LABELS = {
  '/':                { section: 'APPLICATIONS', page: 'PIPELINE'   },
  '/stats':           { section: 'ANALYTICS',    page: 'OVERVIEW'   },
  '/ai/cv':           { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/cover-letter': { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/follow-up':      { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/interview-prep': { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/jobs':            { section: 'MARKETPLACE',   page: 'JOB BOARD'  },
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { applications } = useApplications()
  const { dark, toggle } = useTheme()
  const meta = ROUTE_LABELS[pathname] ?? { section: 'TRACKR', page: '' }

  const dueCount = applications.filter(a => {
    if (!a.reminder_date) return false
    const d = parseISO(a.reminder_date)
    return isToday(d) || isPast(d)
  }).length

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-10">

      <div className="flex items-center gap-4">
        <button className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" onClick={onMenuClick}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6"  x2="17" y2="6"  />
            <line x1="3" y1="12" x2="17" y2="12" />
            <line x1="3" y1="18" x2="17" y2="18" />
          </svg>
        </button>
        <h1 className="text-xs font-semibold font-mono text-slate-400 dark:text-slate-500 hidden sm:block">
          {meta.section}{meta.page && <> / <span className="text-slate-700 dark:text-slate-200">{meta.page}</span></>}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Bell */}
        <div className="relative">
          <button aria-label="Notifications" className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
            <Bell size={18} />
          </button>
          {dueCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950" />
          )}
        </div>

        <ProfileDropdown />
      </div>
    </header>
  )
}
