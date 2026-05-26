import { useState } from 'react'
import { Loader2, Send, Copy, Check, ChevronDown } from 'lucide-react'
import { useApplications } from '../../contexts/ApplicationContext'
import { apiFetch } from '../../lib/api'

const SCENARIOS = [
  { value: 'after_applying',       label: 'Following up after applying'       },
  { value: 'after_interview',      label: 'After an interview'                },
  { value: 'no_response_2_weeks',  label: 'No response for 2 weeks'          },
  { value: 'decline_offer',        label: 'Declining an offer politely'       },
]

export default function FollowUpGenerator() {
  const { applications } = useApplications()
  const [selectedApp, setSelectedApp] = useState('')
  const [scenario, setScenario] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const app = applications.find(a => a.id === selectedApp)

  const handleGenerate = async () => {
    if (!app || !scenario) return
    setLoading(true)
    setEmail('')
    setError(null)
    try {
      const res = await apiFetch('/api/ai/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: app.company, jobTitle: app.job_title, scenario }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setEmail(data.email)
    } catch (err) {
      setError(err.message || 'Failed to generate. Make sure the API server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Follow-up Generator</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Generate a personalized, ready-to-send email for any stage of your job search.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        {/* Application selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Select Application</label>
          <div className="relative">
            <select
              value={selectedApp}
              onChange={e => setSelectedApp(e.target.value)}
              className="w-full appearance-none p-3 pr-9 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800"
            >
              <option value="">Choose an application…</option>
              {applications.map(a => (
                <option key={a.id} value={a.id}>{a.company} — {a.job_title}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Scenario selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5">Scenario</label>
          <div className="grid grid-cols-2 gap-2">
            {SCENARIOS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => setScenario(s.value)}
                className={`text-left px-3 py-2.5 rounded-xl border text-sm transition-all ${
                  scenario === s.value
                    ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !selectedApp || !scenario}
          className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Generating…</> : <><Send size={16} /> Generate Email</>}
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">{error}</div>
      )}

      {email && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-slate-900 dark:text-slate-100">Your Follow-up Email</p>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 font-medium"
            >
              {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans leading-relaxed bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
            {email}
          </pre>
        </div>
      )}
    </div>
  )
}
