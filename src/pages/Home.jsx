import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Bell, FileText, Mail, MessageSquare, Mic, DollarSign,
  TrendingUp, Building2, Link2, AlertTriangle, ChevronRight, Sparkles,
  BookOpen, Handshake, PenLine, ArrowRight, PenSquare, Library, BarChart3, GraduationCap
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { parseISO, isToday, isPast, format, subDays, startOfDay, isSameDay, addDays } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'
import ApplicationModal from '../components/Modals/ApplicationModal'
import QuickPostModal from '../components/QuickPostModal'

const HERO_TOOLS = [
  {
    to: '/ai/interview-coach',
    label: 'Interview Coach',
    desc: 'Live mock interview with a real AI hiring manager. Get a full scorecard.',
    icon: Mic,
    accent: '#ffb4ab',
    tag: 'APEX',
  },
  {
    to: '/ai/negotiate',
    label: 'Offer Simulator',
    desc: 'Practice salary negotiation. AI plays the recruiter — you practice the counter.',
    icon: Handshake,
    accent: '#4edea3',
    tag: 'APEX',
  },
  {
    to: '/cv/builder',
    label: 'CV Builder',
    desc: 'Build a polished, ATS-optimised CV from scratch in minutes.',
    icon: PenLine,
    accent: '#a3c9ff',
    tag: 'PRO',
  },
]

const MORE_TOOLS = [
  { to: '/ai/follow-up',      label: 'Follow-up',       icon: MessageSquare, accent: '#ffb689' },
  { to: '/ai/salary',         label: 'Salary Intel',    icon: DollarSign,    accent: '#a3c9ff' },
  { to: '/ai/market',         label: 'Market Intel',    icon: TrendingUp,    accent: '#4edea3' },
  { to: '/ai/company',        label: 'Company Brief',   icon: Building2,     accent: '#ffb689' },
  { to: '/ai/interview-prep', label: 'Interview Prep',  icon: BookOpen,      accent: '#ffb4ab' },
  { to: '/ai/linkedin',       label: 'LinkedIn',        icon: Link2,         accent: '#4edea3' },
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
  const [quickPostOpen, setQuickPostOpen] = useState(false)

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

  const SIDEBAR = [
    { label: 'Start a Blog', icon: PenSquare,     to: null,       soon: false, action: () => setQuickPostOpen(true) },
    { label: 'Library',      icon: Library,       to: '/library', soon: true  },
    { label: 'Market',       icon: BarChart3,     to: '/market',  soon: true  },
    { label: 'Skills',       icon: GraduationCap, to: '/skills',  soon: true  },
  ]

  return (
    <div style={{ fontFamily: 'Geist, Inter, sans-serif', display: 'flex', gap: 28, alignItems: 'flex-start', maxWidth: 1100, margin: '0 auto' }}>

      {/* Sidebar */}
      <aside style={{ width: 168, flexShrink: 0, position: 'sticky', top: 72 }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 8 }}>
          {SIDEBAR.map(({ label, icon: Icon, to, soon, action }) => (
            <button
              key={label}
              onClick={() => { if (soon) return; if (action) action(); else navigate(to) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px',
                background: 'transparent',
                border: '0.5px solid transparent',
                cursor: soon ? 'default' : 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                opacity: soon ? 0.4 : 1,
              }}
              onMouseEnter={e => {
                if (!soon) {
                  e.currentTarget.style.background = 'rgba(163,201,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(163,201,255,0.08)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <Icon size={14} style={{ color: '#8a919f', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <p style={{
                  fontFamily: 'Geist, Inter, sans-serif', fontSize: 12, fontWeight: 500,
                  color: '#8a919f', letterSpacing: '-0.01em', lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </p>
                {soon && (
                  <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 8, color: '#2a3040', letterSpacing: '0.06em', marginTop: 2 }}>
                    SOON
                  </p>
                )}
              </div>
            </button>
          ))}
        </nav>

        {/* divider */}
        <div style={{ height: '0.5px', background: 'rgba(163,201,255,0.05)', margin: '12px 12px' }} />

        <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 8, color: '#1e2a3a', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 12px' }}>
          Trackr © 2026
        </p>
      </aside>

      {/* Main content */}
      <div className="space-y-5 flex-1 min-w-0">

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
      <section style={{
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        background: 'linear-gradient(160deg, #0d1f3c 0%, #080f1e 100%)',
        border: '0.5px solid rgba(163,201,255,0.07)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03) inset',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* ambient background shimmer */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% -20%, rgba(163,201,255,0.04) 0%, transparent 60%)',
        }} />

        {STATS.map(({ key, label, color, accent }, idx) => {
          const val = stats[key]
          const empty = val === 0
          const pct = key !== 'total' && stats.total > 0
            ? Math.round((val / stats.total) * 100) : null
          const responseRate = key === 'interview' && stats.applied > 0
            ? Math.round((stats.interview / stats.applied) * 100) : null
          const closeRate = key === 'offer' && stats.interview > 0
            ? Math.round((stats.offer / stats.interview) * 100) : null

          let context = null
          if (key === 'total') {
            if (weekDelta > 0) context = { text: `+${weekDelta} this week`, up: true }
            else if (weekDelta < 0) context = { text: `${weekDelta} vs last week`, up: false }
            else if (thisWeekCount > 0) context = { text: `${thisWeekCount} this week`, up: null }
            else context = { text: 'no activity', up: null }
          } else if (key === 'applied') {
            context = pct !== null ? { text: `${pct}% of total`, up: null } : null
          } else if (key === 'interview') {
            context = responseRate !== null
              ? { text: `${responseRate}% rate`, up: responseRate >= 15 }
              : pct !== null ? { text: `${pct}% of total`, up: null } : null
          } else if (key === 'offer') {
            context = closeRate !== null
              ? { text: `${closeRate}% close`, up: closeRate >= 30 }
              : pct !== null ? { text: `${pct}% of total`, up: null } : null
          } else if (key === 'rejected') {
            context = pct !== null ? { text: `${pct}% of total`, up: pct < 40 } : null
          }

          const contextColor = context?.up === true ? '#4edea3'
            : context?.up === false ? '#ffb4ab' : '#3a4455'

          return (
            <div key={key} style={{
              position: 'relative',
              padding: '22px 22px 18px',
              borderRight: idx < 4 ? '0.5px solid rgba(163,201,255,0.05)' : 'none',
              overflow: 'hidden',
              cursor: 'default',
              transition: 'background 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${color}06` }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              {/* gradient top accent — fades out to right */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3, pointerEvents: 'none',
                background: empty
                  ? 'rgba(138,145,159,0.06)'
                  : `linear-gradient(90deg, ${color} 0%, ${color}00 100%)`,
              }} />

              {/* deep corner glow */}
              {!empty && (
                <div style={{
                  position: 'absolute', top: -20, left: -20,
                  width: 120, height: 120, pointerEvents: 'none', borderRadius: '50%',
                  background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                  filter: 'blur(12px)',
                }} />
              )}

              {/* label */}
              <p style={{
                fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 700,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                color: empty ? '#1e2a3a' : `${color}70`,
                marginBottom: 12, position: 'relative',
              }}>
                {label}
              </p>

              {/* number */}
              <p style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 44, fontWeight: 800,
                letterSpacing: '-0.07em', lineHeight: 1,
                marginBottom: 8, position: 'relative',
                background: empty
                  ? 'none'
                  : `linear-gradient(135deg, #ffffff 0%, ${color} 100%)`,
                WebkitBackgroundClip: empty ? 'unset' : 'text',
                WebkitTextFillColor: empty ? 'rgba(138,145,159,0.1)' : 'transparent',
                backgroundClip: empty ? 'unset' : 'text',
                filter: empty ? 'none' : `drop-shadow(0 0 12px ${color}50)`,
              }}>
                {val}
              </p>

              {/* spark + context row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <p style={{
                  fontFamily: 'Geist Mono, monospace', fontSize: 9,
                  letterSpacing: '0.04em', lineHeight: 1,
                  color: contextColor, minHeight: 11,
                }}>
                  {context && (
                    <>
                      {context.up === true && '↑ '}
                      {context.up === false && '↓ '}
                      {context.text}
                    </>
                  )}
                </p>
                {!empty && <Spark data={sparkData[key]} color={color} />}
              </div>

              {/* bottom fill line */}
              {!empty && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1 }}>
                  <div style={{
                    height: '100%',
                    width: `${key === 'total' ? 100 : pct || 0}%`,
                    background: `linear-gradient(90deg, ${color}60, ${color}00)`,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              )}
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

      {/* Weekly Activity Chart — full width */}
      <section style={{
        background: 'linear-gradient(160deg, #0d1f3c 0%, #080f1e 100%)',
        border: '0.5px solid rgba(163,201,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        padding: '20px 24px 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(163,201,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
              Activity
            </p>
            <p style={{ fontFamily: 'Geist, Inter, sans-serif', fontSize: 15, fontWeight: 600, color: '#e2e2e8', letterSpacing: '-0.01em' }}>
              Applications this week
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {weekDelta !== 0 && (
              <span style={{
                fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 700,
                color: weekDelta > 0 ? '#4edea3' : '#ffb4ab',
                background: weekDelta > 0 ? 'rgba(78,222,163,0.08)' : 'rgba(255,180,171,0.08)',
                border: `0.5px solid ${weekDelta > 0 ? 'rgba(78,222,163,0.2)' : 'rgba(255,180,171,0.2)'}`,
                padding: '4px 10px',
              }}>
                {weekDelta > 0 ? '↑' : '↓'} {Math.abs(weekDelta)} vs last week
              </span>
            )}
            <div style={{
              fontFamily: 'Geist Mono, monospace', fontSize: 22, fontWeight: 800,
              letterSpacing: '-0.05em', lineHeight: 1,
              background: 'linear-gradient(135deg, #ffffff 0%, #a3c9ff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 10px rgba(163,201,255,0.3))',
            }}>
              {thisWeekCount}
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData} barSize={28} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <XAxis dataKey="day" tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fill: '#3a4455', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} tick={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fill: '#3a4455' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(163,201,255,0.04)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {weeklyData.map((entry, i) => (
                <Cell key={i}
                  fill={entry.count > 0 && entry.count === maxCount
                    ? 'url(#barGradientPeak)'
                    : entry.count > 0
                      ? 'rgba(163,201,255,0.18)'
                      : 'rgba(255,255,255,0.03)'}
                  stroke={entry.count > 0 && entry.count === maxCount ? 'rgba(163,201,255,0.4)' : 'none'}
                  strokeWidth={1}
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="barGradientPeak" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a3c9ff" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#a3c9ff" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </section>

      {/* AI Tools — full width, hero cards + more row */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={13} style={{ color: '#a3c9ff' }} />
            <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(163,201,255,0.6)', textTransform: 'uppercase' }}>
              AI Toolkit
            </p>
          </div>
          <button onClick={() => navigate('/ai')} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 700,
            letterSpacing: '0.08em', color: '#3a4455', textTransform: 'uppercase',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#a3c9ff'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a4455'}
          >
            All tools <ArrowRight size={10} />
          </button>
        </div>

        {/* 3 hero cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, marginBottom: 2 }}>
          {HERO_TOOLS.map(({ to, label, desc, icon: Icon, accent, tag }) => (
            <button key={to} onClick={() => navigate(to)} style={{
              position: 'relative', textAlign: 'left', padding: '20px 20px 16px',
              background: 'linear-gradient(160deg, #0d1f3c 0%, #080f1e 100%)',
              border: '0.5px solid rgba(163,201,255,0.07)',
              cursor: 'pointer', overflow: 'hidden',
              transition: 'border-color 0.2s, background 0.2s',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = `${accent}30`
                e.currentTarget.style.background = `linear-gradient(160deg, ${accent}08 0%, #080f1e 100%)`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(163,201,255,0.07)'
                e.currentTarget.style.background = 'linear-gradient(160deg, #0d1f3c 0%, #080f1e 100%)'
              }}
            >
              {/* top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${accent} 0%, ${accent}00 100%)` }} />
              {/* corner glow */}
              <div style={{ position: 'absolute', top: -16, left: -16, width: 80, height: 80, borderRadius: '50%', background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`, filter: 'blur(8px)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative' }}>
                <div style={{
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${accent}12`, border: `0.5px solid ${accent}30`,
                }}>
                  <Icon size={16} style={{ color: accent }} />
                </div>
                <span style={{
                  fontFamily: 'Geist Mono, monospace', fontSize: 7, fontWeight: 700, letterSpacing: '0.08em',
                  background: tag === 'APEX' ? 'linear-gradient(90deg, #4edea3, #a3c9ff)' : '#1493ff',
                  color: tag === 'APEX' ? '#0d1117' : '#fff',
                  padding: '2px 6px',
                }}>{tag}</span>
              </div>

              <p style={{ fontFamily: 'Geist, Inter, sans-serif', fontSize: 13, fontWeight: 700, color: '#e2e2e8', letterSpacing: '-0.01em', marginBottom: 6, position: 'relative' }}>
                {label}
              </p>
              <p style={{ fontFamily: 'Geist, Inter, sans-serif', fontSize: 11, color: '#4a5568', lineHeight: 1.55, marginBottom: 14, position: 'relative' }}>
                {desc}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
                <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', color: accent, textTransform: 'uppercase' }}>
                  Start
                </span>
                <ArrowRight size={10} style={{ color: accent }} />
              </div>
            </button>
          ))}
        </div>

        {/* More tools row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2,
        }}>
          {MORE_TOOLS.map(({ to, label, icon: Icon, accent }) => (
            <button key={to} onClick={() => navigate(to)} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
              background: '#0a1628', border: '0.5px solid rgba(163,201,255,0.05)',
              cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = `${accent}08`; e.currentTarget.style.borderColor = `${accent}20` }}
              onMouseLeave={e => { e.currentTarget.style.background = '#0a1628'; e.currentTarget.style.borderColor = 'rgba(163,201,255,0.05)' }}
            >
              <Icon size={12} style={{ color: accent, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 600, color: '#3a4455', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      <ApplicationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={deleteApplication}
        initial={editingApp ?? { status: 'wishlist' }}
      />
      </div>{/* end main content */}

      {quickPostOpen && (
        <QuickPostModal
          onClose={() => setQuickPostOpen(false)}
          onPublished={() => {}}
        />
      )}
    </div>
  )
}
