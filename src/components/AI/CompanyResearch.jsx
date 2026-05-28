import { useState, useEffect, useRef } from 'react'
import {
  Building2, AlertCircle, RefreshCw, Zap, TrendingUp, TrendingDown,
  Minus, Newspaper, Users, DollarSign, Shield, Star, ChevronDown,
  MessageSquare, Flame, CheckCircle2, XCircle, Info, Briefcase,
  ExternalLink, Search, MapPin, Globe
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { apiFetch } from '../../lib/api'
import { useApplications } from '../../contexts/ApplicationContext'

/* ── loading messages ── */
const LOADING_STEPS = [
  { icon: '🔍', text: 'Looking up company profile…'        },
  { icon: '💰', text: 'Checking funding & financials…'     },
  { icon: '👥', text: 'Analysing headcount trends…'        },
  { icon: '📰', text: 'Scanning recent news…'              },
  { icon: '🎙️',  text: 'Pulling interview culture data…'   },
]

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
        <div className="absolute inset-0 bg-sky-500/20 animate-ping" />
        <div className="relative w-16 h-16 bg-sky-600 flex items-center justify-center text-2xl">
          {cur.icon}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-white font-extrabold text-lg tracking-tight">Building company brief</p>
        <p className="text-sky-400 text-sm font-mono animate-pulse">{cur.text}</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        {LOADING_STEPS.map((_, i) => (
          <div key={i} className={cn('w-2 h-2 transition-all duration-500',
            i === step ? 'bg-sky-400 scale-125' : i < step ? 'bg-sky-700' : 'bg-slate-700'
          )} />
        ))}
      </div>
      <p className="text-slate-500 text-xs font-mono">Usually takes 10–15 seconds</p>
    </div>
  )
}

/* ── sentiment badge ── */
function SentimentBadge({ value }) {
  const map = {
    'Very Positive': 'bg-emerald-500 text-white',
    'Positive':      'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    'Mixed':         'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    'Negative':      'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
    'Very Negative': 'bg-rose-500 text-white',
    'Neutral':       'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  }
  return (
    <span className={cn('text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5', map[value] || map.Neutral)}>
      {value}
    </span>
  )
}

/* ── health badge ── */
function HealthBadge({ value }) {
  const map = {
    'Strong':    'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    'Healthy':   'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800',
    'Uncertain': 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    'Struggling':'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    'Unknown':   'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  }
  return (
    <span className={cn('text-[10px] font-extrabold uppercase tracking-widest px-2 py-1 border', map[value] || map.Unknown)}>
      {value}
    </span>
  )
}

/* ── stage badge ── */
function StageBadge({ value }) {
  const isPublic  = value?.includes('Public')
  const isSeed    = value?.includes('Seed') || value?.includes('Pre-seed')
  const isGrowth  = value?.includes('Series C') || value?.includes('Series D') || value?.includes('PE')
  const color = isPublic ? 'bg-violet-500 text-white' : isGrowth ? 'bg-sky-500 text-white' : isSeed ? 'bg-amber-500 text-white' : 'bg-slate-700 text-slate-200'
  return (
    <span className={cn('text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1', color)}>
      {value}
    </span>
  )
}

/* ── trend icon ── */
function TrendIcon({ value }) {
  if (value?.includes('growth') || value?.includes('Growth')) return <TrendingUp size={13} className="text-emerald-500" />
  if (value?.includes('Layoff') || value?.includes('layoff')) return <TrendingDown size={13} className="text-rose-500" />
  return <Minus size={13} className="text-slate-400" />
}

/* ── main component ── */
export default function CompanyResearch() {
  const { applications } = useApplications()

  const [companyName,  setCompanyName]  = useState('')
  const [jobTitle,     setJobTitle]     = useState('')
  const [showPipeline, setShowPipeline] = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [result,       setResult]       = useState(null)
  const [error,        setError]        = useState(null)
  const resultsRef    = useRef(null)
  const dropdownRef   = useRef(null)

  // Unique companies from pipeline, sorted alphabetically
  const pipelineCompanies = (() => {
    const seen = new Map()
    applications.forEach(a => {
      if (a.company && !seen.has(a.company)) {
        seen.set(a.company, a.job_title || '')
      }
    })
    return [...seen.entries()]
      .map(([company, title]) => ({ company, title }))
      .sort((a, b) => a.company.localeCompare(b.company))
  })()

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowPipeline(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selectFromPipeline = (company, title) => {
    setCompanyName(company)
    setJobTitle(title)
    setShowPipeline(false)
  }

  const handleGenerate = async () => {
    if (!companyName.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await apiFetch('/api/ai/company-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, jobTitle }),
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
          <Building2 size={16} className="text-sky-500" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Company Research</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          One click on any company in your pipeline — funding stage, headcount trend, Glassdoor culture, interview process, recent news, and exactly what to say in the room.
        </p>
      </div>

      {/* ── Input form ── */}
      {!result && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 p-6">

          {/* Pipeline picker */}
          {pipelineCompanies.length > 0 && (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setShowPipeline(v => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 text-sm text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Briefcase size={13} />
                  Pick from your pipeline ({pipelineCompanies.length} companies)
                </span>
                <ChevronDown size={14} className={cn('transition-transform', showPipeline && 'rotate-180')} />
              </button>

              {showPipeline && (
                <div className="absolute z-20 top-full left-0 right-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-t-0 shadow-xl max-h-52 overflow-y-auto">
                  {pipelineCompanies.map(({ company, title }) => (
                    <button
                      key={company}
                      onClick={() => selectFromPipeline(company, title)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left border-b border-slate-100 dark:border-slate-800 last:border-0"
                    >
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{company}</span>
                      {title && <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate ml-3">{title}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">or type manually</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* Company name input */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
              Company Name *
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                placeholder="e.g. Stripe, Notion, DeepMind, Monzo…"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
              />
            </div>
          </div>

          {/* Job title */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
              Role You Applied For <span className="normal-case tracking-normal text-slate-300 dark:text-slate-600">(optional — personalises the brief)</span>
            </label>
            <input
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Engineer, Product Manager, Data Scientist…"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!companyName.trim()}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-extrabold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            <Building2 size={15} />
            Generate Company Brief
          </button>

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 font-mono">
            Funding · Culture · Interview process · News · What to say · ~12 seconds
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-4 text-sm text-rose-700 dark:text-rose-400">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Research failed</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && <LoadingState />}

      {/* ── Results ── */}
      {result && (
        <div ref={resultsRef} className="space-y-4">

          {/* Company header bar */}
          <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-white font-extrabold text-lg tracking-tight">{result.company}</span>
                  {result.stage && <StageBadge value={result.stage} />}
                  {result.financial_health && <HealthBadge value={result.financial_health} />}
                </div>
                <p className="text-slate-400 text-sm">{result.tagline}</p>
                <div className="flex flex-wrap items-center gap-3">
                  {result.headquarters && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                      <MapPin size={9} /> {result.headquarters}
                    </span>
                  )}
                  {result.founded && (
                    <span className="text-[11px] font-mono text-slate-500">Est. {result.founded}</span>
                  )}
                  {result.total_funding && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <DollarSign size={9} /> {result.total_funding}
                    </span>
                  )}
                  {result.last_round && (
                    <span className="text-[11px] font-mono text-sky-400">{result.last_round}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setResult(null); setError(null) }}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-sky-400 font-semibold transition-colors shrink-0"
              >
                <RefreshCw size={11} /> New search
              </button>
            </div>
          </div>

          {/* Talk about / Avoid — most important, show first */}
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Talk about */}
            <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={13} className="text-white" />
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 font-extrabold">
                  Bring Up In The Interview
                </p>
              </div>
              <ul className="space-y-2">
                {result.talk_about?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Avoid */}
            <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-amber-500 flex items-center justify-center shrink-0">
                  <Shield size={13} className="text-white" />
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-amber-700 dark:text-amber-400 font-extrabold">
                  Handle With Care
                </p>
              </div>
              <ul className="space-y-2">
                {result.avoid?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[9px] font-extrabold flex items-center justify-center shrink-0 mt-0.5">!</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Role fit note */}
          {result.role_fit_note && (
            <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 px-5 py-4 flex gap-3">
              <Star size={14} className="text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-sky-700 dark:text-sky-400 font-extrabold mb-1">
                  {jobTitle ? `For Your ${jobTitle} Interview` : 'Role Fit Note'}
                </p>
                <p className="text-sm text-sky-900 dark:text-sky-200 leading-relaxed">{result.role_fit_note}</p>
              </div>
            </div>
          )}

          {/* Headcount + Glassdoor row */}
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Headcount */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users size={14} className="text-slate-400" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Team Size & Growth</p>
              </div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{result.headcount}</span>
                {result.headcount_trend && (
                  <div className="flex items-center gap-1.5">
                    <TrendIcon value={result.headcount_trend} />
                    <span className={cn('text-[10px] font-mono font-bold uppercase tracking-wide',
                      result.headcount_trend.includes('growth') || result.headcount_trend.includes('Growth')
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : result.headcount_trend.includes('Layoff')
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-500'
                    )}>
                      {result.headcount_trend}
                    </span>
                  </div>
                )}
              </div>
              {result.headcount_note && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{result.headcount_note}</p>
              )}
            </div>

            {/* Glassdoor */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={14} className="text-slate-400" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Employee Sentiment</p>
              </div>
              <div className="flex items-center gap-3 mb-2">
                {result.glassdoor_score && result.glassdoor_score !== 'N/A' && (
                  <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{result.glassdoor_score}</span>
                )}
                {result.glassdoor_sentiment && <SentimentBadge value={result.glassdoor_sentiment} />}
              </div>
              {result.culture_summary && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">{result.culture_summary}</p>
              )}
            </div>
          </div>

          {/* Interview culture */}
          {result.interview_culture && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={14} className="text-slate-400" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Interview Process</p>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{result.interview_culture}</p>
            </div>
          )}

          {/* Financial health */}
          {result.financial_note && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign size={14} className="text-slate-400" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Financial Health</p>
                </div>
                {result.financial_health && <HealthBadge value={result.financial_health} />}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{result.financial_note}</p>
            </div>
          )}

          {/* Recent news */}
          {result.recent_news?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Newspaper size={14} className="text-slate-400" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Recent News</p>
              </div>
              <div className="space-y-3">
                {result.recent_news.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className={cn('w-1.5 h-1.5 mt-2 shrink-0',
                      item.sentiment === 'Positive' ? 'bg-emerald-500' :
                      item.sentiment === 'Negative' ? 'bg-rose-500' : 'bg-slate-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-snug">{item.headline}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.date && <span className="text-[10px] font-mono text-slate-400">{item.date}</span>}
                        <SentimentBadge value={item.sentiment} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Red flags + Green flags */}
          <div className="grid sm:grid-cols-2 gap-3">
            {result.green_flags?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Star size={14} className="text-emerald-500" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-extrabold">Green Flags</p>
                </div>
                <ul className="space-y-2">
                  {result.green_flags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{f}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.red_flags?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Flame size={14} className="text-rose-500" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-rose-600 dark:text-rose-400 font-extrabold">Red Flags</p>
                </div>
                <ul className="space-y-2">
                  {result.red_flags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <XCircle size={12} className="text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{f}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Key products + competitors */}
          <div className="grid sm:grid-cols-2 gap-3">
            {result.key_products?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={14} className="text-slate-400" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Key Products</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.key_products.map((p, i) => (
                    <span key={i} className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5">{p}</span>
                  ))}
                </div>
                {result.competitive_edge && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {result.competitive_edge}
                  </p>
                )}
              </div>
            )}

            {result.main_competitors?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Zap size={14} className="text-slate-400" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Main Competitors</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.main_competitors.map((c, i) => (
                    <span key={i} className="text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5">{c}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              AI-generated research · Verify critical details before your interview
            </p>
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex items-center gap-1.5 text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors"
            >
              <RefreshCw size={11} /> Research another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
