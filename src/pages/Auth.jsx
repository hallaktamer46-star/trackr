import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const STATS = [
  ['Free',  'Forever plan'],
  ['AI',    'Powered tools'],
  ['100%',  'Data control'],
]

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode,     setMode]     = useState('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)
  const [success,  setSuccess]  = useState(null)

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
    <div style={{ minHeight: '100vh', width: '100%', display: 'flex', background: '#050810', fontFamily: SANS, overflow: 'hidden', position: 'relative' }}>

      {/* ── Animated background ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="auth-grid" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      {/* ── Left hero panel ── */}
      <div className="auth-hero" style={{ flex: '0 0 56%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '44px 56px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div>
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: 48, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.03em', lineHeight: 1 }}>T</span>
        </div>

        {/* Main copy */}
        <div style={{ maxWidth: 540 }}>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(52px, 5.5vw, 78px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', color: '#ffffff', marginBottom: 6, fontFamily: SANS }}>
            Built for those
          </h1>
          <h1 style={{ fontSize: 'clamp(52px, 5.5vw, 78px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.04em', marginBottom: 28, fontFamily: SANS }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.2)' }}>who close.</span>
          </h1>

          <p style={{ fontSize: 15, color: 'rgba(192,199,213,0.6)', lineHeight: 1.75, maxWidth: 420, marginBottom: 44, fontFamily: SANS }}>
            The precision platform for job seekers who treat their career like a mission. Track, strategize, and land — with tools built for real outcomes.
          </p>


          {/* Stats */}
          <div style={{ display: 'flex', gap: 36 }}>
            {STATS.map(([n, l]) => (
              <div key={l}>
                <p style={{ fontFamily: MONO, fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.02em' }}>{n}</p>
                <p style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(160,200,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 5 }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(80,95,120,0.5)', letterSpacing: '0.05em' }}>
          © 2026 Trackr · Free up to 10 apps · Pro $15/mo
        </p>
      </div>

      {/* ── Vertical divider ── */}
      <div style={{ width: '0.5px', background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.05) 80%, transparent 100%)', flexShrink: 0 }} />

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', position: 'relative', zIndex: 1 }}>

        {/* Subtle glow behind card */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 380, height: 380, background: 'radial-gradient(circle, rgba(78,222,163,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 372, position: 'relative' }}>

          {!isSupabaseConfigured && (
            <div style={{ marginBottom: 16, background: 'rgba(78,222,163,0.05)', border: '0.5px solid rgba(78,222,163,0.12)', padding: '9px 14px', borderRadius: 8 }}>
              <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(78,222,163,0.65)', letterSpacing: '0.04em' }}>
                <strong>Demo mode</strong> — data stored locally in your browser.
              </p>
            </div>
          )}

          {/* Card */}
          <div style={{ background: 'rgba(255,255,255,0.018)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '36px 32px', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}>

            <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#4edea3', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              {mode === 'signin' ? '// authenticate' : '// create account'}
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: 5, fontFamily: SANS }}>
              {mode === 'signin' ? 'Welcome back.' : 'Start your pipeline.'}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(150,162,185,0.55)', marginBottom: 28, lineHeight: 1.5, fontFamily: SANS }}>
              {mode === 'signin' ? 'Sign in to your Trackr workspace.' : 'Track applications with precision.'}
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

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.05)' }} />
              <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(150,162,185,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>or</span>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(255,255,255,0.05)' }} />
            </div>

            {/* Google */}
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

            <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(150,162,185,0.4)', textAlign: 'center', marginTop: 22, letterSpacing: '0.02em' }}>
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
      </div>

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-30px) scale(1.05)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,40px) scale(1.08)} }
        @keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,20px) scale(0.95)} }
        @keyframes authSpin  { to { transform: rotate(360deg) } }

        .auth-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 64px 64px;
        }
        .auth-orb {
          position: absolute; border-radius: 50%; pointer-events: none;
        }
        .auth-orb-1 {
          top: -15%; left: 15%; width: 700px; height: 700px;
          background: radial-gradient(circle, rgba(78,222,163,0.07) 0%, transparent 65%);
          animation: orbFloat1 9s ease-in-out infinite;
        }
        .auth-orb-2 {
          bottom: -20%; right: 5%; width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(163,201,255,0.05) 0%, transparent 65%);
          animation: orbFloat2 12s ease-in-out infinite;
        }
        .auth-orb-3 {
          top: 40%; left: 40%; width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(196,181,253,0.04) 0%, transparent 65%);
          animation: orbFloat3 15s ease-in-out infinite;
        }

        .auth-field {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px;
          background: rgba(255,255,255,0.025);
          border: 0.5px solid rgba(255,255,255,0.07);
          border-radius: 8px;
          font-size: 13px;
          font-family: 'Geist', Inter, sans-serif;
          color: #e2e2e8;
          outline: none;
          transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
        }
        .auth-field:focus {
          border-color: rgba(78,222,163,0.35);
          background: rgba(78,222,163,0.025);
          box-shadow: 0 0 0 3px rgba(78,222,163,0.05);
        }
        .auth-field::placeholder { color: rgba(150,162,185,0.22); }

        .auth-submit {
          width: 100%; padding: 11px 0;
          background: linear-gradient(135deg, rgba(78,222,163,0.14), rgba(163,201,255,0.09));
          border: 0.5px solid rgba(78,222,163,0.28);
          border-radius: 8px;
          color: #4edea3;
          font-family: 'Geist Mono', monospace;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.09em; text-transform: uppercase;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
        }
        .auth-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(78,222,163,0.22), rgba(163,201,255,0.15));
          border-color: rgba(78,222,163,0.45);
          box-shadow: 0 0 24px rgba(78,222,163,0.12);
          transform: translateY(-1px);
        }
        .auth-submit:active:not(:disabled) { transform: translateY(0); }
        .auth-submit:disabled { opacity: 0.45; cursor: not-allowed; }

        .auth-spinner {
          display: inline-block; width: 11px; height: 11px;
          border: 1.5px solid rgba(78,222,163,0.25);
          border-top-color: #4edea3;
          border-radius: 50%;
          animation: authSpin 0.65s linear infinite;
        }

        .auth-google {
          width: 100%; padding: 10px;
          background: rgba(255,255,255,0.02);
          border: 0.5px solid rgba(255,255,255,0.06);
          border-radius: 8px;
          color: rgba(192,199,213,0.6);
          font-family: 'Geist', Inter, sans-serif;
          font-size: 13px; font-weight: 500;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.15s, border-color 0.15s;
        }
        .auth-google:hover {
          background: rgba(255,255,255,0.045);
          border-color: rgba(255,255,255,0.11);
        }

        @media (max-width: 768px) {
          .auth-hero { display: none !important; }
        }
      `}</style>
    </div>
  )
}
