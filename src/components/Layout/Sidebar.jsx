import { NavLink, useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, BarChart3, Sparkles, Briefcase, X, Newspaper, Brain } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApplications } from '../../contexts/ApplicationContext'
import { cn } from '../../lib/cn'

const nav = [
  { to: '/',         label: 'Home',           icon: Home,       end: true },
  { to: '/board',    label: 'Board',           icon: LayoutGrid            },
  { to: '/stats',    label: 'Stats',           icon: BarChart3             },
  { to: '/ai/cv',    label: 'AI Tools',        icon: Sparkles              },
  { to: '/jobs',     label: 'Jobs',            icon: Briefcase             },
  { to: '/blog',     label: 'Community',       icon: Newspaper             },
  { to: '/clarity',  label: 'Mental Clarity',  icon: Brain                 },
]

export default function Sidebar({ open, onClose }) {
  const { signOut } = useAuth()
  const { isPaidUser } = useApplications()
  const navigate = useNavigate()

  const handleSignOut = async () => { await signOut(); navigate('/auth') }

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200',
      'lg:translate-x-0',
      open ? 'translate-x-0' : '-translate-x-full'
    )}>

      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.5)] grid place-items-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm" />
          </div>
          <span className="font-extrabold text-xl tracking-tighter font-mono text-white">TRACKR</span>
        </div>
        <button className="lg:hidden text-slate-500 hover:text-slate-300" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  isActive ? 'bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]' : 'bg-transparent'
                )} />
                <Icon size={16} className="opacity-70" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Plan indicator */}
      <div className="px-5 py-4 border-t border-slate-800 flex items-center justify-between">
        <span className="font-extrabold text-sm tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
          <span className={isPaidUser ? 'text-sky-400' : 'text-slate-300'}>
            {isPaidUser ? 'PRO' : 'FREE'}
          </span>
          <span className="text-slate-600 font-normal text-xs ml-1">PLAN</span>
        </span>
        <span className="text-[10px] font-mono text-slate-700">v1.0.0</span>
      </div>
    </aside>
  )
}
