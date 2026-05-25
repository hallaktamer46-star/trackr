import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { STATUSES, STATUS_CONFIG } from '../../contexts/ApplicationContext'
import { cn } from '../../lib/cn'

const EMPTY = {
  company: '',
  job_title: '',
  date_applied: '',
  url: '',
  salary_range: '',
  notes: '',
  status: 'wishlist',
  reminder_date: '',
}

export default function ApplicationModal({ open, onClose, onSave, onDelete, initial }) {
  const [form, setForm] = useState(EMPTY)
  const isEditing = Boolean(initial?.id)

  useEffect(() => {
    if (open) {
      setForm(initial ? {
        company:       initial.company       || '',
        job_title:     initial.job_title     || '',
        date_applied:  initial.date_applied  || '',
        url:           initial.url           || '',
        salary_range:  initial.salary_range  || '',
        notes:         initial.notes         || '',
        status:        initial.status        || 'wishlist',
        reminder_date: initial.reminder_date || '',
      } : EMPTY)
    }
  }, [open, initial])

  if (!open) return null

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.job_title.trim()) return
    onSave({ ...initial, ...form })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
          <h2 className="font-mono uppercase tracking-wider text-xs font-bold text-slate-700 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]" />
            {isEditing ? 'Edit Application' : 'New Application'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Company + Job title */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company">
              <input required value={form.company} onChange={e => set('company', e.target.value)} placeholder="Stripe" className="inp" />
            </Field>
            <Field label="Job Title">
              <input required value={form.job_title} onChange={e => set('job_title', e.target.value)} placeholder="Design Engineer" className="inp" />
            </Field>
          </div>

          {/* Status */}
          <Field label="Status">
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    form.status === s
                      ? STATUS_CONFIG[s].color + ' border-current'
                      : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
                  )}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </Field>

          {/* Date + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Applied Date">
              <input type="date" value={form.date_applied} onChange={e => set('date_applied', e.target.value)} className="inp" />
            </Field>
            <Field label="Salary">
              <input value={form.salary_range} onChange={e => set('salary_range', e.target.value)} placeholder="$180k" className="inp" />
            </Field>
          </div>

          {/* URL + Reminder */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Job Posting URL">
              <input type="url" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://..." className="inp" />
            </Field>
            <Field label="Reminder">
              <input type="date" value={form.reminder_date} onChange={e => set('reminder_date', e.target.value)} className="inp" />
            </Field>
          </div>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Recruiter intro, referral source, prep notes…"
              className="inp resize-none"
            />
          </Field>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            {isEditing ? (
              <button
                type="button"
                onClick={() => { onDelete(initial.id); onClose() }}
                className="flex items-center gap-1.5 text-sm text-rose-500 hover:text-rose-700 font-medium transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors">
                {isEditing ? 'Save Changes' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .inp{width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#0f172a;background:#f8fafc;outline:none;transition:all 0.15s;}
        .inp:focus{border-color:#38bdf8;background:white;box-shadow:0 0 0 3px rgba(56,189,248,0.1);}
        .inp::placeholder{color:#94a3b8;}
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold">
        {label}
      </label>
      {children}
    </div>
  )
}
