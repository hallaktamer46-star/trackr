import { Menu, Bell } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApplications } from '../../contexts/ApplicationContext'
import { isToday, isPast, parseISO } from 'date-fns'

export default function Header({ onMenuClick }) {
  const { user } = useAuth()
  const { applications } = useApplications()

  const dueCount = applications.filter(a => {
    if (!a.reminder_date) return false
    const d = parseISO(a.reminder_date)
    return isToday(d) || isPast(d)
  }).length

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6">
      <button
        className="lg:hidden text-slate-500 hover:text-slate-700"
        onClick={onMenuClick}
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        {dueCount > 0 && (
          <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-medium">
            <Bell size={13} />
            {dueCount} follow-up{dueCount > 1 ? 's' : ''} due
          </div>
        )}
        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-semibold">
          {user?.email?.[0]?.toUpperCase() ?? 'U'}
        </div>
      </div>
    </header>
  )
}
