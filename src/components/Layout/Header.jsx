import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, BarChart3, Sparkles, Briefcase, Newspaper, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import ProfileDropdown from './ProfileDropdown'
import { cn } from '../../lib/cn'

const nav = [
  { to: '/',       label: 'Home',      icon: Home,       end: true },
  { to: '/board',  label: 'Board',     icon: LayoutGrid            },
  { to: '/stats',  label: 'Stats',     icon: BarChart3             },
  { to: '/ai/cv',  label: 'AI Tools',  icon: Sparkles              },
  { to: '/jobs',   label: 'Jobs',      icon: Briefcase             },
  { to: '/blog',   label: 'Community', icon: Newspaper             },
]

export default function Header() {
  const { dark, toggle } = useTheme()

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-30 flex items-center">
      <div className="w-full max-w-screen-xl mx-auto px-4 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-sky-500 rounded-lg shadow-[0_0_14px_rgba(14,165,233,0.45)] grid place-items-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm" />
          </div>
          <span className="font-extrabold text-lg tracking-tighter font-mono text-slate-900 dark:text-white hidden sm:block">
            TRACKR
          </span>
        </div>

        {/* Nav links — centered */}
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
