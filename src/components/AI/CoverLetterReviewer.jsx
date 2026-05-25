import { useState } from 'react'
import { Loader2, Mail, Target, MessageSquare, Lightbulb } from 'lucide-react'
import { cn } from '../../lib/cn'
import { apiFetch } from '../../lib/api'

export default function CoverLetterReviewer() {
  const [coverLetter, setCoverLetter] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyse = async () => {
    if (!coverLetter.trim() || !jobDescription.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await apiFetch('/api/ai/cover-letter-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverLetter, jobDescription }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (err) {
      setError(err.message || 'Failed to analyse. Make sure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cover Letter Reviewer</h1>
        <p className="text-slate-500 text-sm mt-1">Analyse tone, relevance, gaps, and get rewrite suggestions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            rows={5}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:border-sky-400 focus:bg-white resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Cover Letter</label>
          <textarea
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            placeholder="Paste your cover letter here..."
            rows={8}
            className="w-full p-3 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-50 focus:outline-none focus:border-sky-400 focus:bg-white resize-none"
          />
        </div>
        <button
          onClick={handleAnalyse}
          disabled={loading || !coverLetter.trim() || !jobDescription.trim()}
          className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Analysing…</> : <><Mail size={16} /> Analyse Cover Letter</>}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">{error}</div>
      )}

      {result && <CoverLetterResult result={result} />}
    </div>
  )
}

function CoverLetterResult({ result }) {
  return (
    <div className="space-y-4">
      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <ScoreCard label="Relevance Score" value={result.relevance_score} icon={<Target size={18} className="text-sky-500" />} />
        <ScoreCard label="Tone" value={result.tone} isText icon={<MessageSquare size={18} className="text-violet-500" />} />
      </div>

      {/* What's missing */}
      {result.missing?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-bold text-slate-900 text-sm mb-3">What's Missing</p>
          <ul className="space-y-1.5">
            {result.missing.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rewrite suggestions */}
      {result.rewrites?.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <p className="font-bold text-slate-900 flex items-center gap-2">
            <Lightbulb size={16} className="text-sky-400" />
            Rewrite Suggestions
          </p>
          {result.rewrites.map((r, i) => (
            <div key={i} className="space-y-2">
              <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-rose-600 mb-1">Original</p>
                <p className="text-sm text-slate-700 italic">"{r.original}"</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-emerald-600 mb-1">Suggested</p>
                <p className="text-sm text-slate-700">"{r.rewrite}"</p>
              </div>
              {r.reason && <p className="text-xs text-slate-500 px-1">{r.reason}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreCard({ label, value, icon, isText }) {
  const num = isText ? null : (value ?? 0)
  const color = isText ? 'text-violet-700' : num >= 7 ? 'text-emerald-600' : num >= 5 ? 'text-amber-600' : 'text-rose-600'
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
      {icon}
      <div>
        <p className={cn('text-2xl font-black', color)}>{isText ? value : `${value}/10`}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
