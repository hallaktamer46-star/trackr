import { useState, useRef } from 'react'
import {
  Briefcase, Banknote, Heart, Activity, Compass, Users, User, Zap,
  Mic, MicOff, ArrowRight, RotateCcw, CheckCircle2, XCircle, Sparkles,
  Brain, Loader2,
} from 'lucide-react'
import { apiFetch } from '../lib/api'

const CATEGORIES = [
  { id: 'career',        label: 'Career',       icon: Briefcase, color: '#60a5fa' },
  { id: 'money',         label: 'Money',         icon: Banknote,  color: '#fbbf24' },
  { id: 'relationships', label: 'Relationships', icon: Heart,     color: '#f472b6' },
  { id: 'health',        label: 'Health',        icon: Activity,  color: '#4edea3' },
  { id: 'future',        label: 'Future',        icon: Compass,   color: '#a78bfa' },
  { id: 'people',        label: 'People',        icon: Users,     color: '#ffb689' },
  { id: 'self',          label: 'Self-Worth',    icon: User,      color: '#00d4ff' },
  { id: 'pressure',      label: 'Pressure',      icon: Zap,       color: '#ff6b6b' },
]

const ACTION_COLORS = ['#00d4ff', '#4edea3', '#a78bfa']

// ─── Category tile ────────────────────────────────────────────────────────────
function CategoryTile({ cat, selected, onToggle }) {
  const [pop, setPop] = useState(false)
  const [hov, setHov] = useState(false)
  const Icon = cat.icon

  const handleClick = () => {
    setPop(true)
    setTimeout(() => setPop(false), 380)
    onToggle(cat.id)
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '18px 10px 14px',
        background: selected ? `${cat.color}15` : hov ? `${cat.color}07` : '#0d1117',
        border: `1.5px solid ${selected ? cat.color + '70' : hov ? cat.color + '35' : 'rgba(48,54,61,0.9)'}`,
        cursor: 'pointer',
        animation: pop ? 'tile-pop 0.38s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        boxShadow: selected
          ? `0 0 24px ${cat.color}20, 0 0 0 1px ${cat.color}15, inset 0 1px 0 ${cat.color}10`
          : hov ? `0 4px 20px rgba(0,0,0,0.5)` : 'none',
        transition: 'background 0.18s, border-color 0.18s, box-shadow 0.18s',
        overflow: 'hidden',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* top accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${cat.color}, ${cat.color}00)`,
        opacity: selected || hov ? 1 : 0,
        transition: 'opacity 0.18s',
      }} />

      {/* selected badge */}
      {selected && (
        <div style={{
          position: 'absolute', top: 7, right: 7,
          width: 15, height: 15,
          background: cat.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
            <path d="M1 3.5L3 5.5L8 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* icon box */}
      <div style={{
        width: 44, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: selected || hov ? `${cat.color}12` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${selected || hov ? cat.color + '35' : 'rgba(48,54,61,0.7)'}`,
        boxShadow: selected ? `0 0 14px ${cat.color}25` : 'none',
        transition: 'all 0.18s',
        flexShrink: 0,
      }}>
        <Icon
          size={19}
          style={{ color: selected || hov ? cat.color : '#4a5568', transition: 'color 0.18s' }}
        />
      </div>

      <span style={{
        fontFamily: 'Geist Mono, monospace',
        fontSize: 9.5,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: selected ? cat.color : hov ? cat.color + 'bb' : '#4a5568',
        transition: 'color 0.18s',
      }}>
        {cat.label}
      </span>
    </button>
  )
}

// ─── Mic button ───────────────────────────────────────────────────────────────
function MicButton({ recording, transcribing, onPointerDown, onPointerUp }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      {recording && (
        <>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute',
              width: 72, height: 72,
              border: '1.5px solid #ff6b6b',
              borderRadius: '50%',
              animation: `mic-ring 1.6s ease-out ${i * 0.45}s infinite`,
              pointerEvents: 'none',
            }} />
          ))}
        </>
      )}

      <button
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        disabled={transcribing}
        style={{
          width: 72, height: 72,
          borderRadius: '50%',
          border: 'none',
          cursor: transcribing ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', zIndex: 1,
          background: recording
            ? 'linear-gradient(135deg, #ff6b6b 0%, #ef4444 100%)'
            : transcribing
            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%)',
          boxShadow: recording
            ? '0 0 32px rgba(255,107,107,0.65), 0 0 64px rgba(255,107,107,0.2)'
            : transcribing
            ? '0 0 24px rgba(251,191,36,0.5)'
            : '0 0 24px rgba(0,212,255,0.45), 0 0 48px rgba(0,212,255,0.15)',
          transform: recording ? 'scale(1.08)' : 'scale(1)',
          transition: 'all 0.15s cubic-bezier(0.34,1.4,0.64,1)',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {transcribing
          ? <Loader2 size={26} color="white" style={{ animation: 'spin 0.8s linear infinite' }} />
          : recording
          ? <MicOff size={26} color="white" />
          : <Mic size={26} color="white" />
        }
      </button>

      {/* waveform bars */}
      <div style={{
        position: 'absolute', bottom: -28,
        display: 'flex', alignItems: 'center', gap: 3, height: 24,
        opacity: recording ? 1 : 0,
        transition: 'opacity 0.2s',
      }}>
        {[0, 1, 2, 3, 4, 3, 2].map((delay, i) => (
          <div key={i} style={{
            width: 3,
            background: '#ff6b6b',
            borderRadius: 2,
            height: recording ? undefined : 4,
            animation: recording ? `wave-bar 0.55s ease-in-out ${delay * 0.08}s infinite alternate` : 'none',
            minHeight: 4,
            maxHeight: 20,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Result item ──────────────────────────────────────────────────────────────
function ResultItem({ text, type, index }) {
  const color = type === 'controlled' ? '#4edea3' : '#ff6b6b'
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '10px 14px',
      background: `${color}08`,
      border: `1px solid ${color}20`,
      animation: `float-in 0.4s ease both`,
      animationDelay: `${0.1 + index * 0.07}s`,
    }}>
      {type === 'controlled'
        ? <CheckCircle2 size={15} style={{ color, marginTop: 1, flexShrink: 0 }} />
        : <XCircle size={15} style={{ color, marginTop: 1, flexShrink: 0 }} />
      }
      <span style={{
        fontFamily: 'Geist, Inter, sans-serif',
        fontSize: 13,
        color: '#c8d0e0',
        lineHeight: 1.5,
      }}>
        {text}
      </span>
    </div>
  )
}

// ─── Action step ──────────────────────────────────────────────────────────────
function ActionStep({ step, color, index }) {
  return (
    <div style={{
      display: 'flex', gap: 16, alignItems: 'flex-start',
      padding: '18px 20px',
      background: `${color}08`,
      border: `1.5px solid ${color}25`,
      borderLeft: `3px solid ${color}`,
      animation: `float-in 0.45s ease both`,
      animationDelay: `${0.35 + index * 0.1}s`,
    }}>
      <div style={{
        width: 32, height: 32,
        background: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: `0 0 16px ${color}40`,
      }}>
        <span style={{
          fontFamily: 'Geist Mono, monospace',
          fontSize: 13,
          fontWeight: 800,
          color: '#000',
        }}>
          {step.step}
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'Geist, Inter, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          color: color,
          marginBottom: 4,
          letterSpacing: '-0.01em',
        }}>
          {step.title}
        </div>
        <div style={{
          fontFamily: 'Geist, Inter, sans-serif',
          fontSize: 13,
          color: '#c8d0e0',
          lineHeight: 1.55,
          marginBottom: 6,
        }}>
          {step.action}
        </div>
        <div style={{
          fontFamily: 'Geist Mono, monospace',
          fontSize: 11,
          color: color + 'aa',
          lineHeight: 1.4,
        }}>
          {step.why}
        </div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MentalClarity() {
  const [selected, setSelected] = useState(new Set())
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [micError, setMicError] = useState('')

  const mediaRecorder = useRef(null)
  const chunks = useRef([])

  const toggleCategory = (id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const startRecording = async () => {
    if (recording || transcribing) return
    setMicError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      mediaRecorder.current = new MediaRecorder(stream, { mimeType })
      chunks.current = []
      mediaRecorder.current.ondataavailable = e => { if (e.data.size > 0) chunks.current.push(e.data) }
      mediaRecorder.current.start()
      setRecording(true)
    } catch {
      setMicError('Microphone access denied. Type your thoughts below.')
    }
  }

  const stopRecording = async () => {
    if (!recording || !mediaRecorder.current) return
    setRecording(false)

    await new Promise(resolve => {
      mediaRecorder.current.onstop = resolve
      mediaRecorder.current.stop()
    })
    mediaRecorder.current.stream.getTracks().forEach(t => t.stop())

    if (chunks.current.length === 0) return
    const mimeType = mediaRecorder.current.mimeType
    const blob = new Blob(chunks.current, { type: mimeType })

    setTranscribing(true)
    try {
      const fd = new FormData()
      fd.append('audio', blob, `recording.${mimeType.includes('webm') ? 'webm' : 'mp4'}`)
      const res = await apiFetch('/api/ai/clarity/transcribe', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.text) {
        setText(prev => prev ? prev.trimEnd() + ' ' + data.text : data.text)
      }
    } catch {
      setMicError('Transcription failed. Your recording was not saved.')
    } finally {
      setTranscribing(false)
    }
  }

  const analyze = async () => {
    if (!text.trim() || analyzing) return
    setError('')
    setAnalyzing(true)
    try {
      const res = await apiFetch('/api/ai/clarity/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, categories: [...selected] }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const reset = () => {
    setResult(null)
    setText('')
    setSelected(new Set())
    setError('')
    setMicError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', padding: '32px 24px 80px' }}>
      <style>{`
        @keyframes tile-pop {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.09); }
          70%  { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
        @keyframes mic-ring {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @keyframes wave-bar {
          from { height: 4px; }
          to   { height: 20px; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes title-glow {
          0%, 100% { filter: brightness(1); }
          50%       { filter: brightness(1.15); }
        }
        @keyframes shimmer {
          from { transform: translateX(-100%) skewX(-12deg); }
          to   { transform: translateX(200%) skewX(-12deg); }
        }
        @keyframes result-enter {
          from { opacity: 0; transform: translateY(24px) scale(0.99); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .clarity-btn-analyze:hover .shimmer-sweep {
          animation: shimmer 0.7s ease forwards;
        }
        .clarity-btn-analyze:active {
          transform: scale(0.98) !important;
        }
      `}</style>

      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 44, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '6px 16px 6px 10px',
            background: 'rgba(0,212,255,0.07)',
            border: '1px solid rgba(0,212,255,0.2)',
            marginBottom: 20,
          }}>
            <Brain size={14} style={{ color: '#00d4ff' }} />
            <span style={{
              fontFamily: 'Geist Mono, monospace',
              fontSize: 10,
              fontWeight: 700,
              color: '#00d4ff',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Mental Clarity Session
            </span>
          </div>

          <h1 style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontSize: 'clamp(36px, 6vw, 56px)',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            margin: '0 0 14px',
            background: 'linear-gradient(135deg, #ffffff 0%, #a3c9ff 40%, #a78bfa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'title-glow 4s ease-in-out infinite',
          }}>
            Clear Your Head
          </h1>

          <p style={{
            fontFamily: 'Geist, Inter, sans-serif',
            fontSize: 15,
            color: '#60718a',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Brain dump everything. AI separates what you can control — and builds your action plan.
          </p>
        </div>

        {!result ? (
          <>
            {/* ── Step 1: Categories ── */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 22, height: 22,
                  background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 800, color: '#000' }}>1</span>
                </div>
                <span style={{ fontFamily: 'Geist, Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#8899b4', letterSpacing: '-0.01em' }}>
                  What's weighing on you? <span style={{ color: '#4a5568', fontWeight: 400 }}>(pick all that apply)</span>
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 8,
              }}>
                {CATEGORIES.map(cat => (
                  <CategoryTile
                    key={cat.id}
                    cat={cat}
                    selected={selected.has(cat.id)}
                    onToggle={toggleCategory}
                  />
                ))}
              </div>
            </div>

            {/* ── Step 2: Brain dump ── */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 22, height: 22,
                  background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 800, color: '#fff' }}>2</span>
                </div>
                <span style={{ fontFamily: 'Geist, Inter, sans-serif', fontSize: 13, fontWeight: 600, color: '#8899b4', letterSpacing: '-0.01em' }}>
                  Now dump it all out — hold mic to speak, or type
                </span>
              </div>

              <div style={{
                background: '#10151c',
                border: '1.5px solid rgba(48,54,61,0.9)',
                padding: 16,
                position: 'relative',
              }}>
                {/* top bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #a78bfa00)',
                  opacity: text.length > 0 ? 1 : 0,
                  transition: 'opacity 0.3s',
                }} />

                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Everything that's on your mind right now — work, people, money, the future, anything. Don't filter. Just write."
                    rows={6}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'Geist, Inter, sans-serif',
                      fontSize: 14,
                      color: '#c8d0e0',
                      lineHeight: 1.65,
                      padding: 0,
                      minHeight: 120,
                    }}
                  />

                  {/* Mic area */}
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 8, paddingTop: 4, paddingBottom: 36, flexShrink: 0,
                  }}>
                    <MicButton
                      recording={recording}
                      transcribing={transcribing}
                      onPointerDown={startRecording}
                      onPointerUp={stopRecording}
                    />
                    <span style={{
                      fontFamily: 'Geist Mono, monospace',
                      fontSize: 9,
                      color: recording ? '#ff6b6b' : transcribing ? '#fbbf24' : '#2d3748',
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginTop: 36,
                      transition: 'color 0.2s',
                    }}>
                      {recording ? 'Release' : transcribing ? 'Processing' : 'Hold to speak'}
                    </span>
                  </div>
                </div>

                {micError && (
                  <div style={{
                    marginTop: 8,
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 11,
                    color: '#ff6b6b',
                  }}>
                    {micError}
                  </div>
                )}

                {/* char counter */}
                <div style={{
                  position: 'absolute', bottom: 8, right: 16,
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 10,
                  color: text.length > 50 ? '#3d4d5e' : '#252d38',
                  transition: 'color 0.3s',
                }}>
                  {text.length} chars
                </div>
              </div>
            </div>

            {error && (
              <div style={{
                marginBottom: 16,
                padding: '10px 14px',
                background: 'rgba(255,107,107,0.08)',
                border: '1px solid rgba(255,107,107,0.3)',
                fontFamily: 'Geist Mono, monospace',
                fontSize: 12,
                color: '#ff6b6b',
              }}>
                {error}
              </div>
            )}

            {/* ── Analyze button ── */}
            <button
              onClick={analyze}
              disabled={!text.trim() || analyzing}
              className="clarity-btn-analyze"
              style={{
                width: '100%',
                padding: '16px 24px',
                background: !text.trim() || analyzing
                  ? '#1a2030'
                  : 'linear-gradient(135deg, #1a3a6b 0%, #1e1b4b 50%, #1a3a6b 100%)',
                border: `1.5px solid ${!text.trim() ? 'rgba(48,54,61,0.5)' : analyzing ? '#60a5fa50' : '#60a5fa40'}`,
                cursor: !text.trim() || analyzing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
                transform: 'scale(1)',
                boxShadow: text.trim() && !analyzing ? '0 0 32px rgba(96,165,250,0.15), 0 4px 24px rgba(0,0,0,0.4)' : 'none',
              }}
            >
              {/* shimmer on hover */}
              <div
                className="shimmer-sweep"
                style={{
                  position: 'absolute', top: 0, bottom: 0, width: '40%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
                  pointerEvents: 'none',
                }}
              />

              {analyzing
                ? <Loader2 size={18} style={{ color: '#60a5fa', animation: 'spin 0.8s linear infinite' }} />
                : <Sparkles size={18} style={{ color: text.trim() ? '#60a5fa' : '#2d3748' }} />
              }
              <span style={{
                fontFamily: 'Geist, Inter, sans-serif',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: analyzing ? '#60a5fa' : text.trim() ? '#e2e8f0' : '#2d3748',
                transition: 'color 0.2s',
              }}>
                {analyzing ? 'Getting your clarity...' : 'Get Clarity'}
              </span>
              {!analyzing && text.trim() && (
                <ArrowRight size={16} style={{ color: '#60a5fa' }} />
              )}
            </button>
          </>
        ) : (
          /* ── Results ── */
          <div style={{ animation: 'result-enter 0.5s cubic-bezier(0.22,1,0.36,1) both' }}>

            {/* Summary card */}
            <div style={{
              padding: '24px 28px',
              background: 'linear-gradient(135deg, rgba(96,165,250,0.07) 0%, rgba(167,139,250,0.07) 100%)',
              border: '1.5px solid rgba(96,165,250,0.2)',
              marginBottom: 28,
              position: 'relative',
              overflow: 'hidden',
              animation: 'float-in 0.4s ease both',
            }}>
              {/* left accent */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0, left: 0, width: 3,
                background: 'linear-gradient(180deg, #60a5fa, #a78bfa)',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkles size={14} style={{ color: '#a78bfa' }} />
                <span style={{
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#a78bfa',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  Here's what's going on
                </span>
              </div>

              <p style={{
                fontFamily: 'Geist, Inter, sans-serif',
                fontSize: 15,
                color: '#c8d0e0',
                lineHeight: 1.65,
                margin: 0,
              }}>
                {result.summary}
              </p>
            </div>

            {/* Control split */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 28,
            }}>
              {/* In control */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  marginBottom: 10,
                  padding: '8px 12px',
                  background: 'rgba(78,222,163,0.08)',
                  border: '1px solid rgba(78,222,163,0.2)',
                }}>
                  <CheckCircle2 size={13} style={{ color: '#4edea3' }} />
                  <span style={{
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#4edea3',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    In Your Control
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.controlled?.map((item, i) => (
                    <ResultItem key={i} text={item} type="controlled" index={i} />
                  ))}
                </div>
              </div>

              {/* Not in control */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  marginBottom: 10,
                  padding: '8px 12px',
                  background: 'rgba(255,107,107,0.08)',
                  border: '1px solid rgba(255,107,107,0.2)',
                }}>
                  <XCircle size={13} style={{ color: '#ff6b6b' }} />
                  <span style={{
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 9,
                    fontWeight: 700,
                    color: '#ff6b6b',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                    Out of Your Hands
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.not_controlled?.map((item, i) => (
                    <ResultItem key={i} text={item} type="not_controlled" index={i} />
                  ))}
                </div>
              </div>
            </div>

            {/* 3-step plan */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                marginBottom: 14,
              }}>
                <div style={{
                  height: 1, flex: 1,
                  background: 'linear-gradient(90deg, rgba(48,54,61,0.9), transparent)',
                }} />
                <span style={{
                  fontFamily: 'Geist Mono, monospace',
                  fontSize: 9,
                  fontWeight: 700,
                  color: '#60718a',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  padding: '0 8px',
                }}>
                  Your 3-Step Plan
                </span>
                <div style={{
                  height: 1, flex: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(48,54,61,0.9))',
                }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {result.actions?.map((step, i) => (
                  <ActionStep key={i} step={step} color={ACTION_COLORS[i] || '#60a5fa'} index={i} />
                ))}
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={reset}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                background: 'transparent',
                border: '1px solid rgba(48,54,61,0.9)',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(96,165,250,0.4)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(48,54,61,0.9)'}
            >
              <RotateCcw size={14} style={{ color: '#60718a' }} />
              <span style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 11,
                fontWeight: 600,
                color: '#60718a',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                New Session
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
