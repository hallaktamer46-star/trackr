import { useParams, NavLink } from 'react-router-dom'
import { FileText, Mail, MessageSquare, Lock } from 'lucide-react'
import CVReviewer from '../components/AI/CVReviewer'
import CoverLetterReviewer from '../components/AI/CoverLetterReviewer'
import FollowUpGenerator from '../components/AI/FollowUpGenerator'
import { useApplications } from '../contexts/ApplicationContext'
import { cn } from '../lib/cn'

const TOOLS = [
  { key: 'cv',           path: '/ai/cv',           label: 'CV Reviewer',         icon: FileText,     component: CVReviewer          },
  { key: 'cover-letter', path: '/ai/cover-letter', label: 'Cover Letter',         icon: Mail,         component: CoverLetterReviewer },
  { key: 'follow-up',    path: '/ai/follow-up',    label: 'Follow-up Generator',  icon: MessageSquare,component: FollowUpGenerator   },
]

export default function AITools() {
  const { tool = 'cv' } = useParams()
  const { isPaidUser } = useApplications()

  const active = TOOLS.find(t => t.key === tool) || TOOLS[0]
  const ActiveComponent = active.component

  if (!isPaidUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-5">
          <Lock size={28} className="text-violet-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">AI Coaching is a Pro feature</h2>
        <p className="text-slate-500 text-sm max-w-xs mb-6">
          Upgrade to Trackr Pro for $15/month to unlock the CV Reviewer, Cover Letter Reviewer, and Follow-up Generator.
        </p>
        <a
          href="#upgrade"
          className="px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Upgrade to Pro
        </a>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">AI Coaching</h1>
        <p className="text-slate-500 text-sm mt-0.5">Three tools to sharpen your applications and land more interviews.</p>
      </div>

      {/* Tool tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {TOOLS.map(t => {
          const Icon = t.icon
          return (
            <NavLink
              key={t.key}
              to={t.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors border',
                  isActive
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700'
                )
              }
            >
              <Icon size={15} />
              {t.label}
            </NavLink>
          )
        })}
      </div>

      <ActiveComponent />
    </div>
  )
}
