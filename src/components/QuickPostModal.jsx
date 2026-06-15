import { useState } from 'react'
import { X, PenLine, Loader2, AlertCircle } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const CATEGORIES = [
  'Career Advice', 'Hiring Tips', 'Job Market', 'AI & Tech',
  'Interview Tips', 'Salaries', 'Remote Work',
]

const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const SANS = 'Geist, Inter, sans-serif'

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
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '48px 16px',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
      overflowY: 'auto',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      <div style={{
        width: '100%', maxWidth: 560,
        background: 'linear-gradient(180deg, #0d1f3c 0%, #070d1a 100%)',
        border: '0.5px solid rgba(163,201,255,0.1)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
        fontFamily: SANS,
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '0.5px solid rgba(163,201,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(163,201,255,0.08)', border: '0.5px solid rgba(163,201,255,0.2)',
            }}>
              <PenLine size={13} style={{ color: '#a3c9ff' }} />
            </div>
            <div>
              <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#e2e2e8', letterSpacing: '-0.01em' }}>
                Write a Post
              </p>
              <p style={{ fontFamily: MONO, fontSize: 9, color: '#3a4455', letterSpacing: '0.04em' }}>
                Posting as {defaultName}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a4455', padding: 4, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#8a919f'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a4455'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Category */}
          <div>
            <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#3a4455', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                  padding: '5px 10px', cursor: 'pointer',
                  background: category === c ? 'rgba(163,201,255,0.1)' : 'transparent',
                  border: `0.5px solid ${category === c ? 'rgba(163,201,255,0.35)' : 'rgba(163,201,255,0.07)'}`,
                  color: category === c ? '#a3c9ff' : '#3a4455',
                  transition: 'all 0.15s',
                }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#3a4455', textTransform: 'uppercase' }}>
                Title *
              </label>
              <span style={{ fontFamily: MONO, fontSize: 9, color: title.length > 120 ? '#ffb4ab' : '#2a3040' }}>
                {title.length}/140
              </span>
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 140))}
              placeholder="A headline that makes people want to read more…"
              style={{
                width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                background: '#060c18', border: '0.5px solid rgba(163,201,255,0.08)',
                color: '#e2e2e8', fontSize: 13, fontFamily: SANS, fontWeight: 600,
                outline: 'none', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(163,201,255,0.25)'}
              onBlur={e => e.target.style.borderColor = 'rgba(163,201,255,0.08)'}
            />
          </div>

          {/* Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#3a4455', textTransform: 'uppercase' }}>
                Your story *
              </label>
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#2a3040' }}>
                {content.length < 50 && content.length > 0 ? `${50 - content.length} more to unlock` : `${content.length} chars`}
              </span>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your experience, insight or question. Use **bold** for emphasis. Real stories get the most reads."
              rows={7}
              style={{
                width: '100%', padding: '12px 14px', boxSizing: 'border-box',
                background: '#060c18', border: '0.5px solid rgba(163,201,255,0.08)',
                color: '#c0c7d5', fontSize: 13, fontFamily: SANS, lineHeight: 1.65,
                outline: 'none', resize: 'vertical', transition: 'border-color 0.15s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(163,201,255,0.25)'}
              onBlur={e => e.target.style.borderColor = 'rgba(163,201,255,0.08)'}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 11, color: '#ffb4ab' }}>
              <AlertCircle size={12} /> {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handlePublish}
            disabled={!canPost || loading}
            style={{
              width: '100%', padding: '13px 0',
              background: canPost ? 'linear-gradient(90deg, #1493ff, #0ea5e9)' : 'rgba(138,145,159,0.08)',
              border: 'none', cursor: canPost ? 'pointer' : 'default',
              color: canPost ? '#fff' : '#2a3040',
              fontFamily: MONO, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'filter 0.15s', boxShadow: canPost ? '0 4px 16px rgba(20,147,255,0.25)' : 'none',
            }}
            onMouseEnter={e => { if (canPost) e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {loading
              ? <><Loader2 size={13} className="animate-spin" /> Publishing…</>
              : <><PenLine size={13} /> Publish Post</>
            }
          </button>

          {!canPost && (title.length > 0 || content.length > 0) && (
            <p style={{ fontFamily: MONO, fontSize: 9, color: '#2a3040', textAlign: 'center', marginTop: -8 }}>
              {title.length < 10 ? 'Title needs 10+ chars · ' : ''}{content.length < 50 ? 'Content needs 50+ chars' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
