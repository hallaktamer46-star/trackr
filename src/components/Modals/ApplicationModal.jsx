import { useState, useEffect } from 'react'
import { X, Calendar, Link, DollarSign, FileText, Bell } from 'lucide-react'
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
        company:      initial.company      || '',
        job_title:    initial.job_title    || '',
        date_applied: initial.date_applied || '',
        url:          initial.url          || '',
        salary_range: initial.salary_range || '',
        notes:        initial.notes        || '',
        status:       initial.status       || 'wishlist',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {isEditing ? 'Edit Application' : 'New Application'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Status tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
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
          </div>

          {/* Company + Job title */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Company *" icon={null}>
              <input
                required
                value={form.company}
                onChange={e => set('company', e.target.value)}
                placeholder="Acme Inc."
                className="input"
              />
            </Field>
            <Field label="Job Title *" icon={null}>
              <input
                required
                value={form.job_title}
                onChange={e => set('job_title', e.target.value)}
                placeholder="Software Engineer"
                className="input"
              />
            </Field>
          </div>

          {/* Date + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date Applied" icon={<Calendar size={14} />}>
              <input
                type="date"
                value={form.date_applied}
                onChange={e => set('date_applied', e.target.value)}
                className="input pl-8"
              />
            </Field>
            <Field label="Salary Range" icon={<DollarSign size={14} />}>
              <input
                value={form.salary_range}
                onChange={e => set('salary_range', e.target.value)}
                placeholder="$80k–$100k"
                className="input pl-8"
              />
            </Field>
          </div>

          {/* URL */}
          <Field label="Job Posting URL" icon={<Link size={14} />}>
            <input
              type="url"
              value={form.url}
              onChange={e => set('url', e.target.value)}
              placeholder="https://..."
              className="input pl-8"
            />
          </Field>

          {/* Reminder */}
          <Field label="Follow-up Reminder" icon={<Bell size={14} />}>
            <input
              type="date"
              value={form.reminder_date}
              onChange={e => set('reminder_date', e.target.value)}
              className="input pl-8"
            />
          </Field>

          {/* Notes */}
          <Field label="Notes" icon={<FileText size={14} />}>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Recruiter name, interview notes, impressions..."
              rows={3}
              className="input pl-8 resize-none"
            />
          </Field>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {isEditing ? (
              <button
                type="button"
                onClick={() => { onDelete(initial.id); onClose() }}
                className="text-sm text-rose-500 hover:text-rose-700 font-medium"
              >
                Delete
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors"
              >
                {isEditing ? 'Save Changes' : 'Add Application'}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus { border-color: #38bdf8; background: white; box-shadow: 0 0 0 3px rgba(56,189,248,0.1); }
        .input::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  )
}

function Field({ label, icon, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
        {children}
      </div>
    </div>
  )
}
