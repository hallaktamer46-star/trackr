import { useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const PROFESSIONS = [
  'Software Engineer', 'Product Manager', 'Designer', 'Data Scientist',
  'Marketing', 'Sales', 'Finance', 'Operations', 'Consultant', 'Other',
]

export default function Onboarding({ onComplete }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ first_name: '', last_name: '', profession: '' })
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleFinish = async () => {
    if (!form.first_name.trim() || !form.profession) return
    setSaving(true)
    await supabase.auth.updateUser({
      data: {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        profession: form.profession,
      }
    })
    setSaving(false)
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(8px)' }}>

      <div className="w-full max-w-md" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>

        {/* Progress dots */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {[1, 2].map(i => (
            <div key={i} style={{
              width: i === step ? 24 : 6,
              height: 6,
              background: i === step ? '#a3c9ff' : 'rgba(138,145,159,0.3)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#a3c9ff', textTransform: 'uppercase', marginBottom: 8 }}>
              Step 1 of 2
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 6 }}>
              What's your name?
            </h2>
            <p style={{ fontSize: 13, color: '#8a919f', marginBottom: 32 }}>
              We'll use this to personalise your experience.
            </p>

            <div className="space-y-3">
              <div>
                <label style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: '#8a919f', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  First name
                </label>
                <input
                  autoFocus
                  value={form.first_name}
                  onChange={e => set('first_name', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && form.first_name.trim() && setStep(2)}
                  placeholder="Hallak"
                  style={{
                    width: '100%', padding: '10px 14px', background: '#161b22',
                    border: '0.5px solid rgba(48,54,61,0.9)', color: '#e2e2e8',
                    fontSize: 14, outline: 'none', fontFamily: 'Geist, Inter, sans-serif',
                  }}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', color: '#8a919f', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Last name <span style={{ color: '#404753' }}>(optional)</span>
                </label>
                <input
                  value={form.last_name}
                  onChange={e => set('last_name', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && form.first_name.trim() && setStep(2)}
                  placeholder="Karim"
                  style={{
                    width: '100%', padding: '10px 14px', background: '#161b22',
                    border: '0.5px solid rgba(48,54,61,0.9)', color: '#e2e2e8',
                    fontSize: 14, outline: 'none', fontFamily: 'Geist, Inter, sans-serif',
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.first_name.trim()}
              className="flex items-center justify-center gap-2 w-full mt-6 transition-all hover:brightness-110 disabled:opacity-30"
              style={{ background: '#1493ff', color: '#fff', padding: '11px 0', fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#a3c9ff', textTransform: 'uppercase', marginBottom: 8 }}>
              Step 2 of 2
            </p>
            <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', marginBottom: 6 }}>
              What's your field?
            </h2>
            <p style={{ fontSize: 13, color: '#8a919f', marginBottom: 24 }}>
              We'll tailor your AI tools to your profession.
            </p>

            <div className="grid grid-cols-2 gap-2">
              {PROFESSIONS.map(p => (
                <button
                  key={p}
                  onClick={() => set('profession', p)}
                  style={{
                    padding: '10px 14px',
                    background: form.profession === p ? 'rgba(163,201,255,0.1)' : '#161b22',
                    border: `0.5px solid ${form.profession === p ? '#a3c9ff' : 'rgba(48,54,61,0.9)'}`,
                    color: form.profession === p ? '#a3c9ff' : '#c0c7d5',
                    fontSize: 12, fontWeight: form.profession === p ? 600 : 400,
                    textAlign: 'left', transition: 'all 0.15s',
                    fontFamily: 'Geist, Inter, sans-serif',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                style={{ padding: '11px 20px', background: '#161b22', border: '0.5px solid rgba(48,54,61,0.9)', color: '#8a919f', fontSize: 13, fontFamily: 'Geist, Inter, sans-serif' }}
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={!form.profession || saving}
                className="flex-1 flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-30"
                style={{ background: '#1493ff', color: '#fff', fontSize: 13, fontWeight: 600 }}
              >
                {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <>Let's go <ArrowRight size={14} /></>}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
