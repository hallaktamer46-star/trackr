import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode]       = useState('signin')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [success, setSuccess] = useState(null)

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
    <div className="min-h-screen w-full grid md:grid-cols-2 bg-white">

      {/* Left – brand panel */}
      <div className="hidden md:flex flex-col justify-between p-10 bg-slate-900 border-r border-slate-800 relative overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-8 h-8 bg-sky-500 rounded-lg shadow-[0_0_15px_rgba(14,165,233,0.5)] grid place-items-center">
            <div className="w-4 h-4 border-2 border-white rounded-sm" />
          </div>
          <span className="font-extrabold text-xl tracking-tighter font-mono text-white">TRACKR</span>
        </div>

        {/* Tagline + stats */}
        <div className="z-10 space-y-6">
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-sky-400 font-bold">
            v1.0.0 / Q1 RELEASE
          </p>
          <h1 className="text-5xl font-extrabold tracking-tighter leading-[1.05] text-white">
            Your job search,<br />
            <span className="text-slate-500">finally engineered.</span>
          </h1>
          <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
            A pipeline for your applications. Precision tooling for follow-ups, interviews and
            offers. No spreadsheets. No chaos.
          </p>

          <div className="grid grid-cols-3 gap-px bg-slate-800 max-w-md">
            {[['Kanban', 'Pipeline'], ['AI', 'Coaching'], ['Email', 'Reminders']].map(([n, l]) => (
              <div key={l} className="bg-slate-900 p-4">
                <p className="text-2xl font-extrabold font-mono text-white">{n}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[10px] font-mono text-slate-600 z-10">
          © {new Date().getFullYear()} Trackr · Free up to 10 apps · Pro $15/mo
        </p>

        {/* Glow */}
        <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      {/* Right – form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">

          {!isSupabaseConfigured && (
            <div className="mb-6 bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-800">
              <strong>Demo mode:</strong> data stored locally in your browser.
            </div>
          )}

          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-sky-500 font-bold mb-3">
            {mode === 'signin' ? 'Authenticate' : 'Create Account'}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Start your pipeline'}
          </h2>
          <p className="text-sm text-slate-400 mb-8">
            {mode === 'signin'
              ? 'Sign in to your Trackr workspace.'
              : 'Track applications with precision.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Email">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="auth-input"
              />
            </Field>
            <Field label="Password">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="auth-input"
              />
            </Field>

            {error   && <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">{success}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white font-mono uppercase tracking-widest text-[11px] rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Please wait…</>
                : <>{mode === 'signin' ? 'Sign in' : 'Create account'} →</>
              }
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          <p className="text-xs text-slate-400 mt-6 text-center">
            {mode === 'signin' ? 'No account yet?' : 'Already have an account?'}{' '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccess(null) }}
              className="text-sky-500 font-medium hover:underline"
            >
              {mode === 'signin' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <style>{`
        .auth-input{width:100%;padding:10px 14px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;color:#0f172a;background:#f8fafc;outline:none;transition:all 0.15s;}
        .auth-input:focus{border-color:#38bdf8;background:white;box-shadow:0 0 0 3px rgba(56,189,248,0.1);}
        .auth-input::placeholder{color:#94a3b8;}
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono font-semibold">{label}</label>
      {children}
    </div>
  )
}
