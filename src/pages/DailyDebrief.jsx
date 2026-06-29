import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, Send, ChevronDown, ChevronRight, Clock, Zap, Battery, AlertTriangle, ArrowRight, Eye } from 'lucide-react'
import { apiFetch } from '../lib/api'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
const KEY  = 'trackr_debrief_history'

const CARDS = [
  { key: 'drained',    label: 'What Drained You',        icon: Battery,      color: '#ff6b6b' },
  { key: 'energized',  label: 'What Energized You',      icon: Zap,          color: '#4edea3' },
  { key: 'avoiding',   label: 'What You\'re Avoiding',   icon: AlertTriangle,color: '#ffb689' },
  { key: 'tomorrow',   label: 'One Thing Tomorrow',      icon: ArrowRight,   color: '#00d4ff' },
  { key: 'pattern',    label: 'Pattern I Notice',        icon: Eye,          color: '#a78bfa' },
]

const DOT_BG = `url("data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='0.8' fill='rgba(163%2C201%2C255%2C0.06)'/%3E%3C/svg%3E")`

const CSS = `
  @keyframes db-in   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  @keyframes db-fade { from{opacity:0} to{opacity:1} }
  @keyframes db-pulse { 0%,100%{opacity:1} 50%{opacity:.45} }
  @keyframes db-card { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
`

function loadHistory() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function saveHistory(h) { localStorage.setItem(KEY, JSON.stringify(h)) }

function today() {
  return new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })
}
function shortDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month:'short', day:'numeric' })
}

export default function DailyDebrief() {
  const [dump,      setDump]      = useState('')
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState(null)
  const [recording, setRecording] = useState(false)
  const [history,   setHistory]   = useState(loadHistory)
  const [expanded,  setExpanded]  = useState(null)
  const [elapsed,   setElapsed]   = useState(0)

  const recognRef  = useRef(null)
  const timerRef   = useRef(null)
  const textareaRef= useRef(null)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = CSS
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  // Timer
  useEffect(() => {
    if (loading) {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000)
    } else {
      clearInterval(timerRef.current)
      setElapsed(0)
    }
    return () => clearInterval(timerRef.current)
  }, [loading])

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Voice input not supported in this browser. Use Chrome or Edge.'); return }

    if (recording) {
      recognRef.current?.stop()
      setRecording(false)
      return
    }

    const r = new SR()
    r.continuous      = true
    r.interimResults  = true
    r.lang            = 'en-US'
    recognRef.current = r

    r.onresult = (e) => {
      let transcript = ''
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript
      }
      setDump(transcript)
    }
    r.onend   = () => setRecording(false)
    r.onerror = () => setRecording(false)
    r.start()
    setRecording(true)
  }

  async function submit() {
    if (!dump.trim() || dump.trim().split(' ').length < 5) return
    setLoading(true)
    setResult(null)
    setError(null)
    recognRef.current?.stop()
    setRecording(false)

    try {
      const res = await apiFetch('/api/ai/debrief', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ dump }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data)

      // Save to history
      const entry = { id: Date.now(), iso: new Date().toISOString(), dump, ...data }
      const next  = [entry, ...loadHistory()].slice(0, 90)
      setHistory(next)
      saveHistory(next)
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  function newDebrief() {
    setResult(null)
    setDump('')
    setError(null)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

  const wordCount = dump.trim() ? dump.trim().split(/\s+/).length : 0
  const canSubmit = wordCount >= 5 && !loading

  return (
    <div style={{
      background: `radial-gradient(ellipse 70% 40% at 50% 0%, rgba(60,20,120,0.12) 0%, transparent 60%), ${DOT_BG}, #080c10`,
      minHeight: '100vh',
      fontFamily: MONO,
    }}>
      <div style={{ height:1, background:'linear-gradient(90deg,transparent,#a78bfa,#00d4ff,transparent)' }} />

      <div style={{ maxWidth:860, margin:'0 auto', padding:'40px 28px', display:'grid', gridTemplateColumns:'1fr 220px', gap:24, alignItems:'start' }}>

        {/* â”€â”€ Main column â”€â”€ */}
        <div>

          {/* Header */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:9, color:'rgba(167,139,250,0.6)', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:10 }}>
              Daily Debrief
            </div>
            <h1 style={{ fontSize:30, fontWeight:800, color:'#dce8f4', margin:0, letterSpacing:'-0.04em', fontFamily:SANS }}>
              How was your day?
            </h1>
            <p style={{ fontSize:12, color:'rgba(163,201,255,0.45)', marginTop:8, fontFamily:SANS }}>
              {today()} Â· Just talk. 2 minutes. AI does the rest.
            </p>
          </div>

          {/* Dump area or results */}
          {!result ? (
            <div style={{ animation:'db-in .3s ease' }}>
              {/* Textarea */}
              <div style={{
                background:'rgba(13,18,28,0.85)',
                border:`1px solid ${recording ? 'rgba(167,139,250,0.4)' : 'rgba(163,201,255,0.1)'}`,
                transition:'border-color .2s',
                marginBottom:12,
                position:'relative',
              }}>
                {recording && (
                  <div style={{
                    position:'absolute', top:12, right:14,
                    display:'flex', alignItems:'center', gap:6,
                    animation:'db-pulse 1.2s ease-in-out infinite',
                  }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#a78bfa' }} />
                    <span style={{ fontSize:9, color:'#a78bfa', letterSpacing:'0.15em' }}>LISTENING</span>
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  value={dump}
                  onChange={e => setDump(e.target.value)}
                  placeholder="Just start talking â€” what happened today? What felt hard? What felt good? What are you putting off? Don't filter it."
                  style={{
                    background:'transparent', border:'none', outline:'none',
                    width:'100%', minHeight:220, resize:'vertical',
                    color:'#dce8f4', fontSize:14, lineHeight:1.7,
                    padding:'20px', fontFamily:SANS, fontWeight:400,
                    boxSizing:'border-box',
                    caretColor:'#a78bfa',
                  }}
                />
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'10px 16px',
                  borderTop:'1px solid rgba(163,201,255,0.06)',
                }}>
                  <span style={{ fontSize:9, color:'rgba(163,201,255,0.3)', letterSpacing:'0.1em' }}>
                    {wordCount} words
                  </span>
                  <span style={{ fontSize:9, color:'rgba(163,201,255,0.2)', letterSpacing:'0.08em' }}>
                    {wordCount < 5 ? 'keep going...' : 'ready when you are'}
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display:'flex', gap:8 }}>
                <button
                  onClick={toggleVoice}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    background: recording ? 'rgba(167,139,250,0.12)' : 'rgba(163,201,255,0.06)',
                    border: recording ? '1px solid rgba(167,139,250,0.4)' : '1px solid rgba(163,201,255,0.15)',
                    color: recording ? '#a78bfa' : 'rgba(163,201,255,0.6)',
                    fontSize:11, fontWeight:600,
                    padding:'10px 16px', cursor:'pointer',
                    letterSpacing:'0.12em', fontFamily:MONO,
                    transition:'all .18s',
                  }}
                >
                  {recording ? <MicOff size={13} /> : <Mic size={13} />}
                  {recording ? 'STOP' : 'VOICE'}
                </button>

                <button
                  onClick={submit}
                  disabled={!canSubmit}
                  style={{
                    flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                    background: canSubmit ? 'rgba(167,139,250,0.12)' : 'rgba(163,201,255,0.04)',
                    border: canSubmit ? '1px solid rgba(167,139,250,0.4)' : '1px solid rgba(163,201,255,0.08)',
                    color: canSubmit ? '#a78bfa' : 'rgba(163,201,255,0.2)',
                    fontSize:11, fontWeight:700,
                    padding:'10px 20px', cursor: canSubmit ? 'pointer' : 'default',
                    letterSpacing:'0.15em', fontFamily:MONO,
                    transition:'all .18s',
                  }}
                  onMouseEnter={e => { if(canSubmit){ e.currentTarget.style.background='rgba(167,139,250,0.2)' }}}
                  onMouseLeave={e => { if(canSubmit){ e.currentTarget.style.background='rgba(167,139,250,0.12)' }}}
                >
                  {loading ? (
                    <>
                      <Clock size={13} style={{ animation:'spin 1s linear infinite' }} />
                      ANALYZING{elapsed > 0 ? ` Â· ${elapsed}s` : '...'}
                    </>
                  ) : (
                    <><Send size={13} /> DEBRIEF</>
                  )}
                </button>
              </div>

              {error && (
                <div style={{ marginTop:12, fontSize:11, color:'#ff6b6b', padding:'10px 14px', border:'1px solid rgba(255,107,107,0.2)', background:'rgba(255,107,107,0.06)' }}>
                  {error}
                </div>
              )}
            </div>

          ) : (
            /* Results */
            <div style={{ animation:'db-fade .4s ease' }}>
              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
                {CARDS.map((card, i) => {
                  const Icon = card.icon
                  return (
                    <div key={card.key} style={{
                      background:'rgba(13,18,28,0.85)',
                      border:'1px solid rgba(163,201,255,0.08)',
                      borderLeft:`2.5px solid ${card.color}`,
                      padding:'16px 18px',
                      animation:`db-card .35s ease ${i * 0.07}s both`,
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        <Icon size={12} color={card.color} strokeWidth={2} />
                        <span style={{ fontSize:8, color:`${card.color}99`, letterSpacing:'0.22em', textTransform:'uppercase' }}>
                          {card.label}
                        </span>
                      </div>
                      <p style={{ margin:0, fontSize:13, color:'#dce8f4', lineHeight:1.65, fontFamily:SANS, fontWeight:400 }}>
                        {result[card.key]}
                      </p>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={newDebrief}
                style={{
                  background:'transparent',
                  border:'1px solid rgba(163,201,255,0.15)',
                  color:'rgba(163,201,255,0.5)', fontSize:10,
                  padding:'9px 18px', cursor:'pointer',
                  letterSpacing:'0.14em', fontFamily:MONO,
                  transition:'all .15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color='#a3c9ff'; e.currentTarget.style.borderColor='rgba(163,201,255,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.color='rgba(163,201,255,0.5)'; e.currentTarget.style.borderColor='rgba(163,201,255,0.15)' }}
              >
                + NEW DEBRIEF
              </button>
            </div>
          )}
        </div>

        {/* â”€â”€ History sidebar â”€â”€ */}
        <div style={{ paddingTop:80 }}>
          <div style={{ fontSize:8, color:'rgba(163,201,255,0.35)', letterSpacing:'0.25em', marginBottom:10 }}>
            PAST DEBRIEFS
          </div>

          {history.length === 0 ? (
            <div style={{ fontSize:10, color:'rgba(163,201,255,0.2)', fontFamily:SANS, lineHeight:1.6 }}>
              Your debrief history will appear here. Over time, patterns emerge.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:1.5 }}>
              {history.slice(0,30).map(entry => (
                <div key={entry.id}>
                  <button
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                    style={{
                      width:'100%', background: expanded===entry.id ? 'rgba(163,201,255,0.05)' : 'rgba(13,18,28,0.7)',
                      border:'1px solid rgba(163,201,255,0.07)',
                      padding:'9px 11px',
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      cursor:'pointer', transition:'background .15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(163,201,255,0.05)' }}
                    onMouseLeave={e => { if(expanded!==entry.id) e.currentTarget.style.background='rgba(13,18,28,0.7)' }}
                  >
                    <span style={{ fontSize:10, color:'#a3c9ff', fontFamily:SANS, fontWeight:500 }}>
                      {shortDate(entry.iso)}
                    </span>
                    {expanded === entry.id
                      ? <ChevronDown size={11} color="rgba(163,201,255,0.4)" />
                      : <ChevronRight size={11} color="rgba(163,201,255,0.25)" />
                    }
                  </button>

                  {expanded === entry.id && (
                    <div style={{
                      background:'rgba(8,12,16,0.8)',
                      border:'1px solid rgba(163,201,255,0.07)',
                      borderTop:'none',
                      padding:'12px 12px',
                      animation:'db-in .18s ease',
                    }}>
                      {CARDS.map(c => entry[c.key] && (
                        <div key={c.key} style={{ marginBottom:10 }}>
                          <div style={{ fontSize:7, color:`${c.color}88`, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:3 }}>
                            {c.label}
                          </div>
                          <div style={{ fontSize:10, color:'rgba(220,232,244,0.75)', fontFamily:SANS, lineHeight:1.55 }}>
                            {entry[c.key]}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
