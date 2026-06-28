import { useState, useEffect, useRef } from 'react'
import ProfileDropdown from './ProfileDropdown'

const CHECKIN_KEY = 'trackr_checkin_pending'
const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = "'Plus Jakarta Sans', system-ui, sans-serif"

function fmtCountdown(ms) {
  if (!ms || ms <= 0) return '0:00'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Header() {
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

        <div />

        {/* Right actions */}
        <div className="flex items-center gap-2">
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
          position: 'fixed', top: 60, right: 14, width: 300, zIndex: 9997,
          background: '#0b0f1c',
          border: '1px solid rgba(96,165,250,0.18)',
          borderRadius: 12,
          boxShadow: '0 12px 48px rgba(0,0,0,0.65)',
          animation: 'checkin-slide-in 0.22s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{ padding: '16px 16px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#e8f0fe', letterSpacing: '-0.01em' }}>Still working?</span>
              <span style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: '#60a5fa' }}>{fmtCountdown(msLeft)}</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(180,210,255,0.7)', fontFamily: SANS, fontWeight: 400, margin: '0 0 14px', lineHeight: 1.55 }}>
              No response in 30 min — your shift will auto clock-out and 30 min will be deducted.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => window.dispatchEvent(new Event('trackr-clockout'))}
                style={{
                  flex: 1, padding: '9px 0',
                  background: 'rgba(96,165,250,0.07)',
                  border: '1px solid rgba(96,165,250,0.22)',
                  borderRadius: 8,
                  color: '#7ab0f0', fontSize: 12, fontFamily: SANS, fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(96,165,250,0.07)'}
              >
                Clock out
              </button>
              <button
                onClick={confirmFromHeader}
                style={{
                  flex: 1, padding: '9px 0',
                  background: 'rgba(96,165,250,0.14)',
                  border: '1px solid rgba(96,165,250,0.38)',
                  borderRadius: 8,
                  color: '#a8d0ff', fontSize: 12, fontFamily: SANS, fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(96,165,250,0.24)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(96,165,250,0.14)'}
              >
                I'm still here
              </button>
            </div>
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
