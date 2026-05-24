import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, parseISO, subWeeks, startOfWeek, isWithinInterval, endOfWeek } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'
import { STATUS_CONFIG } from '../contexts/ApplicationContext'

const STATUS_COLORS = {
  wishlist:  '#94a3b8',
  applied:   '#38bdf8',
  interview: '#a78bfa',
  offer:     '#34d399',
  rejected:  '#fb7185',
}

export default function Stats() {
  const { applications } = useApplications()

  const total      = applications.length
  const applied    = applications.filter(a => a.status !== 'wishlist').length
  const responded  = applications.filter(a => ['interview', 'offer', 'rejected'].includes(a.status)).length
  const interviews = applications.filter(a => ['interview', 'offer'].includes(a.status)).length
  const offers     = applications.filter(a => a.status === 'offer').length

  const responseRate  = applied  > 0 ? ((responded  / applied)  * 100).toFixed(1) : '0'
  const interviewRate = responded > 0 ? ((interviews / responded) * 100).toFixed(1) : '0'

  // Applications by current status (pie-style bar)
  const byStatus = Object.entries(
    applications.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc }, {})
  ).map(([status, count]) => ({ status, label: STATUS_CONFIG[status]?.label ?? status, count }))

  // Applications per week (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const anchor = subWeeks(new Date(), 7 - i)
      const start  = startOfWeek(anchor, { weekStartsOn: 1 })
      const end    = endOfWeek(anchor, { weekStartsOn: 1 })
      return {
        week: format(start, 'MMM d'),
        count: applications.filter(a => {
          if (!a.date_applied) return false
          const d = parseISO(a.date_applied)
          return isWithinInterval(d, { start, end })
        }).length,
      }
    })
    return weeks
  }, [applications])

  const stats = [
    { label: 'Total Applications', value: total,            color: 'text-slate-700' },
    { label: 'Response Rate',       value: `${responseRate}%`, color: 'text-sky-600'  },
    { label: 'Interview Rate',      value: `${interviewRate}%`, color: 'text-violet-600' },
    { label: 'Offers Received',     value: offers,           color: 'text-emerald-600' },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Stats</h1>
        <p className="text-slate-500 text-sm mt-0.5">A snapshot of your job search progress.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
            <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly bar chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-900 mb-5">Applications per Week</h2>
        {total === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No data yet — add your first application.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f0f9ff' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* By status */}
      {byStatus.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-5">Applications by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byStatus} barSize={40} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                cursor={{ fill: '#f0f9ff' }}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 13 }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Count">
                {byStatus.map(entry => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
