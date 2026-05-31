import { useState, useEffect } from 'react'
import {
  PenLine, Heart, Clock, Tag, ChevronDown, X, AlertCircle,
  Search, TrendingUp, Loader2, MessageCircle, Bookmark, Share2,
  Flame, Sparkles, ArrowUp
} from 'lucide-react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { cn } from '../lib/cn'
import { format, parseISO, formatDistanceToNow } from 'date-fns'

/* ── categories ── */
const CATEGORIES = [
  { id: 'all',           label: 'All',            color: 'text-slate-600 dark:text-slate-300'  },
  { id: 'Hiring Tips',   label: 'Hiring Tips',    color: 'text-sky-600 dark:text-sky-400'      },
  { id: 'Job Market',    label: 'Job Market',     color: 'text-violet-600 dark:text-violet-400'},
  { id: 'AI & Tech',     label: 'AI & Tech',      color: 'text-emerald-600 dark:text-emerald-400'},
  { id: 'Career Advice', label: 'Career Advice',  color: 'text-amber-600 dark:text-amber-400'  },
  { id: 'Interview Tips',label: 'Interview Tips', color: 'text-rose-600 dark:text-rose-400'    },
  { id: 'Salaries',      label: 'Salaries',       color: 'text-teal-600 dark:text-teal-400'    },
  { id: 'Remote Work',   label: 'Remote Work',    color: 'text-indigo-600 dark:text-indigo-400'},
]

const CAT_BADGE = {
  'Hiring Tips':    'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800',
  'Job Market':     'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
  'AI & Tech':      'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  'Career Advice':  'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  'Interview Tips': 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
  'Salaries':       'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  'Remote Work':    'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  'General':        'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
}

/* ── mock seed posts ── */
const SEED_POSTS = [
  {
    id: 'seed-1',
    author_name: 'Sarah K.',
    title: "I applied to 200 jobs in 3 months. Here's what actually worked.",
    content: `After being laid off in February, I went into full application mode. 200 applications. 18 first-round interviews. 4 final rounds. 2 offers.

Here's what moved the needle:

**Tailoring > Volume.** My first 80 applications were copy-paste. My last 40 were tailored — different headline, different first paragraph. The tailored batch had a 3x higher response rate.

**LinkedIn outreach before applying.** I started messaging the hiring manager or a team member 2-3 days before submitting my application. Just a genuine note about what interested me in their work. It made my name recognisable when my CV landed.

**Following up once.** Not twice, not three times — once, exactly 7 days after applying. Short, professional, added one new piece of context about why I was excited about the role. This alone resurrected 3 opportunities I thought were dead.

The job I took wasn't from any job board. It was a referral from someone I'd reached out to cold on LinkedIn 6 weeks earlier. We'd had one brief conversation. She remembered me when a role opened.

The market is hard but it's not random. Pattern-match what works, cut what doesn't.`,
    category: 'Hiring Tips',
    likes: 47,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_seed: true,
  },
  {
    id: 'seed-2',
    author_name: 'Marcus T.',
    title: "AI is changing hiring faster than most candidates realise",
    content: `I spent last week talking to 6 different hiring managers across tech and finance. The picture that emerged was striking.

**Every single company** is now using AI at some point in their hiring pipeline. But not in the ways most people think.

It's not just ATS keyword matching anymore. Companies are using AI to:
- Score cover letters for "communication quality" before a human reads them
- Flag CVs where employment gaps aren't explained
- Analyse video interview responses for confidence and clarity signals

One hiring manager told me candidly: "We get 400 applications for a mid-level role now. Without AI filtering, we'd miss good candidates and burn our team out."

**What this means for you:**
- Write clearly. AI scoring rewards plain, direct language over jargon
- Don't leave gaps unexplained. Add a line about career breaks, freelance periods, travel
- Your first 3 sentences in a cover letter now carry disproportionate weight — they often determine whether a human reads the rest

The candidates doing well right now aren't the ones gaming the system. They're the ones whose applications are genuinely well-crafted and easy to scan. That's still a human skill.`,
    category: 'AI & Tech',
    likes: 83,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    is_seed: true,
  },
  {
    id: 'seed-3',
    author_name: 'Priya M.',
    title: "Negotiated a 22% salary increase. The exact script I used.",
    content: `I just closed an offer $18k above what was initially on the table. Here's exactly how the conversation went — no fluff.

**The setup:** I had two offers at similar levels. Company A was my preference. Company B was 15% higher.

**The call:**
Me: "I'm genuinely excited about this role and the team. I wanted to be transparent — I have a competing offer at a higher compensation level. Before I make my decision, I wanted to give you the chance to see if there's any flexibility."

Them: "What's the range you're looking at?"

Me: "The competing offer is at [X]. I'd be comfortable declining it to join your team if we could get to [X + 10%]."

**What happened:** They came back the next day at X + 8%. I accepted.

Key things that mattered:
1. I had a real competing offer. Don't bluff — they sometimes ask for documentation
2. I was specific about the number, not vague ("more competitive")
3. I gave them a reason to move fast (I had another offer)
4. I expressed genuine enthusiasm — negotiation isn't adversarial

The biggest mistake people make is treating negotiation as confrontational. Frame it as information sharing. You're helping them understand the market for your skills.`,
    category: 'Salaries',
    likes: 124,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    is_seed: true,
  },
  {
    id: 'seed-4',
    author_name: 'James O.',
    title: "Why the 'culture fit' question is a red flag — and how to answer it anyway",
    content: `"Tell me about a time you struggled to fit in with a team culture."

I've been asked this in 4 interviews this year. Each time I've watched the interviewer's face carefully. Here's what I've noticed.

When a company asks a lot about culture fit early, it usually means one of two things:
1. They have a genuinely strong culture worth protecting
2. They've had internal conflict they're trying to avoid repeating

The way to tell the difference: ask them to describe the culture instead of just listening to your answer. "What does a great culture fit look like on your team specifically?" A company with healthy culture answers this specifically and enthusiastically. A company with problems gives vague answers about "collaboration" and "ownership."

**For answering the question itself:**

Don't say you've never struggled — that's not credible.

A strong answer: Pick a real situation where you adapted successfully. Emphasise what you *learned* about working across differences, not just that you "resolved" it. Companies want people who are self-aware and adaptable, not people who claim they've never had friction.

The best culture fit answer I've ever given: "I joined a team where the communication style was much more direct and critical than I was used to. It was uncomfortable at first. I asked my manager directly for context — turns out it came from a military consulting background. Once I understood the why, I actually came to prefer it. Now I actively seek out direct feedback."

Real story. Landed me the job.`,
    category: 'Interview Tips',
    likes: 61,
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    is_seed: true,
  },
  {
    id: 'seed-5',
    author_name: 'Lena R.',
    title: "The honest state of the tech job market — mid 2025",
    content: `I've been tracking job posting data and talking to recruiters weekly for the past 6 months. Here's the unvarnished picture.

**What's actually happening:**

Senior roles (6+ years) are bouncing back. Companies over-cut in 2023-2024 and are now facing capability gaps. If you're senior and good, the market is decent.

Mid-level (3-5 years) is still competitive. The talent pool from the layoff wave is still large and hasn't fully cleared.

Junior is genuinely hard. AI tools have dramatically reduced the need for junior execution work. The roles that exist are fighting over the same 200 applicants.

**By function:**

- Engineering: AI/ML up significantly. Frontend commodity. Backend steady.
- Product: Oversupplied at every level except those with clear AI product experience
- Data: Analytics engineers up. Traditional BI analysts down.
- Design: Struggling. Companies are cutting design headcount faster than any other function.

**The green shoots:**

Cybersecurity is starved for talent and paying more than ever. Healthcare tech is hiring aggressively and largely immune to the broader cycle. Climate tech is early but growing faster than any other vertical.

If you're stuck in a tough market, consider a vertical pivot. Same skills, different industry = different supply/demand curve.`,
    category: 'Job Market',
    likes: 99,
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    is_seed: true,
  },
  {
    id: 'seed-6',
    author_name: 'Dev A.',
    title: "6 months remote after 10 years office — what nobody tells you",
    content: `I took a fully remote role in October after a decade of office jobs. Six months in, here's what surprised me.

**The good that nobody tells you:**
The deep work is real. I get more done in 4 focused hours at home than 8 distracted hours in an open plan office. I've shipped more in 6 months than in the past 2 years combined.

**The hard that nobody tells you:**
Visibility is a skill you have to actively build. In an office, people see you working. Remote, you're invisible unless you make yourself visible. I now over-communicate my progress deliberately — daily standups are more detailed, I post when I finish things in Slack even when nobody asked.

**The thing that genuinely surprised me:**
I miss weak-tie relationships more than close colleagues. The random 5-minute conversation with someone in a different team — those are gone. And those conversations were where a lot of my best ideas came from.

**What I do now:**
Virtual coffee with someone new every 2 weeks. One in-person team trip per quarter (I negotiated this into my contract). I invested in my home setup — good chair, monitor, light. It signals to my brain that this is a real workspace.

Would I go back to full-time office? No. Would I do hybrid if the company was right? Yes. Fully remote is great but it takes intentional effort that nobody warned me about.`,
    category: 'Remote Work',
    likes: 55,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    is_seed: true,
  },
]

/* ── category badge ── */
function CatBadge({ category }) {
  return (
    <span className={cn('text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 border', CAT_BADGE[category] || CAT_BADGE.General)}>
      {category}
    </span>
  )
}

/* ── post card ── */
function PostCard({ post, onOpen, onLike, liked }) {
  const excerpt = post.content.replace(/\*\*/g, '').split('\n').find(l => l.trim().length > 40) || post.content.slice(0, 160)
  const timeAgo = formatDistanceToNow(parseISO(post.created_at), { addSuffix: true })

  return (
    <article
      onClick={() => onOpen(post)}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group flex flex-col"
    >
      {/* Category stripe */}
      <div className={cn('h-0.5 w-full', {
        'bg-sky-400':     post.category === 'Hiring Tips',
        'bg-violet-400':  post.category === 'Job Market',
        'bg-emerald-400': post.category === 'AI & Tech',
        'bg-amber-400':   post.category === 'Career Advice',
        'bg-rose-400':    post.category === 'Interview Tips',
        'bg-teal-400':    post.category === 'Salaries',
        'bg-indigo-400':  post.category === 'Remote Work',
        'bg-slate-400':   !CAT_BADGE[post.category],
      })} />

      <div className="p-5 flex flex-col flex-1">
        {/* Category + time */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <CatBadge category={post.category} />
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">{timeAgo}</span>
        </div>

        {/* Title */}
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug mb-2 tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 flex-1 mb-4">
          {excerpt.slice(0, 180)}{excerpt.length > 180 ? '…' : ''}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{post.author_name}</span>
          <button
            onClick={e => { e.stopPropagation(); onLike(post.id) }}
            className={cn(
              'flex items-center gap-1 text-[11px] font-mono font-bold transition-colors',
              liked ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600 hover:text-rose-400'
            )}
          >
            <Heart size={12} fill={liked ? 'currentColor' : 'none'} />
            {post.likes + (liked && !post.is_seed ? 0 : 0)}
            {post.likes}
          </button>
        </div>
      </div>
    </article>
  )
}

/* ── post modal (read view) ── */
function PostModal({ post, onClose, onLike, liked }) {
  if (!post) return null
  const timeAgo = formatDistanceToNow(parseISO(post.created_at), { addSuffix: true })

  // Render basic bold markdown (**text**)
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <p key={i} className={line.trim() === '' ? 'mt-3' : 'mb-1'}>
          {parts.map((part, j) =>
            j % 2 === 1
              ? <strong key={j} className="font-bold text-slate-900 dark:text-slate-100">{part}</strong>
              : <span key={j}>{part}</span>
          )}
        </p>
      )
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <CatBadge category={post.category} />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-7 h-7 bg-sky-500 flex items-center justify-center text-white text-[11px] font-extrabold shrink-0">
              {post.author_name[0]}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{post.author_name}</p>
              <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{timeAgo}</p>
            </div>
          </div>

          <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {renderContent(post.content)}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={() => onLike(post.id)}
            className={cn(
              'flex items-center gap-1.5 text-sm font-bold transition-colors',
              liked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
            )}
          >
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
            {post.likes} {post.likes === 1 ? 'like' : 'likes'}
          </button>
          <button onClick={onClose} className="text-xs font-mono text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase tracking-widest">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── write post modal ── */
const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

function WriteModal({ onClose, onPublish, user }) {
  const [title,      setTitle]      = useState('')
  const [content,    setContent]    = useState('')
  const [category,   setCategory]   = useState('Career Advice')
  const [authorName, setAuthorName] = useState(() => {
    const m = user?.user_metadata || {}
    if (m.first_name) return `${m.first_name}${m.last_name ? ' ' + m.last_name : ''}`
    return (user?.email || '').split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Anonymous'
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const canPublish = title.trim().length >= 10 && content.trim().length >= 50

  const handlePublish = async () => {
    if (!canPublish) return
    setLoading(true); setError(null)
    try {
      await onPublish({ title: title.trim(), content: content.trim(), category, author_name: authorName.trim() || 'Anonymous' })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to publish')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
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
          padding: '16px 20px', borderBottom: '0.5px solid rgba(163,201,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(163,201,255,0.08)', border: '0.5px solid rgba(163,201,255,0.2)',
            }}>
              <PenLine size={13} style={{ color: '#a3c9ff' }} />
            </div>
            <div>
              <p style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: '#e2e2e8', letterSpacing: '-0.01em' }}>Write a Post</p>
              <p style={{ fontFamily: MONO, fontSize: 9, color: '#3a4455', letterSpacing: '0.04em' }}>Posting as {authorName}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3a4455', padding: 4 }}
            onMouseEnter={e => e.currentTarget.style.color = '#8a919f'}
            onMouseLeave={e => e.currentTarget.style.color = '#3a4455'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Name */}
          <div>
            <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#3a4455', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Your Name</label>
            <input
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="How you'll appear on this post"
              style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', background: '#060c18', border: '0.5px solid rgba(163,201,255,0.08)', color: '#e2e2e8', fontSize: 13, fontFamily: SANS, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'rgba(163,201,255,0.25)'}
              onBlur={e => e.target.style.borderColor = 'rgba(163,201,255,0.08)'}
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#3a4455', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Category</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <button key={c.id} onClick={() => setCategory(c.id)} style={{
                  fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                  padding: '5px 10px', cursor: 'pointer',
                  background: category === c.id ? 'rgba(163,201,255,0.1)' : 'transparent',
                  border: `0.5px solid ${category === c.id ? 'rgba(163,201,255,0.35)' : 'rgba(163,201,255,0.07)'}`,
                  color: category === c.id ? '#a3c9ff' : '#3a4455',
                  transition: 'all 0.15s',
                }}>{c.label}</button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#3a4455', textTransform: 'uppercase' }}>Title *</label>
              <span style={{ fontFamily: MONO, fontSize: 9, color: title.length > 120 ? '#ffb4ab' : '#2a3040' }}>{title.length}/140</span>
            </div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 140))}
              placeholder="Write a headline that makes people want to read more…"
              style={{ width: '100%', padding: '10px 14px', boxSizing: 'border-box', background: '#060c18', border: '0.5px solid rgba(163,201,255,0.08)', color: '#e2e2e8', fontSize: 13, fontFamily: SANS, fontWeight: 600, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'rgba(163,201,255,0.25)'}
              onBlur={e => e.target.style.borderColor = 'rgba(163,201,255,0.08)'}
            />
          </div>

          {/* Content */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#3a4455', textTransform: 'uppercase' }}>Content *</label>
              <span style={{ fontFamily: MONO, fontSize: 9, color: '#2a3040' }}>
                {content.length < 50 && content.length > 0 ? `${50 - content.length} more to unlock` : `${content.length} chars`}
              </span>
            </div>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Share your experience, insight, or question. Use **bold** for emphasis. Real stories get the most reads."
              rows={10}
              style={{ width: '100%', padding: '12px 14px', boxSizing: 'border-box', background: '#060c18', border: '0.5px solid rgba(163,201,255,0.08)', color: '#c0c7d5', fontSize: 13, fontFamily: SANS, lineHeight: 1.65, outline: 'none', resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = 'rgba(163,201,255,0.25)'}
              onBlur={e => e.target.style.borderColor = 'rgba(163,201,255,0.08)'}
            />
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: MONO, fontSize: 11, color: '#ffb4ab' }}>
              <AlertCircle size={12} /> {error}
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={!canPublish || loading}
            style={{
              width: '100%', padding: '13px 0',
              background: canPublish ? 'linear-gradient(90deg, #1493ff, #0ea5e9)' : 'rgba(138,145,159,0.08)',
              border: 'none', cursor: canPublish ? 'pointer' : 'default',
              color: canPublish ? '#fff' : '#2a3040',
              fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: canPublish ? '0 4px 16px rgba(20,147,255,0.25)' : 'none',
              transition: 'filter 0.15s',
            }}
            onMouseEnter={e => { if (canPublish) e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {loading ? <><Loader2 size={13} className="animate-spin" /> Publishing…</> : <><PenLine size={13} /> Publish Post</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── main page ── */
export default function Blog() {
  const { user } = useAuth()

  const [posts,        setPosts]        = useState(SEED_POSTS)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery,  setSearchQuery]  = useState('')
  const [selectedPost, setSelectedPost] = useState(null)
  const [showWrite,    setShowWrite]    = useState(false)
  const [likedPosts,   setLikedPosts]   = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('trackr_liked_posts') || '[]')) }
    catch { return new Set() }
  })
  const [loading,      setLoading]      = useState(false)

  /* ── fetch from Supabase ── */
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    setLoading(true)
    supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error && data?.length) {
          setPosts([...data, ...SEED_POSTS])
        }
        setLoading(false)
      })
  }, [])

  /* ── like ── */
  const handleLike = async (postId) => {
    const alreadyLiked = likedPosts.has(postId)
    const delta = alreadyLiked ? -1 : 1

    // Update local state
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: Math.max(0, p.likes + delta) } : p))
    const next = new Set(likedPosts)
    alreadyLiked ? next.delete(postId) : next.add(postId)
    setLikedPosts(next)
    localStorage.setItem('trackr_liked_posts', JSON.stringify([...next]))

    // Update Supabase (only for non-seed posts)
    if (isSupabaseConfigured && supabase && !postId.startsWith('seed-')) {
      const post = posts.find(p => p.id === postId)
      if (post) {
        await supabase.from('community_posts').update({ likes: Math.max(0, post.likes + delta) }).eq('id', postId)
      }
    }
  }

  /* ── publish ── */
  const handlePublish = async ({ title, content, category, author_name }) => {
    const newPost = {
      id: crypto.randomUUID(),
      user_id: user?.id || null,
      author_name,
      title,
      content,
      category,
      likes: 0,
      created_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase && user) {
      const { data, error } = await supabase
        .from('community_posts')
        .insert({ ...newPost, user_id: user.id })
        .select()
        .single()
      if (error) throw new Error(error.message)
      setPosts(prev => [data, ...prev])
    } else {
      setPosts(prev => [newPost, ...prev])
    }
  }

  /* ── filter ── */
  const filtered = posts.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const q = searchQuery.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  const topPost = filtered[0]
  const restPosts = filtered.slice(1)

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-sky-500 font-bold mb-2">Trackr Community</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">The Feed</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5 max-w-lg">
            Real stories from real job seekers. Hiring insights, market takes, salary wins, and career moves — no recruiters, no ads.
          </p>
        </div>
        <button
          onClick={() => setShowWrite(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-sm tracking-wide transition-colors shrink-0"
        >
          <PenLine size={14} /> Write a Post
        </button>
      </div>

      {/* ── Search + filter bar ── */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:border-sky-400 transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 border transition-all',
                activeCategory === cat.id
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-500'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-200 dark:border-slate-700">
          <p className="text-slate-400 dark:text-slate-500 text-sm font-mono">No posts match your filter</p>
          <button onClick={() => { setActiveCategory('all'); setSearchQuery('') }} className="text-xs text-sky-500 hover:text-sky-600 mt-2 font-semibold">
            Clear filters
          </button>
        </div>
      )}

      {/* ── Featured post (top) ── */}
      {topPost && (
        <article
          onClick={() => setSelectedPost(topPost)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
        >
          <div className={cn('h-0.5 w-full', {
            'bg-sky-400':     topPost.category === 'Hiring Tips',
            'bg-violet-400':  topPost.category === 'Job Market',
            'bg-emerald-400': topPost.category === 'AI & Tech',
            'bg-amber-400':   topPost.category === 'Career Advice',
            'bg-rose-400':    topPost.category === 'Interview Tips',
            'bg-teal-400':    topPost.category === 'Salaries',
            'bg-indigo-400':  topPost.category === 'Remote Work',
            'bg-slate-400':   !CAT_BADGE[topPost.category],
          })} />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <CatBadge category={topPost.category} />
              <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                <Flame size={10} /> Featured
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug mb-3 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
              {topPost.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 max-w-2xl mb-5">
              {topPost.content.replace(/\*\*/g, '').split('\n').find(l => l.trim().length > 40)?.slice(0, 240)}…
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-sky-500 flex items-center justify-center text-white text-[10px] font-extrabold shrink-0">
                  {topPost.author_name[0]}
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{topPost.author_name}</span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {formatDistanceToNow(parseISO(topPost.created_at), { addSuffix: true })}
                </span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleLike(topPost.id) }}
                className={cn(
                  'flex items-center gap-1 text-[11px] font-mono font-bold transition-colors',
                  likedPosts.has(topPost.id) ? 'text-rose-500' : 'text-slate-300 dark:text-slate-600 hover:text-rose-400'
                )}
              >
                <Heart size={12} fill={likedPosts.has(topPost.id) ? 'currentColor' : 'none'} />
                {topPost.likes}
              </button>
            </div>
          </div>
        </article>
      )}

      {/* ── Post grid ── */}
      {restPosts.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {restPosts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              onOpen={setSelectedPost}
              onLike={handleLike}
              liked={likedPosts.has(post.id)}
            />
          ))}
        </div>
      )}

      {/* ── Supabase setup hint ── */}
      {!isSupabaseConfigured && (
        <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-5 py-4">
          <AlertCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1">Demo mode — posts won't persist</p>
            <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
              To save community posts, create a <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1">community_posts</code> table in Supabase.
              Run: <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 text-[10px] leading-relaxed break-all">create table community_posts (id uuid default gen_random_uuid() primary key, user_id uuid, author_name text, title text, content text, category text default 'General', likes integer default 0, created_at timestamptz default now());</code>
            </p>
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onLike={handleLike}
          liked={likedPosts.has(selectedPost.id)}
        />
      )}
      {showWrite && (
        <WriteModal
          onClose={() => setShowWrite(false)}
          onPublish={handlePublish}
          user={user}
        />
      )}
    </div>
  )
}
