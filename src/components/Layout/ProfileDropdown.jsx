import { useState, useRef, useEffect } from 'react'
import { LogOut, Pencil, Check, X, Crown, User } from 'lucide-react'
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

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Populate form from user metadata when opening
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

  const initials = (() => {
    const m = user?.user_metadata || {}
    if (m.first_name) return (m.first_name[0] + (m.last_name?.[0] || '')).toUpperCase()
    return user?.email?.[0]?.toUpperCase() ?? 'U'
  })()

  const displayName = (() => {
    const m = user?.user_metadata || {}
    if (m.first_name) return `${m.first_name}${m.last_name ? ' ' + m.last_name : ''}`
    return user?.email ?? 'User'
  })()

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="relative" ref={ref}>
      {/* Avatar button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-semibold hover:bg-sky-200 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 z-50 overflow-hidden">

          {/* Header strip */}
          <div className="bg-gradient-to-br from-sky-50 to-slate-50 px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-base font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-slate-900 text-sm truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <span className={`ml-auto shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 ${
              isPaidUser
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}>
              {isPaidUser && <Crown size={10} />}
              {isPaidUser ? 'Pro' : 'Free'}
            </span>
          </div>

          {/* Details */}
          <div className="px-5 py-4 space-y-3">
            {editing ? (
              <>
                <Field label="First name">
                  <input
                    value={form.first_name}
                    onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    placeholder="First name"
                    className="input"
                  />
                </Field>
                <Field label="Last name">
                  <input
                    value={form.last_name}
                    onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    placeholder="Last name"
                    className="input"
                  />
                </Field>
                <Field label="Age">
                  <input
                    type="number"
                    min="1" max="120"
                    value={form.age}
                    onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                    placeholder="Your age"
                    className="input"
                  />
                </Field>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    <Check size={14} />{saving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-700 text-sm transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Row label="Email" value={user?.email} />
                <Row label="First name" value={user?.user_metadata?.first_name || '—'} />
                <Row label="Last name"  value={user?.user_metadata?.last_name  || '—'} />
                <Row label="Age"        value={user?.user_metadata?.age        || '—'} />
                {memberSince && <Row label="Member since" value={memberSince} />}
                <button
                  onClick={() => setEditing(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-200 text-sm font-medium transition-colors mt-1"
                >
                  <Pencil size={13} /> Edit profile
                </button>
              </>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-slate-100 px-5 py-3">
            <button
              onClick={() => { setOpen(false); signOut() }}
              className="w-full flex items-center gap-2 text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>

        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-slate-800 font-medium truncate ml-4 max-w-[180px]">{value}</span>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      <style>{`.input{width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:10px;font-size:14px;background:#f8fafc;outline:none;color:#0f172a}.input:focus{border-color:#38bdf8;background:#fff}`}</style>
      {children}
    </div>
  )
}
