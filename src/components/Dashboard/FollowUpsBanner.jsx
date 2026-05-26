import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useApplications } from '../../contexts/ApplicationContext'
import { isToday, isPast, parseISO } from 'date-fns'

export default function FollowUpsBanner({ onEditCard }) {
  const { applications } = useApplications()
  const navigate = useNavigate()

  const due = applications.filter(a => {
    if (!a.reminder_date) return false
    const d = parseISO(a.reminder_date)
    return isToday(d) || isPast(d)
  })

  if (due.length === 0) return null
  const first = due[0]

  return (
    <div className="mb-5 px-4 py-3 bg-sky-500/5 dark:bg-sky-500/10 border border-sky-500/20 dark:border-sky-500/30 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="flex w-5 h-5 items-center justify-center rounded bg-sky-500/20 text-sky-500 shrink-0">
          <AlertTriangle size={11} />
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Follow-up required:{' '}
          <button onClick={() => onEditCard(first)} className="text-slate-800 dark:text-slate-200 font-medium hover:text-sky-600 dark:hover:text-sky-400 transition-colors">
            {first.job_title} @ {first.company}
          </button>
          {due.length > 1 && <span className="text-slate-400 dark:text-slate-500"> +{due.length - 1} more</span>}
        </p>
      </div>
      <button onClick={() => navigate('/ai/follow-up')}
        className="text-[10px] uppercase tracking-widest font-bold text-sky-500 hover:underline whitespace-nowrap ml-4">
        Generate Follow-up
      </button>
    </div>
  )
}
