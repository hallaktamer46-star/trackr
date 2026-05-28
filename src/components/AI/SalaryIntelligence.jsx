import { useState, useEffect, useRef } from 'react'
import {
  Loader2, DollarSign, TrendingUp, TrendingDown, Minus,
  AlertCircle, RefreshCw, Zap, MapPin, Briefcase, BarChart3,
  Building2, Wifi, ArrowUpRight, ArrowDownRight, Info
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { apiFetch } from '../../lib/api'
import { useApplications } from '../../contexts/ApplicationContext'

/* ── loading messages ── */
const LOADING_STEPS = [
  { icon: '📊', text: 'Scanning market data…'             },
  { icon: '🏢', text: 'Benchmarking top employers…'       },
  { icon: '💡', text: 'Calculating percentile bands…'     },
  { icon: '📈', text: 'Analysing remote premium…'         },
  { icon: '🎯', text: 'Building your salary report…'      },
]

const EXP_LEVELS = [
  { value: 'entry',  label: 'Entry Level (0–2 yrs)'  },
  { value: 'mid',    label: 'Mid Level (3–5 yrs)'    },
  { value: 'senior', label: 'Senior (6–10 yrs)'      },
  { value: 'staff',  label: 'Staff / Lead (10+ yrs)' },
]

/* ── loading animation ── */
function LoadingState() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % LOADING_STEPS.length), 1400)
    return () => clearInterval(id)
  }, [])

  const cur = LOADING_STEPS[step]

  return (
    <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 px-8 py-12 text-center space-y-6">
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 bg-emerald-500/20 animate-ping" />
        <div className="relative w-16 h-16 bg-emerald-500 flex items-center justify-center text-2xl">
          {cur.icon}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-white font-extrabold text-lg tracking-tight">Researching salary data</p>
        <p className="text-emerald-400 text-sm font-mono animate-pulse">{cur.text}</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn('w-2 h-2 transition-all duration-500',
              i === step ? 'bg-emerald-400 scale-125' : i < step ? 'bg-emerald-700' : 'bg-slate-700'
            )}
          />
        ))}
      </div>
      <p className="text-slate-500 text-xs font-mono">Usually takes 10–15 seconds</p>
    </div>
  )
}

/* ── salary bar visualisation ── */
function SalaryBar({ data }) {
  const { p25, median, p75, p90, currency = '$' } = data

  const min  = Math.round(p25  * 0.85)
  const max  = Math.round(p90  * 1.05)
  const span = max - min

  const pct = v => Math.max(0, Math.min(100, ((v - min) / span) * 100))

  const fmt = v => {
    if (v >= 1000) return `${currency}${Math.round(v / 1000)}k`
    return `${currency}${v}`
  }

  const markers = [
    { label: 'P25',    value: p25,    color: 'bg-slate-400',   text: 'text-slate-400'   },
    { label: 'Median', value: median, color: 'bg-emerald-500', text: 'text-emerald-500' },
    { label: 'P75',    value: p75,    color: 'bg-sky-500',     text: 'text-sky-500'     },
    { label: 'P90',    value: p90,    color: 'bg-violet-500',  text: 'text-violet-500'  },
  ]

  return (
    <div className="space-y-5">
      {/* Main bar */}
      <div className="relative h-10 bg-slate-100 dark:bg-slate-800 overflow-visible mx-3">
        {/* gradient fill from p25→p90 */}
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-slate-300 via-emerald-400 to-violet-500 dark:from-slate-600 dark:via-emerald-500 dark:to-violet-500 opacity-30"
          style={{ left: `${pct(p25)}%`, width: `${pct(p90) - pct(p25)}%` }}
        />
        {/* marker lines */}
        {markers.map(m => (
          <div
            key={m.label}
            className={cn('absolute top-0 w-0.5 h-full', m.color)}
            style={{ left: `${pct(m.value)}%` }}
          />
        ))}
        {/* median dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-lg z-10"
          style={{ left: `calc(${pct(median)}% - 8px)` }}
        />
      </div>

      {/* Labels below bar */}
      <div className="relative h-8 mx-3">
        {markers.map(m => (
          <div
            key={m.label}
            className="absolute flex flex-col items-center -translate-x-1/2"
            style={{ left: `${pct(m.value)}%` }}
          >
            <span className={cn('text-[10px] font-extrabold font-mono', m.text)}>
              {fmt(m.value)}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
              {m.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend row */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        {markers.map(m => (
          <div key={m.label} className="flex items-center gap-1.5">
            <div className={cn('w-2.5 h-2.5', m.color)} />
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              {m.label} = {fmt(m.value)}<span className="text-slate-400 dark:text-slate-600">/yr</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── stat pill ── */
function StatPill({ label, value, icon: Icon, color }) {
  const colors = {
    green:  'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400',
    sky:    'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400',
    violet: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400',
    amber:  'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
    slate:  'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
  }
  return (
    <div className={cn('border px-4 py-3 flex items-center gap-3', colors[color] || colors.slate)}>
      <Icon size={16} className="shrink-0" />
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-70 font-semibold">{label}</p>
        <p className="text-sm font-extrabold tracking-tight">{value}</p>
      </div>
    </div>
  )
}

/* ── application comparison banner ── */
function AppComparison({ data, applications }) {
  const appsWithSalary = applications.filter(a => a.salary_range)
  if (!appsWithSalary.length) return null

  // Try to extract a number from salary_range strings like "$80k", "£90,000", "80000", "$75k–$95k"
  const extractNum = (str) => {
    const nums = str.replace(/[£€$,]/g, '').match(/\d[\d.k]*/gi)
    if (!nums) return null
    const vals = nums.map(n => n.toLowerCase().endsWith('k') ? parseFloat(n) * 1000 : parseFloat(n))
    return vals.reduce((a, b) => a + b, 0) / vals.length
  }

  const parsed = appsWithSalary
    .map(a => ({ ...a, num: extractNum(a.salary_range) }))
    .filter(a => a.num && a.num > 1000)

  if (!parsed.length) return null

  const avgApplied = parsed.reduce((s, a) => s + a.num, 0) / parsed.length
  const marketMedian = data.median
  const diff = ((avgApplied - marketMedian) / marketMedian) * 100
  const below = diff < -5
  const above = diff > 5

  return (
    <div className={cn(
      'border px-5 py-4 flex items-start gap-4',
      below
        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        : above
          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    )}>
      {below
        ? <ArrowDownRight size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        : above
          ? <ArrowUpRight size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          : <Minus size={20} className="text-slate-500 shrink-0 mt-0.5" />
      }
      <div className="min-w-0">
        <p className={cn(
          'text-sm font-extrabold tracking-tight mb-1',
          below ? 'text-amber-800 dark:text-amber-300' : above ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'
        )}>
          {below
            ? `You're applying ${Math.abs(diff).toFixed(0)}% below market rate`
            : above
              ? `You're targeting ${Math.abs(diff).toFixed(0)}% above market — strong positioning`
              : "You're applying right at market rate"
          }
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Your {parsed.length} tracked application{parsed.length > 1 ? 's' : ''} average <strong className="font-bold">{data.currency || '$'}{Math.round(avgApplied / 1000)}k</strong> vs. the {data.median >= 1000 ? `${data.currency || '$'}${Math.round(data.median / 1000)}k` : `${data.currency || '$'}${data.median}`} market median.
          {below && " Consider negotiating higher or targeting better-paying companies."}
          {above && " Make sure your experience clearly justifies the premium."}
        </p>
      </div>
    </div>
  )
}

/* ── main component ── */
export default function SalaryIntelligence() {
  const { applications } = useApplications()

  const [jobTitle,        setJobTitle]        = useState('')
  const [location,        setLocation]        = useState('')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [loading,         setLoading]         = useState(false)
  const [result,          setResult]          = useState(null)
  const [error,           setError]           = useState(null)
  const resultsRef = useRef(null)

  const handleGenerate = async () => {
    if (!jobTitle.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await apiFetch('/api/ai/salary-intelligence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobTitle, location, experienceLevel }),
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

  const trendIcon = result?.yoy_change > 0
    ? TrendingUp
    : result?.yoy_change < 0
      ? TrendingDown
      : Minus

  const verdictColor = {
    'High Demand':   'bg-emerald-500',
    'Growing':       'bg-sky-500',
    'Stable':        'bg-slate-500',
    'Declining':     'bg-amber-500',
    'Oversaturated': 'bg-rose-500',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign size={16} className="text-emerald-500" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Salary Intelligence</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Know your market worth before you negotiate. Enter a role and location — we'll pull salary bands, top-paying companies, remote premiums, and compare them against what you're actually applying for.
        </p>
      </div>

      {/* ── Input form — hidden once result is showing ── */}
      {!result && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 p-6">

          {/* Job title */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
              Job Title *
            </label>
            <div className="relative">
              <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Senior Product Manager, Frontend Engineer, Data Scientist…"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Location + Experience row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                <input
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. London, New York, Remote…"
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-emerald-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-emerald-400 transition-colors appearance-none cursor-pointer"
              >
                {EXP_LEVELS.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!jobTitle.trim()}
            className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-extrabold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            <BarChart3 size={15} />
            Generate Salary Report
          </button>

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 font-mono">
            Salary bands · Top employers · Remote premium · Market trend · ~12 seconds
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-4 text-sm text-rose-700 dark:text-rose-400">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Generation failed</p>
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
                <DollarSign size={14} className="text-emerald-400" />
                <span className="text-white font-extrabold text-sm">{result.role || jobTitle}</span>
              </div>
              {result.location_label && (
                <span className="text-[11px] text-slate-400 font-mono border border-slate-700 px-2 py-1 bg-slate-800 flex items-center gap-1">
                  <MapPin size={9} /> {result.location_label}
                </span>
              )}
              {result.market_verdict && (
                <span className={cn(
                  'text-[10px] font-bold uppercase tracking-widest px-2 py-1 text-white',
                  verdictColor[result.market_verdict] || 'bg-slate-600'
                )}>
                  {result.market_verdict}
                </span>
              )}
              <span className="text-[11px] font-bold text-emerald-400 border border-emerald-900 bg-emerald-900/20 px-2 py-1 font-mono">
                {result.currency || '$'}{Math.round((result.median || 0) / 1000)}k median
              </span>
            </div>
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-400 font-semibold transition-colors"
            >
              <RefreshCw size={11} /> New search
            </button>
          </div>

          {/* Application comparison (if user has tracked apps) */}
          <AppComparison data={result} applications={applications} />

          {/* Salary bands card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
            <h2 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-5">
              Salary Bands · Annual Base ({result.currency || '$'})
            </h2>
            <SalaryBar data={result} />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <StatPill
              label="YoY Change"
              value={result.yoy_change > 0 ? `+${result.yoy_change}%` : result.yoy_change < 0 ? `${result.yoy_change}%` : 'Flat'}
              icon={trendIcon}
              color={result.yoy_change > 0 ? 'green' : result.yoy_change < 0 ? 'amber' : 'slate'}
            />
            <StatPill
              label="Remote Premium"
              value={result.remote_delta || 'N/A'}
              icon={Wifi}
              color="sky"
            />
            <StatPill
              label="Open Roles"
              value={result.open_roles_estimate || 'High'}
              icon={Briefcase}
              color="violet"
            />
            <StatPill
              label="Demand"
              value={result.demand_level || result.market_verdict || 'Stable'}
              icon={TrendingUp}
              color={result.market_verdict === 'High Demand' ? 'green' : 'slate'}
            />
          </div>

          {/* Market summary */}
          {result.market_summary && (
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-5 py-4 flex gap-3">
              <Info size={14} className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{result.market_summary}</p>
            </div>
          )}

          {/* Top paying companies */}
          {result.top_companies?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-4">
                Top Paying Companies
              </h2>
              <div className="space-y-2">
                {result.top_companies.map((co, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-5 h-5 text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 font-mono">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{co.name}</span>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{co.range}</span>
                      </div>
                      {/* Bar */}
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                          style={{ width: `${Math.max(20, 100 - i * 12)}%` }}
                        />
                      </div>
                    </div>
                    <span className={cn(
                      'text-[9px] font-mono uppercase tracking-wide px-1.5 py-0.5 shrink-0',
                      co.type === 'Remote' ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    )}>
                      {co.type || 'Hybrid'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* In-demand skills */}
          {result.skills_premium?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-4">
                Skills That Command a Premium
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.skills_premium.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{s.skill}</span>
                    <span className="text-[10px] font-extrabold font-mono text-emerald-600 dark:text-emerald-400">+{s.delta}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Negotiation tips */}
          {result.negotiation_tips?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <h2 className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-4">
                Negotiation Playbook
              </h2>
              <ul className="space-y-2">
                {result.negotiation_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 bg-emerald-500 text-white text-[9px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom reset */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              Data is AI-generated based on market trends · Always verify with current job listings
            </p>
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
            >
              <RefreshCw size={11} /> Search again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
