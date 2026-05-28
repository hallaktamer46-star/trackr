import { useLocation } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import ProfileDropdown from './ProfileDropdown'

const ROUTE_LABELS = {
  '/':                { section: 'APPLICATIONS', page: 'PIPELINE'   },
  '/stats':           { section: 'ANALYTICS',    page: 'OVERVIEW'   },
  '/ai/cv':           { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/cover-letter': { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/follow-up':      { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/interview-prep': { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/salary':         { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/market':         { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/company':        { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/ai/linkedin':       { section: 'ASSIST',        page: 'AI TOOLKIT' },
  '/jobs':            { section: 'MARKETPLACE',   page: 'JOB BOARD'  },
  '/blog':            { section: 'COMMUNITY',     page: 'THE FEED'   },
}

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation()
  const { dark, toggle } = useTheme()
  const meta = ROUTE_LABELS[pathname] ?? { section: 'TRACKR', page: '' }

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

      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <ProfileDropdown />
      </div>
    </header>
  )
}
