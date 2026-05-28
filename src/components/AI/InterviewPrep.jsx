import { useState, useEffect, useRef } from 'react'
import {
  Loader2, ChevronDown, ChevronUp, Copy, Check,
  Users, Code2, Target, Lightbulb, Zap, BookOpen,
  AlertCircle, RefreshCw, Shield
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { apiFetch } from '../../lib/api'

/* ── loading messages that cycle while AI thinks ── */
const LOADING_STEPS = [
  { icon: '🔍', text: 'Analysing job requirements…'       },
  { icon: '🧠', text: 'Predicting likely questions…'      },
  { icon: '✍️',  text: 'Crafting tailored model answers…' },
  { icon: '⚡',  text: 'Sharpening the insider tips…'     },
  { icon: '📋', text: 'Finalising your prep kit…'         },
]

const CAT_ICONS = {
  users:     Users,
  code:      Code2,
  target:    Target,
  lightbulb: Lightbulb,
}

const CAT_ACCENTS = {
  Behavioral:  { ring: 'border-sky-500',    bg: 'bg-sky-500',    light: 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800',    text: 'text-sky-700 dark:text-sky-300'    },
  Technical:   { ring: 'border-violet-500', bg: 'bg-violet-500', light: 'bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-800', text: 'text-violet-700 dark:text-violet-300' },
  Motivation:  { ring: 'border-emerald-500',bg: 'bg-emerald-500',light: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300' },
  Situational: { ring: 'border-amber-500',  bg: 'bg-amber-500',  light: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',  text: 'text-amber-700 dark:text-amber-300'  },
}

/* ── single question card ── */
function QuestionCard({ question, index, catName, isOpen, onToggle }) {
  const [copied, setCopied] = useState(false)
  const accent = CAT_ACCENTS[catName] || CAT_ACCENTS.Behavioral

  const copyAnswer = async (e) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(question.answer)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn(
      'border bg-white dark:bg-slate-900 transition-all duration-200',
      isOpen
        ? `border-l-2 ${accent.ring} border-t border-r border-b border-slate-200 dark:border-slate-700`
        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
    )}>
      {/* Question header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-4 text-left group"
      >
        <span className={cn(
          'w-6 h-6 text-[11px] font-extrabold flex items-center justify-center shrink-0 transition-colors',
          isOpen ? `${accent.bg} text-white` : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
        )}>
          {index + 1}
        </span>
        <p className={cn(
          'flex-1 text-sm font-semibold leading-snug transition-colors',
          isOpen ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'
        )}>
          {question.q}
        </p>
        {isOpen
          ? <ChevronUp size={15} className="text-slate-400 shrink-0" />
          : <ChevronDown size={15} className="text-slate-400 shrink-0 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
        }
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">

          {/* Why they ask this */}
          <div className={cn('border px-4 py-3 flex gap-3', accent.light)}>
            <Shield size={14} className={cn('shrink-0 mt-0.5', accent.text)} />
            <div className="min-w-0">
              <p className={cn('text-[10px] font-extrabold uppercase tracking-widest font-mono mb-1', accent.text)}>
                Why they ask this
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {question.why}
              </p>
            </div>
          </div>

          {/* Model answer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest font-mono text-slate-400 dark:text-slate-500">
                Model Answer
              </p>
              <button
                onClick={copyAnswer}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
              >
                {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
              </button>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3">
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {question.answer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

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
      {/* Pulsing icon */}
      <div className="relative w-16 h-16 mx-auto">
        <div className="absolute inset-0 bg-sky-500/20 animate-ping" />
        <div className="relative w-16 h-16 bg-sky-500 flex items-center justify-center text-2xl">
          {cur.icon}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-2">
        <p className="text-white font-extrabold text-lg tracking-tight">Preparing your interview kit</p>
        <p className="text-sky-400 text-sm font-mono animate-pulse">{cur.text}</p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={cn('w-2 h-2 transition-all duration-500', i === step ? 'bg-sky-400 scale-125' : i < step ? 'bg-sky-700' : 'bg-slate-700')}
          />
        ))}
      </div>

      <p className="text-slate-500 text-xs font-mono">Usually takes 10–15 seconds</p>
    </div>
  )
}

/* ── results header summary ── */
function ResultsSummary({ result, onReset }) {
  const total = result.categories?.reduce((acc, c) => acc + (c.questions?.length || 0), 0) || 0
  const diffColors = {
    Junior: 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20',
    'Mid-level': 'text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20',
    Senior: 'text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20',
    Staff: 'text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20',
  }

  return (
    <div className="bg-slate-900 dark:bg-slate-950 border border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-sky-400" />
          <span className="text-white font-extrabold text-sm">{result.role}</span>
        </div>
        <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-1 border', diffColors[result.difficulty] || diffColors['Mid-level'])}>
          {result.difficulty}
        </span>
        <span className="text-[11px] text-slate-400 font-mono border border-slate-700 px-2 py-1 bg-slate-800">
          {result.company_type}
        </span>
        <span className="text-[11px] font-bold text-sky-400 border border-sky-900 bg-sky-900/20 px-2 py-1 font-mono">
          {total} questions
        </span>
      </div>
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-sky-400 font-semibold transition-colors"
      >
        <RefreshCw size={11} /> New prep
      </button>
    </div>
  )
}

/* ── main component ── */
export default function InterviewPrep() {
  const [jobDescription, setJobDescription] = useState('')
  const [candidateContext, setCandidateContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [activeCat, setActiveCat] = useState(0)
  const [expandedQ, setExpandedQ] = useState(null)
  const resultsRef = useRef(null)

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    setExpandedQ(null)

    try {
      const res = await apiFetch('/api/ai/interview-prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, candidateContext }),
      })
      if (!res.ok) throw new Error((await res.json()).error || await res.text())
      const data = await res.json()
      setResult(data)
      setActiveCat(0)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err) {
      setError(err.message || 'Failed to generate. Make sure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const currentCategory = result?.categories?.[activeCat]

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} className="text-sky-500" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Interview Prep</h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Paste the job description — get the exact questions they will ask, why they ask them, and a model answer tailored to that role. Go in prepared, not guessing.
        </p>
      </div>

      {/* ── Input card — hidden once result is showing ── */}
      {!result && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 p-6">

          {/* JD textarea */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
              Job Description *
            </label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here — the more detail you give, the more accurate the questions will be…"
              rows={11}
              className="w-full p-4 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Optional context */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
              About You <span className="normal-case tracking-normal text-slate-300 dark:text-slate-600">(optional — personalises the answers)</span>
            </label>
            <input
              value={candidateContext}
              onChange={e => setCandidateContext(e.target.value)}
              placeholder="e.g. 5 years React experience, currently a senior engineer at a fintech startup…"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!jobDescription.trim()}
            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-extrabold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={15} />
            Generate My Interview Prep Kit
          </button>

          <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 font-mono">
            16 tailored questions · Model answers · Insider tips · ~12 seconds
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
        <div ref={resultsRef} className="space-y-0">

          {/* Summary bar */}
          <ResultsSummary result={result} onReset={() => { setResult(null); setError(null) }} />

          {/* Category tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
            {result.categories?.map((cat, i) => {
              const Icon = CAT_ICONS[cat.icon] || BookOpen
              const accent = CAT_ACCENTS[cat.name] || CAT_ACCENTS.Behavioral
              const isActive = i === activeCat
              return (
                <button
                  key={cat.name}
                  onClick={() => { setActiveCat(i); setExpandedQ(null) }}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border-b-2 -mb-px',
                    isActive
                      ? `${accent.ring} text-slate-900 dark:text-slate-100`
                      : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  )}
                >
                  <Icon size={13} />
                  {cat.name}
                  <span className={cn(
                    'ml-0.5 text-[10px] font-extrabold px-1.5 py-0.5',
                    isActive ? `${accent.bg} text-white` : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'
                  )}>
                    {cat.questions?.length || 0}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Category description */}
          {currentCategory && (
            <div className="bg-slate-50 dark:bg-slate-800/50 border-x border-b border-slate-200 dark:border-slate-800 px-5 py-2.5 flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500">
                {currentCategory.description}
              </span>
            </div>
          )}

          {/* Questions list */}
          {currentCategory?.questions?.map((q, i) => (
            <QuestionCard
              key={`${activeCat}-${i}`}
              question={q}
              index={i}
              catName={currentCategory.name}
              isOpen={expandedQ === i}
              onToggle={() => setExpandedQ(expandedQ === i ? null : i)}
            />
          ))}

          {/* Bottom reset */}
          <div className="bg-white dark:bg-slate-900 border border-t-0 border-slate-200 dark:border-slate-800 px-5 py-4 flex items-center justify-between">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
              {result.categories?.reduce((a, c) => a + (c.questions?.length || 0), 0)} questions across {result.categories?.length} categories
            </p>
            <button
              onClick={() => { setResult(null); setError(null) }}
              className="flex items-center gap-1.5 text-xs font-bold text-sky-500 hover:text-sky-600 transition-colors"
            >
              <RefreshCw size={11} /> Prep for a different role
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
