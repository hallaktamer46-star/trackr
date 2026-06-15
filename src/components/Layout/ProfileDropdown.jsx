import { useState, useRef, useEffect } from 'react'
import { LogOut, UserCog, Crown, Check, X, Zap, Rocket, Sun, Moon, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useApplications } from '../../contexts/ApplicationContext'
import { useTheme } from '../../contexts/ThemeContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export default function ProfileDropdown() {
  const { user, signOut } = useAuth()
  const { isPaidUser, isApexUser } = useApplications()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', age: '', profession: '' })
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      const m = user?.user_metadata || {}
      setForm({ first_name: m.first_name || '', last_name: m.last_name || '', age: m.age || '', profession: m.profession || '' })
      setEditing(false)
    }
  }, [open, user])

  const handleSave = async () => {
    if (!isSupabaseConfigured) { setEditing(false); return }
    setSaving(true)
    await supabase.auth.updateUser({ data: { ...form, age: form.age ? Number(form.age) : '' } })
    setSaving(false)
    setEditing(false)
  }

  const m = user?.user_metadata || {}
  const firstName = m.first_name || ''
  const lastName = m.last_name || ''
  const initials = firstName
    ? (firstName[0] + (lastName[0] || '')).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U'
  const displayName = firstName ? `${firstName}${lastName ? ' ' + lastName : ''}` : null

  return (
    <div className="relative" ref={ref}>

      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, outline: 'none' }}
        onMouseEnter={e => { const a = e.currentTarget.querySelector('.avatar-ring'); if (a) a.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.55), 0 4px 14px rgba(0,0,0,0.25)' }}
        onMouseLeave={e => { const a = e.currentTarget.querySelector('.avatar-ring'); if (a) a.style.boxShadow = '0 0 0 1.5px rgba(255,255,255,0.1), 0 2px 8px rgba(0,0,0,0.2)' }}
      >
        <div
          className="avatar-ring"
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(160deg, #1a2744 0%, #0f172a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.08)',
            transition: 'box-shadow 0.2s',
            overflow: 'hidden',
          }}
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="8" r="3.8" fill="rgba(255,255,255,0.6)"/>
            <path d="M3.5 21c0-4.694 3.806-8 8.5-8s8.5 3.306 8.5 8" fill="rgba(255,255,255,0.6)"/>
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-slate-900/50 z-50 overflow-hidden">

          {/* Header */}
          <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono">
                Signed in as
              </p>
              {isApexUser ? (
                <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize:10, fontWeight:700, padding:'2px 8px', background:'linear-gradient(135deg, rgba(78,222,163,0.15), rgba(163,201,255,0.15))', border:'0.5px solid rgba(78,222,163,0.4)', color:'#4edea3', letterSpacing:'0.06em' }}>
                  <Rocket size={9} /> APEX
                </span>
              ) : isPaidUser ? (
                <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize:10, fontWeight:700, padding:'2px 8px', background:'rgba(163,201,255,0.12)', border:'0.5px solid rgba(163,201,255,0.35)', color:'#a3c9ff', letterSpacing:'0.06em' }}>
                  <Crown size={9} /> PRO
                </span>
              ) : (
                <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize:10, fontWeight:700, padding:'2px 8px', background:'rgba(138,145,159,0.1)', border:'0.5px solid rgba(138,145,159,0.25)', color:'#8a919f', letterSpacing:'0.06em' }}>
                  FREE
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {displayName || user?.email}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{user?.email}</p>
            {m.profession && <p className="text-xs text-sky-500 font-mono mt-0.5">{m.profession}</p>}

            {/* Age + Plan grid */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Age</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-200 font-semibold">{m.age || '—'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Plan</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-200 font-semibold">{isApexUser ? 'Apex' : isPaidUser ? 'Pro' : 'Free'}</p>
              </div>
            </div>
          </div>

          {/* Edit form */}
          {editing ? (
            <div className="px-4 py-3 space-y-3 border-b border-slate-100 dark:border-slate-800">
              {[
                { key: 'first_name', label: 'First name', type: 'text'   },
                { key: 'last_name',  label: 'Last name',  type: 'text'   },
                { key: 'profession', label: 'Profession', type: 'text'   },
                { key: 'age',        label: 'Age',        type: 'number' },
              ].map(({ key, label, type }) => (
                <div key={key}>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-sky-400 focus:bg-white"
                  />
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors disabled:opacity-60"
                >
                  <Check size={12} />{saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-700 text-xs transition-colors">
                  <X size={12} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
            >
              <UserCog size={15} /> Edit profile
            </button>
          )}

          {/* Completed tasks */}
          <button
            onClick={() => { setOpen(false); navigate('/completed-tasks') }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
          >
            <CheckCircle2 size={15} className="text-emerald-500" /> Completed tasks
          </button>

          {/* Plans */}
          <button
            onClick={() => { setOpen(false); navigate('/plans') }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
            style={{ color: isApexUser ? '#4edea3' : isPaidUser ? '#a3c9ff' : '#ffb689' }}
          >
            {isApexUser ? <Rocket size={15} /> : isPaidUser ? <Crown size={15} /> : <Zap size={15} />}
            {isApexUser ? 'Manage Apex plan' : isPaidUser ? 'Upgrade to Apex' : 'View plans & upgrade'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
          >
            <span className="flex items-center gap-2">
              {dark ? <Sun size={15} /> : <Moon size={15} />}
              {dark ? 'Light mode' : 'Dark mode'}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              {dark ? 'Light' : 'Dark'}
            </span>
          </button>

          {/* Sign out */}
          <button
            onClick={() => { setOpen(false); signOut() }}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={15} /> Sign out
          </button>

        </div>
      )}
    </div>
  )
}
