import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Bell, FileText, Mail, MessageSquare, Mic, DollarSign,
  TrendingUp, Building2, Link2, AlertTriangle, ChevronRight, Sparkles
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { parseISO, isToday, isPast, format, subDays, startOfDay, isSameDay } from 'date-fns'
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
  { key: 'total',     label: 'Total',      dot: '#8a919f', color: '#e2e2e8' },
  { key: 'applied',   label: 'Applied',    dot: '#a3c9ff', color: '#a3c9ff' },
  { key: 'interview', label: 'Interviews', dot: '#ffb689', color: '#ffb689' },
  { key: 'offer',     label: 'Offers',     dot: '#4edea3', color: '#4edea3' },
  { key: 'rejected',  label: 'Rejected',   dot: '#ffb4ab', color: '#ffb4ab' },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2024', border: '0.5px solid rgba(138,145,159,0.3)', borderRadius: 6, padding: '6px 10px' }}>
      <p style={{ color: '#c0c7d5', fontFamily: 'Geist Mono, monospace', fontSize: 10, marginBottom: 2 }}>{label}</p>
      <p style={{ color: '#a3c9ff', fontFamily: 'Geist Mono, monospace', fontSize: 13, fontWeight: 600 }}>{payload[0].value}</p>
    </div>
  )
}

export default function Home() {
  const { applications, addApplication, updateApplication, deleteApplication, canAddMore } = useApplications()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingApp, setEditingApp] = useState(null)

  const stats = useMemo(() => ({
    total:     applications.length,
    applied:   applications.filter(a => a.status === 'applied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer:     applications.filter(a => a.status === 'offer').length,
    rejected:  applications.filter(a => a.status === 'rejected').length,
  }), [applications])

  const followUps = useMemo(() =>
    applications
      .filter(a => a.reminder_date && (isToday(parseISO(a.reminder_date)) || isPast(parseISO(a.reminder_date))))
      .sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date))
  , [applications])

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
      <section className="flex items-end justify-between pt-1">
        <div>
          <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, letterSpacing: '0.08em', fontWeight: 600, color: '#a3c9ff', textTransform: 'uppercase', marginBottom: 2 }}>
            Overview
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', lineHeight: 1.15 }}>
            Home
          </h1>
        </div>
        {canAddMore && (
          <button
            onClick={() => { setEditingApp(null); setModalOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 font-bold text-xs text-white transition-all active:scale-95 hover:brightness-110"
            style={{ background: '#1493ff', boxShadow: '0 4px 12px rgba(20,147,255,0.3)', letterSpacing: '0.02em' }}
          >
            <Plus size={14} />
            Add Application
          </button>
        )}
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-5 gap-px" style={{ background: 'rgba(138,145,159,0.15)' }}>
        {STATS.map(({ key, label, dot, color }) => {
          const val = stats[key]
          return (
            <div key={key} style={{ background: '#111318', padding: '10px 14px' }}>
              <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: '#8a919f', textTransform: 'uppercase', marginBottom: 6 }}>
                {label}
              </p>
              <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, color: val === 0 ? 'rgba(138,145,159,0.2)' : color }}>
                {val}
              </p>
              <div style={{ marginTop: 8, height: 2, background: val === 0 ? 'rgba(138,145,159,0.1)' : dot, opacity: val === 0 ? 1 : 0.5 }} />
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
