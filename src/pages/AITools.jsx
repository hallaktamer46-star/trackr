import { useState } from 'react'
import { useParams, NavLink, useNavigate } from 'react-router-dom'
import { FileText, Mail, Send, Lock, Crown, Loader2, BookOpen, DollarSign, BarChart2, Building2, Link2 } from 'lucide-react'
import CVReviewer from '../components/AI/CVReviewer'
import CoverLetterReviewer from '../components/AI/CoverLetterReviewer'
import FollowUpGenerator from '../components/AI/FollowUpGenerator'
import InterviewPrep from '../components/AI/InterviewPrep'
import SalaryIntelligence from '../components/AI/SalaryIntelligence'
import MarketAnalysis from '../components/AI/MarketAnalysis'
import CompanyResearch from '../components/AI/CompanyResearch'
import LinkedInReviewer from '../components/AI/LinkedInReviewer'
import { useApplications } from '../contexts/ApplicationContext'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../lib/api'
import { cn } from '../lib/cn'

const TOOLS = [
  { key: 'cv',             path: '/ai/cv',             label: 'CV Reviewer',    icon: FileText,    component: CVReviewer          },
  { key: 'cover-letter',   path: '/ai/cover-letter',   label: 'Cover Letter',   icon: Mail,        component: CoverLetterReviewer },
  { key: 'follow-up',      path: '/ai/follow-up',      label: 'Follow-up',      icon: Send,        component: FollowUpGenerator   },
  { key: 'interview-prep', path: '/ai/interview-prep', label: 'Interview Prep', icon: BookOpen,    component: InterviewPrep,       hot: true },
  { key: 'salary',         path: '/ai/salary',         label: 'Salary Intel',   icon: DollarSign,  component: SalaryIntelligence,  hot: true },
  { key: 'market',         path: '/ai/market',         label: 'Market Intel',   icon: BarChart2,   component: MarketAnalysis,      hot: true },
  { key: 'company',        path: '/ai/company',        label: 'Company Brief',  icon: Building2,   component: CompanyResearch,     hot: true },
  { key: 'linkedin',       path: '/ai/linkedin',       label: 'LinkedIn',       icon: Link2,       component: LinkedInReviewer,    hot: true },
]

export default function AITools() {
  const { tool = 'cv' } = useParams()
  const { isPaidUser } = useApplications()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState(null)

  const handleUpgrade = async () => {
    if (!user) return
    setCheckoutLoading(true); setCheckoutError(null)
    try {
      const res = await apiFetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err) {
      setCheckoutError(err.message || 'Could not open checkout. Is the server running?')
      setCheckoutLoading(false)
    }
  }

  const active = TOOLS.find(t => t.key === tool) || TOOLS[0]
  const ActiveComponent = active.component

  return (
    <div className="max-w-4xl mx-auto relative">

      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-sky-500 font-bold mb-2">
          Trackr Assist
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">AI Toolkit</h1>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 max-w-xl">
          Precision feedback on your materials. Each tool is tuned to the role, not generic AI fluff.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 rounded-xl w-fit">
        {TOOLS.map(t => {
          const Icon = t.icon
          const isActive = t.key === tool
          return (
            <NavLink
              key={t.key}
              to={t.path}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-mono uppercase tracking-wider font-semibold transition-all',
                isActive
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <Icon size={13} /> {t.label}
              {t.hot && (
                <span className="absolute -top-1.5 -right-1.5 text-[8px] font-extrabold bg-sky-500 text-white px-1 py-0.5 leading-none tracking-wide uppercase">
                  NEW
                </span>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* Tool content */}
      <ActiveComponent />

      {/* Paywall overlay */}
      {!isPaidUser && (
        <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/85 backdrop-blur-md grid place-items-center p-8 rounded-2xl">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 max-w-md text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-900/30 grid place-items-center mx-auto mb-5">
              <Lock size={20} className="text-sky-500" />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-sky-500 font-bold mb-2">
              Pro Feature
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
              Unlock AI Tools
            </h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
              Tailored CV reviews, cover letter critiques and follow-up drafts. Triple your interview rate.
            </p>
            {checkoutError && <p className="text-xs text-rose-600 mb-4">{checkoutError}</p>}
            <button
              onClick={handleUpgrade}
              disabled={checkoutLoading}
              className="w-full h-11 bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-600 disabled:opacity-60 text-white font-mono uppercase tracking-widest text-[11px] rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {checkoutLoading
                ? <><Loader2 size={14} className="animate-spin" /> Opening checkout…</>
                : <><Crown size={14} /> Upgrade to Pro · $15/mo</>
              }
            </button>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 font-mono">Cancel anytime</p>
          </div>
        </div>
      )}
    </div>
  )
}
