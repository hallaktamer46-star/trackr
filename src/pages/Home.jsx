import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Bell, FileText, Mail, MessageSquare, Mic, DollarSign,
  TrendingUp, Building2, Link2, AlertTriangle, ChevronRight, Sparkles
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { parseISO, isToday, isPast, format, subDays, startOfDay, isSameDay, addDays } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'
import ApplicationModal from '../components/Modals/ApplicationModal'

const AI_TOOLS = [
  { to: '/ai/cv',             label: 'CV Review',       icon: FileText,      accent: '#a3c9ff', iconBg: 'rgba(163,201,255,0.08)', border: 'rgba(163,201,255,0.18)' },
  { to: '/ai/cover-letter',   label: 'Cover Letter',    icon: Mail,          accent: '#4edea3', iconBg: 'rgba(78,222,163,0.08)',  border: 'rgba(78,222,163,0.18)'  },
  { to: '/ai/follow-up',      label: 'Follow-up',       icon: MessageSquare, accent: '#ffb689', iconBg: 'rgba(255,182,137,0.08)', border: 'rgba(255,182,137,0.18)' },
  { to: '/ai/interview-prep', label: 'Interview Prep',  icon: Mic,           accent: '#e56f03', iconBg: 'rgba(229,111,3,0.08)',   border: 'rgba(229,111,3,0.18)'   },
  { to: '/ai/salary',         label: 'Salary Intel',    icon: DollarSign,    accent: '#ffb4ab', iconBg: 'rgba(255,180,171,0.08)', border: 'rgba(255,180,171,0.18)' },
  { to: '/ai/market',         label: 'Market Analysis', icon: TrendingUp,    accent: '#a3c9ff', iconBg: 'rgba(163,201,255,0.08)', border: 'rgba(163,201,255,0.18)' },
  { to: '/ai/company',        label: 'Company Research',icon: Building2,     accent: '#ffb689', iconBg: 'rgba(255,182,137,0.08)', border: 'rgba(255,182,137,0.18)' },
  { to: '/ai/linkedin',       label: 'LinkedIn Review', icon: Link2,         accent: '#4edea3', iconBg: 'rgba(78,222,163,0.08)',  border: 'rgba(78,222,163,0.18)'  },
]

const STATS = [
  { key: 'total',     label: 'Total',       color: '#e2e2e8', accent: 'rgba(226,226,232,0.12)' },
  { key: 'applied',   label: 'Applied',     color: '#a3c9ff', accent: 'rgba(163,201,255,0.12)' },
  { key: 'interview', label: 'Interviews',  color: '#ffb689', accent: 'rgba(255,182,137,0.12)' },
  { key: 'offer',     label: 'Offers',      color: '#4edea3', accent: 'rgba(78,222,163,0.12)'  },
  { key: 'rejected',  label: 'Rejected',    color: '#ffb4ab', accent: 'rgba(255,180,171,0.12)' },
]

function Spark({ data, color }) {
  const max = Math.max(...data, 1)
  const W = 36, H = 18, bw = 6, gap = 2
  return (
    <svg width={W} height={H} style={{ display: 'block' }}>
      {data.map((v, i) => {
        const h = Math.max((v / max) * H, v > 0 ? 3 : 1)
        return (
          <rect key={i} x={i * (bw + gap)} y={H - h} width={bw} height={h}
            fill={i === data.length - 1 ? color : `${color}55`} rx={1} />
        )
      })}
    </svg>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#161b22', border: '0.5px solid rgba(138,145,159,0.3)', borderRadius: 6, padding: '6px 10px' }}>
      <p style={{ color: '#c0c7d5', fontFamily: 'Geist Mono, monospace', fontSize: 10, marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#a3c9ff', fontFamily: 'Geist Mono, monospace', fontSize: 13, fontWeight: 600 }}>{payload[0].value}</p>
    </div>
  )
}

export default function Home() {
  const { applications, addApplication, updateApplication, deleteApplication, canAddMore } = useApplications()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState(null)

  const firstName = user?.user_metadata?.first_name || null

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const stats = useMemo(() => ({
    total:     applications.length,
    applied:   applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer:     applications.filter(a => a.status === 'offer').length,
    rejected:  applications.filter(a => a.status === 'rejected').length,
  }), [applications])

  // 4-week sparkline data per stat key
  const sparkData = useMemo(() => {
    const weeks = Array.from({ length: 4 }, (_, i) => {
      const start = startOfDay(subDays(new Date(), (3 - i) * 7 + 6))
      const end   = addDays(start, 7)
      const week  = applications.filter(a =>
        a.created_at && parseISO(a.created_at) >= start && parseISO(a.created_at) < end
      )
      return {
        total:     week.length,
        applied:   week.filter(a => a.status === 'applied').length,
        interview: week.filter(a => a.status === 'interview').length,
        offer:     week.filter(a => a.status === 'offer').length,
        rejected:  week.filter(a => a.status === 'rejected').length,
      }
    })
    return {
      total:     weeks.map(w => w.total),
      applied:   weeks.map(w => w.applied),
      interview: weeks.map(w => w.interview),
      offer:     weeks.map(w => w.offer),
      rejected:  weeks.map(w => w.rejected),
    }
  }, [applications])

  // This week vs last week delta (new apps added)
  const thisWeekCount = useMemo(() =>
    applications.filter(a =>
      a.created_at && parseISO(a.created_at) >= startOfDay(subDays(new Date(), 6))
    ).length
  , [applications])

  const lastWeekCount = useMemo(() =>
    applications.filter(a => {
      if (!a.created_at) return false
      const d = parseISO(a.created_at)
      return d >= startOfDay(subDays(new Date(), 13)) && d < startOfDay(subDays(new Date(), 6))
    }).length
  , [applications])

  const weekDelta = thisWeekCount - lastWeekCount

  const followUps = useMemo(() =>
    applications
      .filter(a => a.reminder_date && (isToday(parseISO(a.reminder_date)) || isPast(parseISO(a.reminder_date))))
      .sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date))
  , [applications])

  const smartSummary = useMemo(() => {
    const parts = []
    if (followUps.length > 0) parts.push(`${followUps.length} follow-up${followUps.length > 1 ? 's' : ''} due`)
    const interviews = applications.filter(a => a.status === 'interview').length
    if (interviews > 0) parts.push(`${interviews} interview${interviews > 1 ? 's' : ''} in progress`)
    const offers = applications.filter(a => a.status === 'offer').length
    if (offers > 0) parts.push(`${offers} offer${offers > 1 ? 's' : ''}`)
    if (parts.length === 0 && applications.length === 0) return 'Add your first application to get started.'
    if (parts.length === 0) return `${applications.length} application${applications.length > 1 ? 's' : ''} tracked — keep pushing.`
    return parts.join(' · ')
  }, [applications, followUps])

  const weeklyData = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i))
      return {
        day: format(date, 'EEE').toUpperCase(),
        count: applications.filter(a => a.created_at && isSameDay(parseISO(a.created_at), date)).length,
      }
    })
  , [applications])

  const maxCount = Math.max(...weeklyData.map(d => d.count), 1)

  const handleSave = async (data) => {
    if (data.id) await updateApplication(data.id, data)
    else await addApplication({ ...data, status: data.status || 'wishlist' })
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>

      {/* Header row */}
      <section className="flex items-center justify-between pt-2">
        <div>
          <p style={{
            fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.08em', color: '#404753', textTransform: 'uppercase', marginBottom: 6,
          }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', lineHeight: 1.15, marginBottom: 6 }}>
            {greeting}{firstName ? `, ${firstName}` : ''}.
          </h1>
          <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: '#8a919f', letterSpacing: '0.01em' }}>
            {smartSummary}
          </p>
        </div>
        {canAddMore && (
          <button
            onClick={() => { setEditingApp(null); setModalOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2.5 font-bold text-xs text-white transition-all active:scale-95 hover:brightness-110"
            style={{ background: '#1493ff', boxShadow: '0 4px 16px rgba(20,147,255,0.25)', letterSpacing: '0.04em', fontFamily: 'Geist Mono, monospace' }}
          >
            <Plus size={13} />
            Add Application
          </button>
        )}
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-5 gap-px" style={{ background: 'rgba(138,145,159,0.12)' }}>
        {STATS.map(({ key, label, color, accent }) => {
          const val = stats[key]
          const empty = val === 0
          const pct = key !== 'total' && stats.total > 0
            ? Math.round((val / stats.total) * 100) : null
          const responseRate = key === 'interview' && stats.applied > 0
            ? Math.round((stats.interview / stats.applied) * 100) : null
          const closeRate = key === 'offer' && stats.interview > 0
            ? Math.round((stats.offer / stats.interview) * 100) : null

          // context line per stat
          let context = null
          if (key === 'total') {
            if (weekDelta > 0) context = { text: `+${weekDelta} this week`, up: true }
            else if (weekDelta < 0) context = { text: `${weekDelta} vs last week`, up: false }
            else if (thisWeekCount > 0) context = { text: `${thisWeekCount} this week`, up: null }
            else context = { text: 'no new this week', up: null }
          } else if (key === 'applied') {
            context = pct !== null ? { text: `${pct}% of pipeline`, up: null } : null
          } else if (key === 'interview') {
            context = responseRate !== null
              ? { text: `${responseRate}% response rate`, up: responseRate >= 15 }
              : pct !== null ? { text: `${pct}% of pipeline`, up: null } : null
          } else if (key === 'offer') {
            context = closeRate !== null
              ? { text: `${closeRate}% close rate`, up: closeRate >= 30 }
              : pct !== null ? { text: `${pct}% of pipeline`, up: null } : null
          } else if (key === 'rejected') {
            context = pct !== null ? { text: `${pct}% of pipeline`, up: pct < 40 } : null
          }

          // proportion bar width
          const barWidth = key === 'total'
            ? (thisWeekCount > 0 ? Math.min((thisWeekCount / Math.max(lastWeekCount, thisWeekCount, 1)) * 100, 100) : 0)
            : stats.total > 0 ? (val / stats.total) * 100 : 0

          return (
            <div key={key} style={{
              background: '#0d1117',
              padding: '14px 16px 12px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* subtle bg glow when active */}
              {!empty && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `radial-gradient(ellipse at 10% 0%, ${accent} 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
              )}

              <p style={{
                fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 600,
                letterSpacing: '0.1em', color: '#404753',
                textTransform: 'uppercase', marginBottom: 8, position: 'relative',
              }}>
                {label}
              </p>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8, position: 'relative' }}>
                <p style={{
                  fontFamily: 'Geist Mono, monospace', fontSize: 30, fontWeight: 700,
                  letterSpacing: '-0.05em', lineHeight: 1,
                  color: empty ? 'rgba(138,145,159,0.18)' : color,
                }}>
                  {val}
                </p>
                {!empty && (
                  <Spark data={sparkData[key]} color={color} />
                )}
              </div>

              {/* context line */}
              <p style={{
                fontFamily: 'Geist Mono, monospace', fontSize: 9,
                letterSpacing: '0.02em', lineHeight: 1,
                color: context?.up === true ? '#4edea3'
                  : context?.up === false ? '#ffb4ab'
                  : '#404753',
                marginBottom: 10, position: 'relative',
                minHeight: 12,
              }}>
                {context ? (
                  <>
                    {context.up === true && '↑ '}
                    {context.up === false && '↓ '}
                    {context.text}
                  </>
                ) : null}
              </p>

              {/* proportion bar */}
              <div style={{ height: 2, background: 'rgba(138,145,159,0.1)', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, height: '100%',
                  width: `${barWidth}%`,
                  background: empty ? 'transparent' : color,
                  opacity: 0.5,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          )
        })}
      </section>

      {/* Follow-up reminders */}
      {followUps.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bell size={12} style={{ color: '#ffb689' }} />
              <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#c0c7d5', textTransform: 'uppercase' }}>
                Follow-up Reminders
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold" style={{ background: '#e56f03', color: '#fff', fontFamily: 'Geist Mono, monospace' }}>
                {followUps.length}
              </span>
            </div>
            <button
              onClick={() => navigate('/ai/follow-up')}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
              style={{ color: '#a3c9ff', fontFamily: 'Geist Mono, monospace' }}
            >
              Generate <ChevronRight size={10} />
            </button>
          </div>
          <div className="space-y-2">
            {followUps.map(app => (
              <button
                key={app.id}
                onClick={() => { setEditingApp(app); setModalOpen(true) }}
                className="surface-glass w-full flex items-center gap-3 rounded-none text-left transition-all group"
                style={{ padding: '10px 14px' }}
              >
                <AlertTriangle size={13} style={{ color: '#ffb689', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e8' }}>
                    {app.job_title} <span style={{ fontWeight: 400, color: '#8a919f' }}>@ {app.company}</span>
                  </p>
                  <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#ffb689', marginTop: 1 }}>
                    Due {format(parseISO(app.reminder_date), 'MMM d')}
                  </p>
                </div>
                <ChevronRight size={13} style={{ color: '#404753', flexShrink: 0 }} className="group-hover:text-[#c0c7d5] transition-colors" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Chart + AI Tools grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Weekly chart */}
        <section className="surface-glass rounded-none lg:col-span-7" style={{ padding: 16 }}>
          <div className="flex items-center justify-between mb-5">
            <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#c0c7d5', textTransform: 'uppercase' }}>
              Applications Activity
            </span>
          </div>
          <ResponsiveContainer width="100%" height={148}>
            <BarChart data={weeklyData} barSize={20} margin={{ top: 4, right: 0, left: -32, bottom: 0 }}>
              <XAxis
                dataKey="day"
                tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fill: '#8a919f', fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis allowDecimals={false} tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fill: '#8a919f' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(138,145,159,0.06)' }} />
              <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                {weeklyData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.count > 0 && entry.count === maxCount
                      ? 'rgba(163,201,255,0.55)'
                      : entry.count > 0
                        ? 'rgba(163,201,255,0.2)'
                        : 'rgba(64,71,83,0.35)'}
                    stroke={entry.count > 0 && entry.count === maxCount ? 'rgba(163,201,255,0.5)' : 'none'}
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* AI Tools */}
        <section className="surface-glass rounded-none lg:col-span-5" style={{ padding: 16 }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={15} style={{ color: '#a3c9ff' }} />
            <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: '#c0c7d5', textTransform: 'uppercase' }}>
              Intelligent Tools
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {AI_TOOLS.map(({ to, label, icon: Icon, accent, iconBg, border }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className="tool-card flex items-center gap-2.5 rounded-none text-left group"
                style={{ padding: '8px 10px' }}
              >
                <div className="w-7 h-7 flex items-center justify-center shrink-0" style={{ background: iconBg, border: `0.5px solid ${border}` }}>
                  <Icon size={13} style={{ color: accent }} />
                </div>
                <span className="text-xs font-medium leading-tight" style={{ color: '#e2e2e8', fontFamily: 'Geist, Inter, sans-serif' }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </section>

      </div>

      <ApplicationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={deleteApplication}
        initial={editingApp ?? { status: 'wishlist' }}
      />
    </div>
  )
}
