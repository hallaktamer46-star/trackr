import { useState } from 'react'
import { Plus, Trash2, Loader2, Copy, Check, ChevronRight, ChevronLeft, User, Briefcase, GraduationCap, Zap, FileText } from 'lucide-react'
import { apiFetch } from '../../lib/api'

// ─── design tokens ───────────────────────────────────────────────
const S = {
  label: {
    fontFamily: 'Geist Mono, monospace', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.1em', color: '#8a919f', textTransform: 'uppercase',
    display: 'block', marginBottom: 6,
  },
  input: {
    width: '100%', padding: '10px 14px',
    background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)',
    color: '#e2e2e8', fontSize: 13, outline: 'none',
    fontFamily: 'Geist, Inter, sans-serif',
  },
  section: {
    background: '#0c1d35', border: '0.5px solid rgba(20,60,110,0.6)',
    padding: '20px 24px', marginBottom: 16,
  },
  card: {
    background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)',
    padding: '16px 20px', marginBottom: 12,
  },
}

const STEPS = [
  { key: 'personal',    label: 'Personal',    icon: User },
  { key: 'experience',  label: 'Experience',  icon: Briefcase },
  { key: 'education',   label: 'Education',   icon: GraduationCap },
  { key: 'skills',      label: 'Skills',      icon: Zap },
]

const emptyExp = () => ({ company: '', title: '', start: '', end: '', location: '', bullets: ['', '', ''] })
const emptyEdu = () => ({ institution: '', degree: '', field: '', graduation: '', gpa: '', achievements: '' })

// ─── tiny reusable field ─────────────────────────────────────────
function Field({ label, value, onChange, placeholder = '', type = 'text', half = false }) {
  return (
    <div style={{ flex: half ? '1 1 calc(50% - 8px)' : '1 1 100%', minWidth: 0 }}>
      <label style={S.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={S.input}
      />
    </div>
  )
}

// ─── tag input ───────────────────────────────────────────────────
function TagInput({ label, tags, onChange }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (v && !tags.includes(v)) onChange([...tags, v])
    setDraft('')
  }
  return (
    <div>
      <label style={S.label}>{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {tags.map(t => (
          <span key={t} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(20,60,110,0.6)', border: '0.5px solid rgba(163,201,255,0.2)',
            color: '#a3c9ff', fontSize: 11, fontFamily: 'Geist Mono, monospace',
            padding: '3px 10px',
          }}>
            {t}
            <button onClick={() => onChange(tags.filter(x => x !== t))} style={{ color: '#8a919f', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder="Type and press Enter…"
          style={{ ...S.input, flex: 1 }}
        />
        <button onClick={add} style={{
          background: 'rgba(163,201,255,0.1)', border: '0.5px solid rgba(163,201,255,0.3)',
          color: '#a3c9ff', padding: '0 14px', cursor: 'pointer', fontSize: 13,
        }}>+</button>
      </div>
    </div>
  )
}

// ─── steps ───────────────────────────────────────────────────────

function StepPersonal({ data, set }) {
  const f = (key) => (val) => set({ ...data, [key]: val })
  return (
    <div style={S.section}>
      <p style={{ ...S.label, color: '#a3c9ff', marginBottom: 16 }}>Personal Information</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <Field half label="First Name"   value={data.firstName}  onChange={f('firstName')} />
        <Field half label="Last Name"    value={data.lastName}   onChange={f('lastName')} />
        <Field half label="Email"        value={data.email}      onChange={f('email')}    type="email" />
        <Field half label="Phone"        value={data.phone}      onChange={f('phone')} />
        <Field half label="Location"     value={data.location}   onChange={f('location')} placeholder="City, Country" />
        <Field half label="LinkedIn URL" value={data.linkedin}   onChange={f('linkedin')} placeholder="linkedin.com/in/…" />
        <Field      label="Portfolio / Website" value={data.website} onChange={f('website')} placeholder="https://…" />
      </div>
    </div>
  )
}

function StepExperience({ list, setList }) {
  const update = (i, key, val) => {
    const copy = list.map((e, idx) => idx === i ? { ...e, [key]: val } : e)
    setList(copy)
  }
  const updateBullet = (i, bi, val) => {
    const copy = list.map((e, idx) => {
      if (idx !== i) return e
      const bullets = e.bullets.map((b, bx) => bx === bi ? val : b)
      return { ...e, bullets }
    })
    setList(copy)
  }
  const addBullet = (i) => {
    const copy = list.map((e, idx) => idx === i ? { ...e, bullets: [...e.bullets, ''] } : e)
    setList(copy)
  }
  const removeBullet = (i, bi) => {
    const copy = list.map((e, idx) => idx === i ? { ...e, bullets: e.bullets.filter((_, bx) => bx !== bi) } : e)
    setList(copy)
  }

  return (
    <div>
      {list.map((exp, i) => (
        <div key={i} style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ ...S.label, color: '#ffb689', margin: 0 }}>Position {i + 1}</p>
            {list.length > 1 && (
              <button onClick={() => setList(list.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a919f' }}>
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <Field half label="Job Title"   value={exp.title}    onChange={v => update(i, 'title', v)} />
            <Field half label="Company"     value={exp.company}  onChange={v => update(i, 'company', v)} />
            <Field half label="Start Date"  value={exp.start}    onChange={v => update(i, 'start', v)}    placeholder="Jan 2022" />
            <Field half label="End Date"    value={exp.end}      onChange={v => update(i, 'end', v)}      placeholder="Present" />
            <Field      label="Location"    value={exp.location} onChange={v => update(i, 'location', v)} placeholder="City, Country (optional)" />
          </div>
          <label style={S.label}>Key Achievements / Responsibilities</label>
          <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 9, color: '#404753', marginBottom: 8 }}>
            Write rough notes — AI will polish them into strong bullet points
          </p>
          {exp.bullets.map((b, bi) => (
            <div key={bi} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <span style={{ color: '#a3c9ff', fontSize: 11, paddingTop: 11, flexShrink: 0 }}>›</span>
              <input
                value={b}
                onChange={e => updateBullet(i, bi, e.target.value)}
                placeholder={`Achievement or responsibility ${bi + 1}…`}
                style={{ ...S.input, flex: 1 }}
              />
              {exp.bullets.length > 1 && (
                <button onClick={() => removeBullet(i, bi)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#404753' }}>
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
          <button onClick={() => addBullet(i)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#404753', fontSize: 11, fontFamily: 'Geist Mono, monospace',
            display: 'flex', alignItems: 'center', gap: 4, marginTop: 4,
          }}>
            <Plus size={11} /> Add bullet
          </button>
        </div>
      ))}
      <button onClick={() => setList([...list, emptyExp()])} style={{
        width: '100%', padding: '10px 0',
        background: 'rgba(255,182,137,0.05)', border: '0.5px dashed rgba(255,182,137,0.3)',
        color: '#ffb689', fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Plus size={12} /> Add Another Position
      </button>
    </div>
  )
}

function StepEducation({ list, setList }) {
  const update = (i, key, val) => setList(list.map((e, idx) => idx === i ? { ...e, [key]: val } : e))
  return (
    <div>
      {list.map((edu, i) => (
        <div key={i} style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <p style={{ ...S.label, color: '#4edea3', margin: 0 }}>Education {i + 1}</p>
            {list.length > 1 && (
              <button onClick={() => setList(list.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8a919f' }}>
                <Trash2 size={13} />
              </button>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Field      label="Institution"    value={edu.institution} onChange={v => update(i, 'institution', v)} />
            <Field half label="Degree"         value={edu.degree}      onChange={v => update(i, 'degree', v)}      placeholder="BSc, MSc, MBA…" />
            <Field half label="Field of Study" value={edu.field}       onChange={v => update(i, 'field', v)}       placeholder="Computer Science…" />
            <Field half label="Graduation Year" value={edu.graduation} onChange={v => update(i, 'graduation', v)}  placeholder="2023" />
            <Field half label="GPA (optional)" value={edu.gpa}         onChange={v => update(i, 'gpa', v)}         placeholder="3.8 / 4.0" />
            <div style={{ flex: '1 1 100%' }}>
              <label style={S.label}>Notable Achievements / Coursework</label>
              <textarea
                value={edu.achievements}
                onChange={e => update(i, 'achievements', e.target.value)}
                placeholder="Dean's list, thesis title, relevant modules, societies…"
                rows={2}
                style={{ ...S.input, resize: 'vertical' }}
              />
            </div>
          </div>
        </div>
      ))}
      <button onClick={() => setList([...list, emptyEdu()])} style={{
        width: '100%', padding: '10px 0',
        background: 'rgba(78,222,163,0.05)', border: '0.5px dashed rgba(78,222,163,0.3)',
        color: '#4edea3', fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.06em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Plus size={12} /> Add Another Qualification
      </button>
    </div>
  )
}

function StepSkills({ skills, setSkills, extras, setExtras }) {
  const sf = (key) => (val) => setSkills({ ...skills, [key]: val })
  const ef = (key) => (val) => setExtras({ ...extras, [key]: val })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={S.card}>
        <p style={{ ...S.label, color: '#a3c9ff', marginBottom: 16 }}>Skills</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TagInput label="Technical / Hard Skills"  tags={skills.hard}         onChange={sf('hard')} />
          <TagInput label="Soft Skills"              tags={skills.soft}         onChange={sf('soft')} />
          <TagInput label="Languages"                tags={skills.languages}    onChange={sf('languages')} />
          <TagInput label="Certifications / Courses" tags={skills.certifications} onChange={sf('certifications')} />
        </div>
      </div>
      <div style={S.card}>
        <p style={{ ...S.label, color: '#ffb4ab', marginBottom: 16 }}>Target & Context</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <Field      label="Target Role / Job Title" value={extras.targetRole} onChange={ef('targetRole')} placeholder="e.g. Senior Product Manager" />
          <Field half label="Years of Experience"     value={extras.yearsExp}  onChange={ef('yearsExp')}   placeholder="e.g. 5" type="number" />
          <Field half label="Industry"                value={extras.industry}  onChange={ef('industry')}   placeholder="e.g. FinTech" />
          <div style={{ flex: '1 1 100%' }}>
            <label style={S.label}>Anything else to highlight</label>
            <textarea
              value={extras.notes}
              onChange={e => ef('notes')(e.target.value)}
              placeholder="Awards, publications, volunteer work, open-source projects, anything that sets you apart…"
              rows={3}
              style={{ ...S.input, resize: 'vertical' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CV preview ──────────────────────────────────────────────────
function CVPreview({ cv, onReset }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(cv)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <p style={{ ...S.label, color: '#4edea3', marginBottom: 4 }}>Your CV is ready</p>
          <p style={{ fontSize: 11, color: '#8a919f', fontFamily: 'Geist Mono, monospace' }}>
            ATS-optimised · Reverse chronological · Action-verb bullets
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={copy} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: copied ? 'rgba(78,222,163,0.15)' : 'rgba(163,201,255,0.08)',
            border: `0.5px solid ${copied ? 'rgba(78,222,163,0.4)' : 'rgba(163,201,255,0.25)'}`,
            color: copied ? '#4edea3' : '#a3c9ff',
            padding: '8px 14px', cursor: 'pointer',
            fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
          }}>
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy CV</>}
          </button>
          <button onClick={onReset} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(138,145,159,0.06)', border: '0.5px solid rgba(138,145,159,0.2)',
            color: '#8a919f', padding: '8px 14px', cursor: 'pointer',
            fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
          }}>
            Edit Info
          </button>
        </div>
      </div>

      {/* CV text */}
      <div style={{
        background: '#0d1117', border: '0.5px solid rgba(48,54,61,0.9)',
        padding: '32px 36px',
        fontFamily: 'Geist Mono, monospace',
        fontSize: 12.5,
        lineHeight: 1.75,
        color: '#c0c7d5',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {cv}
      </div>

      <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 10, color: '#404753', marginTop: 12, textAlign: 'center' }}>
        Tip: Copy and paste into Google Docs or Word to add your own formatting and export as PDF
      </p>
    </div>
  )
}

// ─── main component ──────────────────────────────────────────────
export default function CVBuilder() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const [personal, setPersonal] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    location: '', linkedin: '', website: '',
  })
  const [experience, setExperience] = useState([emptyExp()])
  const [education, setEducation] = useState([emptyEdu()])
  const [skills, setSkills] = useState({ hard: [], soft: [], languages: [], certifications: [] })
  const [extras, setExtras] = useState({ targetRole: '', yearsExp: '', industry: '', notes: '' })

  const generate = async () => {
    setLoading(true); setError(null)
    try {
      const res = await apiFetch('/api/ai/build-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personal, experience, education, skills, extras }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.cv)
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (result) return <CVPreview cv={result} onReset={() => setResult(null)} />

  const stepComponents = [
    <StepPersonal   data={personal}    set={setPersonal} />,
    <StepExperience list={experience}  setList={setExperience} />,
    <StepEducation  list={education}   setList={setEducation} />,
    <StepSkills     skills={skills}    setSkills={setSkills} extras={extras} setExtras={setExtras} />,
  ]

  return (
    <div style={{ fontFamily: 'Geist, Inter, sans-serif' }}>

      {/* Step progress bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'rgba(20,60,110,0.3)' }}>
        {STEPS.map((s, i) => {
          const Icon = s.icon
          const active = i === step
          const done   = i < step
          return (
            <button
              key={s.key}
              onClick={() => i < step && setStep(i)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '12px 8px',
                background: active ? 'rgba(163,201,255,0.1)' : 'transparent',
                borderBottom: active ? '2px solid #a3c9ff' : '2px solid transparent',
                border: 'none',
                cursor: i < step ? 'pointer' : 'default',
                transition: 'all 0.15s',
              }}
            >
              <Icon size={13} style={{ color: active ? '#a3c9ff' : done ? '#4edea3' : '#404753' }} />
              <span style={{
                fontFamily: 'Geist Mono, monospace', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                color: active ? '#a3c9ff' : done ? '#4edea3' : '#404753',
                textTransform: 'uppercase',
              }}>
                {s.label}
              </span>
              {done && <Check size={10} style={{ color: '#4edea3' }} />}
            </button>
          )
        })}
      </div>

      {/* Step content */}
      <div style={{ minHeight: 300 }}>
        {stepComponents[step]}
      </div>

      {error && (
        <p style={{ fontFamily: 'Geist Mono, monospace', fontSize: 11, color: '#ffb4ab', marginTop: 12 }}>{error}</p>
      )}

      {/* Nav buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
        <button
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(138,145,159,0.06)', border: '0.5px solid rgba(138,145,159,0.2)',
            color: '#8a919f', padding: '10px 18px', cursor: step === 0 ? 'default' : 'pointer',
            opacity: step === 0 ? 0.3 : 1,
            fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
          }}
        >
          <ChevronLeft size={13} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#1493ff', border: 'none',
              color: '#fff', padding: '10px 22px', cursor: 'pointer',
              fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Next <ChevronRight size={13} />
          </button>
        ) : (
          <button
            onClick={generate}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: loading ? 'rgba(78,222,163,0.15)' : '#4edea3',
              border: 'none', color: '#0d1117',
              padding: '10px 24px', cursor: loading ? 'default' : 'pointer',
              fontFamily: 'Geist Mono, monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? <><Loader2 size={13} className="animate-spin" /> Building your CV…</>
              : <><FileText size={13} /> Build My CV</>
            }
          </button>
        )}
      </div>
    </div>
  )
}
