import { useParams, NavLink } from 'react-router-dom'
import BackToHome from '../components/BackToHome'
import { PenLine, FileText, Mail } from 'lucide-react'
import CVBuilder from '../components/AI/CVBuilder'
import CVReviewer from '../components/AI/CVReviewer'
import CoverLetterReviewer from '../components/AI/CoverLetterReviewer'

const TOOLS = [
  { key: 'builder',      label: 'CV Builder',   desc: 'Build a CV from scratch',  icon: PenLine,   component: CVBuilder,          accent: '#4edea3' },
  { key: 'reviewer',     label: 'CV Reviewer',  desc: 'Score & fix your CV',      icon: FileText,  component: CVReviewer,         accent: '#a3c9ff' },
  { key: 'cover-letter', label: 'Cover Letter', desc: 'Tailored letter drafts',   icon: Mail,      component: CoverLetterReviewer, accent: '#ffb689' },
]

export default function CVHub() {
  const { tool = 'builder' } = useParams()
  const active = TOOLS.find(t => t.key === tool) || TOOLS[0]
  const ActiveComponent = active.component

  return (
    <div className="max-w-4xl mx-auto" style={{ fontFamily: 'Geist, Inter, sans-serif' }}>

      <BackToHome />

      {/* Header */}
      <div className="mb-7">
        <p style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#4edea3', textTransform: 'uppercase', marginBottom: 4 }}>
          Trackr
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e8', lineHeight: 1.15 }}>
          CV Builder
        </h1>
        <p style={{ fontSize: 13, color: '#8a919f', marginTop: 4 }}>
          Build, review, and craft your application materials in one place.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-px mb-8" style={{ background: 'rgba(20,60,110,0.3)' }}>
        {TOOLS.map(t => {
          const Icon = t.icon
          const isActive = t.key === tool
          return (
            <NavLink
              key={t.key}
              to={`/cv/${t.key}`}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '14px 20px',
                background: isActive ? `linear-gradient(135deg, ${t.accent}18 0%, #0d2040 100%)` : '#0c1d35',
                borderBottom: isActive ? `2px solid ${t.accent}` : '2px solid transparent',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isActive ? `${t.accent}18` : 'rgba(138,145,159,0.07)',
                border: `0.5px solid ${isActive ? t.accent + '40' : 'rgba(138,145,159,0.15)'}`,
                flexShrink: 0,
              }}>
                <Icon size={15} style={{ color: isActive ? t.accent : '#8a919f' }} />
              </div>
              <div>
                <p style={{
                  fontFamily: 'Geist, Inter, sans-serif', fontSize: 13, fontWeight: 600,
                  color: isActive ? '#e2e2e8' : '#c0c7d5', lineHeight: 1.2, marginBottom: 2,
                }}>
                  {t.label}
                </p>
                <p style={{
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 9,
                  color: isActive ? t.accent + 'cc' : '#404753', letterSpacing: '0.02em',
                }}>
                  {t.desc}
                </p>
              </div>
            </NavLink>
          )
        })}
      </div>

      {/* Tool content */}
      <ActiveComponent />

    </div>
  )
}
