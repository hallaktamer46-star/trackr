import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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
    <div className="min-h-screen w-full grid md:grid-cols-2 bg-white dark:bg-slate-950">

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
      <div className="flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm">

          {!isSupabaseConfigured && (
            <div className="mb-6 bg-sky-50 dark:bg-sky-950 border border-sky-200 dark:border-sky-800 rounded-xl p-3.5 text-xs text-sky-800 dark:text-sky-300">
              <strong>Demo mode:</strong> data stored locally in your browser.
            </div>
          )}

          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-sky-500 font-bold mb-3">
            {mode === 'signin' ? 'Authenticate' : 'Create Account'}
          </p>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Start your pipeline'}
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-8">
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
              className="w-full h-11 bg-slate-900 dark:bg-sky-500 hover:bg-slate-800 dark:hover:bg-sky-600 disabled:opacity-60 text-white font-mono uppercase tracking-widest text-[11px] rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading
                ? <><Loader2 size={14} className="animate-spin" /> Please wait…</>
                : <>{mode === 'signin' ? 'Sign in' : 'Create account'} →</>
              }
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600 font-mono">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <button
            type="button"
            onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
            className="mt-4 w-full h-11 flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#4285F4" d="M47.5 24.6c0-1.6-.1-3.1-.4-4.6H24v8.7h13.2c-.6 3-2.3 5.5-4.9 7.2v6h7.9c4.6-4.3 7.3-10.6 7.3-17.3z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.9-6c-2.1 1.4-4.8 2.3-8 2.3-6.2 0-11.4-4.2-13.3-9.8H2.6v6.2C6.6 42.7 14.8 48 24 48z"/>
              <path fill="#FBBC05" d="M10.7 28.7A14.7 14.7 0 0 1 10 24c0-1.6.3-3.2.7-4.7v-6.2H2.6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.9l8.1-6.2z"/>
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.9 2.1 30.4 0 24 0 14.8 0 6.6 5.3 2.6 13.1l8.1 6.2C12.6 13.7 17.8 9.5 24 9.5z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 text-center">
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
        .dark .auth-input{background:#1e293b;color:#f1f5f9;border-color:#334155;}
        .dark .auth-input:focus{background:#1e293b;border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,0.15);}
        .dark .auth-input::placeholder{color:#475569;}
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
