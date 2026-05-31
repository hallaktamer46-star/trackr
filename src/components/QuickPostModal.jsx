import { useState } from 'react'
import { X, PenLine, Loader2, AlertCircle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/cn'

const CATEGORIES = [
  'Career Advice', 'Hiring Tips', 'Job Market', 'AI & Tech',
  'Interview Tips', 'Salaries', 'Remote Work',
]

export default function QuickPostModal({ onClose, onPublished }) {
  const { user } = useAuth()

  const defaultName = (() => {
    const m = user?.user_metadata || {}
    if (m.first_name) return `${m.first_name}${m.last_name ? ' ' + m.last_name : ''}`
    return (user?.email || '').split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Anonymous'
  })()

  const [title,    setTitle]    = useState('')
  const [content,  setContent]  = useState('')
  const [category, setCategory] = useState('Career Advice')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const canPost = title.trim().length >= 10 && content.trim().length >= 50

  const handlePublish = async () => {
    if (!canPost) return
    setLoading(true); setError(null)
    try {
      const newPost = {
        id: crypto.randomUUID(),
        user_id: user?.id || null,
        author_name: defaultName,
        title: title.trim(),
        content: content.trim(),
        category,
        likes: 0,
        created_at: new Date().toISOString(),
      }
      if (isSupabaseConfigured && supabase && user) {
        const { data, error: sbErr } = await supabase
          .from('community_posts')
          .insert({ ...newPost, user_id: user.id })
          .select().single()
        if (sbErr) throw new Error(sbErr.message)
        onPublished?.(data)
      } else {
        onPublished?.(newPost)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to publish')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 bg-black/40 backdrop-blur-sm overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <PenLine size={16} className="text-sky-500" />
            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Write a Post</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">

          {/* Display name (read-only) */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
              Your Name
            </label>
            <div className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800">
              {defaultName}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-sky-400 transition-colors appearance-none cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
                Title *
              </label>
              <span className={cn('text-[10px] font-mono', title.length > 120 ? 'text-rose-500' : 'text-slate-400')}>
                {title.length}/140
              </span>
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 140))}
              placeholder="Write a headline that makes people want to read more…"
              className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 transition-colors"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-slate-500 font-semibold">
                Content *
              </label>
              <span className="text-[10px] font-mono text-slate-400">Use **bold** for emphasis</span>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your experience, insight, or question. Be specific — the best posts tell a real story or share actionable knowledge…"
              rows={10}
              className="w-full p-4 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-sky-400 focus:bg-white dark:focus:bg-slate-800 transition-colors resize-none leading-relaxed"
            />
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">
              {content.length} chars {content.length < 50 && content.length > 0 && '· minimum 50 to publish'}
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
              <AlertCircle size={12} /> {error}
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={!canPost || loading}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-extrabold text-sm tracking-wide transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={14} className="animate-spin" /> Publishing…</>
              : <><PenLine size={14} /> Publish Post</>
            }
          </button>

        </div>
      </div>
    </div>
  )
}
