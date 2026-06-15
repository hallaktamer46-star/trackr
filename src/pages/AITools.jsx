import { useParams, NavLink, useNavigate } from 'react-router-dom'
import { Send, Lock, Crown, BookOpen, DollarSign, BarChart2, Building2, Link2, Handshake, Rocket, Mic, GitCompare, Zap, Star } from 'lucide-react'
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
import { useNavigate as useNav } from 'react-router-dom'

const TOOLS = [
  { key: 'follow-up',       path: '/ai/follow-up',       label: 'Follow-up',       desc: 'Chase with confidence',           icon: Send,       component: FollowUpGenerator,    accent: '#ffb689', tier: 'free'  },
  { key: 'interview-prep',  path: '/ai/interview-prep',  label: 'Interview Prep',  desc: 'Question bank for your role',     icon: BookOpen,   component: InterviewPrep,        accent: '#ffb4ab', tier: 'pro'   },
  { key: 'salary',          path: '/ai/salary',          label: 'Salary Intel',    desc: 'Know your market worth',          icon: DollarSign, component: SalaryIntelligence,   accent: '#a3c9ff', tier: 'pro'   },
  { key: 'market',          path: '/ai/market',          label: 'Market Intel',    desc: 'Industry trends & signals',       icon: BarChart2,  component: MarketAnalysis,       accent: '#4edea3', tier: 'pro'   },
  { key: 'company',         path: '/ai/company',         label: 'Company Brief',   desc: 'Deep-dive any employer',          icon: Building2,  component: CompanyResearch,      accent: '#ffb689', tier: 'pro'   },
  { key: 'linkedin',        path: '/ai/linkedin',        label: 'LinkedIn',        desc: 'Optimise your profile',           icon: Link2,      component: LinkedInReviewer,     accent: '#ffb4ab', tier: 'pro'   },
  { key: 'offer-compare',   path: '/ai/offer-compare',   label: 'Offer Comparison',desc: 'Compare & pick the best offer',   icon: GitCompare, component: OfferComparison,      accent: '#a3c9ff', tier: 'pro'   },
  { key: 'interview-coach', path: '/ai/interview-coach', label: 'Interview Coach', desc: 'Live mock interview + scorecard', icon: Mic,        component: InterviewCoach,       accent: '#ffb4ab', tier: 'apex'  },
  { key: 'negotiate',       path: '/ai/negotiate',       label: 'Offer Simulator', desc: 'Practice salary negotiation',     icon: Handshake,  component: NegotiationSimulator, accent: '#4edea3', tier: 'apex'  },
]

const FREE_TOOLS  = TOOLS.filter(t => t.tier === 'free')
const PRO_TOOLS   = TOOLS.filter(t => t.tier === 'pro')
const APEX_TOOLS  = TOOLS.filter(t => t.tier === 'apex')

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const SANS = 'Geist, Inter, sans-serif'

function TierDivider({ label, color, gradient }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, marginTop: 4 }}>
      <span style={{
        fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
        textTransform: 'uppercase',
        background: gradient ? 'linear-gradient(90deg, #4edea3, #a3c9ff)' : 'none',
        WebkitBackgroundClip: gradient ? 'text' : 'unset',
        WebkitTextFillColor: gradient ? 'transparent' : color,
        color: gradient ? 'transparent' : color,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '0.5px', background: gradient
        ? 'linear-gradient(90deg, rgba(78,222,163,0.3), rgba(163,201,255,0.1), transparent)'
        : `linear-gradient(90deg, ${color}40, transparent)` }} />
    </div>
  )
}

function ToolCard({ t, tool, cols = 3 }) {
  const Icon = t.icon
  const isActive = t.key === tool
  return (
    <NavLink
      to={t.path}
      style={{
        position: 'relative', display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        background: isActive
          ? `linear-gradient(135deg, ${t.accent}14 0%, rgba(12,29,53,0.95) 100%)`
          : 'rgba(10,16,28,0.8)',
        borderLeft: `2px solid ${isActive ? t.accent : 'transparent'}`,
        borderBottom: '0.5px solid rgba(163,201,255,0.04)',
        transition: 'all 0.15s',
        textDecoration: 'none',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = `${t.accent}08`; e.currentTarget.style.borderLeftColor = `${t.accent}40` } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(10,16,28,0.8)'; e.currentTarget.style.borderLeftColor = 'transparent' } }}
    >
      {/* corner glow on active */}
      {isActive && (
        <div style={{
          position: 'absolute', top: -10, left: -10, width: 60, height: 60,
          borderRadius: '50%', pointerEvents: 'none',
          background: `radial-gradient(circle, ${t.accent}25 0%, transparent 70%)`,
          filter: 'blur(6px)',
        }} />
      )}

      {/* icon */}
      <div style={{
        width: 34, height: 34, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isActive ? `${t.accent}15` : 'rgba(255,255,255,0.03)',
        border: `0.5px solid ${isActive ? t.accent + '40' : 'rgba(255,255,255,0.05)'}`,
        transition: 'all 0.15s',
      }}>
        <Icon size={15} style={{ color: isActive ? t.accent : '#4a5568', transition: 'color 0.15s' }} />
      </div>

      {/* text */}
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{
          fontFamily: SANS, fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em',
          color: isActive ? '#e2e2e8' : '#6b7583', lineHeight: 1.2, marginBottom: 2,
          transition: 'color 0.15s',
        }}>
          {t.label}
        </p>
        <p style={{
          fontFamily: MONO, fontSize: 9, letterSpacing: '0.02em',
          color: isActive ? `${t.accent}99` : '#2a3040', lineHeight: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {t.desc}
        </p>
      </div>
    </NavLink>
  )
}

export default function AITools() {
  const { tool = 'follow-up' } = useParams()
  const { isPaidUser, isApexUser } = useApplications()
  const navigate = useNavigate()

  const active = TOOLS.find(t => t.key === tool) || TOOLS[0]
  const ActiveComponent = active.component

  const showProWall  = !isPaidUser && (active.tier === 'pro' || active.tier === 'apex')
  const showApexWall = isPaidUser && !isApexUser && active.tier === 'apex'

  // Badge logic: apex users see nothing, pro users skip PRO badge, free users see both
  const getBadge = (t) => {
    if (isApexUser) return null
    if (isPaidUser && t.tier === 'pro') return null
    if (t.tier === 'apex') return 'apex'
    if (t.tier === 'pro') return 'pro'
    return null
  }

  return (
    <div className="ai-sharp max-w-5xl mx-auto" style={{ fontFamily: SANS }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(163,201,255,0.5)', textTransform: 'uppercase', marginBottom: 6 }}>
          Trackr Assist
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', lineHeight: 1.15, marginBottom: 6 }}>
          AI Toolkit
        </h1>
        <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.5 }}>
          Precision tools tuned to your role. Not generic AI fluff.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 2, alignItems: 'start' }}>

        {/* ── LEFT NAV ── */}
        <div style={{
          background: 'linear-gradient(180deg, #0a1628 0%, #070d1a 100%)',
          border: '0.5px solid rgba(163,201,255,0.06)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          position: 'sticky', top: 72,
        }}>

          {/* FREE */}
          <div style={{ padding: '14px 14px 8px' }}>
            <TierDivider label="Free" color="#8a919f" />
            {FREE_TOOLS.map(t => (
              <div key={t.key} style={{ position: 'relative' }}>
                <ToolCard t={t} tool={tool} />
                {getBadge(t) && (
                  <span style={{
                    position: 'absolute', top: 8, right: 8,
                    fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: '0.06em',
                    background: '#1e2a3a', color: '#8a919f', padding: '2px 5px',
                  }}>FREE</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ height: '0.5px', background: 'rgba(163,201,255,0.04)', margin: '0 14px' }} />

          {/* PRO */}
          <div style={{ padding: '12px 14px 8px' }}>
            <TierDivider label="Pro" color="#1493ff" />
            {PRO_TOOLS.map(t => {
              const badge = getBadge(t)
              return (
                <div key={t.key} style={{ position: 'relative' }}>
                  <ToolCard t={t} tool={tool} />
                  {badge === 'pro' && (
                    <span style={{
                      position: 'absolute', top: 8, right: 8,
                      fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: '0.06em',
                      background: '#1493ff', color: '#fff', padding: '2px 5px',
                    }}>PRO</span>
                  )}
                </div>
              )
            })}
          </div>

          <div style={{ height: '0.5px', background: 'rgba(163,201,255,0.04)', margin: '0 14px' }} />

          {/* APEX */}
          <div style={{ padding: '12px 14px 14px' }}>
            <TierDivider label="Apex" color="#4edea3" gradient />
            <div style={{
              background: 'linear-gradient(135deg, rgba(78,222,163,0.04) 0%, rgba(163,201,255,0.02) 100%)',
              border: '0.5px solid rgba(78,222,163,0.1)',
            }}>
              {APEX_TOOLS.map(t => {
                const badge = getBadge(t)
                return (
                  <div key={t.key} style={{ position: 'relative' }}>
                    <ToolCard t={t} tool={tool} />
                    {badge === 'apex' && (
                      <span style={{
                        position: 'absolute', top: 8, right: 8,
                        fontFamily: MONO, fontSize: 7, fontWeight: 700, letterSpacing: '0.06em',
                        background: 'linear-gradient(90deg, #4edea3, #a3c9ff)',
                        color: '#0d1117', padding: '2px 5px',
                      }}>APEX</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* ── RIGHT CONTENT ── */}
        <div style={{ position: 'relative', minHeight: 400 }}>

          {/* Active tool header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
            background: 'linear-gradient(135deg, rgba(12,29,53,0.95) 0%, rgba(7,13,26,0.98) 100%)',
            border: '0.5px solid rgba(163,201,255,0.06)',
            borderBottom: `1px solid ${active.accent}20`,
            marginBottom: 2,
          }}>
            <div style={{
              width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${active.accent}15`, border: `0.5px solid ${active.accent}40`,
            }}>
              {(() => { const I = active.icon; return <I size={14} style={{ color: active.accent }} /> })()}
            </div>
            <div>
              <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#e2e2e8', letterSpacing: '-0.01em' }}>
                {active.label}
              </p>
              <p style={{ fontFamily: MONO, fontSize: 9, color: `${active.accent}80`, letterSpacing: '0.04em' }}>
                {active.desc}
              </p>
            </div>
          </div>

          {/* Tool content */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(10,16,28,0.9) 0%, rgba(7,13,26,0.95) 100%)',
            border: '0.5px solid rgba(163,201,255,0.06)',
            padding: 20,
            position: 'relative',
          }}>
            <ActiveComponent />

            {/* Free → Pro paywall */}
            {showProWall && (
              <div className="absolute inset-0 grid place-items-center p-8" style={{ background: 'rgba(7,13,26,0.95)', backdropFilter: 'blur(12px)' }}>
                <div style={{ maxWidth: 320, width: '100%', textAlign: 'center', fontFamily: SANS }}>
                  <div style={{
                    width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    background: 'rgba(20,147,255,0.08)', border: '0.5px solid rgba(20,147,255,0.2)',
                  }}>
                    <Lock size={18} style={{ color: '#1493ff' }} />
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#1493ff', textTransform: 'uppercase', marginBottom: 10 }}>
                    Pro Feature
                  </p>
                  <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 10 }}>
                    Unlock AI Tools
                  </h2>
                  <p style={{ fontSize: 12, color: '#4a5568', marginBottom: 24, lineHeight: 1.65 }}>
                    Tailored CV reviews, cover letter critiques, salary intelligence and more. Built to triple your interview rate.
                  </p>
                  <button onClick={() => navigate('/plans')} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: '#1493ff', color: '#fff', border: 'none', padding: '12px 0',
                    fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'filter 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    <Crown size={13} /> View Plans
                  </button>
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#1e2a3a', marginTop: 10 }}>Cancel anytime · No hidden fees</p>
                </div>
              </div>
            )}

            {/* Pro → Apex paywall */}
            {showApexWall && (
              <div className="absolute inset-0 grid place-items-center p-8" style={{ background: 'rgba(7,13,26,0.95)', backdropFilter: 'blur(12px)' }}>
                <div style={{ maxWidth: 320, width: '100%', textAlign: 'center', fontFamily: SANS }}>
                  <div style={{
                    width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                    background: 'rgba(78,222,163,0.08)', border: '0.5px solid rgba(78,222,163,0.25)',
                  }}>
                    <Rocket size={18} style={{ color: '#4edea3' }} />
                  </div>
                  <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#4edea3', textTransform: 'uppercase', marginBottom: 10 }}>
                    Apex Exclusive
                  </p>
                  <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 10 }}>
                    Upgrade to Apex
                  </h2>
                  <p style={{ fontSize: 12, color: '#4a5568', marginBottom: 24, lineHeight: 1.65 }}>
                    {active.key === 'interview-coach'
                      ? 'Practice live mock interviews with an AI hiring manager. Get a full performance scorecard after every session.'
                      : 'Practice real salary negotiations with an AI recruiter. Get scored and coached after every session.'}
                  </p>
                  <button onClick={() => navigate('/plans')} style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: 'linear-gradient(90deg, #4edea3, #a3c9ff)', color: '#0d1117', border: 'none', padding: '12px 0',
                    fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'filter 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    <Rocket size={13} /> Upgrade to Apex — $29/mo
                  </button>
                  <p style={{ fontFamily: MONO, fontSize: 9, color: '#1e2a3a', marginTop: 10 }}>Cancel anytime · No hidden fees</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
