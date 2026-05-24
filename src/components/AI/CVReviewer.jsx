import { useState, useRef } from 'react'
import { Upload, FileText, Loader2, Star, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/cn'

export default function CVReviewer() {
  const [cvText, setCvText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const fileRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type === 'text/plain') {
      const text = await file.text()
      setCvText(text)
    } else {
      setError('Please paste your CV text directly — PDF parsing requires a server-side setup.')
    }
  }

  const handleAnalyse = async () => {
    if (!cvText.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch('/api/ai/cv-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to analyse CV. Make sure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CV / Resume Reviewer</h1>
        <p className="text-slate-500 text-sm mt-1">Get an AI-powered score, strengths, weaknesses, and line-by-line improvements.</p>
      </div>

      {/* Input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">Paste your CV text</label>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-800 font-medium"
          >
            <Upload size={13} /> Upload .txt
          </button>
          <input ref={fileRef} type="file" accept=".txt" className="hidden" onChange={handleFile} />
        </div>
        <textarea
          value={cvText}
          onChange={e => setCvText(e.target.value)}
          placeholder="Paste your entire CV / resume here..."
          rows={12}
          className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:border-sky-400 focus:bg-white resize-none"
        />
        <button
          onClick={handleAnalyse}
          disabled={loading || !cvText.trim()}
          className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing…</> : <><FileText size={16} /> Analyse CV</>}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">{error}</div>
      )}

      {result && <CVResult result={result} />}
    </div>
  )
}

function CVResult({ result }) {
  const [expanded, setExpanded] = useState(null)
  const score = result.score ?? 0

  const scoreColor = score >= 7 ? 'text-emerald-600' : score >= 5 ? 'text-amber-600' : 'text-rose-600'
  const scoreBg   = score >= 7 ? 'bg-emerald-50 border-emerald-200' : score >= 5 ? 'bg-amber-50 border-amber-200' : 'bg-rose-50 border-rose-200'

  return (
    <div className="space-y-4">
      {/* Score */}
      <div className={cn('rounded-2xl border p-6 flex items-center gap-5', scoreBg)}>
        <div className="text-center min-w-[80px]">
          <p className={cn('text-5xl font-black', scoreColor)}>{score}</p>
          <p className="text-xs text-slate-500 mt-1">/ 10</p>
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg">Overall Score</p>
          <p className="text-sm text-slate-600 mt-1">{result.summary}</p>
        </div>
      </div>

      {/* Strengths / Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <Section icon={<TrendingUp size={16} className="text-emerald-500" />} title="Top Strengths" color="emerald">
          {(result.strengths || []).map((s, i) => (
            <li key={i} className="text-sm text-slate-700">{s}</li>
          ))}
        </Section>
        <Section icon={<TrendingDown size={16} className="text-rose-500" />} title="Areas to Improve" color="rose">
          {(result.weaknesses || []).map((w, i) => (
            <li key={i} className="text-sm text-slate-700">{w}</li>
          ))}
        </Section>
      </div>

      {/* Line suggestions */}
      {result.suggestions?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="font-bold text-slate-900 mb-3">Specific Suggestions</p>
          <div className="space-y-3">
            {result.suggestions.map((s, i) => (
              <div key={i} className="border border-slate-100 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                  onClick={() => setExpanded(expanded === i ? null : i)}
                >
                  <span className="flex items-center gap-2">
                    <Star size={14} className="text-sky-400 shrink-0" />
                    {s.line}
                  </span>
                  {expanded === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {expanded === i && (
                  <div className="px-4 pb-4 pt-1 bg-sky-50/50 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Suggestion</p>
                    <p className="text-sm text-slate-700">{s.suggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, color, children }) {
  return (
    <div className={cn('rounded-2xl border p-5', color === 'emerald' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200')}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <p className="font-bold text-slate-900 text-sm">{title}</p>
      </div>
      <ul className="space-y-2 list-disc list-inside">{children}</ul>
    </div>
  )
}
