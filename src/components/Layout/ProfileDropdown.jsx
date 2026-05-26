import { useState, useRef, useEffect } from 'react'
import { LogOut, UserCog, Crown, Check, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApplications } from '../../contexts/ApplicationContext'
import { supabase, isSupabaseConfigured } from '../../lib/supabase'

export default function ProfileDropdown() {
  const { user, signOut } = useAuth()
  const { isPaidUser } = useApplications()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ first_name: '', last_name: '', age: '' })
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      const m = user?.user_metadata || {}
      setForm({ first_name: m.first_name || '', last_name: m.last_name || '', age: m.age || '' })
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

      {/* Trigger — name + avatar */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-3 group outline-none"
      >
        <div className="text-right hidden sm:block">
          {displayName && (
            <p className="text-xs font-semibold text-slate-700 leading-tight">{displayName}</p>
          )}
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono leading-tight truncate max-w-[140px]">
            {user?.email}
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-100 ring-1 ring-slate-200 group-hover:ring-sky-400 transition-all grid place-items-center text-xs font-bold font-mono text-slate-700">
          {initials}
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
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                isPaidUser
                  ? 'bg-sky-50 text-sky-600'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {isPaidUser && <Crown size={10} />}
                {isPaidUser ? 'PRO' : 'FREE'}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {displayName || user?.email}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-mono">{user?.email}</p>

            {/* Age + Plan grid */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Age</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-200 font-semibold">{m.age || '—'}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Plan</p>
                <p className="text-xs font-mono text-slate-700 dark:text-slate-200 font-semibold">{isPaidUser ? 'Pro' : 'Free'}</p>
              </div>
            </div>
          </div>

          {/* Edit form */}
          {editing ? (
            <div className="px-4 py-3 space-y-3 border-b border-slate-100 dark:border-slate-800">
              {[
                { key: 'first_name', label: 'First name', type: 'text' },
                { key: 'last_name',  label: 'Last name',  type: 'text' },
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
