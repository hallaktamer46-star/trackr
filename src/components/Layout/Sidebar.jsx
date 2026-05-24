import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, BarChart2, Brain, FileText, Mail, X, LogOut, Briefcase } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/cn'

const navItems = [
  { to: '/',       icon: LayoutDashboard, label: 'Board' },
  { to: '/stats',  icon: BarChart2,       label: 'Stats' },
]

const aiItems = [
  { to: '/ai/cv',           icon: FileText, label: 'CV Reviewer'        },
  { to: '/ai/cover-letter', icon: Brain,    label: 'Cover Letter'       },
  { to: '/ai/follow-up',    icon: Mail,     label: 'Follow-up Generator' },
]

function NavItem({ to, icon: Icon, label, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-sky-50 text-sky-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )
      }
    >
      <Icon size={18} />
      {label}
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }) {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200',
        'lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
            <Briefcase size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">Trackr</span>
        </div>
        <button
          className="lg:hidden text-slate-400 hover:text-slate-600"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} end={item.to === '/'} onClick={onClose} />
        ))}

        <div className="pt-4">
          <p className="px-3 mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            AI Coaching
          </p>
          {aiItems.map(item => (
            <NavItem key={item.to} {...item} onClick={onClose} />
          ))}
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
