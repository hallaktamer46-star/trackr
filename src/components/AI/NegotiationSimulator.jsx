import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Star, ChevronDown, RotateCcw, Zap } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import { useNavigate } from 'react-router-dom'

const EXP_LEVELS = ['Junior', 'Mid-level', 'Senior', 'Staff / Lead']

const LABEL = {
  fontFamily: 'Consolas, Menlo, Monaco, monospace',
  fontSize: 9, fontWeight: 600,
  letterSpacing: '0.1em', color: '#8a919f',
  textTransform: 'uppercase', display: 'block', marginBottom: 6,
}

const INPUT = {
  width: '100%', padding: '10px 14px',
  background: '#0d1117',
  border: '0.5px solid rgba(48,54,61,0.9)',
  color: '#e2e2e8', fontSize: 13, outline: 'none',
  fontFamily: 'Geist, Inter, sans-serif',
}

function ScoreRing({ score }) {
  const color = score >= 75 ? '#4edea3' : score >= 50 ? '#ffb689' : '#ffb4ab'
  const r = 28, c = 2 * Math.PI * r
  const dash = (score / 100) * c
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(48,54,61,0.6)" strokeWidth="5" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="butt"
        transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x="36" y="40" textAnchor="middle"
        style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 16, fontWeight: 700, fill: color }}>
        {score}
      </text>
    </svg>
  )
}

export default function NegotiationSimulator() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState('setup') // setup | chat | score
  const [context, setContext] = useState({ company: '', jobTitle: '', offerAmount: '', targetAmount: '', experienceLevel: 'Mid-level' })
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [scoreData, setScoreData] = useState(null)
  const [scoring, setScoring] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const setCtx = (k, v) => setContext(c => ({ ...c, [k]: v }))

  const startChat = async () => {
    if (!context.company || !context.jobTitle || !context.offerAmount || !context.targetAmount) return
    setLoading(true); setError(null)
    try {
      const res = await apiFetch('/api/ai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages([{ role: 'assistant', content: data.reply }])
      setPhase('chat')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const newMessages = [...messages, { role: 'user', content: input.trim() }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const res = await apiFetch('/api/ai/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages(m => [...m, { role: 'assistant', content: data.reply }])
      setTimeout(() => inputRef.current?.focus(), 50)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getScore = async () => {
    setScoring(true); setError(null)
    try {
      const res = await apiFetch('/api/ai/negotiate/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setScoreData(data)
      setPhase('score')
    } catch (err) {
      setError(err.message)
    } finally {
      setScoring(false)
    }
  }

  const reset = () => {
    setPhase('setup'); setMessages([]); setScoreData(null)
    setContext({ company: '', jobTitle: '', offerAmount: '', targetAmount: '', experienceLevel: 'Mid-level' })
    setError(null)
  }

  if (phase === 'setup') return (
    <div style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
      <div style={{ background: '#161b22', border: '0.5px solid rgba(48,54,61,0.9)', padding: 24, marginBottom: 16 }}>
        <div className="flex items-center gap-2 mb-6">
          <div style={{ width: 6, height: 6, background: '#4edea3' }} />
          <span style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#4edea3', textTransform: 'uppercase' }}>
            Offer Negotiation Simulator
          </span>
        </div>

        <p style={{ fontSize: 13, color: '#8a919f', marginBottom: 24, lineHeight: 1.6 }}>
          Set up your scenario and the AI will play a recruiter from the company. Negotiate in real time, then get a scorecard and a script you can actually use.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label style={LABEL}>Company</label>
            <input style={INPUT} placeholder="e.g. Stripe" value={context.company} onChange={e => setCtx('company', e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>Job Title</label>
            <input style={INPUT} placeholder="e.g. Senior Engineer" value={context.jobTitle} onChange={e => setCtx('jobTitle', e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>Their Offer</label>
            <input style={INPUT} placeholder="e.g. $120,000" value={context.offerAmount} onChange={e => setCtx('offerAmount', e.target.value)} />
          </div>
          <div>
            <label style={LABEL}>Your Target</label>
            <input style={INPUT} placeholder="e.g. $145,000" value={context.targetAmount} onChange={e => setCtx('targetAmount', e.target.value)} />
          </div>
        </div>

        <div className="mb-6">
          <label style={LABEL}>Experience Level</label>
          <div className="flex gap-2">
            {EXP_LEVELS.map(l => (
              <button key={l} onClick={() => setCtx('experienceLevel', l)}
                style={{
                  padding: '7px 14px', fontSize: 11, fontFamily: 'Geist, Inter, sans-serif',
                  background: context.experienceLevel === l ? 'rgba(78,222,163,0.1)' : '#0d1117',
                  border: `0.5px solid ${context.experienceLevel === l ? '#4edea3' : 'rgba(48,54,61,0.9)'}`,
                  color: context.experienceLevel === l ? '#4edea3' : '#8a919f',
                  fontWeight: context.experienceLevel === l ? 600 : 400, cursor: 'pointer',
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {error && <p style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 11, color: '#ffb4ab', marginBottom: 12 }}>{error}</p>}

        <button
          onClick={startChat}
          disabled={loading || !context.company || !context.jobTitle || !context.offerAmount || !context.targetAmount}
          className="flex items-center justify-center gap-2 w-full transition-all hover:brightness-110 disabled:opacity-30"
          style={{ background: '#4edea3', color: '#0d1117', padding: '12px 0', fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          {loading ? <><Loader2 size={13} className="animate-spin" /> Starting…</> : <>Start Negotiation →</>}
        </button>
      </div>
    </div>
  )

  if (phase === 'score') return (
    <div style={{ fontFamily: 'Geist, Inter, sans-serif' }}>
      <div style={{ background: '#161b22', border: '0.5px solid rgba(48,54,61,0.9)', padding: 24 }}>

        {/* Score header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: '#8a919f', textTransform: 'uppercase', marginBottom: 4 }}>
              Negotiation Score
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: '#e2e2e8' }}>
              {scoreData.verdict}
            </h2>
            <p style={{ fontSize: 12, color: '#8a919f', marginTop: 2 }}>{scoreData.final_outcome}</p>
          </div>
          <ScoreRing score={scoreData.score} />
        </div>

        {/* Strengths */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ ...LABEL, color: '#4edea3', marginBottom: 10 }}>What you did well</p>
          <div className="space-y-2">
            {scoreData.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Star size={11} style={{ color: '#4edea3', marginTop: 2, flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#c0c7d5', lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ ...LABEL, color: '#ffb689', marginBottom: 10 }}>What to do differently</p>
          <div className="space-y-3">
            {scoreData.improvements.map((item, i) => (
              <div key={i} style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '10px 14px' }}>
                <p style={{ fontSize: 11, color: '#ffb689', marginBottom: 4 }}>{item.what}</p>
                <p style={{ fontSize: 12, color: '#c0c7d5', lineHeight: 1.5 }}>
                  <span style={{ color: '#8a919f', fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 9 }}>SAY INSTEAD → </span>
                  {item.instead}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Script */}
        <div style={{ marginBottom: 24 }}>
          <p style={{ ...LABEL, color: '#a3c9ff', marginBottom: 10 }}>Your ready-to-use script</p>
          <div style={{ background: '#0d1117', border: '0.5px solid rgba(163,201,255,0.2)', padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: '#c0c7d5', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{scoreData.script}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={reset} className="flex items-center gap-2 transition-all hover:brightness-110"
            style={{ padding: '10px 20px', background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', color: '#8a919f', fontSize: 12, fontFamily: 'Geist, Inter, sans-serif' }}>
            <RotateCcw size={13} /> Try again
          </button>
          <button onClick={() => setPhase('chat')} className="flex items-center gap-2 transition-all hover:brightness-110"
            style={{ padding: '10px 20px', background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', color: '#a3c9ff', fontSize: 12, fontFamily: 'Geist, Inter, sans-serif' }}>
            <ChevronDown size={13} /> Back to chat
          </button>
        </div>
      </div>
    </div>
  )

  // Chat phase
  return (
    <div style={{ fontFamily: 'Geist, Inter, sans-serif' }}>

      {/* Context bar */}
      <div className="flex items-center justify-between mb-3" style={{ padding: '8px 14px', background: '#161b22', border: '0.5px solid rgba(48,54,61,0.9)' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 10, color: '#4edea3', fontWeight: 600 }}>
            {context.company}
          </span>
          <span style={{ color: 'rgba(48,54,61,0.9)', fontSize: 12 }}>·</span>
          <span style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 10, color: '#8a919f' }}>{context.jobTitle}</span>
          <span style={{ color: 'rgba(48,54,61,0.9)', fontSize: 12 }}>·</span>
          <span style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 10, color: '#ffb689' }}>
            Offer: {context.offerAmount}
          </span>
          <span style={{ color: 'rgba(48,54,61,0.9)', fontSize: 12 }}>·</span>
          <span style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 10, color: '#a3c9ff' }}>
            Target: {context.targetAmount}
          </span>
        </div>
        <button onClick={reset} style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 9, color: '#8a919f', letterSpacing: '0.05em' }}>
          RESET
        </button>
      </div>

      {/* Messages */}
      <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', minHeight: 320, maxHeight: 420, overflowY: 'auto', padding: '16px' }} className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div style={{ width: 24, height: 24, background: 'rgba(78,222,163,0.1)', border: '0.5px solid rgba(78,222,163,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0, marginTop: 2 }}>
                <Zap size={11} style={{ color: '#4edea3' }} />
              </div>
            )}
            <div style={{
              maxWidth: '72%', padding: '10px 14px',
              background: m.role === 'user' ? '#0c1d35' : '#161b22',
              border: `0.5px solid ${m.role === 'user' ? 'rgba(163,201,255,0.15)' : 'rgba(48,54,61,0.9)'}`,
              fontSize: 13, color: '#e2e2e8', lineHeight: 1.6,
            }}>
              {m.role === 'assistant' && (
                <p style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 8, fontWeight: 600, color: '#4edea3', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>
                  Recruiter · {context.company}
                </p>
              )}
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div style={{ width: 24, height: 24, background: 'rgba(78,222,163,0.1)', border: '0.5px solid rgba(78,222,163,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 8, flexShrink: 0 }}>
              <Zap size={11} style={{ color: '#4edea3' }} />
            </div>
            <div style={{ padding: '10px 14px', background: '#161b22', border: '0.5px solid rgba(48,54,61,0.9)' }}>
              <Loader2 size={13} className="animate-spin" style={{ color: '#4edea3' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 11, color: '#ffb4ab', padding: '8px 0' }}>{error}</p>}

      {/* Input row */}
      <div className="flex gap-2 mt-2">
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          placeholder="Respond to the recruiter…"
          style={{ ...INPUT, flex: 1 }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()}
          className="flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-30"
          style={{ padding: '0 18px', background: '#4edea3', color: '#0d1117', fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
          <Send size={13} />
        </button>
        <button onClick={getScore} disabled={scoring || messages.length < 3}
          className="flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-30"
          style={{ padding: '0 16px', background: '#0d1117', border: '0.5px solid rgba(163,201,255,0.3)', color: '#a3c9ff', fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
          {scoring ? <><Loader2 size={12} className="animate-spin" /> Scoring…</> : <>End & Score</>}
        </button>
      </div>
      <p style={{ fontFamily: 'Consolas, Menlo, Monaco, monospace', fontSize: 9, color: '#404753', marginTop: 6 }}>
        Press Enter to send · End & Score available after 3+ exchanges
      </p>
    </div>
  )
}
