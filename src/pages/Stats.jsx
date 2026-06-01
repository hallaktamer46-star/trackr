import { useMemo } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { format, parseISO, subWeeks, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'
import { TrendingUp, Target, Award, Zap } from 'lucide-react'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STATUS_COLORS = {
  wishlist:  '#8a919f',
  applied:   '#a3c9ff',
  interview: '#ffb689',
  offer:     '#4edea3',
  rejected:  '#ffb4ab',
}
const STATUS_LABELS = {
  wishlist: 'Wishlist', applied: 'Applied',
  interview: 'Interview', offer: 'Offer', rejected: 'Rejected',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#060c18', border: '0.5px solid rgba(163,201,255,0.15)',
      padding: '8px 12px', fontFamily: MONO,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      <p style={{ fontSize: 9, color: 'rgba(163,201,255,0.5)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: payload[0].color || '#a3c9ff', letterSpacing: '-0.03em' }}>{payload[0].value}</p>
    </div>
  )
}

// mini 4-week spark
function Spark({ data, color }) {
  const max = Math.max(...data, 1)
  return (
    <svg width={36} height={18} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = Math.max((v / max) * 18, v > 0 ? 3 : 1)
        return <rect key={i} x={i * 8} y={18 - h} width={6} height={h}
          fill={i === data.length - 1 ? color : `${color}55`} rx={1} />
      })}
    </svg>
  )
}

export default function Stats() {
  const { applications } = useApplications()

  const total        = applications.length
  const active       = applications.filter(a => ['applied', 'interview'].includes(a.status)).length
  const offers       = applications.filter(a => a.status === 'offer').length
  const interviews   = applications.filter(a => a.status === 'interview').length
  const rejected     = applications.filter(a => a.status === 'rejected').length
  const applied      = applications.filter(a => a.status !== 'wishlist').length
  const responded    = applications.filter(a => ['interview', 'offer', 'rejected'].includes(a.status)).length
  const responseRate = applied > 0 ? Math.round((responded / applied) * 100) : 0
  const offerRate    = interviews > 0 ? Math.round((offers / interviews) * 100) : 0

  // 8-week activity
  const activity = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => {
      const anchor = subWeeks(new Date(), 7 - i)
      const start  = startOfWeek(anchor, { weekStartsOn: 1 })
      const end    = endOfWeek(anchor,   { weekStartsOn: 1 })
      return {
        week: format(start, 'MMM d'),
        count: applications.filter(a => a.date_applied &&
          isWithinInterval(parseISO(a.date_applied), { start, end })
        ).length,
      }
    }), [applications])

  const byStatus = useMemo(() =>
    Object.keys(STATUS_COLORS).map(s => ({
      name: STATUS_LABELS[s], value: applications.filter(a => a.status === s).length, color: STATUS_COLORS[s],
    })), [applications])

  // 4-week sparklines per KPI
  const sparkWeeks = useMemo(() =>
    Array.from({ length: 4 }, (_, i) => {
      const anchor = subWeeks(new Date(), 3 - i)
      const start  = startOfWeek(anchor, { weekStartsOn: 1 })
      const end    = endOfWeek(anchor,   { weekStartsOn: 1 })
      const week   = applications.filter(a => a.date_applied &&
        isWithinInterval(parseISO(a.date_applied), { start, end }))
      return {
        total:     week.length,
        active:    week.filter(a => ['applied','interview'].includes(a.status)).length,
        offers:    week.filter(a => a.status === 'offer').length,
        response:  week.length > 0 ? Math.round((week.filter(a => ['interview','offer','rejected'].includes(a.status)).length / week.length) * 100) : 0,
      }
    }), [applications])

  const kpis = [
    { label: 'Total',         value: total,              display: String(total),          color: '#e2e2e8', accent: 'rgba(226,226,232,0.12)', spark: sparkWeeks.map(w => w.total),    icon: Target },
    { label: 'Active',        value: active,             display: String(active),         color: '#a3c9ff', accent: 'rgba(163,201,255,0.12)', spark: sparkWeeks.map(w => w.active),   icon: Zap },
    { label: 'Offers',        value: offers,             display: String(offers),         color: '#4edea3', accent: 'rgba(78,222,163,0.12)',  spark: sparkWeeks.map(w => w.offers),   icon: Award },
    { label: 'Response Rate', value: responseRate,       display: `${responseRate}%`,     color: '#ffb689', accent: 'rgba(255,182,137,0.12)', spark: sparkWeeks.map(w => w.response), icon: TrendingUp },
  ]

  const maxActivity = Math.max(...activity.map(d => d.count), 1)

  return (
    <div style={{ fontFamily: SANS, maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page header */}
      <div style={{ paddingTop: 4 }}>
        <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(163,201,255,0.5)', textTransform: 'uppercase', marginBottom: 6 }}>
          Analytics
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.04em', color: '#e2e2e8', lineHeight: 1.1, marginBottom: 4 }}>
          Activity Overview
        </h1>
        <p style={{ fontFamily: MONO, fontSize: 10, color: '#3a4455', letterSpacing: '0.02em' }}>
          {total === 0 ? 'No applications yet — add one to start tracking.' : `Tracking ${total} application${total > 1 ? 's' : ''} across your pipeline.`}
        </p>
      </div>

      {/* KPI strip */}
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        background: 'linear-gradient(160deg, #0d1f3c 0%, #080f1e 100%)',
        border: '0.5px solid rgba(163,201,255,0.07)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03) inset',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 50% -20%, rgba(163,201,255,0.04) 0%, transparent 60%)' }} />
        {kpis.map(({ label, value, display, color, accent, spark, icon: Icon }, idx) => {
          const empty = value === 0
          return (
            <div key={label} style={{
              position: 'relative', padding: '20px 20px 16px',
              borderRight: idx < 3 ? '0.5px solid rgba(163,201,255,0.05)' : 'none',
              overflow: 'hidden', transition: 'background 0.25s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}06` }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {/* gradient top accent */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, pointerEvents: 'none', background: empty ? 'rgba(138,145,159,0.06)' : `linear-gradient(90deg, ${color} 0%, ${color}00 100%)` }} />
              {/* corner glow */}
              {!empty && <div style={{ position: 'absolute', top: -20, left: -20, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, filter: 'blur(12px)', pointerEvents: 'none' }} />}

              {/* label row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, position: 'relative' }}>
                <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: empty ? '#1e2a3a' : `${color}70` }}>
                  {label}
                </p>
                <Icon size={11} style={{ color: empty ? '#1e2a3a' : `${color}60` }} />
              </div>

              {/* number */}
              <p style={{
                fontFamily: MONO, fontSize: 40, fontWeight: 800,
                letterSpacing: '-0.07em', lineHeight: 1, marginBottom: 8, position: 'relative',
                background: empty ? 'none' : `linear-gradient(135deg, #ffffff 0%, ${color} 100%)`,
                WebkitBackgroundClip: empty ? 'unset' : 'text',
                WebkitTextFillColor: empty ? 'rgba(138,145,159,0.1)' : 'transparent',
                backgroundClip: empty ? 'unset' : 'text',
                filter: empty ? 'none' : `drop-shadow(0 0 10px ${color}40)`,
              }}>
                {display}
              </p>

              {/* spark */}
              <div style={{ position: 'relative' }}>
                {!empty ? <Spark data={spark} color={color} /> : (
                  <div style={{ height: 18, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                    {[3,5,2,4].map((h,i) => <div key={i} style={{ width: 6, height: h, background: 'rgba(163,201,255,0.05)', borderRadius: 1 }} />)}
                  </div>
                )}
              </div>

              {/* bottom fill */}
              {!empty && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1 }}>
                  <div style={{ height: '100%', width: label === 'Total' ? '100%' : label === 'Response Rate' ? `${responseRate}%` : `${Math.min((value / Math.max(total, 1)) * 100, 100)}%`, background: `linear-gradient(90deg, ${color}60, ${color}00)`, transition: 'width 0.8s ease' }} />
                </div>
              )}
            </div>
          )
        })}
      </section>

      {/* Activity chart — full width */}
      <section style={{
        background: 'linear-gradient(160deg, #0d1f3c 0%, #080f1e 100%)',
        border: '0.5px solid rgba(163,201,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        padding: '20px 24px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(163,201,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
              Activity Over Time
            </p>
            <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: '#e2e2e8', letterSpacing: '-0.01em' }}>
              Weekly application volume
            </p>
          </div>
          <span style={{
            fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
            color: 'rgba(163,201,255,0.5)', background: 'rgba(163,201,255,0.06)',
            border: '0.5px solid rgba(163,201,255,0.12)', padding: '4px 10px',
          }}>
            8 WEEKS
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={activity} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#a3c9ff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#a3c9ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(163,201,255,0.04)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="week" tick={{ fontFamily: MONO, fontSize: 9, fill: '#3a4455', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontFamily: MONO, fontSize: 9, fill: '#3a4455' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(163,201,255,0.1)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="count" stroke="#a3c9ff" strokeWidth={2} fill="url(#aGrad)" dot={{ fill: '#a3c9ff', r: 3, strokeWidth: 0 }} activeDot={{ fill: '#a3c9ff', r: 5, strokeWidth: 0, filter: 'drop-shadow(0 0 6px #a3c9ff)' }} />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      {/* Pie + Funnel row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>

        {/* Status breakdown */}
        <div style={{
          background: 'linear-gradient(160deg, #0d1f3c 0%, #080f1e 100%)',
          border: '0.5px solid rgba(163,201,255,0.07)',
          padding: '20px 24px',
        }}>
          <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(163,201,255,0.4)', textTransform: 'uppercase', marginBottom: 16 }}>
            Status Breakdown
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={38} outerRadius={58}
                  paddingAngle={byStatus.filter(d => d.value > 0).length > 1 ? 3 : 0} stroke="none">
                  {byStatus.map(d => <Cell key={d.name} fill={d.color} opacity={d.value === 0 ? 0.08 : 0.9} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {byStatus.map(d => {
                const pct = total > 0 ? Math.round((d.value / total) * 100) : 0
                return (
                  <div key={d.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 6, height: 6, background: d.color, opacity: d.value === 0 ? 0.15 : 1 }} />
                        <span style={{ fontFamily: SANS, fontSize: 11, color: d.value === 0 ? '#2a3040' : '#8a919f' }}>{d.name}</span>
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: d.value === 0 ? '#1e2a3a' : d.color }}>{d.value}</span>
                    </div>
                    <div style={{ height: 2, background: 'rgba(163,201,255,0.05)' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: d.color, opacity: d.value === 0 ? 0.1 : 0.6, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Conversion funnel */}
        <div style={{
          background: 'linear-gradient(160deg, #0d1f3c 0%, #080f1e 100%)',
          border: '0.5px solid rgba(163,201,255,0.07)',
          padding: '20px 24px',
        }}>
          <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(163,201,255,0.4)', textTransform: 'uppercase', marginBottom: 20 }}>
            Conversion Funnel
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Applied',    value: applied,    color: '#a3c9ff', pct: 100 },
              { label: 'Responded',  value: responded,  color: '#ffb689', pct: applied > 0 ? Math.round((responded / applied) * 100) : 0 },
              { label: 'Interview',  value: interviews, color: '#ffb689', pct: applied > 0 ? Math.round((interviews / applied) * 100) : 0 },
              { label: 'Offer',      value: offers,     color: '#4edea3', pct: applied > 0 ? Math.round((offers / applied) * 100) : 0 },
            ].map(({ label, value, color, pct }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, color: value === 0 ? '#2a3040' : '#8a919f' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontFamily: MONO, fontSize: 10, color: value === 0 ? '#1e2a3a' : '#3a4455' }}>{pct}%</span>
                    <span style={{
                      fontFamily: MONO, fontSize: 13, fontWeight: 800, letterSpacing: '-0.04em',
                      background: value === 0 ? 'none' : `linear-gradient(135deg, #fff 0%, ${color} 100%)`,
                      WebkitBackgroundClip: value === 0 ? 'unset' : 'text',
                      WebkitTextFillColor: value === 0 ? 'rgba(138,145,159,0.15)' : 'transparent',
                      backgroundClip: value === 0 ? 'unset' : 'text',
                    }}>{value}</span>
                  </div>
                </div>
                <div style={{ height: 6, background: 'rgba(163,201,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute', inset: 0, right: `${100 - pct}%`,
                    background: value === 0 ? 'transparent' : `linear-gradient(90deg, ${color}80, ${color}30)`,
                    transition: 'right 0.9s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* conversion rates */}
          <div style={{ display: 'flex', gap: 2, marginTop: 20 }}>
            {[
              { label: 'Response rate', value: `${responseRate}%`, color: '#ffb689' },
              { label: 'Offer rate',    value: `${offerRate}%`,    color: '#4edea3' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ flex: 1, padding: '10px 12px', background: 'rgba(163,201,255,0.03)', border: `0.5px solid ${color}15` }}>
                <p style={{ fontFamily: MONO, fontSize: 8, color: '#2a3040', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
                <p style={{ fontFamily: MONO, fontSize: 18, fontWeight: 800, letterSpacing: '-0.04em', background: `linear-gradient(135deg, #fff 0%, ${color} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart — full width */}
      <section style={{
        background: 'linear-gradient(160deg, #0d1f3c 0%, #080f1e 100%)',
        border: '0.5px solid rgba(163,201,255,0.07)',
        padding: '20px 24px 16px',
      }}>
        <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(163,201,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
          Pipeline Distribution
        </p>
        <p style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: '#e2e2e8', letterSpacing: '-0.01em', marginBottom: 20 }}>
          Applications by status
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={byStatus} barSize={32} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <defs>
              {byStatus.map(d => (
                <linearGradient key={d.name} id={`bGrad-${d.name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={d.color} stopOpacity={d.value === 0 ? 0.08 : 0.85} />
                  <stop offset="100%" stopColor={d.color} stopOpacity={d.value === 0 ? 0.03 : 0.30} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(163,201,255,0.04)" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="name" tick={{ fontFamily: MONO, fontSize: 9, fill: '#3a4455', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontFamily: MONO, fontSize: 9, fill: '#3a4455' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(163,201,255,0.03)' }} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]}>
              {byStatus.map(d => <Cell key={d.name} fill={`url(#bGrad-${d.name})`} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </section>

    </div>
  )
}
