import { useApplications } from '../../contexts/ApplicationContext'

export default function StatsPanel() {
  const { applications } = useApplications()

  const total = applications.length
  const responded = applications.filter(a => ['interview', 'offer', 'rejected'].includes(a.status)).length
  const interviews = applications.filter(a => ['interview', 'offer'].includes(a.status)).length
  const applied = applications.filter(a => a.status !== 'wishlist').length

  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0
  const interviewRate = responded > 0 ? Math.round((interviews / responded) * 100) : 0

  const stats = [
    { label: 'Total',         value: total,           color: 'text-slate-700' },
    { label: 'Response Rate', value: `${responseRate}%`, color: 'text-sky-600'   },
    { label: 'Interview Rate',value: `${interviewRate}%`,color: 'text-violet-600' },
    { label: 'Offers',        value: applications.filter(a => a.status === 'offer').length, color: 'text-emerald-600' },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      {stats.map(s => (
        <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center">
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  )
}
