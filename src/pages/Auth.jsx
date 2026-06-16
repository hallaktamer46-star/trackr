import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = 'Geist, Inter, sans-serif'
const CANDY = '#38bdf8'

const PILLARS = [
  {
    key: 'hired',
    label: 'Getting Hired',
    tagline: 'From first application to signed offer.',
    description: 'Track every role, perfect your materials, and move through the pipeline with clarity. Know exactly where you stand at every stage.',
    color: '#4edea3',
    glow: 'rgba(78,222,163,0.15)',
    tools: ['Job Tracker', 'Job Toolkit', 'CV Builder', 'CV Reviewer', 'Cover Letter', 'Stats'],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 26V12l10-8 10 8v14" stroke="#4edea3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="12" y="18" width="8" height="8" stroke="#4edea3" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M10 16h2M20 16h2" stroke="#4edea3" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'business',
    label: 'Your Business',
    tagline: 'Build, validate, and pitch your ideas.',
    description: 'From early-stage concepts to investor-ready pitches. Structure your thinking, stress-test your model, and communicate your vision.',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    tools: ['Growth Lab', 'Startup Studio', 'Pitch Lab'],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M4 28h24M8 28V16M16 28V8M24 28V20" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="16" cy="6" r="2" stroke="#a78bfa" strokeWidth="1.6"/>
      </svg>
    ),
  },
  {
    key: 'personal',
    label: 'Your Life',
    tagline: 'Stay grounded while you grow.',
    description: 'Daily reflection, mental clarity, and life planning — because your career is only part of who you are. Build the whole picture.',
    color: '#a3c9ff',
    glow: 'rgba(163,201,255,0.15)',
    tools: ['Life Plan', 'Daily Debrief', 'Mental Clarity', 'Round Table', 'Calendar'],
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="10" stroke="#a3c9ff" strokeWidth="1.8"/>
        <path d="M16 8v8l5 3" stroke="#a3c9ff" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
]

function FeatureCard({ pillar, index }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        flex: '1 1 280px',
        background: 'rgba(255,255,255,0.025)',
        border: `1px solid ${pillar.color}22`,
        borderRadius: 20,
        padding: '36px 32px',
        display: 'flex', flexDirection: 'column', gap: 20,
        boxShadow: visible ? `0 0 60px ${pillar.glow}` : 'none',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.7s ease ${index * 0.15}s, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${index * 0.15}s, box-shadow 1.2s ease`,
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 14,
        background: `${pillar.color}12`,
        border: `1px solid ${pillar.color}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {pillar.icon}
      </div>

      <div>
        <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: pillar.color, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
          {pillar.tagline}
        </p>
        <h3 style={{ fontFamily: SANS, fontSize: 26, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12 }}>
          {pillar.label}
        </h3>
        <p style={{ fontFamily: SANS, fontSize: 14, color: 'rgba(192,199,213,0.55)', lineHeight: 1.75 }}>
          {pillar.description}
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 'auto' }}>
        {pillar.tools.map(tool => (
          <span key={tool} style={{
            fontFamily: MONO, fontSize: 9, fontWeight: 700,
            color: pillar.color, background: `${pillar.color}0f`,
            border: `0.5px solid ${pillar.color}28`,
            padding: '4px 10px', borderRadius: 999,
            letterSpacing: '0.06em',
          }}>
            {tool}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode,     setMode]     = useState('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(null)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(null); setSuccess(null)
    try {
      const { error } = mode === 'signin'
        ? await signIn(email, password)
        : await signUp(email, password)
      if (error) throw error
      if (mode === 'signup' && isSupabaseConfigured)
        setSuccess('Check your email to confirm your account!')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#050810', fontFamily: SANS, overflowX: 'hidden', position: 'relative' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="auth-grid" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      {/* ── Top bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 58, borderBottom: '1px solid rgba(255,255,255,0.055)', background: 'rgba(5,8,16,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>

        <div style={{ width: 120 }} />

        {/* Center nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {['Product', 'Features', 'Pricing', 'Roadmap'].map(label => (
            <button key={label}
              style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: CANDY, background: 'none', border: 'none', padding: '6px 16px', cursor: 'pointer', letterSpacing: '-0.01em', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = CANDY}
            >{label}</button>
          ))}
        </nav>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 120, justifyContent: 'flex-end' }}>
          <button
            onClick={() => { setMode('signin'); setShowForm(true) }}
            style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: CANDY, background: 'none', border: 'none', padding: '7px 14px', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = CANDY}
          >Log in</button>
          <button
            onClick={() => { setMode('signup'); setShowForm(true) }}
            style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#050810', background: '#ffffff', border: 'none', padding: '7px 18px', borderRadius: 8, cursor: 'pointer', letterSpacing: '-0.01em', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.88)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'none' }}
          >Sign up</button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div style={{ position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 58px)', padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 780 }}>
          <p style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: CANDY, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 28, opacity: 0.8 }}>
            Career · Business · Life
          </p>

          <h1 style={{ fontSize: 'clamp(54px, 6.5vw, 92px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em', color: '#ffffff', marginBottom: 0, fontFamily: SANS }}>
            Take the next step.
          </h1>
          <h1 style={{ fontSize: 'clamp(54px, 6.5vw, 92px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em', marginBottom: 36, fontFamily: SANS }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.22)' }}>Keep taking them.</span>
          </h1>

          <p style={{ fontSize: 17, color: 'rgba(192,199,213,0.52)', lineHeight: 1.85, maxWidth: 520, margin: '0 auto 52px', fontFamily: SANS, fontWeight: 400 }}>
            One platform for your ambition. Track your career, build your business, and design the life you want — all in one place.
          </p>

          <button
            onClick={() => { setMode('signup'); setShowForm(true) }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 42px', background: 'linear-gradient(135deg, #4edea3 0%, #a3c9ff 100%)', border: 'none', borderRadius: 12, cursor: 'pointer', fontFamily: SANS, fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em', color: '#050810', transition: 'all .2s', boxShadow: '0 8px 40px rgba(78,222,163,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 14px 48px rgba(78,222,163,0.32)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(78,222,163,0.2)' }}
          >
            Get started free →
          </button>
        </div>
      </div>

      {/* ── Features section ── */}
      <div style={{ position: 'relative', zIndex: 5, padding: '100px 48px 120px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 72 }}>
            <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: CANDY, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 16 }}>
              What we offer
            </p>
            <h2 style={{ fontFamily: SANS, fontSize: 'clamp(36px,4vw,56px)', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 18 }}>
              Built for more than just jobs.
            </h2>
            <p style={{ fontFamily: SANS, fontSize: 16, color: 'rgba(192,199,213,0.45)', maxWidth: 480, margin: '0 auto', lineHeight: 1.75 }}>
              Three pillars. One platform. Everything you need to grow — professionally, personally, and beyond.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'stretch' }}>
            {PILLARS.map((pillar, i) => (
              <FeatureCard key={pillar.key} pillar={pillar} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Auth form overlay ── */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,16,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{ width: '100%', maxWidth: 380, background: 'rgba(10,14,28,0.95)', border: '0.5px solid rgba(255,255,255,0.08)', padding: '40px 36px', borderRadius: 20, backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', position: 'relative', animation: 'authFadeIn .22s ease' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowForm(false)}
              style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', color: 'rgba(163,201,255,0.3)', cursor: 'pointer', fontSize: 18, fontFamily: MONO, lineHeight: 1, padding: 4, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(163,201,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(163,201,255,0.3)'}
            >×</button>

            {!isSupabaseConfigured && (
              <div style={{ marginBottom: 18, background: 'rgba(78,222,163,0.05)', border: '0.5px solid rgba(78,222,163,0.12)', padding: '8px 12px', borderRadius: 8 }}>
                <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(78,222,163,0.65)', letterSpacing: '0.04em' }}>
                  <strong>Demo mode</strong> — data stored locally.
                </p>
              </div>
            )}

            <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#4edea3', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              {mode === 'signin' ? '// authenticate' : '// create account'}
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: 4, fontFamily: SANS }}>
              {mode === 'signin' ? 'Welcome back.' : 'Start your journey.'}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(150,162,185,0.45)', marginBottom: 28, lineHeight: 1.5, fontFamily: SANS }}>
              {mode === 'signin' ? 'Sign in to your workspace.' : 'One platform. Every ambition.'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: 9, fontWeight: 700, color: 'rgba(160,200,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="auth-field" />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: MONO, fontSize: 9, fontWeight: 700, color: 'rgba(160,200,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 7 }}>Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} className="auth-field" />
              </div>

              {error   && <p style={{ fontFamily: MONO, fontSize: 10, color: '#ffb4ab', background: 'rgba(255,180,171,0.07)', border: '0.5px solid rgba(255,180,171,0.18)', padding: '8px 12px', borderRadius: 6, letterSpacing: '0.02em' }}>{error}</p>}
              {success && <p style={{ fontFamily: MONO, fontSize: 10, color: '#4edea3', background: 'rgba(78,222,163,0.07)', border: '0.5px solid rgba(78,222,163,0.18)', padding: '8px 12px', borderRadius: 6, letterSpacing: '0.02em' }}>{success}</p>}

              <button type="submit" disabled={loading} className="auth-submit" style={{ marginTop: 4 }}>
                {loading
                  ? <><span className="auth-spinner" /> Processing…</>
                  : <>{mode === 'signin' ? 'Sign in' : 'Create account'} →</>
                }
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.05)' }} />
              <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(150,162,185,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.05)' }} />
            </div>

            <button
              type="button"
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
              className="auth-google"
            >
              <svg width="15" height="15" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.3z"/>
                <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.2 0-11.4-4.2-13.3-9.8H2.6v6.2C6.6 42.7 14.8 48 24 48z"/>
                <path fill="#FBBC05" d="M10.7 28.7A14.7 14.7 0 0 1 10 24c0-1.6.3-3.2.7-4.7v-6.2H2.6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.9l8.1-6.2z"/>
                <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.9 2.1 30.4 0 24 0 14.8 0 6.6 5.3 2.6 13.1l8.1 6.2C12.6 13.7 17.8 9.5 24 9.5z"/>
              </svg>
              Continue with Google
            </button>

            <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(150,162,185,0.35)', textAlign: 'center', marginTop: 22, letterSpacing: '0.02em' }}>
              {mode === 'signin' ? 'No account? ' : 'Already have one? '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccess(null) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4edea3', fontFamily: MONO, fontSize: 10, fontWeight: 700, padding: 0 }}
              >
                {mode === 'signin' ? 'Create account →' : 'Sign in →'}
              </button>
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.05)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(1.08)} }
        @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,20px) scale(0.95)} }
        @keyframes authSpin  { to { transform: rotate(360deg) } }
        @keyframes authFadeIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }

        .auth-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px);
          background-size: 72px 72px;
        }
        .auth-orb { position: absolute; border-radius: 50%; pointer-events: none; }
        .auth-orb-1 { top:-15%;left:10%;width:760px;height:760px;background:radial-gradient(circle,rgba(78,222,163,0.07) 0%,transparent 65%);animation:orbFloat1 9s ease-in-out infinite; }
        .auth-orb-2 { bottom:-20%;right:5%;width:640px;height:640px;background:radial-gradient(circle,rgba(163,201,255,0.05) 0%,transparent 65%);animation:orbFloat2 12s ease-in-out infinite; }
        .auth-orb-3 { top:35%;left:45%;width:480px;height:480px;background:radial-gradient(circle,rgba(196,181,253,0.04) 0%,transparent 65%);animation:orbFloat3 15s ease-in-out infinite; }

        .auth-field {
          width:100%;box-sizing:border-box;padding:10px 14px;
          background:rgba(255,255,255,0.025);border:0.5px solid rgba(255,255,255,0.07);
          border-radius:10px;font-size:13px;font-family:'Geist',Inter,sans-serif;
          color:#e2e2e8;outline:none;transition:border-color 0.15s,background 0.15s,box-shadow 0.15s;
        }
        .auth-field:focus { border-color:rgba(78,222,163,0.35);background:rgba(78,222,163,0.025);box-shadow:0 0 0 3px rgba(78,222,163,0.05); }
        .auth-field::placeholder { color:rgba(150,162,185,0.22); }

        .auth-submit {
          width:100%;padding:11px 0;
          background:linear-gradient(135deg,rgba(78,222,163,0.14),rgba(163,201,255,0.09));
          border:0.5px solid rgba(78,222,163,0.28);border-radius:10px;
          color:#4edea3;font-family:Consolas,Menlo,Monaco,monospace;
          font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;
          transition:background 0.15s,border-color 0.15s,box-shadow 0.15s,transform 0.1s;
        }
        .auth-submit:hover:not(:disabled) { background:linear-gradient(135deg,rgba(78,222,163,0.22),rgba(163,201,255,0.15));border-color:rgba(78,222,163,0.45);box-shadow:0 0 24px rgba(78,222,163,0.12);transform:translateY(-1px); }
        .auth-submit:disabled { opacity:0.45;cursor:not-allowed; }

        .auth-spinner { display:inline-block;width:11px;height:11px;border:1.5px solid rgba(78,222,163,0.25);border-top-color:#4edea3;border-radius:50%;animation:authSpin 0.65s linear infinite; }

        .auth-google {
          width:100%;padding:10px;
          background:rgba(255,255,255,0.02);border:0.5px solid rgba(255,255,255,0.06);border-radius:10px;
          color:rgba(192,199,213,0.6);font-family:'Geist',Inter,sans-serif;font-size:13px;font-weight:500;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:background 0.15s,border-color 0.15s;
        }
        .auth-google:hover { background:rgba(255,255,255,0.045);border-color:rgba(255,255,255,0.11); }
      `}</style>
    </div>
  )
}
