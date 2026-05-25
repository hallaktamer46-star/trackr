import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO, subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'

const STATUS_COLORS = {
  wishlist:  '#94a3b8',
  applied:   '#38bdf8',
  interview: '#a78bfa',
  offer:     '#34d399',
  rejected:  '#fb7185',
}

const STATUS_LABELS = {
  wishlist: 'Wishlist', applied: 'Applied', interview: 'Interview', offer: 'Offer', rejected: 'Rejected',
}

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: 6,
  fontSize: 12,
  color: '#f1f5f9',
}

export default function Stats() {
  const { applications } = useApplications()

  const total      = applications.length
  const active     = applications.filter(a => ['applied', 'interview'].includes(a.status)).length
  const offers     = applications.filter(a => a.status === 'offer').length
  const responded  = applications.filter(a => ['interview', 'offer', 'rejected'].includes(a.status)).length
  const applied    = applications.filter(a => a.status !== 'wishlist').length
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) + '%' : '0%'

  const byStatus = useMemo(() =>
    Object.keys(STATUS_COLORS).map(s => ({
      name:  STATUS_LABELS[s],
      value: applications.filter(a => a.status === s).length,
      color: STATUS_COLORS[s],
    })), [applications])

  const activity = useMemo(() => {
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const anchor = subWeeks(new Date(), 7 - i)
      const start  = startOfWeek(anchor, { weekStartsOn: 1 })
      const end    = endOfWeek(anchor,   { weekStartsOn: 1 })
      return {
        month: format(start, 'MMM d'),
        count: applications.filter(a => {
          if (!a.date_applied) return false
          return isWithinInterval(parseISO(a.date_applied), { start, end })
        }).length,
      }
    })
    return weeks
  }, [applications])

  const totals = [
    { label: 'Total',         value: total        },
    { label: 'Active',        value: active       },
    { label: 'Offers',        value: offers       },
    { label: 'Response Rate', value: responseRate },
  ]

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Page header */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-sky-500 font-bold mb-1">Analytics</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Activity Overview</h1>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {totals.map(t => (
          <div key={t.label} className="bg-white border border-slate-200 rounded-xl p-5">
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mb-2">{t.label}</p>
            <p className="text-3xl font-extrabold font-mono text-slate-900">{t.value}</p>
          </div>
        ))}
      </div>

      {/* Area + Pie row */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold font-mono text-slate-400">
              Activity Over Time
            </h2>
            <span className="text-[10px] font-mono text-sky-500">apps / week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={2} fill="url(#aGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold font-mono text-slate-400 mb-4">
            Status Breakdown
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2} stroke="white">
                {byStatus.map(d => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {byStatus.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  <span className="text-slate-500">{d.name}</span>
                </div>
                <span className="font-mono text-slate-700">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold font-mono text-slate-400 mb-4">
          Applications by Status
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byStatus}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {byStatus.map(d => <Cell key={d.name} fill={d.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
