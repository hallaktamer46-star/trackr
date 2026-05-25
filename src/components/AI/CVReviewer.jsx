import { useState, useRef } from 'react'
import { Upload, Loader2, X, FileText, CheckCircle2, XCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/cn'
import { apiFetch } from '../../lib/api'

export default function CVReviewer() {
  const [cvText, setCvText]       = useState('')
  const [fileName, setFileName]   = useState(null)
  const [fileLoading, setFileLoading] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)
  const fileRef = useRef(null)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError(null)
    setFileLoading(true)
    setFileName(file.name)
    try {
      if (file.type === 'text/plain') {
        setCvText(await file.text())
      } else if (file.type === 'application/pdf') {
        const fd = new FormData()
        fd.append('file', file)
        const res = await apiFetch('/api/ai/parse-cv', { method: 'POST', body: fd })
        if (!res.ok) throw new Error((await res.json()).error)
        setCvText((await res.json()).text)
      }
    } catch (err) {
      setError(err.message || 'Failed to read file.')
      setFileName(null)
    } finally {
      setFileLoading(false)
      e.target.value = ''
    }
  }

  const clearFile = () => { setFileName(null); setCvText(''); setResult(null) }

  const handleAnalyse = async () => {
    if (!cvText.trim()) return
    setLoading(true); setResult(null); setError(null)
    try {
      const res = await apiFetch('/api/ai/cv-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText }),
      })
      if (!res.ok) throw new Error((await res.json()).error || await res.text())
      setResult(await res.json())
    } catch (err) {
      setError(err.message || 'Failed to analyse. Is the backend server running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CV Reviewer</h1>
        <p className="text-slate-500 text-sm mt-1">Get brutally honest, recruiter-level feedback on your resume.</p>
      </div>

      {/* Upload card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700">Paste your CV or upload a file</p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={fileLoading}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 border border-sky-200 hover:border-sky-400 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
          >
            {fileLoading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            Upload PDF or TXT
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.txt,application/pdf,text/plain" className="hidden" onChange={handleFile} />
        </div>

        {fileName && (
          <div className="flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-4 py-2.5">
            <FileText size={15} className="text-sky-500 shrink-0" />
            <span className="text-sm text-sky-800 font-medium flex-1 truncate">{fileName}</span>
            <button onClick={clearFile} className="text-sky-400 hover:text-rose-500 transition-colors"><X size={15} /></button>
          </div>
        )}

        <textarea
          value={cvText}
          onChange={e => { setCvText(e.target.value); if (fileName) setFileName(null) }}
          placeholder="Paste your entire CV / resume here, or upload a PDF / TXT above..."
          rows={10}
          className="w-full p-4 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:border-sky-400 focus:bg-white transition-colors resize-none leading-relaxed"
        />

        <button
          onClick={handleAnalyse}
          disabled={loading || !cvText.trim()}
          className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-sky-200"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Analysing your CV…</>
            : 'Analyse CV'}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
          <XCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {result && <CVResult result={result} />}
    </div>
  )
}

function ScoreRing({ score }) {
  const pct   = (score / 10) * 100
  const color = score >= 8 ? '#10b981' : score >= 6 ? '#f59e0b' : '#f43f5e'
  const r = 40, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="10" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-900">{score}</span>
        <span className="text-xs text-slate-400 font-medium">/ 10</span>
      </div>
    </div>
  )
}

function CVResult({ result }) {
  const [openIdx, setOpenIdx] = useState(null)
  const score = result.score ?? 0
  const label = score >= 8 ? 'Strong' : score >= 6 ? 'Good' : score >= 4 ? 'Needs Work' : 'Weak'
  const labelColor = score >= 8 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : score >= 6 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-rose-600 bg-rose-50 border-rose-200'

  return (
    <div className="space-y-5">

      {/* Score + summary */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex gap-6 items-center">
        <ScoreRing score={score} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full border', labelColor)}>{label}</span>
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">{result.summary}</p>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={18} className="text-emerald-500" />
            <h3 className="font-bold text-slate-900 text-sm">What's Working</h3>
          </div>
          <ul className="space-y-3">
            {(result.strengths || []).map((s, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={18} className="text-rose-400" />
            <h3 className="font-bold text-slate-900 text-sm">Holding You Back</h3>
          </div>
          <ul className="space-y-3">
            {(result.weaknesses || []).map((w, i) => (
              <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggestions */}
      {result.suggestions?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100">
            <Lightbulb size={18} className="text-amber-400" />
            <h3 className="font-bold text-slate-900 text-sm">Rewrite Suggestions</h3>
            <span className="ml-auto text-xs text-slate-400">{result.suggestions.length} improvements</span>
          </div>
          <div className="divide-y divide-slate-100">
            {result.suggestions.map((s, i) => (
              <div key={i}>
                <button
                  onClick={() => setOpenIdx(openIdx === i ? null : i)}
                  className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-600 italic flex-1 truncate">"{s.line}"</p>
                  {openIdx === i ? <ChevronUp size={15} className="text-slate-400 shrink-0" /> : <ChevronDown size={15} className="text-slate-400 shrink-0" />}
                </button>

                {openIdx === i && (
                  <div className="px-6 pb-5 space-y-3">
                    <div className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3">
                      <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide mb-1">Original</p>
                      <p className="text-sm text-slate-700 italic">"{s.line}"</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                      <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide mb-1">Suggested rewrite</p>
                      <p className="text-sm text-slate-800 font-medium">{s.suggestion}</p>
                    </div>
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
