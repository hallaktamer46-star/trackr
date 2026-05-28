import { useState, useEffect, useRef } from 'react'
import {
  TrendingUp, TrendingDown, Minus, AlertCircle, RefreshCw,
  Zap, Briefcase, BookOpen, Map, ChevronRight, Clock,
  DollarSign, Flame, Shield, ArrowUpRight, Target, Lightbulb,
  Activity, BarChart2, Rocket, CheckCircle2, Info, Star
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { apiFetch } from '../../lib/api'
import { useApplications } from '../../contexts/ApplicationContext'

/* ── loading messages ── */
const LOADING_STEPS = [
  { icon: '🌍', text: 'Scanning the job market…'              },
  { icon: '🔬', text: 'Analysing your career trajectory…'     },
  { icon: '📡', text: 'Detecting skill demand signals…'       },
  { icon: '🗺️',  text: 'Mapping career paths…'               },
  { icon: '⚡',  text: 'Building your intelligence report…'  },
]

const EXP_LEVELS = [
  { value: '0-2',   label: '0–2 years'  },
  { value: '3-5',   label: '3–5 years'  },
  { value: '6-10',  label: '6–10 years' },
  { value: '10+',   label: '10+ years'  },
]

/* ── loading animation ── */
function LoadingState() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % LOADING_STEPS.length), 1500)
    return () => clearInterval(id)
  }, [])
  const cur = LOADING_STEPS[step]
  return (
    <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 px-8 py-12 text-center space-y-6">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 bg-violet-500/20 animate-ping" />
        <div className="relative w-16 h-16 bg-violet-600 flex items-center justify-center text-2xl">
          {cur.icon}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-white font-extrabold text-lg tracking-tight">Analysing your market position</p>
        <p className="text-violet-400 text-sm font-mono animate-pulse">{cur.text}</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        {LOADING_STEPS.map((_, i) => (
          <div key={i} className={cn('w-2 h-2 transition-all duration-500',
            i === step ? 'bg-violet-400 scale-125' : i < step ? 'bg-violet-700' : 'bg-slate-700'
          )} />
        ))}
      </div>
      <p className="text-slate-500 text-xs font-mono">Building all 3 sections · Usually 15–20 seconds</p>
    </div>
  )
}

/* ── demand score ring ── */
function DemandRing({ score }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const fill = (score / 10) * circ
  const color = score >= 8 ? '#10b981' : score >= 6 ? '#38bdf8' : score >= 4 ? '#f59e0b' : '#f43f5e'
  const label = score >= 8 ? 'Hot Market' : score >= 6 ? 'Growing' : score >= 4 ? 'Stable' : 'Declining'
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" className="rotate-[-90deg]">
        <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor" strokeWidth="5"
          className="text-slate-200 dark:text-slate-700" />
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="5"
          stroke={color} strokeLinecap="square"
          strokeDasharray={`${fill} ${circ - fill}`} />
      </svg>
      <div className="text-center -mt-1">
        <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-none">{score}<span className="text-sm font-normal text-slate-400">/10</span></p>
        <p className="text-[10px] font-mono uppercase tracking-widest mt-0.5" style={{ color }}>{label}</p>
      </div>
    </div>
  )
}

/* ── section header ── */
function SectionHeader({ icon: Icon, label, color, subtitle }) {
  const colors = {
    violet: 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30',
    sky:    'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30',
    emerald:'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
  }
  return (
    <div className="flex items-start gap-3 mb-5">
      <div className={cn('w-8 h-8 flex items-center justify-center shrink-0', colors[color])}>
        <Icon size={16} />
      </div>
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{label}</h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

/* ── SECTION 1: Career Health Check ── */
function HealthCheck({ data }) {
  const statusColors = {
    Hot:       'bg-emerald-500 text-white',
    Growing:   'bg-sky-500 text-white',
    Stable:    'bg-slate-500 text-white',
    Declining: 'bg-amber-500 text-white',
    Shrinking: 'bg-rose-500 text-white',
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5">
      <SectionHeader
        icon={Activity}
        label="Career Health Check"
        color="violet"
        subtitle="Where your current role sits in today's market"
      />

      {/* Score + status row */}
      <div className="flex items-start gap-6">
        <DemandRing score={data.demand_score} />
        <div className="flex-1 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn('text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1', statusColors[data.market_status] || statusColors.Stable)}>
              {data.market_status}
            </span>
            {data.salary_ceiling && (
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1">
                Ceiling: {data.salary_ceiling}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{data.summary}</p>
        </div>
      </div>

      {/* Top industries */}
      {data.top_industries?.length > 0 && (
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-2.5">
            Industries Hiring Most
          </p>
          <div className="flex flex-wrap gap-2">
            {data.top_industries.map((ind, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5">
                <Briefcase size={10} className="text-slate-400" />
                {ind}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI impact */}
      {data.ai_impact && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 px-4 py-3">
          <Zap size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-700 dark:text-amber-400 font-mono mb-1">AI & Automation Impact</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">{data.ai_impact}</p>
          </div>
        </div>
      )}

      {/* Warning */}
      {data.warning && (
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 px-4 py-3">
          <AlertCircle size={13} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">{data.warning}</p>
        </div>
      )}
    </div>
  )
}

/* ── SECTION 2: Skills Gap Radar ── */
function SkillsGap({ data }) {
  const priorityColor = (p) => {
    if (p === 1) return { dot: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400', label: '#1 Priority' }
    if (p === 2) return { dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400', label: `#${p} Priority` }
    return { dot: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400', badge: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400', label: `#${p} Priority` }
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5">
      <SectionHeader
        icon={Target}
        label="Skills Gap Radar"
        color="sky"
        subtitle="What to learn next — ranked by pay impact and demand"
      />

      {/* Quick win callout */}
      {data.quick_win && (
        <div className="flex items-start gap-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 px-4 py-3">
          <Star size={14} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-sky-700 dark:text-sky-400 font-mono mb-1">Learn This First</p>
            <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">{data.quick_win}</p>
          </div>
        </div>
      )}

      {/* Skills list */}
      <div className="space-y-3">
        {data.gap_skills?.map((skill, i) => {
          const p = priorityColor(i + 1)
          return (
            <div key={i} className="border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={cn('w-2 h-2 shrink-0 mt-0.5', p.dot)} />
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{skill.skill}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {skill.pay_delta && (
                    <span className="text-[10px] font-extrabold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.5">
                      {skill.pay_delta}
                    </span>
                  )}
                  <span className={cn('text-[10px] font-mono border px-1.5 py-0.5', p.badge)}>
                    {p.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4.5">
                {skill.time_to_learn && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    <Clock size={9} /> {skill.time_to_learn}
                  </span>
                )}
                {skill.demand && (
                  <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                    <TrendingUp size={9} /> {skill.demand} demand
                  </span>
                )}
              </div>
              {skill.why && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-2 ml-4.5">
                  {skill.why}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── SECTION 3: Career Path Explorer ── */
function CareerPaths({ data }) {
  const pathConfig = {
    Safe: {
      icon:    Shield,
      color:   'text-sky-600 dark:text-sky-400',
      border:  'border-sky-200 dark:border-sky-800',
      bg:      'bg-sky-50 dark:bg-sky-900/20',
      badge:   'bg-sky-500 text-white',
      header:  'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800',
    },
    Fast: {
      icon:    Rocket,
      color:   'text-emerald-600 dark:text-emerald-400',
      border:  'border-emerald-200 dark:border-emerald-800',
      bg:      'bg-emerald-50 dark:bg-emerald-900/20',
      badge:   'bg-emerald-500 text-white',
      header:  'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
    },
    Bold: {
      icon:    Flame,
      color:   'text-violet-600 dark:text-violet-400',
      border:  'border-violet-200 dark:border-violet-800',
      bg:      'bg-violet-50 dark:bg-violet-900/20',
      badge:   'bg-violet-500 text-white',
      header:  'bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800',
    },
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-5">
      <SectionHeader
        icon={Map}
        label="Career Path Explorer"
        color="emerald"
        subtitle="Three routes forward — safe, fast, and bold"
      />

      <div className="grid sm:grid-cols-3 gap-4">
        {data.paths?.map((path, i) => {
          const cfg = pathConfig[path.type] || pathConfig.Safe
          const Icon = cfg.icon
          return (
            <div key={i} className={cn('border flex flex-col', cfg.border)}>
              {/* Path header */}
              <div className={cn('px-4 py-3 border-b flex items-center justify-between', cfg.header, cfg.border)}>
                <div className="flex items-center gap-2">
                  <Icon size={14} className={cfg.color} />
                  <span className={cn('text-[10px] font-extrabold uppercase tracking-widest', cfg.color)}>
                    {path.type} Path
                  </span>
                </div>
                {path.difficulty && (
                  <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase">{path.difficulty}</span>
                )}
              </div>

              {/* Body */}
              <div className="p-4 flex-1 space-y-3">
                {/* Target role */}
                <div>
                  <p className="text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight">{path.role}</p>
                  {path.timeline && (
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                      <Clock size={9} /> {path.timeline}
                    </p>
                  )}
                </div>

                {/* Salary jump */}
                {path.salary_jump && (
                  <div className={cn('flex items-center gap-1.5 px-2.5 py-1.5', cfg.bg)}>
                    <ArrowUpRight size={12} className={cfg.color} />
                    <span className={cn('text-xs font-extrabold', cfg.color)}>{path.salary_jump}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">salary jump</span>
                  </div>
                )}

                {/* Description */}
                {path.description && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{path.description}</p>
                )}

                {/* Steps */}
                {path.steps?.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Roadmap</p>
                    {path.steps.map((step, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <CheckCircle2 size={11} className={cn('shrink-0 mt-0.5', cfg.color)} />
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Working hours note */}
                {path.work_style && (
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2.5 mt-auto">
                    <Briefcase size={9} />
                    {path.work_style}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── application context card ── */
function ApplicationContext({ applications, currentRole }) {
  const total      = applications.length
  const interviews = applications.filter(a => a.status === 'interview').length
  const offers     = applications.filter(a => a.status === 'offer').length
  const pending    = applications.filter(a => a.status === 'applied').length

  if (!total) return null

  const rate = total > 0 ? Math.round((interviews / total) * 100) : 0

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-5 py-3 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Info size={12} className="text-slate-400" />
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Personalised using your {total} tracked application{total !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{pending} pending</span>
        <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400">{interviews} interviews</span>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">{offers} offers</span>
        <span className="text-[10px] font-mono text-slate-400">interview rate: {rate}%</span>
      </div>
    </div>
  )
}

/* ── main component ── */
export default function MarketAnalysis() {
  const { applications } = useApplications()

  const [currentRole,     setCurrentRole]     = useState('')
  const [yearsExp,        setYearsExp]        = useState('3-5')
  const [targetGoal,      setTargetGoal]      = useState('')
  const [loading,         setLoading]         = useState(false)
  const [result,          setResult]          = useState(null)
  const [error,           setError]           = useState(null)
  const resultsRef = useRef(null)

  // Pre-fill currentRole from their most-applied job title
  const inferredRole = (() => {
    if (!applications.length) return ''
    const counts = {}
    applications.forEach(a => {
      if (a.job_title) counts[a.job_title] = (counts[a.job_title] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
  })()

  const effectiveRole = currentRole || inferredRole

  // Build application context to send to AI
  const appContext = (() => {
    if (!applications.length) return null
    const titles    = [...new Set(applications.map(a => a.job_title).filter(Boolean))].slice(0, 5)
    const salaries  = applications.map(a => a.salary_range).filter(Boolean).slice(0, 5)
    const companies = [...new Set(applications.map(a => a.company).filter(Boolean))].slice(0, 5)
    const total     = applications.length
    const interviews = applications.filter(a => a.status === 'interview').length
    const offers     = applications.filter(a => a.status === 'offer').length
    return { titles, salaries, companies, total, interviews, offers }
  })()

  const handleGenerate = async () => {
    if (!effectiveRole.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await apiFetch('/api/ai/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRole: effectiveRole,
          yearsExperience: yearsExp,
          targetGoal,
          appContext,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error || await res.text())
      const data = await res.json()
      setResult(data)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err.message || 'Failed to generate. Make sure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={16} className="text-violet-500" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Market Analysis</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Your career intelligence report — is your path in demand, what skills move the needle, and which direction should you head next.
        </p>
      </div>

      {/* ── Input form ── */}
      {!result && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 p-6">

          {/* Auto-filled hint */}
          {inferredRole && !currentRole && (
            <div className="flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 px-3 py-2">
              <Lightbulb size={12} className="text-violet-500 shrink-0" />
              <p className="text-[11px] text-violet-700 dark:text-violet-400 font-mono">
                Pre-filled from your pipeline: <strong>{inferredRole}</strong>
              </p>
            </div>
          )}

          {/* Current role */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
              Your Current (or Target) Role *
            </label>
            <input
              value={currentRole || inferredRole}
              onChange={e => setCurrentRole(e.target.value)}
              placeholder="e.g. Product Manager, Software Engineer, Data Analyst…"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-violet-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
          </div>

          {/* Experience + Goal row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                Years of Experience
              </label>
              <select
                value={yearsExp}
                onChange={e => setYearsExp(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-violet-400 transition-colors appearance-none cursor-pointer"
              >
                {EXP_LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                Where You Want to Go <span className="normal-case tracking-normal text-slate-300 dark:text-slate-600">(optional)</span>
              </label>
              <input
                value={targetGoal}
                onChange={e => setTargetGoal(e.target.value)}
                placeholder="e.g. better pay, remote work, VP in 3 years…"
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-violet-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!effectiveRole.trim()}
            className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-extrabold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            <BarChart2 size={15} />
            Analyse My Career Market
          </button>

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 font-mono">
            Health check · Skills gap · 3 career paths · ~15 seconds
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-4 text-sm text-rose-700 dark:text-rose-400">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Analysis failed</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <LoadingState />}

      {/* ── Results ── */}
      {result && (
        <div ref={resultsRef} className="space-y-4">

          {/* Summary bar */}
          <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <BarChart2 size={14} className="text-violet-400" />
                <span className="text-white font-extrabold text-sm">{result.health_check?.role || effectiveRole}</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono border border-slate-700 px-2 py-1 bg-slate-800">
                {yearsExp} yrs exp
              </span>
              <span className="text-[11px] font-bold text-violet-400 border border-violet-900 bg-violet-900/20 px-2 py-1 font-mono">
                {result.skills_gap?.gap_skills?.length || 0} skill gaps identified
              </span>
              <span className="text-[11px] font-bold text-emerald-400 border border-emerald-900 bg-emerald-900/20 px-2 py-1 font-mono">
                3 paths mapped
              </span>
            </div>
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-violet-400 font-semibold transition-colors"
            >
              <RefreshCw size={11} /> New analysis
            </button>
          </div>

          {/* App context note */}
          <ApplicationContext applications={applications} currentRole={effectiveRole} />

          {/* Section 1: Health Check */}
          {result.health_check && <HealthCheck data={result.health_check} />}

          {/* Section 2: Skills Gap */}
          {result.skills_gap && <SkillsGap data={result.skills_gap} />}

          {/* Section 3: Career Paths */}
          {result.career_paths && <CareerPaths data={result.career_paths} />}

          {/* Bottom reset */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              AI-generated market intelligence · Use as a strategic guide, not a guarantee
            </p>
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex items-center gap-1.5 text-xs font-bold text-violet-500 hover:text-violet-600 transition-colors"
            >
              <RefreshCw size={11} /> New analysis
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
