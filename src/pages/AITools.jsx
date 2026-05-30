import { useState } from 'react'
import { useParams, NavLink, useNavigate } from 'react-router-dom'
import { Send, Lock, Crown, Loader2, BookOpen, DollarSign, BarChart2, Building2, Link2, Handshake, Rocket, Mic, GitCompare } from 'lucide-react'
import FollowUpGenerator from '../components/AI/FollowUpGenerator'
import InterviewPrep from '../components/AI/InterviewPrep'
import InterviewCoach from '../components/AI/InterviewCoach'
import SalaryIntelligence from '../components/AI/SalaryIntelligence'
import MarketAnalysis from '../components/AI/MarketAnalysis'
import CompanyResearch from '../components/AI/CompanyResearch'
import LinkedInReviewer from '../components/AI/LinkedInReviewer'
import NegotiationSimulator from '../components/AI/NegotiationSimulator'
import OfferComparison from '../components/AI/OfferComparison'
import { useApplications } from '../contexts/ApplicationContext'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../lib/api'

const TOOLS = [
  { key: 'follow-up',      path: '/ai/follow-up',      label: 'Follow-up',       desc: 'Chase with confidence',       icon: Send,       component: FollowUpGenerator,    accent: '#ffb689' },
  { key: 'interview-prep', path: '/ai/interview-prep', label: 'Interview Prep',  desc: 'Question bank for your role',    icon: BookOpen, component: InterviewPrep,        accent: '#ffb4ab', pro: true },
  { key: 'interview-coach', path: '/ai/interview-coach', label: 'Interview Coach', desc: 'Live mock interview + scorecard', icon: Mic,     component: InterviewCoach,       accent: '#ffb4ab', apex: true },
  { key: 'salary',         path: '/ai/salary',         label: 'Salary Intel',    desc: 'Know your market worth',      icon: DollarSign, component: SalaryIntelligence,   accent: '#a3c9ff', pro: true },
  { key: 'market',         path: '/ai/market',         label: 'Market Intel',    desc: 'Industry trends & signals',   icon: BarChart2,  component: MarketAnalysis,       accent: '#4edea3', pro: true },
  { key: 'company',        path: '/ai/company',        label: 'Company Brief',   desc: 'Deep-dive any employer',      icon: Building2,  component: CompanyResearch,      accent: '#ffb689', pro: true },
  { key: 'linkedin',       path: '/ai/linkedin',       label: 'LinkedIn',        desc: 'Optimise your profile',       icon: Link2,      component: LinkedInReviewer,     accent: '#ffb4ab', pro: true },
  { key: 'offer-compare',  path: '/ai/offer-compare',  label: 'Offer Comparison', desc: 'Compare & pick the best offer', icon: GitCompare, component: OfferComparison,     accent: '#a3c9ff', pro: true },
  { key: 'negotiate',      path: '/ai/negotiate',      label: 'Offer Simulator', desc: 'Practice salary negotiation', icon: Handshake,  component: NegotiationSimulator, accent: '#4edea3', apex: true },
]

export default function AITools() {
  const { tool = 'cv' } = useParams()
  const { isPaidUser, isApexUser } = useApplications()
  const { user } = useAuth()
  const navigate = useNavigate()

  const active = TOOLS.find(t => t.key === tool) || TOOLS[0]
  const ActiveComponent = active.component

  // Which paywall to show?
  const showProWall  = !isPaidUser
  const showApexWall = isPaidUser && !isApexUser && active.apex

  return (
    <div className="ai-sharp max-w-4xl mx-auto relative">

      {/* Header */}
      <div className="mb-7" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
        <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#a3c9ff', textTransform: 'uppercase', marginBottom: 4 }}>
          Trackr Assist
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', lineHeight: 1.15 }}>
          AI Toolkit
        </h1>
        <p style={{ fontSize: 13, color: '#8a919f', marginTop: 4 }}>
          Precision feedback on your materials. Each tool is tuned to the role, not generic AI fluff.
        </p>
      </div>

      {/* Tool picker grid */}
      <div className="grid grid-cols-4 gap-px mb-8" style={{ background: 'rgba(20,60,110,0.3)' }}>
        {TOOLS.map(t => {
          const Icon = t.icon
          const isActive = t.key === tool
          return (
            <NavLink
              key={t.key}
              to={t.path}
              className="tool-picker-card relative flex items-center gap-3 transition-all"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${t.accent}18 0%, #0d2040 100%)`
                  : '#0c1d35',
                padding: '14px 16px',
                borderLeft: isActive ? `2px solid ${t.accent}` : '2px solid transparent',
              }}
            >
              {/* Icon tile */}
              <div style={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? `${t.accent}18` : 'rgba(138,145,159,0.07)',
                border: `0.5px solid ${isActive ? t.accent + '40' : 'rgba(138,145,159,0.15)'}`,
                flexShrink: 0,
                transition: 'all 0.2s',
              }}>
                <Icon size={16} style={{ color: isActive ? t.accent : '#8a919f', transition: 'color 0.2s' }} />
              </div>

              {/* Label + desc */}
              <div className="min-w-0">
                <p style={{
                  fontFamily: 'Geist, Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: isActive ? '#e2e2e8' : '#c0c7d5',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                  marginBottom: 2,
                }}>
                  {t.label}
                </p>
                <p style={{
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 9,
                  color: isActive ? t.accent + 'cc' : '#404753',
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {t.desc}
                </p>
              </div>

              {/* Badge */}
              {t.apex ? (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  fontFamily: 'Geist Mono, monospace', fontSize: 7, fontWeight: 700,
                  letterSpacing: '0.06em',
                  background: 'linear-gradient(90deg, #4edea3, #a3c9ff)',
                  color: '#0d1117', padding: '2px 5px', lineHeight: 1.4,
                }}>
                  APEX
                </span>
              ) : t.pro ? (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  fontFamily: 'Geist Mono, monospace', fontSize: 7, fontWeight: 700,
                  letterSpacing: '0.06em',
                  background: '#1493ff',
                  color: '#fff', padding: '2px 5px', lineHeight: 1.4,
                }}>
                  PRO
                </span>
              ) : null}
            </NavLink>
          )
        })}
      </div>

      {/* Tool content — paywall scoped to this box only */}
      <div className="relative">
        <ActiveComponent />

        {/* Free → Pro paywall */}
        {showProWall && (
          <div className="absolute inset-0 grid place-items-center p-8" style={{ background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(8px)' }}>
            <div className="max-w-sm w-full text-center" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              <div className="w-11 h-11 flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(163,201,255,0.08)', border: '0.5px solid rgba(163,201,255,0.2)' }}>
                <Lock size={18} style={{ color: '#a3c9ff' }} />
              </div>
              <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#a3c9ff', textTransform: 'uppercase', marginBottom: 8 }}>
                Pro Feature
              </p>
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 8 }}>
                Unlock AI Tools
              </h2>
              <p style={{ fontSize: 13, color: '#8a919f', marginBottom: 28, lineHeight: 1.6 }}>
                Tailored CV reviews, cover letter critiques and follow-up drafts. Triple your interview rate.
              </p>
              <button
                onClick={() => navigate('/plans')}
                className="w-full flex items-center justify-center gap-2 transition-all hover:brightness-110"
                style={{ background: '#1493ff', color: '#fff', padding: '11px 0', fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                <Crown size={13} /> View Plans
              </button>
              <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#404753', marginTop: 12 }}>Cancel anytime · No hidden fees</p>
            </div>
          </div>
        )}

        {/* Pro → Apex paywall */}
        {showApexWall && (
          <div className="absolute inset-0 grid place-items-center p-8" style={{ background: 'rgba(13,17,23,0.92)', backdropFilter: 'blur(8px)' }}>
            <div className="max-w-sm w-full text-center" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
              <div className="w-11 h-11 flex items-center justify-center mx-auto mb-5" style={{ background: 'rgba(78,222,163,0.08)', border: '0.5px solid rgba(78,222,163,0.25)' }}>
                <Rocket size={18} style={{ color: '#4edea3' }} />
              </div>
              <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#4edea3', textTransform: 'uppercase', marginBottom: 8 }}>
                Apex Exclusive
              </p>
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 8 }}>
                Upgrade to Apex
              </h2>
              <p style={{ fontSize: 13, color: '#8a919f', marginBottom: 28, lineHeight: 1.6 }}>
                The Offer Simulator is exclusive to Apex. Practice real salary negotiations with an AI recruiter and get a full performance scorecard.
              </p>
              <button
                onClick={() => navigate('/plans')}
                className="w-full flex items-center justify-center gap-2 transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(90deg, #4edea3, #a3c9ff)', color: '#0d1117', padding: '11px 0', fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                <Rocket size={13} /> Upgrade to Apex — $29/mo
              </button>
              <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#404753', marginTop: 12 }}>Cancel anytime · No hidden fees</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
