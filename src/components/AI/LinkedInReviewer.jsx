import { useState, useEffect, useRef } from 'react'
import {
  AlertCircle, RefreshCw, Zap, Copy, Check,
  TrendingUp, Search, Star, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, AlertTriangle, ArrowRight,
  Info, Users, Hash
} from 'lucide-react'

/* ── LinkedIn logo SVG (lucide-react doesn't include it) ── */
function LinkedinIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}
import { cn } from '../../lib/cn'
import { apiFetch } from '../../lib/api'

/* ── loading messages ── */
const LOADING_STEPS = [
  { icon: '🔍', text: 'Analysing recruiter visibility…'       },
  { icon: '🎯', text: 'Scoring keyword alignment…'            },
  { icon: '✍️',  text: 'Rewriting your headline options…'     },
  { icon: '📝', text: 'Critiquing your About section…'        },
  { icon: '⚡',  text: 'Building your optimisation report…'   },
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
        <div className="absolute inset-0 bg-[#0a66c2]/30 animate-ping" />
        <div className="relative w-16 h-16 bg-[#0a66c2] flex items-center justify-center text-2xl">
          {cur.icon}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-white font-extrabold text-lg tracking-tight">Reviewing your LinkedIn profile</p>
        <p className="text-[#70b5f9] text-sm font-mono animate-pulse">{cur.text}</p>
      </div>
      <div className="flex items-center justify-center gap-2">
        {LOADING_STEPS.map((_, i) => (
          <div key={i} className={cn('w-2 h-2 transition-all duration-500',
            i === step ? 'bg-[#0a66c2] scale-125' : i < step ? 'bg-[#0a66c2]/40' : 'bg-slate-700'
          )} />
        ))}
      </div>
      <p className="text-slate-500 text-xs font-mono">Usually takes 12–18 seconds</p>
    </div>
  )
}

/* ── visibility score ring ── */
function VisibilityRing({ score }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#0a66c2' : score >= 30 ? '#f59e0b' : '#f43f5e'
  const label = score >= 75 ? 'High Visibility' : score >= 50 ? 'Moderate' : score >= 30 ? 'Low Visibility' : 'Nearly Invisible'
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="96" height="96" className="rotate-[-90deg]">
        <circle cx="48" cy="48" r={r} fill="none" stroke="currentColor" strokeWidth="6"
          className="text-slate-200 dark:text-slate-700" />
        <circle cx="48" cy="48" r={r} fill="none" strokeWidth="6"
          stroke={color} strokeLinecap="square"
          strokeDasharray={`${fill} ${circ - fill}`} />
      </svg>
      <div className="text-center -mt-1">
        <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-none">
          {score}<span className="text-base font-normal text-slate-400">/100</span>
        </p>
        <p className="text-[11px] font-mono uppercase tracking-widest mt-1 font-bold" style={{ color }}>{label}</p>
      </div>
    </div>
  )
}

/* ── copyable text block ── */
function CopyBlock({ text, label }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">{label}</span>
          <button onClick={copy} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#0a66c2] transition-colors font-semibold">
            {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
          </button>
        </div>
      )}
      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3">
        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">{text}</p>
      </div>
    </div>
  )
}

/* ── headline option card ── */
function HeadlineOption({ headline, reasoning, index, isRecommended }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(headline)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className={cn(
      'border p-4 transition-all',
      isRecommended
        ? 'border-[#0a66c2] bg-[#0a66c2]/5 dark:bg-[#0a66c2]/10'
        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
    )}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            'w-5 h-5 text-[10px] font-extrabold flex items-center justify-center shrink-0',
            isRecommended ? 'bg-[#0a66c2] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          )}>
            {index + 1}
          </span>
          {isRecommended && (
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#0a66c2] border border-[#0a66c2]/30 px-1.5 py-0.5">
              Recommended
            </span>
          )}
        </div>
        <button onClick={copy} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#0a66c2] transition-colors font-semibold shrink-0">
          {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
        </button>
      </div>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-2">{headline}</p>
      {reasoning && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{reasoning}</p>
      )}
    </div>
  )
}

/* ── section score badge ── */
function SectionScore({ score }) {
  const color = score >= 80 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
    : score >= 60 ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800'
    : score >= 40 ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
  return (
    <span className={cn('text-xs font-extrabold font-mono border px-2 py-0.5', color)}>{score}/100</span>
  )
}

/* ── main component ── */
export default function LinkedInReviewer() {
  const [headline,    setHeadline]    = useState('')
  const [about,       setAbout]       = useState('')
  const [targetRole,  setTargetRole]  = useState('')
  const [loading,     setLoading]     = useState(false)
  const [result,      setResult]      = useState(null)
  const [error,       setError]       = useState(null)
  const [aboutOpen,   setAboutOpen]   = useState(false)
  const resultsRef = useRef(null)

  const handleGenerate = async () => {
    if (!headline.trim() && !about.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const res = await apiFetch('/api/ai/linkedin-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, about, targetRole }),
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

  const canGenerate = headline.trim() || about.trim()

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <LinkedinIcon size={16} className="text-[#0a66c2]" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">LinkedIn Reviewer</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          80% of recruiters search LinkedIn before reaching out. Get your recruiter visibility score, headline rewrites, About section feedback, and the exact keywords you're missing.
        </p>
      </div>

      {/* ── How to use note ── */}
      {!result && !loading && (
        <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3">
          <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            LinkedIn blocks external access, so paste your content directly. Open your profile → copy your headline and About section → paste below. Takes 30 seconds.
          </p>
        </div>
      )}

      {/* ── Input form ── */}
      {!result && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 p-6">

          {/* Headline */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
                Current Headline *
              </label>
              <span className={cn('text-[10px] font-mono', headline.length > 220 ? 'text-rose-500' : 'text-slate-400')}>
                {headline.length}/220
              </span>
            </div>
            <input
              value={headline}
              onChange={e => setHeadline(e.target.value)}
              placeholder="e.g. Software Engineer at Acme | React · Node.js · Building products people love"
              maxLength={240}
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-[#0a66c2] focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
              Your headline appears in every recruiter search result — it's the single highest-impact field on LinkedIn
            </p>
          </div>

          {/* About section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
                About Section <span className="normal-case tracking-normal text-slate-300 dark:text-slate-600">(optional but strongly recommended)</span>
              </label>
              <span className={cn('text-[10px] font-mono', about.length > 2600 ? 'text-rose-500' : 'text-slate-400')}>
                {about.length}/2600
              </span>
            </div>
            <textarea
              value={about}
              onChange={e => setAbout(e.target.value)}
              placeholder="Paste your LinkedIn About section here…"
              rows={7}
              maxLength={2700}
              className="w-full p-4 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-[#0a66c2] focus:bg-white dark:focus:bg-slate-800 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Target role */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
              Target Role / Industry <span className="normal-case tracking-normal text-slate-300 dark:text-slate-600">(optional — optimises keywords)</span>
            </label>
            <input
              value={targetRole}
              onChange={e => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Product Manager at a fintech startup, Data Engineer in London…"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-[#0a66c2] focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full py-3.5 bg-[#0a66c2] hover:bg-[#004182] disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-extrabold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            <LinkedinIcon size={15} />
            Review My LinkedIn Profile
          </button>

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 font-mono">
            Visibility score · Headline rewrites · About feedback · Keyword gaps · ~15 seconds
          </p>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 p-4 text-sm text-rose-700 dark:text-rose-400">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Review failed</p>
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
                <LinkedinIcon size={14} className="text-[#0a66c2]" />
                <span className="text-white font-extrabold text-sm">LinkedIn Review</span>
              </div>
              {result.visibility_score != null && (
                <span className={cn(
                  'text-[11px] font-bold font-mono border px-2 py-1',
                  result.visibility_score >= 75 ? 'text-emerald-400 border-emerald-900 bg-emerald-900/20' :
                  result.visibility_score >= 50 ? 'text-[#70b5f9] border-[#0a66c2]/50 bg-[#0a66c2]/10' :
                  'text-amber-400 border-amber-900 bg-amber-900/20'
                )}>
                  {result.visibility_score}/100 visibility
                </span>
              )}
              {result.missing_keywords?.length > 0 && (
                <span className="text-[11px] font-mono text-rose-400 border border-rose-900 bg-rose-900/20 px-2 py-1">
                  {result.missing_keywords.length} keywords missing
                </span>
              )}
            </div>
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-[#0a66c2] font-semibold transition-colors"
            >
              <RefreshCw size={11} /> Review again
            </button>
          </div>

          {/* Score + quick wins side by side */}
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Visibility score */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center gap-4">
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold self-start">
                Recruiter Visibility Score
              </p>
              <VisibilityRing score={result.visibility_score || 0} />
              {result.visibility_verdict && (
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-center">{result.visibility_verdict}</p>
              )}
            </div>

            {/* Quick wins */}
            {result.quick_wins?.length > 0 && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={14} className="text-amber-500" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Fix These Today</p>
                </div>
                <ul className="space-y-2.5">
                  {result.quick_wins.map((win, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight size={11} className="text-amber-500 shrink-0 mt-1" />
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{win}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Headline section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-slate-400" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Headline Analysis</p>
              </div>
              {result.headline_score != null && <SectionScore score={result.headline_score} />}
            </div>

            {/* Current headline */}
            {headline && (
              <div className="space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">Current</p>
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{headline}</p>
                </div>
              </div>
            )}

            {/* Headline issues */}
            {result.headline_issues?.length > 0 && (
              <div className="space-y-1.5">
                {result.headline_issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 dark:text-slate-400">{issue}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Headline rewrites */}
            {result.headline_rewrites?.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">Suggested Rewrites</p>
                {result.headline_rewrites.map((h, i) => (
                  <HeadlineOption
                    key={i}
                    headline={h.text}
                    reasoning={h.reasoning}
                    index={i}
                    isRecommended={i === 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* About section */}
          {(result.about_score != null || result.about_feedback) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-400" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">About Section</p>
                </div>
                {result.about_score != null && <SectionScore score={result.about_score} />}
              </div>

              {/* Feedback points */}
              {result.about_feedback?.length > 0 && (
                <ul className="space-y-2">
                  {result.about_feedback.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className={cn('shrink-0 mt-0.5',
                        item.type === 'good' ? 'text-emerald-500' :
                        item.type === 'bad'  ? 'text-rose-500' : 'text-amber-500'
                      )}>
                        {item.type === 'good'
                          ? <CheckCircle2 size={12} />
                          : item.type === 'bad'
                            ? <XCircle size={12} />
                            : <AlertTriangle size={12} />
                        }
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{item.text}</p>
                    </li>
                  ))}
                </ul>
              )}

              {/* Rewritten about */}
              {result.about_rewrite && (
                <div>
                  <button
                    onClick={() => setAboutOpen(v => !v)}
                    className="flex items-center gap-2 w-full text-left"
                  >
                    <p className="text-[10px] font-mono uppercase tracking-widest text-[#0a66c2] font-semibold flex-1">
                      View Rewritten About Section
                    </p>
                    {aboutOpen ? <ChevronUp size={13} className="text-slate-400" /> : <ChevronDown size={13} className="text-slate-400" />}
                  </button>
                  {aboutOpen && (
                    <div className="mt-3">
                      <CopyBlock text={result.about_rewrite} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Missing keywords */}
          {result.missing_keywords?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search size={14} className="text-slate-400" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
                  Keywords Recruiters Search For — You're Missing These
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {result.missing_keywords.map((kw, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs font-semibold bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 px-3 py-1.5">
                    <XCircle size={10} /> {kw}
                  </span>
                ))}
              </div>
              {result.keywords_present?.length > 0 && (
                <>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-2 mt-4">Already Present</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords_present.map((kw, i) => (
                      <span key={i} className="flex items-center gap-1 text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-3 py-1.5">
                        <CheckCircle2 size={10} /> {kw}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Profile completeness checklist */}
          {result.profile_checklist?.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star size={14} className="text-slate-400" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
                  Profile Completeness
                </p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {result.profile_checklist.map((item, i) => (
                  <div key={i} className={cn(
                    'flex items-center gap-2.5 px-3 py-2 border',
                    item.done
                      ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  )}>
                    {item.done
                      ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      : <XCircle size={13} className="text-slate-300 dark:text-slate-600 shrink-0" />
                    }
                    <span className={cn('text-xs font-semibold',
                      item.done ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-400'
                    )}>
                      {item.label}
                    </span>
                    {item.impact && !item.done && (
                      <span className="ml-auto text-[9px] font-mono text-amber-600 dark:text-amber-400 shrink-0">{item.impact}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom reset */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              Based on LinkedIn's recruiter search algorithm and best practices
            </p>
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex items-center gap-1.5 text-xs font-bold text-[#0a66c2] hover:text-[#004182] transition-colors"
            >
              <RefreshCw size={11} /> Review again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
