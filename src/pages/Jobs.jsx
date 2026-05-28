import { useState, useMemo } from 'react'
import {
  Search, MapPin, DollarSign, Briefcase, Clock, Users, X,
  ChevronDown, Building2, Plus, Crown, CheckCircle2,
  Bookmark, Share2, ExternalLink, ArrowRight, Sparkles,
  Star, Filter, LayoutGrid, List, SlidersHorizontal
} from 'lucide-react'
import { cn } from '../lib/cn'
import { formatDistanceToNow, parseISO } from 'date-fns'

/* ─────────────────────────── static data ─────────────────────────── */

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Freelance']

const LOCATIONS = [
  'All Locations', 'Remote', 'New York', 'London', 'Berlin',
  'Dubai', 'Amsterdam', 'Singapore', 'Toronto', 'Sydney',
]

const SALARY_RANGES = [
  { label: 'Any Salary',    min: 0,      max: Infinity },
  { label: '$30k – $60k',   min: 30000,  max: 60000    },
  { label: '$60k – $100k',  min: 60000,  max: 100000   },
  { label: '$100k – $150k', min: 100000, max: 150000   },
  { label: '$150k+',        min: 150000, max: Infinity  },
]

const MOCK_JOBS = [
  {
    id: '1', sponsored: true,
    company: 'Stripe', companyColor: '#635BFF', logo: 'S',
    title: 'Senior Frontend Engineer', type: 'Full-time',
    location: 'Remote', salaryMin: 150000, salaryMax: 190000,
    currency: '$', rateType: 'yr', posted: '2026-05-24',
    description: "Join Stripe's dashboard team to build the financial tools that power millions of businesses worldwide. You'll work on complex, high-impact problems at scale.",
    requirements: ['React', 'TypeScript', '5+ yrs exp', 'System design'],
    responsibilities: [
      'Build and maintain high-quality user interfaces for Stripe Dashboard',
      'Collaborate with designers and product managers to ship features',
      'Mentor junior engineers and contribute to engineering culture',
      "Drive architectural decisions for the frontend platform",
    ],
    perks: ['Equity', 'Remote-first', 'Health insurance', '$3k learning budget'],
    applicants: 142, category: 'Engineering',
  },
  {
    id: '2', sponsored: true,
    company: 'Vercel', companyColor: '#171717', logo: '▲',
    title: 'Design Engineer', type: 'Full-time',
    location: 'Remote', salaryMin: 130000, salaryMax: 170000,
    currency: '$', rateType: 'yr', posted: '2026-05-23',
    description: "Help shape the future of the web at Vercel. You'll bridge the gap between design and engineering, building beautiful developer experiences used by millions.",
    requirements: ['React', 'CSS mastery', 'Figma', 'Motion design'],
    responsibilities: [
      'Design and implement UI components for vercel.com and internal tools',
      "Define and maintain Vercel's design system",
      'Work closely with marketing and product on new launches',
      'Prototype interactions and micro-animations',
    ],
    perks: ['Equity', 'Remote-first', 'Premium equipment', 'Unlimited PTO'],
    applicants: 89, category: 'Design',
  },
  {
    id: '3', sponsored: true,
    company: 'Linear', companyColor: '#5E6AD2', logo: 'L',
    title: 'Senior Product Manager', type: 'Full-time',
    location: 'San Francisco, CA', salaryMin: 140000, salaryMax: 185000,
    currency: '$', rateType: 'yr', posted: '2026-05-22',
    description: "Linear is looking for a PM who obsesses over product quality and UX. Join a small, high-calibre team building the issue tracker the world's best software companies rely on.",
    requirements: ['4+ yrs PM', 'B2B SaaS', 'Data-driven', 'Excellent writing'],
    responsibilities: [
      'Own end-to-end product areas from discovery to launch',
      'Work closely with engineering and design to ship high-quality features',
      'Define roadmap, success metrics and OKRs',
      'Communicate strategy clearly to the whole team',
    ],
    perks: ['Significant equity', 'Top-tier MacBook', 'Health & dental', 'Annual team offsite'],
    applicants: 67, category: 'Product',
  },
  {
    id: '4', sponsored: false,
    company: 'Notion', companyColor: '#000000', logo: 'N',
    title: 'Backend Engineer', type: 'Full-time',
    location: 'New York, NY', salaryMin: 120000, salaryMax: 160000,
    currency: '$', rateType: 'yr', posted: '2026-05-25',
    description: "Build the infrastructure that powers Notion for millions of users. You'll work on scalable, distributed systems that handle enormous data volumes with low latency.",
    requirements: ['Node.js', 'PostgreSQL', 'AWS', '4+ yrs exp'],
    responsibilities: [
      'Design and build scalable backend services',
      'Improve reliability and performance of core infrastructure',
      'Work with cross-functional teams on product features',
    ],
    perks: ['Equity', 'Health insurance', 'Flexible hours', 'Home office stipend'],
    applicants: 54, category: 'Engineering',
  },
  {
    id: '5', sponsored: false,
    company: 'Figma', companyColor: '#F24E1E', logo: 'F',
    title: 'UX Researcher', type: 'Full-time',
    location: 'Remote', salaryMin: 90000, salaryMax: 125000,
    currency: '$', rateType: 'yr', posted: '2026-05-24',
    description: "Help Figma understand how designers and developers use collaborative design tools. You'll run studies, synthesise insights, and directly shape the product roadmap.",
    requirements: ['Mixed methods', '3+ yrs UX research', 'Usability testing', 'Survey design'],
    responsibilities: [
      'Plan and execute qualitative and quantitative user research',
      'Synthesise research into clear, actionable insights',
      'Present findings to product and design leadership',
    ],
    perks: ['Equity', 'Remote option', 'Learning stipend', 'Conference budget'],
    applicants: 38, category: 'Design',
  },
  {
    id: '6', sponsored: false,
    company: 'Shopify', companyColor: '#96BF48', logo: 'SH',
    title: 'iOS Engineer', type: 'Full-time',
    location: 'Toronto, Canada', salaryMin: 110000, salaryMax: 145000,
    currency: '$', rateType: 'yr', posted: '2026-05-20',
    description: "Build world-class iOS experiences for Shopify merchants. You'll own features end-to-end, working with designers and PMs to ship polished apps loved by millions.",
    requirements: ['Swift', 'SwiftUI', '3+ yrs iOS', 'MVVM/TCA'],
    responsibilities: [
      'Build new features for the Shopify mobile app',
      'Write clean, testable, maintainable Swift code',
      'Participate in architecture and code reviews',
    ],
    perks: ['Equity', 'Fully remote', 'Extended benefits', '$2k home office'],
    applicants: 71, category: 'Engineering',
  },
  {
    id: '7', sponsored: false,
    company: 'Freelance Hub', companyColor: '#0EA5E9', logo: 'FH',
    title: 'React Developer — Contract', type: 'Freelance',
    location: 'Remote', salaryMin: 80, salaryMax: 120,
    currency: '$', rateType: 'hr', posted: '2026-05-26',
    description: 'An experienced React developer needed for a 3-month fintech SaaS project. ~30 hrs/week. Build a data-rich dashboard from Figma designs and integrate REST APIs.',
    requirements: ['React', 'TypeScript', 'Tailwind CSS', 'REST APIs'],
    responsibilities: [
      'Build the main dashboard UI from Figma designs',
      'Integrate with third-party REST APIs',
      'Implement secure authentication flows',
    ],
    perks: ['Flexible hours', 'Remote', 'Weekly payments', 'Contract extension possible'],
    applicants: 23, category: 'Engineering',
  },
  {
    id: '8', sponsored: false,
    company: 'Bolt', companyColor: '#34D399', logo: 'B',
    title: 'Marketing Manager', type: 'Part-time',
    location: 'London, UK', salaryMin: 40000, salaryMax: 55000,
    currency: '£', rateType: 'yr', posted: '2026-05-21',
    description: "Join Bolt's marketing team on a flexible part-time basis to drive growth in the UK market. Own campaigns, content strategy, and brand partnerships.",
    requirements: ['Digital marketing', '3+ yrs exp', 'Analytics tools', 'Content creation'],
    responsibilities: [
      'Plan and execute multi-channel marketing campaigns',
      'Manage social media presence and content calendar',
      'Report on KPIs and optimise spend',
    ],
    perks: ['Hybrid', 'Flexible schedule', 'Performance bonus', 'Team events'],
    applicants: 31, category: 'Marketing',
  },
  {
    id: '9', sponsored: false,
    company: 'Contentful', companyColor: '#FFB400', logo: 'CF',
    title: 'Developer Advocate', type: 'Full-time',
    location: 'Berlin, Germany', salaryMin: 85000, salaryMax: 110000,
    currency: '€', rateType: 'yr', posted: '2026-05-19',
    description: 'Contentful is looking for a developer advocate to build community, create technical content, and be the internal voice of developers. Travel 20-30% for conferences.',
    requirements: ['Public speaking', 'Technical writing', 'JavaScript', 'API experience'],
    responsibilities: [
      'Create tutorials, blog posts, and video content',
      'Represent Contentful at conferences and meetups',
      'Gather developer feedback and relay to product teams',
    ],
    perks: ['Equity', '€3k conference budget', 'Visa sponsorship', 'Relocation support'],
    applicants: 19, category: 'Engineering',
  },
  {
    id: '10', sponsored: false,
    company: 'Loom', companyColor: '#625DF5', logo: 'LM',
    title: 'Data Analyst', type: 'Full-time',
    location: 'Remote', salaryMin: 95000, salaryMax: 125000,
    currency: '$', rateType: 'yr', posted: '2026-05-18',
    description: "Loom is scaling fast and needs a sharp data analyst to turn user behaviour into product insights. You'll partner directly with product teams to influence roadmap decisions.",
    requirements: ['SQL', 'dbt', 'Python', 'Looker or Tableau'],
    responsibilities: [
      'Build and maintain dashboards for product and leadership',
      'Run ad-hoc analyses to answer critical business questions',
      'Partner with data engineers to improve data quality',
    ],
    perks: ['Equity', 'Remote-first', 'Generous PTO', 'Quarterly off-sites'],
    applicants: 44, category: 'Data',
  },
]

/* ─────────────────────────── helpers ─────────────────────────── */

function formatSalary(job) {
  if (job.rateType === 'hr') return `${job.currency}${job.salaryMin}–${job.salaryMax}/hr`
  const fmt = (n) => n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`
  return `${job.currency}${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`
}

function timeAgo(dateStr) {
  try { return formatDistanceToNow(parseISO(dateStr), { addSuffix: true }) }
  catch { return dateStr }
}

const TYPE_COLORS = {
  'Full-time': 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  'Part-time': 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800',
  'Freelance': 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
}

/* ─────────────────────────── List Card ─────────────────────────── */

function ListCard({ job, onClick }) {
  return (
    <div
      onClick={() => onClick(job)}
      className={cn(
        'group bg-white dark:bg-slate-900 border cursor-pointer transition-all duration-150',
        'hover:shadow-md dark:hover:shadow-slate-900/60',
        job.sponsored
          ? 'border-amber-300 dark:border-amber-700/70 hover:border-amber-400 dark:hover:border-amber-600'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
      )}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Logo */}
        <div
          className="w-10 h-10 flex items-center justify-center text-white text-xs font-extrabold shrink-0"
          style={{ background: job.companyColor }}
        >
          {job.logo}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{job.company}</p>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                {job.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {job.sponsored && (
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 px-2 py-0.5">
                  <Crown size={8} /> Sponsored
                </span>
              )}
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 border', TYPE_COLORS[job.type])}>
                {job.type}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <MapPin size={10} /> {job.location}
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <DollarSign size={10} /> {formatSalary(job)}
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-600">
              <Users size={10} /> {job.applicants}
              <span className="mx-1.5 text-slate-200 dark:text-slate-700">·</span>
              <Clock size={10} /> {timeAgo(job.posted)}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {job.requirements.slice(0, 4).map(r => (
              <span key={r} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 font-mono border border-slate-200 dark:border-slate-700">
                {r}
              </span>
            ))}
          </div>
        </div>

        <ArrowRight size={14} className="text-slate-300 dark:text-slate-700 group-hover:text-sky-500 dark:group-hover:text-sky-400 shrink-0 transition-colors" />
      </div>
    </div>
  )
}

/* ─────────────────────────── Grid Card ─────────────────────────── */

function GridCard({ job, onClick }) {
  return (
    <div
      onClick={() => onClick(job)}
      className={cn(
        'group bg-white dark:bg-slate-900 border cursor-pointer transition-all duration-150 flex flex-col',
        'hover:shadow-md dark:hover:shadow-slate-900/60',
        job.sponsored
          ? 'border-amber-300 dark:border-amber-700/70 hover:border-amber-400 dark:hover:border-amber-600'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
      )}
    >
      <div className="p-4 flex-1 flex flex-col">
        {/* Top row */}
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-9 h-9 flex items-center justify-center text-white text-xs font-extrabold"
            style={{ background: job.companyColor }}
          >
            {job.logo}
          </div>
          <div className="flex items-center gap-1.5">
            {job.sponsored && (
              <span className="flex items-center gap-0.5 text-[8px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 px-1.5 py-0.5">
                <Crown size={7} /> Sponsored
              </span>
            )}
            <span className={cn('text-[9px] font-semibold px-1.5 py-0.5 border', TYPE_COLORS[job.type])}>
              {job.type}
            </span>
          </div>
        </div>

        {/* Company + title */}
        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-0.5">{job.company}</p>
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 mb-3">
          {job.title}
        </h3>

        {/* Location + salary */}
        <div className="space-y-1 mb-3">
          <p className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin size={9} /> {job.location}
          </p>
          <p className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <DollarSign size={9} /> {formatSalary(job)}
          </p>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mt-auto">
          {job.requirements.slice(0, 3).map(r => (
            <span key={r} className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 font-mono border border-slate-200 dark:border-slate-700">
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-600">
          <Users size={9} /> {job.applicants}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-600">
          <Clock size={9} /> {timeAgo(job.posted)}
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────── Job Detail Modal ─────────────────────────── */

function JobDetailModal({ job, onClose }) {
  if (!job) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 pt-5 pb-4 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 flex items-center justify-center text-white font-extrabold text-lg"
                style={{ background: job.companyColor }}
              >
                {job.logo}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{job.company}</p>
                  {job.sponsored && (
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 px-1.5 py-0.5">
                      <Crown size={8} /> Sponsored
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{job.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className={cn('text-[11px] font-semibold px-2.5 py-1 border', TYPE_COLORS[job.type])}>
              {job.type}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1">
              <MapPin size={11} /> {job.location}
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 px-2.5 py-1">
              <DollarSign size={11} /> {formatSalary(job)}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1">
              <Clock size={11} /> {timeAgo(job.posted)}
            </span>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 font-mono mb-2">About the Role</h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{job.description}</p>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 font-mono mb-3">Responsibilities</h3>
            <ul className="space-y-2">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={14} className="text-sky-500 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 font-mono mb-3">Requirements</h3>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map(r => (
                <span key={r} className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-3 py-1.5">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 font-mono mb-3">Perks & Benefits</h3>
            <div className="flex flex-wrap gap-2">
              {job.perks.map(p => (
                <span key={p} className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1.5">
                  <Star size={10} className="text-emerald-500" /> {p}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3">
            <Users size={13} />
            <span><strong className="text-slate-600 dark:text-slate-300">{job.applicants}</strong> people have applied to this role</span>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center gap-3">
          <button className="flex-1 h-11 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
            Apply Now <ExternalLink size={14} />
          </button>
          <button className="h-11 px-4 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700 transition-colors">
            <Bookmark size={15} />
          </button>
          <button className="h-11 px-4 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 hover:border-sky-300 dark:hover:border-sky-700 transition-colors">
            <Share2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Post Job Modal ─────────────────────────── */

const EMPTY_JOB = {
  company: '', companyWebsite: '', title: '', type: 'Full-time', location: '',
  salaryMin: '', salaryMax: '', currency: '$', rateType: 'yr',
  description: '', requirements: '', perks: '', sponsored: false,
}

function PostJobModal({ onClose, onPost }) {
  const [form, setForm] = useState(EMPTY_JOB)
  const [step, setStep] = useState(1)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePost = () => {
    onPost({
      ...form,
      id: Date.now().toString(),
      logo: form.company?.[0]?.toUpperCase() || '?',
      companyColor: '#0EA5E9',
      salaryMin: Number(form.salaryMin) || 0,
      salaryMax: Number(form.salaryMax) || 0,
      posted: new Date().toISOString().split('T')[0],
      requirements: form.requirements.split(',').map(r => r.trim()).filter(Boolean),
      responsibilities: [],
      perks: form.perks.split(',').map(p => p.trim()).filter(Boolean),
      applicants: 0,
      category: 'Other',
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-bold font-mono text-sky-500">Post a Job</p>
            <h2 className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {step === 1 ? 'Business Details' : step === 2 ? 'Role Details' : 'Review & Publish'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(s => (
                <div key={s} className={cn('w-6 h-1.5 transition-all', step >= s ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700')} />
              ))}
            </div>
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {step === 1 && (
            <>
              <PostField label="Company Name *">
                <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Inc." className="post-inp" />
              </PostField>
              <PostField label="Company Website">
                <input value={form.companyWebsite} onChange={e => set('companyWebsite', e.target.value)} placeholder="https://acme.com" className="post-inp" />
              </PostField>
              <PostField label="Listing Type">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: false, label: 'Free Listing', desc: 'Standard visibility', icon: '✓' },
                    { val: true,  label: 'Sponsored',    desc: 'Top placement + badge', icon: '⭐' },
                  ].map(opt => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => set('sponsored', opt.val)}
                      className={cn(
                        'p-3 border text-left transition-all',
                        form.sponsored === opt.val
                          ? opt.val ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      )}
                    >
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{opt.icon} {opt.label}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </PostField>
            </>
          )}

          {step === 2 && (
            <>
              <PostField label="Job Title *">
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Senior Product Designer" className="post-inp" />
              </PostField>
              <div className="grid grid-cols-2 gap-3">
                <PostField label="Job Type">
                  <select value={form.type} onChange={e => set('type', e.target.value)} className="post-inp">
                    {JOB_TYPES.slice(1).map(t => <option key={t}>{t}</option>)}
                  </select>
                </PostField>
                <PostField label="Location">
                  <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Remote / London" className="post-inp" />
                </PostField>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <PostField label="Currency">
                  <select value={form.currency} onChange={e => set('currency', e.target.value)} className="post-inp">
                    {['$', '£', '€', 'AED'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </PostField>
                <PostField label="Min">
                  <input type="number" value={form.salaryMin} onChange={e => set('salaryMin', e.target.value)} placeholder="80000" className="post-inp" />
                </PostField>
                <PostField label="Max">
                  <input type="number" value={form.salaryMax} onChange={e => set('salaryMax', e.target.value)} placeholder="120000" className="post-inp" />
                </PostField>
              </div>
              <PostField label="Rate">
                <div className="flex gap-2">
                  {[['yr', 'Per year'], ['hr', 'Per hour']].map(([v, l]) => (
                    <button key={v} type="button" onClick={() => set('rateType', v)}
                      className={cn('flex-1 py-2 text-xs font-semibold border transition-all', form.rateType === v ? 'bg-sky-50 dark:bg-sky-900/30 border-sky-300 dark:border-sky-700 text-sky-700 dark:text-sky-300' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400')}>
                      {l}
                    </button>
                  ))}
                </div>
              </PostField>
              <PostField label="Description *">
                <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
                  placeholder="Describe the role, team, and what you are looking for…"
                  className="post-inp resize-none" />
              </PostField>
              <PostField label="Requirements (comma-separated)">
                <input value={form.requirements} onChange={e => set('requirements', e.target.value)} placeholder="React, TypeScript, 3+ yrs exp" className="post-inp" />
              </PostField>
              <PostField label="Perks & Benefits (comma-separated)">
                <input value={form.perks} onChange={e => set('perks', e.target.value)} placeholder="Remote, Equity, Health insurance" className="post-inp" />
              </PostField>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-500 flex items-center justify-center text-white font-bold text-sm">
                    {form.company?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{form.company}</p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{form.title}</p>
                  </div>
                  {form.sponsored && (
                    <span className="ml-auto flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700/50 px-2 py-0.5">
                      <Crown size={8} /> Sponsored
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className={cn('text-[10px] font-semibold px-2 py-0.5 border', TYPE_COLORS[form.type] || TYPE_COLORS['Full-time'])}>
                    {form.type}
                  </span>
                  {form.location && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin size={10} /> {form.location}
                    </span>
                  )}
                  {form.salaryMin && (
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <DollarSign size={10} /> {form.currency}{form.salaryMin}–{form.salaryMax}/{form.rateType}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Your listing will be visible to all Trackr users immediately.
                {form.sponsored && ' Sponsored listings appear at the top.'}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 pb-5 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
              Back
            </button>
          ) : <div />}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? !form.company : !form.title || !form.description}
              className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center gap-1.5"
            >
              Continue <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={handlePost} className="px-5 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white font-bold transition-colors flex items-center gap-1.5">
              Publish <CheckCircle2 size={14} />
            </button>
          )}
        </div>

        <style>{`
          .post-inp{width:100%;padding:8px 12px;border:1px solid #e2e8f0;font-size:13px;color:#0f172a;background:#f8fafc;outline:none;transition:all 0.15s;font-family:inherit;}
          .post-inp:focus{border-color:#38bdf8;background:white;box-shadow:0 0 0 3px rgba(56,189,248,0.1);}
          .post-inp::placeholder{color:#94a3b8;}
          .dark .post-inp{background:#1e293b;color:#f1f5f9;border-color:#334155;}
          .dark .post-inp:focus{background:#1e293b;border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,0.15);}
          .dark .post-inp::placeholder{color:#475569;}
        `}</style>
      </div>
    </div>
  )
}

function PostField({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">{label}</label>
      {children}
    </div>
  )
}

/* ─────────────────────────── Filter Dropdown ─────────────────────────── */

function FilterDropdown({ label, icon: Icon, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const isActive = value && value !== options[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 border text-xs font-semibold transition-all',
          isActive
            ? 'border-sky-400 dark:border-sky-600 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300'
            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
        )}
      >
        <Icon size={11} />
        {isActive ? (typeof value === 'string' ? value : value.label) : label}
        <ChevronDown size={10} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-slate-900/60 z-30 overflow-hidden py-1">
          {options.map(opt => {
            const label = typeof opt === 'string' ? opt : opt.label
            const cur = typeof value === 'string' ? value : value?.label
            return (
              <button
                key={label}
                onClick={() => { onChange(opt); setOpen(false) }}
                className={cn(
                  'w-full text-left px-4 py-2 text-xs transition-colors',
                  label === cur
                    ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────── Main Page ─────────────────────────── */

export default function Jobs() {
  const [jobs, setJobs] = useState(MOCK_JOBS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [salaryFilter, setSalaryFilter] = useState(SALARY_RANGES[0])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'grid'
  const [selectedJob, setSelectedJob] = useState(null)
  const [showPostModal, setShowPostModal] = useState(false)

  const activeFilterCount = [
    typeFilter !== 'All',
    locationFilter !== 'All Locations',
    salaryFilter !== SALARY_RANGES[0],
  ].filter(Boolean).length

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('All')
    setLocationFilter('All Locations')
    setSalaryFilter(SALARY_RANGES[0])
  }

  const filtered = useMemo(() => {
    return jobs.filter(j => {
      const q = search.toLowerCase()
      const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.requirements.some(r => r.toLowerCase().includes(q))
      const matchType = typeFilter === 'All' || j.type === typeFilter
      const matchLoc = locationFilter === 'All Locations' || j.location.toLowerCase().includes(locationFilter.toLowerCase())
      const salaryRef = j.rateType === 'yr' ? j.salaryMin : j.salaryMin * 2000
      const matchSalary = salaryRef >= salaryFilter.min && salaryRef <= salaryFilter.max
      return matchSearch && matchType && matchLoc && matchSalary
    })
  }, [jobs, search, typeFilter, locationFilter, salaryFilter])

  const sponsored = filtered.filter(j => j.sponsored)
  const free = filtered.filter(j => !j.sponsored)

  const handlePost = (newJob) => setJobs(prev => [newJob, ...prev])

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-sky-500 font-bold mb-1">Job Board</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Find Your Next Role
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Full-time, part-time and freelance from verified businesses.
          </p>
        </div>

        {/* Hiring CTA — prominently in the header */}
        <div className="shrink-0 flex flex-col items-end gap-2">
          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 h-10 pl-4 pr-5 bg-slate-900 dark:bg-sky-500 hover:bg-slate-700 dark:hover:bg-sky-600 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
          >
            <Building2 size={13} /> Hiring? Post a Job
          </button>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Free &amp; sponsored tiers</p>
        </div>
      </div>

      {/* ── Search bar + filter toggle + view toggle ── */}
      <div className="space-y-0">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search roles, companies, skills…"
              className="w-full pl-8 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 outline-none border border-slate-200 dark:border-slate-700 focus:border-sky-400 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />

          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={cn(
              'relative flex items-center gap-2 h-9 px-3 border text-xs font-semibold transition-all',
              filtersOpen || activeFilterCount > 0
                ? 'border-sky-500 bg-sky-500 text-white'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
            )}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 text-[10px] font-extrabold bg-white text-sky-600 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />

          {/* View toggle */}
          <div className="flex border border-slate-200 dark:border-slate-700 overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={cn('h-9 px-2.5 flex items-center justify-center transition-colors', viewMode === 'list' ? 'bg-slate-900 dark:bg-sky-500 text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn('h-9 px-2.5 flex items-center justify-center border-l border-slate-200 dark:border-slate-700 transition-colors', viewMode === 'grid' ? 'bg-slate-900 dark:bg-sky-500 text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>

        {/* ── Collapsible filter panel ── */}
        {filtersOpen && (
          <div className="border border-t-0 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-3 flex flex-wrap items-center gap-2">
            {/* Type chips */}
            <div className="flex gap-1">
              {JOB_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    'px-3 py-1.5 border text-[11px] font-semibold transition-all',
                    typeFilter === t
                      ? 'bg-slate-900 dark:bg-sky-500 text-white border-slate-900 dark:border-sky-500'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />

            <FilterDropdown label="Location" icon={MapPin} options={LOCATIONS} value={locationFilter} onChange={setLocationFilter} />
            <FilterDropdown label="Salary" icon={DollarSign} options={SALARY_RANGES} value={salaryFilter} onChange={setSalaryFilter} />

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold transition-colors"
              >
                <X size={11} /> Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Results meta ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          {filtered.length > 0
            ? <><span className="text-slate-700 dark:text-slate-300 font-bold">{filtered.length}</span> listings</>
            : 'No listings match'
          }
          {sponsored.length > 0 && (
            <span className="ml-3 text-amber-500 dark:text-amber-400">
              · <Crown size={9} className="inline mb-0.5" /> {sponsored.length} sponsored
            </span>
          )}
        </p>
      </div>

      {/* ── No results ── */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
            <Briefcase size={20} className="text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-[10px] uppercase tracking-widest font-mono text-sky-500 font-bold mb-2">No Results</p>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">No jobs found</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mb-5">Try adjusting your filters or search.</p>
          <button onClick={clearFilters} className="text-sm font-bold text-sky-500 hover:underline">Clear filters</button>
        </div>
      )}

      {/* ═══════════════ LIST VIEW ═══════════════ */}
      {viewMode === 'list' && filtered.length > 0 && (
        <div className="space-y-5">
          {/* Sponsored */}
          {sponsored.length > 0 && (
            <section className="space-y-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold font-mono text-amber-600 dark:text-amber-400">
                  <Crown size={10} /> Sponsored
                </span>
                <div className="flex-1 h-px bg-amber-200 dark:bg-amber-900/40" />
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">{sponsored.length}</span>
              </div>
              <div className="border-l-2 border-amber-300 dark:border-amber-700/60 space-y-px">
                {sponsored.map(job => <ListCard key={job.id} job={job} onClick={setSelectedJob} />)}
              </div>
            </section>
          )}

          {/* Free */}
          {free.length > 0 && (
            <section className="space-y-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold font-mono text-slate-400 dark:text-slate-500">
                  All Listings
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">{free.length}</span>
              </div>
              <div className="space-y-px">
                {free.map(job => <ListCard key={job.id} job={job} onClick={setSelectedJob} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ═══════════════ GRID VIEW ═══════════════ */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className="space-y-5">
          {/* Sponsored row */}
          {sponsored.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold font-mono text-amber-600 dark:text-amber-400">
                  <Crown size={10} /> Sponsored
                </span>
                <div className="flex-1 h-px bg-amber-200 dark:bg-amber-900/40" />
              </div>
              <div className="grid grid-cols-3 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                {sponsored.map(job => <GridCard key={job.id} job={job} onClick={setSelectedJob} />)}
              </div>
            </section>
          )}

          {/* Free grid */}
          {free.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold font-mono text-slate-400 dark:text-slate-500">
                  All Listings
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="grid grid-cols-3 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
                {free.map(job => <GridCard key={job.id} job={job} onClick={setSelectedJob} />)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      {showPostModal && <PostJobModal onClose={() => setShowPostModal(false)} onPost={handlePost} />}
    </div>
  )
}
