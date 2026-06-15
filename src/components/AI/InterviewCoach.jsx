import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, RotateCcw, Flag, Mic } from 'lucide-react'
import { apiFetch } from '../../lib/api'

// ── design tokens ─────────────────────────────────────────────────
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
const SANS = 'Geist, Inter, sans-serif'

const LABEL = {
  fontFamily: MONO, fontSize: 9, fontWeight: 600,
  letterSpacing: '0.1em', color: '#8a919f',
  textTransform: 'uppercase', display: 'block', marginBottom: 6,
}
const INPUT = {
  width: '100%', padding: '10px 14px',
  background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)',
  color: '#e2e2e8', fontSize: 13, outline: 'none', fontFamily: SANS,
}

const INTERVIEW_TYPES = ['General', 'Behavioural', 'Technical', 'Situational', 'Culture Fit']
const EXP_LEVELS      = ['Junior', 'Mid-level', 'Senior', 'Executive']
const Q_COUNTS        = [5, 8, 10]

// ── score ring ────────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r = 36, circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 75 ? '#4edea3' : score >= 50 ? '#ffb689' : '#ffb4ab'
  return (
    <svg width={90} height={90} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(48,54,61,0.6)" strokeWidth={6} />
      <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${filled} ${circ}`} strokeLinecap="butt" style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={45} y={49} textAnchor="middle" dominantBaseline="middle"
        style={{ fill: color, fontSize: 20, fontFamily: MONO, fontWeight: 700, transform: 'rotate(90deg)', transformOrigin: '45px 45px' }}>
        {score}
      </text>
    </svg>
  )
}

// ── mini score bar ─────────────────────────────────────────────────
function ScoreBar({ label, score, comment }) {
  const color = score >= 75 ? '#4edea3' : score >= 50 ? '#ffb689' : '#ffb4ab'
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 600, color: '#8a919f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color }}>{score}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(48,54,61,0.6)', marginBottom: 5 }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, transition: 'width 1s ease' }} />
      </div>
      <p style={{ fontFamily: SANS, fontSize: 11, color: '#8a919f', lineHeight: 1.5 }}>{comment}</p>
    </div>
  )
}

// ── scorecard ─────────────────────────────────────────────────────
function Scorecard({ data, context, onReset }) {
  return (
    <div style={{ fontFamily: SANS }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px', background: '#0c1d35', border: '0.5px solid rgba(20,60,110,0.6)', marginBottom: 2 }}>
        <ScoreRing score={data.overallScore} />
        <div>
          <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: '#a3c9ff', textTransform: 'uppercase', marginBottom: 6 }}>
            Interview Complete · {context.jobTitle} {context.company ? `at ${context.company}` : ''}
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: '#e2e2e8', marginBottom: 4 }}>{data.verdict}</p>
          <p style={{ fontFamily: MONO, fontSize: 10, color: '#8a919f' }}>{context.interviewType} · {context.difficulty === 'tough' ? 'Tough' : 'Normal'} · {context.totalQuestions} questions</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 2 }}>
        {/* Breakdown */}
        <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '20px 24px' }}>
          <p style={{ ...LABEL, color: '#a3c9ff', marginBottom: 16 }}>Performance Breakdown</p>
          {Object.entries(data.breakdown).map(([key, val]) => (
            <ScoreBar key={key} label={key} score={val.score} comment={val.comment} />
          ))}
        </div>

        {/* Strengths + improvements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '20px 24px', flex: 1 }}>
            <p style={{ ...LABEL, color: '#4edea3', marginBottom: 12 }}>What You Did Well</p>
            {data.strengths.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <span style={{ color: '#4edea3', fontSize: 14, lineHeight: 1.4, flexShrink: 0 }}>✓</span>
                <p style={{ fontSize: 12, color: '#c0c7d5', lineHeight: 1.5 }}>{s}</p>
              </div>
            ))}
          </div>

          {data.standoutMoment && (
            <div style={{ background: 'rgba(78,222,163,0.04)', border: '0.5px solid rgba(78,222,163,0.2)', padding: '16px 20px' }}>
              <p style={{ ...LABEL, color: '#4edea3', marginBottom: 8 }}>Standout Moment</p>
              <p style={{ fontSize: 12, color: '#c0c7d5', lineHeight: 1.5, fontStyle: 'italic' }}>"{data.standoutMoment}"</p>
            </div>
          )}

          {data.redFlag && (
            <div style={{ background: 'rgba(255,180,171,0.04)', border: '0.5px solid rgba(255,180,171,0.2)', padding: '16px 20px' }}>
              <p style={{ ...LABEL, color: '#ffb4ab', marginBottom: 8 }}>Red Flag</p>
              <p style={{ fontSize: 12, color: '#c0c7d5', lineHeight: 1.5 }}>{data.redFlag}</p>
            </div>
          )}
        </div>
      </div>

      {/* Improvements */}
      {data.improvements?.length > 0 && (
        <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '20px 24px', marginBottom: 2 }}>
          <p style={{ ...LABEL, color: '#ffb689', marginBottom: 16 }}>How to Improve</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.improvements.map((imp, i) => (
              <div key={i} style={{ borderLeft: '2px solid rgba(255,182,137,0.3)', paddingLeft: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#ffb689', marginBottom: 4 }}>{imp.issue}</p>
                <p style={{ fontSize: 12, color: '#8a919f', marginBottom: 8, lineHeight: 1.5 }}>{imp.fix}</p>
                {imp.example && (
                  <div style={{ background: 'rgba(255,182,137,0.05)', border: '0.5px solid rgba(255,182,137,0.15)', padding: '10px 14px' }}>
                    <p style={{ fontFamily: MONO, fontSize: 9, color: '#ffb689', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>Better Answer</p>
                    <p style={{ fontSize: 12, color: '#c0c7d5', lineHeight: 1.6, fontStyle: 'italic' }}>"{imp.example}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button onClick={onReset} style={{
        width: '100%', padding: '12px 0', marginTop: 2,
        background: 'rgba(163,201,255,0.06)', border: '0.5px solid rgba(163,201,255,0.2)',
        color: '#a3c9ff', fontFamily: MONO, fontSize: 11, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <RotateCcw size={12} /> Start New Interview
      </button>
    </div>
  )
}

// ── main component ─────────────────────────────────────────────────
export default function InterviewCoach() {
  const [phase, setPhase] = useState('setup') // setup | chat | scoring | score
  const [context, setContext] = useState({
    jobTitle: '', company: '', interviewType: 'General',
    difficulty: 'normal', totalQuestions: 8, experienceLevel: 'Mid-level',
  })
  const [messages, setMessages] = useState([])   // { role, content }
  const [input, setInput]       = useState('')
  const [typing, setTyping]     = useState(false)
  const [scoreData, setScoreData] = useState(null)
  const [error, setError]       = useState(null)
  const [questionCount, setQuestionCount] = useState(0)
  const [interviewDone, setInterviewDone] = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const DONE_PHRASE = "That's all the questions I have for you today. Thank you for your time."

  const startInterview = async () => {
    setPhase('chat')
    setTyping(true)
    setError(null)
    try {
      const res = await apiFetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [], context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const aiMsg = { role: 'assistant', content: data.message }
      setMessages([aiMsg])
      if (data.message.includes(DONE_PHRASE)) setInterviewDone(true)
    } catch (err) {
      setError(err.message)
      setPhase('setup')
    } finally {
      setTyping(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || typing || interviewDone) return
    const userMsg = { role: 'user', content: input.trim() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setTyping(true)
    setError(null)
    try {
      const res = await apiFetch('/api/ai/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated, context }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      const aiMsg = { role: 'assistant', content: data.message }
      setMessages(prev => [...prev, aiMsg])
      setQuestionCount(q => q + 1)
      if (data.message.includes(DONE_PHRASE)) setInterviewDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setTyping(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  const getScore = async () => {
    setPhase('scoring')
    setError(null)
    try {
      const res = await apiFetch('/api/ai/interview/score', {
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
      setPhase('chat')
    }
  }

  const reset = () => {
    setPhase('setup')
    setMessages([])
    setInput('')
    setScoreData(null)
    setError(null)
    setQuestionCount(0)
    setInterviewDone(false)
  }

  const cf = (key) => (val) => setContext(c => ({ ...c, [key]: val }))

  // ── SETUP ────────────────────────────────────────────────────────
  if (phase === 'setup') return (
    <div style={{ fontFamily: SANS }}>
      <div style={{ background: '#0c1d35', border: '0.5px solid rgba(20,60,110,0.6)', padding: '24px', marginBottom: 2 }}>
        <p style={{ ...LABEL, color: '#ffb4ab', marginBottom: 16 }}>Interview Setup</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 0 }}>
            <label style={LABEL}>Target Role *</label>
            <input value={context.jobTitle} onChange={e => cf('jobTitle')(e.target.value)}
              placeholder="e.g. Senior Product Manager" style={INPUT} />
          </div>
          <div style={{ flex: '1 1 calc(50% - 8px)', minWidth: 0 }}>
            <label style={LABEL}>Company (optional)</label>
            <input value={context.company} onChange={e => cf('company')(e.target.value)}
              placeholder="e.g. Google" style={INPUT} />
          </div>
        </div>
      </div>

      {/* Interview type */}
      <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '20px 24px', marginBottom: 2 }}>
        <label style={LABEL}>Interview Type</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {INTERVIEW_TYPES.map(t => (
            <button key={t} onClick={() => cf('interviewType')(t)} style={{
              padding: '7px 16px', fontFamily: MONO, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
              background: context.interviewType === t ? 'rgba(255,180,171,0.15)' : 'rgba(138,145,159,0.06)',
              border: `0.5px solid ${context.interviewType === t ? 'rgba(255,180,171,0.5)' : 'rgba(138,145,159,0.2)'}`,
              color: context.interviewType === t ? '#ffb4ab' : '#8a919f',
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Experience + difficulty + questions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, marginBottom: 2 }}>
        <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '20px 24px' }}>
          <label style={LABEL}>Experience Level</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {EXP_LEVELS.map(l => (
              <button key={l} onClick={() => cf('experienceLevel')(l)} style={{
                padding: '7px 12px', fontFamily: MONO, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.04em', cursor: 'pointer', textAlign: 'left',
                background: context.experienceLevel === l ? 'rgba(163,201,255,0.1)' : 'transparent',
                border: `0.5px solid ${context.experienceLevel === l ? 'rgba(163,201,255,0.4)' : 'rgba(138,145,159,0.15)'}`,
                color: context.experienceLevel === l ? '#a3c9ff' : '#8a919f',
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '20px 24px' }}>
          <label style={LABEL}>Difficulty</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[['normal', 'Normal', '#4edea3'], ['tough', 'Tough 🔥', '#ffb4ab']].map(([val, label, color]) => (
              <button key={val} onClick={() => cf('difficulty')(val)} style={{
                padding: '7px 12px', fontFamily: MONO, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.04em', cursor: 'pointer', textAlign: 'left',
                background: context.difficulty === val ? `${color}18` : 'transparent',
                border: `0.5px solid ${context.difficulty === val ? color + '60' : 'rgba(138,145,159,0.15)'}`,
                color: context.difficulty === val ? color : '#8a919f',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)', padding: '20px 24px' }}>
          <label style={LABEL}>Questions</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {Q_COUNTS.map(n => (
              <button key={n} onClick={() => cf('totalQuestions')(n)} style={{
                padding: '7px 12px', fontFamily: MONO, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.04em', cursor: 'pointer', textAlign: 'left',
                background: context.totalQuestions === n ? 'rgba(78,222,163,0.1)' : 'transparent',
                border: `0.5px solid ${context.totalQuestions === n ? 'rgba(78,222,163,0.4)' : 'rgba(138,145,159,0.15)'}`,
                color: context.totalQuestions === n ? '#4edea3' : '#8a919f',
              }}>{n} questions</button>
            ))}
          </div>
        </div>
      </div>

      {error && <p style={{ fontFamily: MONO, fontSize: 11, color: '#ffb4ab', marginBottom: 12 }}>{error}</p>}

      <button
        onClick={startInterview}
        disabled={!context.jobTitle.trim()}
        style={{
          width: '100%', padding: '13px 0',
          background: context.jobTitle.trim() ? '#ffb4ab' : 'rgba(138,145,159,0.1)',
          border: 'none', color: context.jobTitle.trim() ? '#0d1117' : '#404753',
          fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', cursor: context.jobTitle.trim() ? 'pointer' : 'default',
        }}
      >
        Start Interview
      </button>
    </div>
  )

  // ── SCORING LOADER ────────────────────────────────────────────────
  if (phase === 'scoring') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16 }}>
      <Loader2 size={28} className="animate-spin" style={{ color: '#a3c9ff' }} />
      <p style={{ fontFamily: MONO, fontSize: 11, color: '#8a919f', letterSpacing: '0.08em' }}>Analysing your performance…</p>
    </div>
  )

  // ── SCORECARD ─────────────────────────────────────────────────────
  if (phase === 'score') return <Scorecard data={scoreData} context={context} onReset={reset} />

  // ── CHAT ──────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: SANS }}>
      {/* Context bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: '#0c1d35',
        border: '0.5px solid rgba(20,60,110,0.6)', marginBottom: 2,
      }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {[
            [context.jobTitle, '#ffb4ab'],
            [context.company || 'Company TBD', '#8a919f'],
            [context.interviewType, '#a3c9ff'],
            [context.difficulty === 'tough' ? 'Tough 🔥' : 'Normal', '#4edea3'],
          ].map(([val, color], i) => (
            <span key={i} style={{ fontFamily: MONO, fontSize: 10, color, letterSpacing: '0.04em' }}>{val}</span>
          ))}
        </div>
        <span style={{ fontFamily: MONO, fontSize: 10, color: '#404753' }}>
          {questionCount}/{context.totalQuestions} questions
        </span>
      </div>

      {/* Messages */}
      <div style={{
        minHeight: 360, maxHeight: 480, overflowY: 'auto',
        background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)',
        padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16,
        marginBottom: 2,
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            {m.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginRight: 10, marginTop: 2,
                background: 'rgba(255,180,171,0.1)', border: '0.5px solid rgba(255,180,171,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#ffb4ab',
              }}>AI</div>
            )}
            <div style={{
              maxWidth: '72%', padding: '12px 16px',
              background: m.role === 'user' ? '#0c1d35' : '#161b22',
              border: `0.5px solid ${m.role === 'user' ? 'rgba(20,60,110,0.7)' : 'rgba(48,54,61,0.9)'}`,
              fontSize: 13, color: '#c0c7d5', lineHeight: 1.65,
              fontFamily: SANS,
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {typing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(255,180,171,0.1)', border: '0.5px solid rgba(255,180,171,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: MONO, fontSize: 9, fontWeight: 700, color: '#ffb4ab',
            }}>AI</div>
            <div style={{ display: 'flex', gap: 4, padding: '10px 14px', background: '#161b22', border: '0.5px solid rgba(48,54,61,0.9)' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%', background: '#8a919f',
                  animation: 'pulse 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Interview ended banner */}
      {interviewDone && (
        <div style={{
          padding: '14px 20px', marginBottom: 2,
          background: 'rgba(78,222,163,0.06)', border: '0.5px solid rgba(78,222,163,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <p style={{ fontFamily: MONO, fontSize: 11, color: '#4edea3', letterSpacing: '0.05em' }}>
            Interview complete — ready for your scorecard?
          </p>
          <button onClick={getScore} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#4edea3', border: 'none', color: '#0d1117',
            padding: '8px 18px', fontFamily: MONO, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
          }}>
            <Flag size={12} /> Get Scorecard
          </button>
        </div>
      )}

      {error && <p style={{ fontFamily: MONO, fontSize: 11, color: '#ffb4ab', marginBottom: 8 }}>{error}</p>}

      {/* Input */}
      <div style={{ display: 'flex', gap: 2 }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder={interviewDone ? 'Interview ended' : 'Type your answer…'}
          disabled={typing || interviewDone}
          style={{
            ...INPUT, flex: 1,
            opacity: interviewDone ? 0.4 : 1,
            cursor: interviewDone ? 'not-allowed' : 'text',
            padding: '13px 16px', fontSize: 13,
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || typing || interviewDone}
          style={{
            padding: '0 20px', background: '#ffb4ab', border: 'none',
            color: '#0d1117', cursor: !input.trim() || typing || interviewDone ? 'default' : 'pointer',
            opacity: !input.trim() || typing || interviewDone ? 0.4 : 1,
          }}
        >
          <Send size={15} />
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        <p style={{ fontFamily: MONO, fontSize: 9, color: '#404753' }}>Press Enter to send · Stay in character</p>
        <button onClick={reset} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: MONO, fontSize: 9, color: '#404753', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <RotateCcw size={10} /> Restart
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
