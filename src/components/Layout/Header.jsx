import { useCheckIn } from '../../hooks/useCheckIn'

const MONO = 'Consolas, Menlo, Monaco, monospace'
const SANS = "'Plus Jakarta Sans', system-ui, sans-serif"

function fmtCountdown(ms) {
  if (!ms || ms <= 0) return '0:00'
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

function confirmFromHeader() {
  window.dispatchEvent(new Event('trackr-checkin-confirm'))
}

export default function Header() {
  const checkInData = useCheckIn()
  const msLeft = checkInData ? Math.max(0, checkInData.deadline - Date.now()) : 0

  if (!checkInData) return null

  return (
    <>
      <div style={{
        position: 'fixed', top: 14, right: 14, width: 300, zIndex: 9997,
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

      <style>{`
        @keyframes checkin-slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
