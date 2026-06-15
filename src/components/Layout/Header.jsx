import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileDropdown from './ProfileDropdown'

const CHECKIN_KEY = 'trackr_checkin_pending'
const MONO = 'Consolas, Menlo, Monaco, monospace'

function fmtCountdown(ms) {
  if (!ms || ms <= 0) return '0:00'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

function ActivityIcon({ size = 17, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <polyline
        points="1,10 5,10 7,4 10,16 13,8 15,11 19,11"
        stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Header() {
  const navigate = useNavigate()
  const [checkInData, setCheckInData] = useState(null)
  const [, setTick] = useState(0)
  const tickRef = useRef(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECKIN_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      if (Date.now() < data.deadline) setCheckInData(data)
    } catch {}
  }, [])

  useEffect(() => {
    const onStart = (e) => setCheckInData(e.detail)
    const onClear = () => setCheckInData(null)
    window.addEventListener('trackr-checkin-start', onStart)
    window.addEventListener('trackr-checkin-clear', onClear)
    return () => {
      window.removeEventListener('trackr-checkin-start', onStart)
      window.removeEventListener('trackr-checkin-clear', onClear)
    }
  }, [])

  useEffect(() => {
    if (checkInData) {
      tickRef.current = setInterval(() => setTick(t => t + 1), 1000)
    } else {
      clearInterval(tickRef.current)
    }
    return () => clearInterval(tickRef.current)
  }, [checkInData])

  function confirmFromHeader() {
    window.dispatchEvent(new Event('trackr-checkin-confirm'))
  }

  const msLeft = checkInData ? Math.max(0, checkInData.deadline - Date.now()) : 0

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950 sticky top-0 z-30 flex items-center">
      <div className="w-full px-4 flex items-center justify-between gap-4">

        {/* Logo / brand */}
        <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, color: 'rgba(163,201,255,0.6)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Trackr
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/time-report')}
            title="Time Report"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 10px', background: 'transparent', border: 'none', borderRadius: 6,
              cursor: 'pointer', color: 'rgba(148,163,184,0.7)', transition: 'color 0.15s, background 0.15s',
              fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.background = 'rgba(56,189,248,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.7)'; e.currentTarget.style.background = 'transparent' }}
          >
            <ActivityIcon size={15} />
            <span style={{ letterSpacing: '0.1em' }}>Report</span>
          </button>

          <div style={{ position: 'relative' }}>
            <ProfileDropdown />
            {checkInData && (
              <span style={{
                position: 'absolute', top: 0, right: 0,
                width: 10, height: 10, borderRadius: '50%',
                background: '#ff6b6b', border: '2px solid #0d1117',
                boxShadow: '0 0 8px #ff6b6b',
                animation: 'checkin-pulse 1.4s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Check-in notification */}
      {checkInData && (
        <div style={{
          position: 'fixed', top: 60, right: 12, width: 288, zIndex: 9997,
          background: '#07090f', border: '1px solid rgba(255,107,107,0.45)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,107,107,0.15)',
          animation: 'checkin-slide-in 0.22s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 800, color: '#ff6b6b', letterSpacing: '0.12em' }}>STILL WORKING?</span>
              <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 800, color: '#ff6b6b' }}>{fmtCountdown(msLeft)}</span>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,140,140,0.6)', fontFamily: 'Geist, sans-serif', margin: '0 0 10px', lineHeight: 1.5 }}>
              No response in 30 min → 30 min deducted &amp; auto clock-out.
            </p>
            <button
              onClick={confirmFromHeader}
              style={{
                width: '100%', padding: '9px 0',
                background: 'rgba(78,222,163,0.1)', border: '1px solid rgba(78,222,163,0.35)',
                color: '#4edea3', fontSize: 11, fontFamily: 'Geist, sans-serif', fontWeight: 700,
                cursor: 'pointer', letterSpacing: '0.04em', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(78,222,163,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(78,222,163,0.1)'}
            >
              ✓ &nbsp;I'm still here
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes checkin-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        @keyframes checkin-slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}
