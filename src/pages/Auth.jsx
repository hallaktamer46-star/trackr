import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = 'Geist, Inter, sans-serif'
const SERIF = "Georgia, 'Times New Roman', serif"

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
    <div style={{ minHeight: '100vh', width: '100%', background: '#050810', fontFamily: SANS, overflow: 'hidden', position: 'relative' }}>

      {/* ── Animated background ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="auth-grid" />
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      {/* ── Top bar ── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', height: 58, borderBottom: '1px solid rgba(255,255,255,0.055)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 34 34" fill="none">
            <rect width="34" height="34" fill="#0c1a2e"/>
            <polyline points="4,17 8,17 10.5,10 14,24 17,12 20,20 23,20 26,17 30,17"
              stroke="#00d4ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>Trackr</span>
        </div>

        {/* Center nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {[['Product', null], ['Features', null], ['Pricing', null], ['Roadmap', null]].map(([label]) => (
            <button key={label}
              onClick={() => label === 'Pricing' || label === 'Product' ? null : null}
              style={{ fontFamily: SANS, fontSize: 13, fontWeight: 400, color: 'rgba(200,210,230,0.55)', background: 'none', border: 'none', padding: '6px 16px', cursor: 'pointer', letterSpacing: '-0.01em', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(200,210,230,0.55)'}
            >{label}</button>
          ))}
        </nav>

        {/* Right: Log in + Sign up */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <button
            onClick={() => { setMode('signin'); setShowForm(true) }}
            style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: 'rgba(200,210,230,0.65)', background: 'none', border: 'none', padding: '7px 16px', cursor: 'pointer', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(200,210,230,0.65)'}
          >Log in</button>
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }}/>
          <button
            onClick={() => { setMode('signup'); setShowForm(true) }}
            style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: '#050810', background: '#ffffff', border: 'none', padding: '7px 18px', cursor: 'pointer', letterSpacing: '-0.01em', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.88)'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >Sign up</button>
        </div>
      </div>

      {/* ── Centered hero ── */}
      <div style={{ position: 'relative', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 116px)', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 780 }}>

          <h1 style={{ fontSize: 'clamp(54px, 6.5vw, 92px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em', color: '#ffffff', marginBottom: 0, fontFamily: SANS }}>
            Take the next step.
          </h1>
          <h1 style={{ fontSize: 'clamp(54px, 6.5vw, 92px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.04em', marginBottom: 32, fontFamily: SANS }}>
            <span style={{ color: 'transparent', WebkitTextStroke: '1.5px rgba(255,255,255,0.22)' }}>Keep taking them.</span>
          </h1>

          <p style={{ fontSize: 17, color: 'rgba(192,199,213,0.52)', lineHeight: 1.85, maxWidth: 500, margin: '0 auto 52px', fontFamily: SANS, fontWeight: 400 }}>
            Job searching is momentum. Trackr keeps it going — every application tracked, every follow-up timed, every offer earned.
          </p>

          <button
            onClick={() => { setMode('signup'); setShowForm(true) }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 38px', background: 'linear-gradient(135deg, #4edea3 0%, #a3c9ff 100%)', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#050810', transition: 'all .2s', boxShadow: '0 8px 40px rgba(78,222,163,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 48px rgba(78,222,163,0.32)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(78,222,163,0.2)' }}
          >
            Start tracking free →
          </button>

          <p style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(80,95,120,0.4)', letterSpacing: '0.05em', marginTop: 20 }}>
            No card required · Free up to 10 applications
          </p>

        </div>
      </div>

      {/* ── Auth form overlay ── */}
      {showForm && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,16,0.82)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '20px' }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{ width: '100%', maxWidth: 380, background: 'rgba(10,14,28,0.95)', border: '0.5px solid rgba(255,255,255,0.08)', padding: '40px 36px', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', position: 'relative', animation: 'authFadeIn .22s ease' }}
            onClick={e => e.stopPropagation()}
          >

            {/* Close */}
            <button
              onClick={() => setShowForm(false)}
              style={{ position: 'absolute', top: 16, right: 18, background: 'none', border: 'none', color: 'rgba(163,201,255,0.3)', cursor: 'pointer', fontSize: 18, fontFamily: MONO, lineHeight: 1, padding: 4, transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(163,201,255,0.7)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(163,201,255,0.3)'}
            >×</button>

            {!isSupabaseConfigured && (
              <div style={{ marginBottom: 18, background: 'rgba(78,222,163,0.05)', border: '0.5px solid rgba(78,222,163,0.12)', padding: '8px 12px' }}>
                <p style={{ fontFamily: MONO, fontSize: 10, color: 'rgba(78,222,163,0.65)', letterSpacing: '0.04em' }}>
                  <strong>Demo mode</strong> — data stored locally.
                </p>
              </div>
            )}

            <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#4edea3', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              {mode === 'signin' ? '// authenticate' : '// create account'}
            </p>
            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: 4, fontFamily: SANS }}>
              {mode === 'signin' ? 'Welcome back.' : 'Start your pipeline.'}
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(150,162,185,0.45)', marginBottom: 28, lineHeight: 1.5, fontFamily: SANS }}>
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

              {error   && <p style={{ fontFamily: MONO, fontSize: 10, color: '#ffb4ab', background: 'rgba(255,180,171,0.07)', border: '0.5px solid rgba(255,180,171,0.18)', padding: '8px 12px', letterSpacing: '0.02em' }}>{error}</p>}
              {success && <p style={{ fontFamily: MONO, fontSize: 10, color: '#4edea3', background: 'rgba(78,222,163,0.07)', border: '0.5px solid rgba(78,222,163,0.18)', padding: '8px 12px', letterSpacing: '0.02em' }}>{success}</p>}

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
        .auth-orb-1 {
          top: -15%; left: 10%; width: 760px; height: 760px;
          background: radial-gradient(circle, rgba(78,222,163,0.07) 0%, transparent 65%);
          animation: orbFloat1 9s ease-in-out infinite;
        }
        .auth-orb-2 {
          bottom: -20%; right: 5%; width: 640px; height: 640px;
          background: radial-gradient(circle, rgba(163,201,255,0.05) 0%, transparent 65%);
          animation: orbFloat2 12s ease-in-out infinite;
        }
        .auth-orb-3 {
          top: 35%; left: 45%; width: 480px; height: 480px;
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
          font-family: Consolas, Menlo, Monaco, monospace;
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
      `}</style>
    </div>
  )
}
