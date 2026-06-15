import { useEffect, useState } from 'react'
import { X, Rocket, Crown, Zap, Check, Sparkles, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = 'Geist, Inter, sans-serif'

const PLAN_CONFIG = {
  pro: {
    name: 'Pro',
    icon: Crown,
    color: '#a3c9ff',
    bg: 'rgba(163,201,255,0.08)',
    border: 'rgba(163,201,255,0.35)',
    glow: 'rgba(163,201,255,0.15)',
    headline: 'Welcome to Pro 🎉',
    sub: "You're now in the top tier of job seekers. Here's what just unlocked:",
    unlocked: [
      { emoji: '🤖', label: 'All 8 AI Tools', desc: 'CV review, cover letters, interview prep, salary intel & more' },
      { emoji: '∞',  label: 'Unlimited Applications', desc: 'Track as many roles as you want, no cap' },
      { emoji: '🎯', label: 'Interview Coach', desc: 'Live mock interviews with real-time feedback' },
      { emoji: '📊', label: 'Market & Salary Intel', desc: 'Know your worth before every negotiation' },
      { emoji: '🏢', label: 'Company Research Briefs', desc: 'Deep-dive any employer in seconds' },
      { emoji: '💼', label: 'LinkedIn Optimiser', desc: 'Get more recruiter inbound' },
    ],
    cta: 'Explore AI Tools',
    ctaPath: '/ai/cv',
  },
  apex: {
    name: 'Apex',
    icon: Rocket,
    color: '#4edea3',
    bg: 'rgba(78,222,163,0.08)',
    border: 'rgba(78,222,163,0.35)',
    glow: 'rgba(78,222,163,0.15)',
    headline: 'You just reached Apex 🚀',
    sub: "You're in a league of your own. Everything is unlocked — here's what's new:",
    unlocked: [
      { emoji: '🤝', label: 'Offer Negotiation Simulator', desc: 'Practice salary negotiations with an AI recruiter and get a scorecard' },
      { emoji: '🧠', label: 'AI Job Matching', desc: 'Get matched to jobs from the board based on your profile' },
      { emoji: '📧', label: 'Email Reminders', desc: 'Follow-up nudges sent straight to your inbox' },
      { emoji: '📄', label: 'PDF & CSV Export', desc: 'Download your entire pipeline any time' },
      { emoji: '🌐', label: 'Public Profile', desc: 'A shareable link recruiters can find and view' },
      { emoji: '⚡', label: 'Chrome Extension', desc: 'Add jobs to Trackr in one click from any site' },
    ],
    cta: 'Try Offer Simulator',
    ctaPath: '/ai/negotiate',
  },
}

function Particle({ style }) {
  return <div style={{ position: 'absolute', borderRadius: '50%', animation: 'particleFly 2s ease-out forwards', ...style }} />
}

export default function UpgradeCelebration({ plan, onClose }) {
  const navigate = useNavigate()
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.pro
  const Icon = cfg.icon
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleCta = () => {
    handleClose()
    setTimeout(() => navigate(cfg.ctaPath), 220)
  }

  const particles = Array.from({ length: 18 }, (_, i) => ({
    width: Math.random() * 6 + 3,
    height: Math.random() * 6 + 3,
    background: [cfg.color, '#ffb689', '#ffb4ab', '#c4b5fd', '#ffffff'][i % 5],
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 60}%`,
    animationDelay: `${Math.random() * 0.6}s`,
    animationDuration: `${1.2 + Math.random() * 1}s`,
    opacity: Math.random() * 0.8 + 0.2,
  }))

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(20px)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.2s ease',
        fontFamily: SANS,
      }}
      onClick={e => { if (e.target === e.currentTarget) handleClose() }}
    >
      <div style={{
        width: '100%', maxWidth: 500,
        background: 'linear-gradient(160deg, #0c1829 0%, #070d1a 100%)',
        border: `0.5px solid ${cfg.border}`,
        boxShadow: `0 0 0 1px ${cfg.color}08, 0 40px 100px rgba(0,0,0,0.9), 0 0 100px ${cfg.glow}`,
        overflow: 'hidden',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.95)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.4,0.64,1)',
        position: 'relative',
      }}>
        {/* Particles */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {particles.map((p, i) => <Particle key={i} style={p} />)}
        </div>

        {/* Accent top bar */}
        <div style={{ height: 2, background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}66, transparent)` }} />

        {/* Header */}
        <div style={{ padding: '24px 24px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.04)', position: 'relative' }}>
          <button onClick={handleClose}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#5a6478', padding: '5px 6px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#e2e2e8'} onMouseLeave={e => e.currentTarget.style.color = '#5a6478'}>
            <X size={13} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: cfg.bg, border: `0.5px solid ${cfg.border}`,
              boxShadow: `0 0 32px ${cfg.glow}`,
              animation: 'iconPulse 2s ease-in-out infinite',
            }}>
              <Icon size={24} style={{ color: cfg.color }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: cfg.color }}>
                  {cfg.name} · Activated
                </span>
                <Sparkles size={10} style={{ color: cfg.color }} />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', color: '#e2e2e8', lineHeight: 1.2 }}>
                {cfg.headline}
              </h2>
            </div>
          </div>

          <p style={{ fontSize: 13, color: '#8a919f', marginTop: 12, lineHeight: 1.6 }}>
            {cfg.sub}
          </p>
        </div>

        {/* Unlocked features */}
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
          {cfg.unlocked.map((item, i) => (
            <div key={i}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.02)',
                border: '0.5px solid rgba(255,255,255,0.05)',
                animation: `featureIn 0.35s ease both`,
                animationDelay: `${0.1 + i * 0.06}s`,
              }}>
              <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>{item.emoji}</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#e2e2e8' }}>{item.label}</p>
                  <Check size={11} style={{ color: cfg.color, flexShrink: 0 }} />
                </div>
                <p style={{ fontFamily: MONO, fontSize: 10, color: '#5a6478', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px 20px', borderTop: '0.5px solid rgba(255,255,255,0.04)', display: 'flex', gap: 8 }}>
          <button onClick={handleCta}
            style={{
              flex: 1, padding: '11px 0',
              background: plan === 'apex'
                ? 'linear-gradient(135deg, #4edea3, #a3c9ff)'
                : 'linear-gradient(135deg, #a3c9ff, #7ab4ff)',
              border: 'none', cursor: 'pointer',
              color: '#070d1a', fontFamily: MONO, fontSize: 11, fontWeight: 800,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: `0 4px 24px ${cfg.glow}`,
              transition: 'filter 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = 'none'; e.currentTarget.style.transform = 'none' }}>
            {cfg.cta} <ArrowRight size={13} />
          </button>
          <button onClick={handleClose}
            style={{ padding: '0 18px', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', cursor: 'pointer', color: '#5a6478', fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#8a919f'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#5a6478'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}>
            Got it
          </button>
        </div>
      </div>

      <style>{`
        @keyframes particleFly {
          0%   { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-120px) scale(0.3) rotate(${Math.random()*360}deg); opacity: 0; }
        }
        @keyframes iconPulse {
          0%, 100% { box-shadow: 0 0 32px ${PLAN_CONFIG.pro.glow}; }
          50%       { box-shadow: 0 0 48px ${PLAN_CONFIG.pro.glow}, 0 0 80px ${PLAN_CONFIG.pro.glow}; }
        }
        @keyframes featureIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}
