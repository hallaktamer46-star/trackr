import { Bell, ChevronRight } from 'lucide-react'
import { useApplications } from '../../contexts/ApplicationContext'
import { isToday, isPast, parseISO, format } from 'date-fns'

export default function FollowUpsBanner({ onEditCard }) {
  const { applications } = useApplications()

  const due = applications.filter(a => {
    if (!a.reminder_date) return false
    const d = parseISO(a.reminder_date)
    return isToday(d) || isPast(d)
  })

  if (due.length === 0) return null

  return (
    <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Bell size={16} className="text-amber-600" />
        <h3 className="font-semibold text-amber-800 text-sm">
          {due.length} Follow-up{due.length > 1 ? 's' : ''} Due
        </h3>
      </div>
      <div className="space-y-2">
        {due.map(app => (
          <button
            key={app.id}
            onClick={() => onEditCard(app)}
            className="w-full flex items-center justify-between bg-white rounded-lg px-3 py-2.5 text-left border border-amber-100 hover:border-amber-300 transition-colors group"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">{app.company}</p>
              <p className="text-xs text-slate-500">{app.job_title} · Due {format(parseISO(app.reminder_date), 'MMM d')}</p>
            </div>
            <ChevronRight size={16} className="text-amber-400 group-hover:text-amber-600 transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}
