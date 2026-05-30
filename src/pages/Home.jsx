import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Bell, FileText, Mail, MessageSquare, Mic, DollarSign,
  TrendingUp, Building2, Link2, AlertTriangle, ChevronRight
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { parseISO, isToday, isPast, format, subDays, startOfDay, isSameDay } from 'date-fns'
import { useApplications } from '../contexts/ApplicationContext'
import ApplicationModal from '../components/Modals/ApplicationModal'

const AI_TOOLS = [
  { to: '/ai/cv',            label: 'CV Review',       icon: FileText,     color: 'text-sky-500',     bg: 'bg-sky-50 dark:bg-sky-900/20'     },
  { to: '/ai/cover-letter',  label: 'Cover Letter',    icon: Mail,         color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-900/20' },
  { to: '/ai/follow-up',     label: 'Follow-up',       icon: MessageSquare,color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { to: '/ai/interview-prep',label: 'Interview Prep',  icon: Mic,          color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20'   },
  { to: '/ai/salary',        label: 'Salary Intel',    icon: DollarSign,   color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-900/20'     },
  { to: '/ai/market',        label: 'Market Analysis', icon: TrendingUp,   color: 'text-indigo-500',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { to: '/ai/company',       label: 'Company Research',icon: Building2,    color: 'text-orange-500',  bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { to: '/ai/linkedin',      label: 'LinkedIn Review', icon: Link2,        color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-900/20'     },
]

const STAT_CONFIG = [
  { key: 'total',     label: 'Total',      color: 'text-slate-700 dark:text-slate-200', dot: 'bg-slate-400' },
  { key: 'applied',   label: 'Applied',    color: 'text-sky-600 dark:text-sky-400',     dot: 'bg-sky-500'   },
  { key: 'interview', label: 'Interviews', color: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  { key: 'offer',     label: 'Offers',     color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  { key: 'rejected',  label: 'Rejected',   color: 'text-rose-500 dark:text-rose-400',   dot: 'bg-rose-500'  },
]

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
    applications.filter(a => {
      if (!a.reminder_date) return false
      const d = parseISO(a.reminder_date)
      return isToday(d) || isPast(d)
    }).sort((a, b) => new Date(a.reminder_date) - new Date(b.reminder_date))
  , [applications])

  const weeklyData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 6 - i))
      const count = applications.filter(a =>
        a.created_at && isSameDay(parseISO(a.created_at), date)
      ).length
      return { day: format(date, 'EEE'), date, count }
    })
    return days
  }, [applications])

  const maxCount = Math.max(...weeklyData.map(d => d.count), 1)

  const handleSave = async (data) => {
    if (data.id) await updateApplication(data.id, data)
    else await addApplication({ ...data, status: data.status || 'wishlist' })
  }

  const openEdit = (app) => { setEditingApp(app); setModalOpen(true) }
  const openAdd  = () => { setEditingApp(null); setModalOpen(true) }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Top row: greeting + quick-add */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-mono text-sky-500 font-bold">Overview</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Home</h1>
        </div>
        {canAddMore && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-600 text-white text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm"
          >
            <Plus size={13} className="shrink-0" />
            Add Application
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STAT_CONFIG.map(({ key, label, color, dot }) => (
          <div key={key} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <span className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-semibold">{label}</span>
            </div>
            <p className={`text-2xl font-extrabold tracking-tight ${color}`}>{stats[key]}</p>
          </div>
        ))}
      </div>

      {/* Follow-up reminders */}
      {followUps.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-400 flex items-center gap-2">
              <Bell size={12} className="text-amber-500" /> Follow-up Reminders
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{followUps.length}</span>
            </h2>
            <button onClick={() => navigate('/ai/follow-up')} className="text-[10px] uppercase tracking-widest font-bold text-sky-500 hover:underline flex items-center gap-1">
              Generate Follow-up <ChevronRight size={10} />
            </button>
          </div>
          <div className="space-y-2">
            {followUps.map(app => (
              <button
                key={app.id}
                onClick={() => openEdit(app)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-xl text-left hover:border-amber-300 dark:hover:border-amber-700 transition-colors group"
              >
                <AlertTriangle size={14} className="text-amber-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {app.job_title} <span className="font-normal text-slate-500">@ {app.company}</span>
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
                    Due {format(parseISO(app.reminder_date), 'MMM d')}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Weekly progress + AI shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Weekly chart */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold mb-4">Applications This Week</h2>
          {applications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-300 dark:text-slate-700">
              <p className="text-xs font-mono">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={weeklyData} barSize={22} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                  contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: 11 }}
                  itemStyle={{ color: '#38bdf8' }}
                  formatter={(v) => [v, 'Applications']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={entry.count === maxCount && entry.count > 0 ? '#0ea5e9' : '#e2e8f0'}
                      className="dark:[&]:fill-slate-700"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* AI shortcuts */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <h2 className="text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold mb-4">AI Tools</h2>
          <div className="grid grid-cols-2 gap-2">
            {AI_TOOLS.map(({ to, label, icon: Icon, color, bg }) => (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${bg} hover:opacity-80 transition-opacity text-left group`}
              >
                <Icon size={14} className={`${color} shrink-0`} />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">{label}</span>
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
