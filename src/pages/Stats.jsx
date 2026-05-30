import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO, subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'

const STATUS_COLORS = {
  wishlist:  '#8a919f',
  applied:   '#a3c9ff',
  interview: '#ffb689',
  offer:     '#4edea3',
  rejected:  '#ffb4ab',
}

const STATUS_LABELS = {
  wishlist: 'Wishlist', applied: 'Applied', interview: 'Interview', offer: 'Offer', rejected: 'Rejected',
}

const TIP = {
  contentStyle: {
    background: '#1e2024',
    border: '0.5px solid rgba(138,145,159,0.3)',
    borderRadius: 0,
    fontSize: 11,
    color: '#e2e2e8',
    fontFamily: 'Geist Mono, monospace',
  },
  labelStyle: { color: '#8a919f', fontSize: 10 },
  cursor: { fill: 'rgba(138,145,159,0.06)' },
}

const CARD = {
  background: 'rgba(30,32,36,0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '0.5px solid rgba(138,145,159,0.2)',
  padding: 16,
}

const LABEL = {
  fontFamily: 'Geist Mono, monospace',
  fontSize: 9,
  fontWeight: 600,
  letterSpacing: '0.1em',
  color: '#8a919f',
  textTransform: 'uppercase',
}

export default function Stats() {
  const { applications } = useApplications()

  const total       = applications.length
  const active      = applications.filter(a => ['applied', 'interview'].includes(a.status)).length
  const offers      = applications.filter(a => a.status === 'offer').length
  const responded   = applications.filter(a => ['interview', 'offer', 'rejected'].includes(a.status)).length
  const applied     = applications.filter(a => a.status !== 'wishlist').length
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) + '%' : '0%'

  const kpis = [
    { label: 'Total',         value: total,        color: '#e2e2e8', bar: '#8a919f' },
    { label: 'Active',        value: active,       color: '#a3c9ff', bar: '#a3c9ff' },
    { label: 'Offers',        value: offers,       color: '#4edea3', bar: '#4edea3' },
    { label: 'Response Rate', value: responseRate, color: '#ffb689', bar: '#ffb689' },
  ]

  const byStatus = useMemo(() =>
    Object.keys(STATUS_COLORS).map(s => ({
      name:  STATUS_LABELS[s],
      value: applications.filter(a => a.status === s).length,
      color: STATUS_COLORS[s],
    })), [applications])

  const activity = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const anchor = subWeeks(new Date(), 7 - i)
      const start  = startOfWeek(anchor, { weekStartsOn: 1 })
      const end    = endOfWeek(anchor,   { weekStartsOn: 1 })
      return {
        week: format(start, 'MMM d'),
        count: applications.filter(a => {
          if (!a.date_applied) return false
          return isWithinInterval(parseISO(a.date_applied), { start, end })
        }).length,
      }
    })
  }, [applications])

  return (
    <div className="space-y-5 max-w-5xl" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>

      {/* Page header */}
      <div className="pt-1">
        <p style={{ ...LABEL, color: '#a3c9ff', marginBottom: 2 }}>Analytics</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', lineHeight: 1.15 }}>
          Activity Overview
        </h1>
      </div>

      {/* KPI strip — same flush grid as Home stats */}
      <section className="grid grid-cols-4 gap-px" style={{ background: 'rgba(138,145,159,0.15)' }}>
        {kpis.map(({ label, value, color, bar }) => {
          const isEmpty = value === 0 || value === '0%'
          return (
            <div key={label} style={{ background: '#111318', padding: '10px 14px' }}>
              <p style={{ ...LABEL, marginBottom: 6 }}>{label}</p>
              <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: isEmpty ? 'rgba(138,145,159,0.2)' : color }}>
                {value}
              </p>
              <div style={{ marginTop: 8, height: 2, background: isEmpty ? 'rgba(138,145,159,0.1)' : bar, opacity: isEmpty ? 1 : 0.5 }} />
            </div>
          )
        })}
      </section>

      {/* Area + Pie */}
      <div className="grid md:grid-cols-3 gap-px" style={{ background: 'rgba(138,145,159,0.15)' }}>

        <div className="md:col-span-2" style={CARD}>
          <div className="flex items-center justify-between mb-5">
            <span style={LABEL}>Activity Over Time</span>
            <span style={{ ...LABEL, color: '#a3c9ff' }}>apps / week</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={activity}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#a3c9ff" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#a3c9ff" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(138,145,159,0.1)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fill: '#8a919f' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fill: '#8a919f' }} allowDecimals={false} axisLine={false} tickLine={false} width={24} />
              <Tooltip {...TIP} />
              <Area type="monotone" dataKey="count" stroke="#a3c9ff" strokeWidth={1.5} fill="url(#aGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={CARD}>
          <span style={{ ...LABEL, display: 'block', marginBottom: 16 }}>Status Breakdown</span>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={42} outerRadius={65} paddingAngle={2} stroke="none">
                {byStatus.map(d => <Cell key={d.name} fill={d.color} opacity={d.value === 0 ? 0.15 : 1} />)}
              </Pie>
              <Tooltip {...TIP} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-3">
            {byStatus.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5" style={{ background: d.color, opacity: d.value === 0 ? 0.25 : 1 }} />
                  <span style={{ fontSize: 11, color: d.value === 0 ? '#404753' : '#c0c7d5' }}>{d.name}</span>
                </div>
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: d.value === 0 ? '#404753' : d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div style={CARD}>
        <span style={{ ...LABEL, display: 'block', marginBottom: 16 }}>Applications by Status</span>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={byStatus} barSize={24}>
            <CartesianGrid stroke="rgba(138,145,159,0.1)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fill: '#8a919f' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fill: '#8a919f' }} allowDecimals={false} axisLine={false} tickLine={false} width={24} />
            <Tooltip {...TIP} />
            <Bar dataKey="value" radius={[0, 0, 0, 0]}>
              {byStatus.map(d => <Cell key={d.name} fill={d.color} opacity={d.value === 0 ? 0.15 : 0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  )
}
