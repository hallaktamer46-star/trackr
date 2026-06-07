import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, MapPin, DollarSign, Briefcase, Clock, Users, X,
  ChevronDown, Building2, CheckCircle2, Bookmark, Share2,
  ExternalLink, ArrowRight, Sparkles, Star, SlidersHorizontal,
  List, LayoutGrid, Crown, Zap, Globe, TrendingUp
} from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'

const MONO = 'Geist Mono, monospace'
const SANS = 'Geist, Inter, sans-serif'

const BG      = '#0d1117'
const SURFACE = '#161b22'
const BORDER  = 'rgba(48,54,61,0.9)'

/* ─── data ─── */
const JOB_TYPES    = ['All', 'Full-time', 'Part-time', 'Freelance']
const LOCATIONS    = ['All Locations','Remote','New York','London','Berlin','Dubai','Amsterdam','Singapore','Toronto','Sydney']
const SALARY_RANGES = [
  { label: 'Any Salary',    min: 0,      max: Infinity },
  { label: '$30k – $60k',   min: 30000,  max: 60000    },
  { label: '$60k – $100k',  min: 60000,  max: 100000   },
  { label: '$100k – $150k', min: 100000, max: 150000   },
  { label: '$150k+',        min: 150000, max: Infinity  },
]

const MOCK_JOBS = [
  { id:'1', sponsored:true,  company:'Stripe',       companyColor:'#635BFF', logo:'S',  title:'Senior Frontend Engineer',  type:'Full-time', location:'Remote',             salaryMin:150000, salaryMax:190000, currency:'$', rateType:'yr', posted:'2026-05-24', description:"Join Stripe's dashboard team to build the financial tools that power millions of businesses worldwide. You'll work on complex, high-impact problems at scale.", requirements:['React','TypeScript','5+ yrs exp','System design'], responsibilities:["Build and maintain high-quality user interfaces for Stripe Dashboard","Collaborate with designers and product managers to ship features","Mentor junior engineers and contribute to engineering culture","Drive architectural decisions for the frontend platform"], perks:['Equity','Remote-first','Health insurance','$3k learning budget'], applicants:142, category:'Engineering' },
  { id:'2', sponsored:true,  company:'Vercel',       companyColor:'#ffffff', logo:'▲',  title:'Design Engineer',            type:'Full-time', location:'Remote',             salaryMin:130000, salaryMax:170000, currency:'$', rateType:'yr', posted:'2026-05-23', description:"Help shape the future of the web at Vercel. You'll bridge the gap between design and engineering, building beautiful developer experiences used by millions.", requirements:['React','CSS mastery','Figma','Motion design'], responsibilities:["Design and implement UI components for vercel.com","Define and maintain Vercel's design system","Work closely with marketing and product on new launches","Prototype interactions and micro-animations"], perks:['Equity','Remote-first','Premium equipment','Unlimited PTO'], applicants:89, category:'Design' },
  { id:'3', sponsored:true,  company:'Linear',       companyColor:'#5E6AD2', logo:'L',  title:'Senior Product Manager',     type:'Full-time', location:'San Francisco, CA',  salaryMin:140000, salaryMax:185000, currency:'$', rateType:'yr', posted:'2026-05-22', description:"Linear is looking for a PM who obsesses over product quality and UX. Join a small, high-calibre team building the issue tracker the world's best software companies rely on.", requirements:['4+ yrs PM','B2B SaaS','Data-driven','Excellent writing'], responsibilities:['Own end-to-end product areas from discovery to launch','Work closely with engineering and design','Define roadmap, success metrics and OKRs','Communicate strategy clearly'], perks:['Significant equity','Top-tier MacBook','Health & dental','Annual team offsite'], applicants:67, category:'Product' },
  { id:'4', sponsored:false, company:'Notion',       companyColor:'#e2e2e8', logo:'N',  title:'Backend Engineer',           type:'Full-time', location:'New York, NY',       salaryMin:120000, salaryMax:160000, currency:'$', rateType:'yr', posted:'2026-05-25', description:"Build the infrastructure that powers Notion for millions of users. You'll work on scalable, distributed systems that handle enormous data volumes with low latency.", requirements:['Node.js','PostgreSQL','AWS','4+ yrs exp'], responsibilities:['Design and build scalable backend services','Improve reliability and performance','Work with cross-functional teams'], perks:['Equity','Health insurance','Flexible hours','Home office stipend'], applicants:54, category:'Engineering' },
  { id:'5', sponsored:false, company:'Figma',        companyColor:'#F24E1E', logo:'F',  title:'UX Researcher',              type:'Full-time', location:'Remote',             salaryMin:90000,  salaryMax:125000, currency:'$', rateType:'yr', posted:'2026-05-24', description:"Help Figma understand how designers and developers use collaborative design tools. You'll run studies, synthesise insights, and directly shape the product roadmap.", requirements:['Mixed methods','3+ yrs UX research','Usability testing','Survey design'], responsibilities:['Plan and execute qualitative and quantitative research','Synthesise research into clear insights','Present findings to leadership'], perks:['Equity','Remote option','Learning stipend','Conference budget'], applicants:38, category:'Design' },
  { id:'6', sponsored:false, company:'Shopify',      companyColor:'#96BF48', logo:'SH', title:'iOS Engineer',               type:'Full-time', location:'Toronto, Canada',    salaryMin:110000, salaryMax:145000, currency:'$', rateType:'yr', posted:'2026-05-20', description:"Build world-class iOS experiences for Shopify merchants. You'll own features end-to-end, working with designers and PMs to ship polished apps loved by millions.", requirements:['Swift','SwiftUI','3+ yrs iOS','MVVM/TCA'], responsibilities:['Build new features for the Shopify mobile app','Write clean, testable Swift code','Participate in architecture reviews'], perks:['Equity','Fully remote','Extended benefits','$2k home office'], applicants:71, category:'Engineering' },
  { id:'7', sponsored:false, company:'Freelance Hub',companyColor:'#0EA5E9', logo:'FH', title:'React Developer — Contract', type:'Freelance',  location:'Remote',             salaryMin:80,     salaryMax:120,    currency:'$', rateType:'hr', posted:'2026-05-26', description:'An experienced React developer needed for a 3-month fintech SaaS project. ~30 hrs/week. Build a data-rich dashboard from Figma designs and integrate REST APIs.', requirements:['React','TypeScript','Tailwind CSS','REST APIs'], responsibilities:['Build the main dashboard UI','Integrate with third-party REST APIs','Implement secure authentication flows'], perks:['Flexible hours','Remote','Weekly payments','Contract extension possible'], applicants:23, category:'Engineering' },
  { id:'8', sponsored:false, company:'Bolt',         companyColor:'#34D399', logo:'B',  title:'Marketing Manager',          type:'Part-time', location:'London, UK',         salaryMin:40000,  salaryMax:55000,  currency:'£', rateType:'yr', posted:'2026-05-21', description:"Join Bolt's marketing team on a flexible part-time basis to drive growth in the UK market. Own campaigns, content strategy, and brand partnerships.", requirements:['Digital marketing','3+ yrs exp','Analytics tools','Content creation'], responsibilities:['Plan and execute multi-channel marketing campaigns','Manage social media and content calendar','Report on KPIs'], perks:['Hybrid','Flexible schedule','Performance bonus','Team events'], applicants:31, category:'Marketing' },
  { id:'9', sponsored:false, company:'Contentful',   companyColor:'#FFB400', logo:'CF', title:'Developer Advocate',         type:'Full-time', location:'Berlin, Germany',    salaryMin:85000,  salaryMax:110000, currency:'€', rateType:'yr', posted:'2026-05-19', description:'Contentful is looking for a developer advocate to build community, create technical content, and be the internal voice of developers. Travel 20-30% for conferences.', requirements:['Public speaking','Technical writing','JavaScript','API experience'], responsibilities:['Create tutorials, blog posts, and video content','Represent Contentful at conferences','Gather developer feedback'], perks:['Equity','€3k conference budget','Visa sponsorship','Relocation support'], applicants:19, category:'Engineering' },
  { id:'10',sponsored:false, company:'Loom',         companyColor:'#625DF5', logo:'LM', title:'Data Analyst',               type:'Full-time', location:'Remote',             salaryMin:95000,  salaryMax:125000, currency:'$', rateType:'yr', posted:'2026-05-18', description:"Loom is scaling fast and needs a sharp data analyst to turn user behaviour into product insights. You'll partner directly with product teams to influence roadmap decisions.", requirements:['SQL','dbt','Python','Looker or Tableau'], responsibilities:['Build and maintain dashboards','Run ad-hoc analyses','Partner with data engineers'], perks:['Equity','Remote-first','Generous PTO','Quarterly off-sites'], applicants:44, category:'Data' },
]

/* ─── helpers ─── */
const fmtSalary = j => j.rateType === 'hr'
  ? `${j.currency}${j.salaryMin}–${j.salaryMax}/hr`
  : `${j.currency}${j.salaryMin >= 1000 ? Math.round(j.salaryMin/1000)+'k' : j.salaryMin} – ${j.currency}${j.salaryMax >= 1000 ? Math.round(j.salaryMax/1000)+'k' : j.salaryMax}`

const timeAgo = d => { try { return formatDistanceToNow(parseISO(d), { addSuffix: true }) } catch { return d } }

const TYPE_ACCENT = {
  'Full-time': { color: '#a3c9ff', bg: 'rgba(163,201,255,0.1)', border: 'rgba(163,201,255,0.25)' },
  'Part-time':  { color: '#c4b5fd', bg: 'rgba(196,181,253,0.1)', border: 'rgba(196,181,253,0.25)' },
  'Freelance':  { color: '#ffb689', bg: 'rgba(255,182,137,0.1)', border: 'rgba(255,182,137,0.25)' },
}

/* ─── List Card ─── */
function ListCard({ job, onClick, index }) {
  return (
    <div
      onClick={() => onClick(job)}
      className="job-card"
      style={{
        background: SURFACE,
        border: `0.5px solid ${job.sponsored ? 'rgba(255,182,137,0.3)' : BORDER}`,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
        transition: 'all 0.2s',
        position: 'relative', overflow: 'hidden',
        animation: `cardIn 0.4s ease both`,
        animationDelay: `${index * 0.05}s`,
        fontFamily: SANS,
      }}
    >
      {/* left glow accent on hover (done via CSS class) */}
      {job.sponsored && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: 'linear-gradient(180deg, #ffb689, #ffb68933)' }} />
      )}

      {/* Logo */}
      <div style={{
        width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: job.companyColor + '18', border: `0.5px solid ${job.companyColor}40`,
        color: job.companyColor, fontWeight: 800, fontSize: 14, flexShrink: 0,
        boxShadow: `0 0 16px ${job.companyColor}20`,
        fontFamily: MONO,
      }}>
        {job.logo}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#5a6478', textTransform: 'uppercase', marginBottom: 3 }}>
          {job.company}
        </p>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#e2e2e8', letterSpacing: '-0.01em', marginBottom: 6, transition: 'color 0.2s' }} className="job-title">
          {job.title}
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 10, color: '#5a6478' }}>
            <Globe size={9} /> {job.location}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 10, fontWeight: 700, color: '#4edea3' }}>
            <TrendingUp size={9} /> {fmtSalary(job)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 9, color: '#404753' }}>
            <Users size={8} /> {job.applicants}
            <span style={{ margin: '0 4px', color: '#2a3040' }}>·</span>
            <Clock size={8} /> {timeAgo(job.posted)}
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {job.requirements.slice(0,4).map(r => (
            <span key={r} style={{ fontFamily: MONO, fontSize: 9, padding: '3px 8px', background: 'rgba(163,201,255,0.06)', border: '0.5px solid rgba(163,201,255,0.12)', color: '#7a8699', letterSpacing: '0.04em' }}>
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Right badges */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        {job.sponsored && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ffb689', background: 'rgba(255,182,137,0.1)', border: '0.5px solid rgba(255,182,137,0.3)', padding: '3px 8px' }}>
            <Zap size={8} /> Sponsored
          </span>
        )}
        {(() => { const a = TYPE_ACCENT[job.type] || TYPE_ACCENT['Full-time']; return (
          <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: a.color, background: a.bg, border: `0.5px solid ${a.border}`, padding: '3px 8px' }}>
            {job.type}
          </span>
        )})()}
        <ArrowRight size={13} style={{ color: '#2a3040', transition: 'color 0.2s, transform 0.2s' }} className="job-arrow" />
      </div>
    </div>
  )
}

/* ─── Grid Card ─── */
function GridCard({ job, onClick, index }) {
  const a = TYPE_ACCENT[job.type] || TYPE_ACCENT['Full-time']
  return (
    <div onClick={() => onClick(job)} className="job-card"
      style={{
        background: SURFACE, border: `0.5px solid ${job.sponsored ? 'rgba(255,182,137,0.25)' : BORDER}`,
        cursor: 'pointer', display: 'flex', flexDirection: 'column', padding: 16,
        transition: 'all 0.2s', position: 'relative', overflow: 'hidden', fontFamily: SANS,
        animation: `cardIn 0.4s ease both`, animationDelay: `${index * 0.06}s`,
      }}>
      {job.sponsored && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, background: 'linear-gradient(90deg, #ffb689, #ffb68944, transparent)' }} />}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: job.companyColor + '18', border: `0.5px solid ${job.companyColor}40`, color: job.companyColor, fontWeight: 800, fontSize: 13, fontFamily: MONO, boxShadow: `0 0 14px ${job.companyColor}20` }}>
          {job.logo}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {job.sponsored && <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#ffb689', background: 'rgba(255,182,137,0.1)', border: '0.5px solid rgba(255,182,137,0.3)', padding: '2px 6px' }}>Sponsored</span>}
          <span style={{ fontFamily: MONO, fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: a.color, background: a.bg, border: `0.5px solid ${a.border}`, padding: '2px 6px' }}>{job.type}</span>
        </div>
      </div>
      <p style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#5a6478', textTransform: 'uppercase', marginBottom: 4 }}>{job.company}</p>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#e2e2e8', letterSpacing: '-0.01em', marginBottom: 10, lineHeight: 1.4, flex: 1 }} className="job-title">{job.title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 9, color: '#5a6478' }}><Globe size={9} />{job.location}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: MONO, fontSize: 10, fontWeight: 700, color: '#4edea3' }}><TrendingUp size={9} />{fmtSalary(job)}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 'auto' }}>
        {job.requirements.slice(0,3).map(r => (
          <span key={r} style={{ fontFamily: MONO, fontSize: 8, padding: '2px 7px', background: 'rgba(163,201,255,0.06)', border: '0.5px solid rgba(163,201,255,0.12)', color: '#7a8699' }}>{r}</span>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTop: `0.5px solid ${BORDER}` }}>
        <span style={{ fontFamily: MONO, fontSize: 9, color: '#404753' }}><Users size={9} style={{ display:'inline', marginRight:3 }}/>{job.applicants} applicants</span>
        <span style={{ fontFamily: MONO, fontSize: 9, color: '#404753' }}>{timeAgo(job.posted)}</span>
      </div>
    </div>
  )
}

/* ─── Job Detail Modal ─── */
function JobDetailModal({ job, onClose }) {
  if (!job) return null
  const a = TYPE_ACCENT[job.type] || TYPE_ACCENT['Full-time']
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(16px)', animation:'fadeIn 0.15s ease', fontFamily:SANS }}
      onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width:'100%', maxWidth:580, maxHeight:'88vh', display:'flex', flexDirection:'column', background:'linear-gradient(160deg, #0c1829 0%, #070d1a 100%)', border:`0.5px solid ${a.border}`, boxShadow:`0 0 0 1px ${a.color}08, 0 32px 80px rgba(0,0,0,0.8)`, animation:'slideUp 0.22s cubic-bezier(0.34,1.4,0.64,1)', overflow:'hidden' }}>
        {/* top accent */}
        <div style={{ height:2, background:`linear-gradient(90deg, ${a.color}, ${a.color}44, transparent)` }} />
        {/* Header */}
        <div style={{ padding:'18px 22px 16px', borderBottom:`0.5px solid rgba(255,255,255,0.04)`, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:52, height:52, display:'flex', alignItems:'center', justifyContent:'center', background:job.companyColor+'18', border:`0.5px solid ${job.companyColor}50`, color:job.companyColor, fontWeight:900, fontSize:18, fontFamily:MONO, boxShadow:`0 0 24px ${job.companyColor}30`, flexShrink:0 }}>
                {job.logo}
              </div>
              <div>
                <p style={{ fontFamily:MONO, fontSize:10, color:'#5a6478', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>{job.company}</p>
                <h2 style={{ fontSize:18, fontWeight:800, color:'#e2e2e8', letterSpacing:'-0.02em', lineHeight:1.2 }}>{job.title}</h2>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.04)', border:`0.5px solid ${BORDER}`, cursor:'pointer', color:'#5a6478', padding:'6px 7px', display:'flex', alignItems:'center', transition:'all 0.15s', flexShrink:0 }}
              onMouseEnter={e=>{e.currentTarget.style.color='#e2e2e8'}} onMouseLeave={e=>{e.currentTarget.style.color='#5a6478'}}>
              <X size={14}/>
            </button>
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {job.sponsored && <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#ffb689', background:'rgba(255,182,137,0.1)', border:'0.5px solid rgba(255,182,137,0.3)', padding:'4px 10px' }}><Zap size={9}/>Sponsored</span>}
            <span style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:a.color, background:a.bg, border:`0.5px solid ${a.border}`, padding:'4px 10px' }}>{job.type}</span>
            <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:10, color:'#5a6478', background:'rgba(255,255,255,0.03)', border:`0.5px solid ${BORDER}`, padding:'4px 10px' }}><Globe size={9}/>{job.location}</span>
            <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:10, fontWeight:700, color:'#4edea3', background:'rgba(78,222,163,0.07)', border:'0.5px solid rgba(78,222,163,0.2)', padding:'4px 10px' }}><TrendingUp size={9}/>{fmtSalary(job)}</span>
            <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:9, color:'#404753', background:'rgba(255,255,255,0.02)', border:`0.5px solid ${BORDER}`, padding:'4px 10px' }}><Clock size={9}/>{timeAgo(job.posted)}</span>
          </div>
        </div>
        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 22px', display:'flex', flexDirection:'column', gap:20 }}>
          <div>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#5a6478', textTransform:'uppercase', marginBottom:8 }}>About the Role</p>
            <p style={{ fontSize:13, color:'#8a919f', lineHeight:1.7 }}>{job.description}</p>
          </div>
          <div>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#5a6478', textTransform:'uppercase', marginBottom:10 }}>Responsibilities</p>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {job.responsibilities.map((r,i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                  <div style={{ width:5, height:5, background:'#4edea3', marginTop:6, flexShrink:0 }} />
                  <p style={{ fontSize:13, color:'#c0c7d5', lineHeight:1.6 }}>{r}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#5a6478', textTransform:'uppercase', marginBottom:10 }}>Requirements</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {job.requirements.map(r => (
                <span key={r} style={{ fontFamily:MONO, fontSize:10, padding:'5px 12px', background:'rgba(163,201,255,0.06)', border:'0.5px solid rgba(163,201,255,0.15)', color:'#a3c9ff' }}>{r}</span>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.12em', color:'#5a6478', textTransform:'uppercase', marginBottom:10 }}>Perks & Benefits</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {job.perks.map(p => (
                <span key={p} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:SANS, fontSize:12, fontWeight:500, padding:'6px 12px', background:'rgba(78,222,163,0.07)', border:'0.5px solid rgba(78,222,163,0.2)', color:'#4edea3' }}>
                  <Star size={9}/> {p}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:'rgba(163,201,255,0.04)', border:'0.5px solid rgba(163,201,255,0.1)' }}>
            <Users size={12} style={{ color:'#a3c9ff' }}/>
            <span style={{ fontSize:12, color:'#8a919f' }}><strong style={{ color:'#c0c7d5' }}>{job.applicants}</strong> people have already applied</span>
          </div>
        </div>
        {/* Footer */}
        <div style={{ padding:'14px 22px', borderTop:`0.5px solid rgba(255,255,255,0.04)`, display:'flex', gap:8, flexShrink:0 }}>
          <button style={{ flex:1, padding:'11px 0', background:'linear-gradient(135deg, #a3c9ff, #7ab4ff)', border:'none', cursor:'pointer', color:'#070d1a', fontFamily:MONO, fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', justifyContent:'center', gap:6, boxShadow:'0 4px 20px rgba(163,201,255,0.3)', transition:'filter 0.15s, transform 0.15s' }}
            onMouseEnter={e=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-1px)'}} onMouseLeave={e=>{e.currentTarget.style.filter='none';e.currentTarget.style.transform='none'}}>
            Apply Now <ExternalLink size={12}/>
          </button>
          {[Bookmark,Share2].map((Icon,i) => (
            <button key={i} style={{ padding:'0 14px', background:'rgba(255,255,255,0.04)', border:`0.5px solid ${BORDER}`, cursor:'pointer', color:'#5a6478', display:'flex', alignItems:'center', transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.color='#a3c9ff';e.currentTarget.style.borderColor='rgba(163,201,255,0.3)'}} onMouseLeave={e=>{e.currentTarget.style.color='#5a6478';e.currentTarget.style.borderColor=BORDER}}>
              <Icon size={14}/>
            </button>
          ))}
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(24px) scale(0.97)}to{opacity:1;transform:none}}`}</style>
    </div>
  )
}

/* ─── Post Job Modal ─── */
const EMPTY_JOB = { company:'', companyWebsite:'', title:'', type:'Full-time', location:'', salaryMin:'', salaryMax:'', currency:'$', rateType:'yr', description:'', requirements:'', perks:'', sponsored:false }

function PostJobModal({ onClose, onPost }) {
  const [form, setForm] = useState(EMPTY_JOB)
  const [step, setStep] = useState(1)
  const set = (k,v) => setForm(f => ({...f,[k]:v}))
  const handlePost = () => {
    onPost({ ...form, id:Date.now().toString(), logo:form.company?.[0]?.toUpperCase()||'?', companyColor:'#a3c9ff', salaryMin:Number(form.salaryMin)||0, salaryMax:Number(form.salaryMax)||0, posted:new Date().toISOString().split('T')[0], requirements:form.requirements.split(',').map(r=>r.trim()).filter(Boolean), responsibilities:[], perks:form.perks.split(',').map(p=>p.trim()).filter(Boolean), applicants:0, category:'Other' })
    onClose()
  }
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(16px)', animation:'fadeIn 0.15s ease', fontFamily:SANS }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:480, maxHeight:'88vh', display:'flex', flexDirection:'column', background:'linear-gradient(160deg, #0c1829 0%, #070d1a 100%)', border:`0.5px solid rgba(163,201,255,0.2)`, boxShadow:'0 32px 80px rgba(0,0,0,0.8)', animation:'slideUp 0.22s cubic-bezier(0.34,1.4,0.64,1)', overflow:'hidden' }}>
        <div style={{ height:2, background:'linear-gradient(90deg, #a3c9ff, #a3c9ff44, transparent)' }} />
        <div style={{ padding:'16px 20px 14px', borderBottom:`0.5px solid rgba(255,255,255,0.04)`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, color:'#a3c9ff', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:3 }}>Post a Job</p>
            <h2 style={{ fontSize:15, fontWeight:800, color:'#e2e2e8', letterSpacing:'-0.02em' }}>{step===1?'Business Details':step===2?'Role Details':'Review & Publish'}</h2>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ display:'flex', gap:4 }}>
              {[1,2,3].map(s => <div key={s} style={{ width:20, height:2, background:step>=s?'#a3c9ff':'rgba(163,201,255,0.15)', transition:'background 0.3s' }} />)}
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.04)', border:`0.5px solid ${BORDER}`, cursor:'pointer', color:'#5a6478', padding:'6px 7px', display:'flex', alignItems:'center', transition:'color 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#e2e2e8'} onMouseLeave={e=>e.currentTarget.style.color='#5a6478'}>
              <X size={14}/>
            </button>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
          {step===1 && <>
            <PF label="Company Name"><PI value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Acme Inc."/></PF>
            <PF label="Company Website"><PI value={form.companyWebsite} onChange={e=>set('companyWebsite',e.target.value)} placeholder="https://acme.com"/></PF>
            <PF label="Listing Type">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[{val:false,label:'Free Listing',desc:'Standard visibility',icon:'✓'},{val:true,label:'Sponsored',desc:'Top placement + badge',icon:'⭐'}].map(opt=>(
                  <button key={String(opt.val)} type="button" onClick={()=>set('sponsored',opt.val)} style={{ padding:'10px 12px', border:`0.5px solid ${form.sponsored===opt.val?(opt.val?'rgba(255,182,137,0.5)':'rgba(163,201,255,0.5)'):BORDER}`, background:form.sponsored===opt.val?(opt.val?'rgba(255,182,137,0.08)':'rgba(163,201,255,0.08)'):'rgba(255,255,255,0.02)', textAlign:'left', cursor:'pointer', transition:'all 0.15s' }}>
                    <p style={{ fontSize:12, fontWeight:700, color:'#e2e2e8', marginBottom:2 }}>{opt.icon} {opt.label}</p>
                    <p style={{ fontFamily:MONO, fontSize:9, color:'#5a6478' }}>{opt.desc}</p>
                  </button>
                ))}
              </div>
            </PF>
          </>}
          {step===2 && <>
            <PF label="Job Title"><PI value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Senior Product Designer"/></PF>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <PF label="Type"><PS value={form.type} onChange={e=>set('type',e.target.value)}>{JOB_TYPES.slice(1).map(t=><option key={t}>{t}</option>)}</PS></PF>
              <PF label="Location"><PI value={form.location} onChange={e=>set('location',e.target.value)} placeholder="Remote / London"/></PF>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'80px 1fr 1fr', gap:10 }}>
              <PF label="Currency"><PS value={form.currency} onChange={e=>set('currency',e.target.value)}>{['$','£','€','AED'].map(c=><option key={c}>{c}</option>)}</PS></PF>
              <PF label="Min"><PI type="number" value={form.salaryMin} onChange={e=>set('salaryMin',e.target.value)} placeholder="80000"/></PF>
              <PF label="Max"><PI type="number" value={form.salaryMax} onChange={e=>set('salaryMax',e.target.value)} placeholder="120000"/></PF>
            </div>
            <PF label="Description"><PI as="textarea" rows={4} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Describe the role, team, and what you're looking for…"/></PF>
            <PF label="Requirements (comma-separated)"><PI value={form.requirements} onChange={e=>set('requirements',e.target.value)} placeholder="React, TypeScript, 3+ yrs exp"/></PF>
            <PF label="Perks (comma-separated)"><PI value={form.perks} onChange={e=>set('perks',e.target.value)} placeholder="Remote, Equity, Health insurance"/></PF>
          </>}
          {step===3 && (
            <div style={{ background:SURFACE, border:`0.5px solid ${BORDER}`, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(163,201,255,0.1)', border:'0.5px solid rgba(163,201,255,0.25)', color:'#a3c9ff', fontWeight:800, fontFamily:MONO }}>{form.company?.[0]?.toUpperCase()||'?'}</div>
                <div>
                  <p style={{ fontFamily:MONO, fontSize:9, color:'#5a6478', letterSpacing:'0.1em', textTransform:'uppercase' }}>{form.company}</p>
                  <p style={{ fontSize:14, fontWeight:700, color:'#e2e2e8' }}>{form.title}</p>
                </div>
              </div>
              <p style={{ fontFamily:MONO, fontSize:10, color:'#5a6478', textAlign:'center', paddingTop:8, borderTop:`0.5px solid ${BORDER}` }}>Your listing will go live immediately to all Trackr users.</p>
            </div>
          )}
        </div>
        <div style={{ padding:'12px 20px 16px', borderTop:`0.5px solid rgba(255,255,255,0.04)`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {step>1 ? <button onClick={()=>setStep(s=>s-1)} style={{ padding:'8px 16px', background:'rgba(255,255,255,0.04)', border:`0.5px solid ${BORDER}`, cursor:'pointer', color:'#5a6478', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all 0.15s' }}>Back</button> : <div/>}
          {step<3 ? <button onClick={()=>setStep(s=>s+1)} disabled={step===1?!form.company:!form.title||!form.description} style={{ padding:'8px 20px', background:'linear-gradient(135deg, #a3c9ff, #7ab4ff)', border:'none', cursor:'pointer', color:'#070d1a', fontFamily:MONO, fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6, boxShadow:'0 4px 16px rgba(163,201,255,0.25)', opacity:1, transition:'filter 0.15s' }}>Continue <ArrowRight size={13}/></button>
          : <button onClick={handlePost} style={{ padding:'8px 20px', background:'linear-gradient(135deg, #4edea3, #2ec48a)', border:'none', cursor:'pointer', color:'#070d1a', fontFamily:MONO, fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6, boxShadow:'0 4px 16px rgba(78,222,163,0.3)' }}>Publish <CheckCircle2 size={13}/></button>}
        </div>
      </div>
    </div>
  )
}

function PF({ label, children }) {
  return <div style={{ display:'flex', flexDirection:'column', gap:5 }}><label style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#5a6478' }}>{label}</label>{children}</div>
}

function PI({ as, ...props }) {
  const [f,setF] = useState(false)
  const Tag = as || 'input'
  return <Tag {...props} onFocus={e=>{setF(true);props.onFocus?.(e)}} onBlur={e=>{setF(false);props.onBlur?.(e)}} style={{ width:'100%', padding:'9px 12px', boxSizing:'border-box', background:f?'rgba(163,201,255,0.04)':'rgba(255,255,255,0.025)', border:`0.5px solid ${f?'rgba(163,201,255,0.35)':BORDER}`, color:'#e2e2e8', fontSize:13, fontFamily:SANS, outline:'none', transition:'all 0.2s', boxShadow:f?'0 0 0 3px rgba(163,201,255,0.08)':'none', resize:'none', ...props.style }}/>
}

function PS({ children, ...props }) {
  return <select {...props} style={{ width:'100%', padding:'9px 12px', background:SURFACE, border:`0.5px solid ${BORDER}`, color:'#e2e2e8', fontSize:13, fontFamily:SANS, outline:'none', cursor:'pointer' }}>{children}</select>
}

/* ─── Main ─── */
export default function Jobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState(MOCK_JOBS)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [locationFilter, setLocationFilter] = useState('All Locations')
  const [salaryFilter, setSalaryFilter] = useState(SALARY_RANGES[0])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState('list')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showPostModal, setShowPostModal] = useState(false)

  const activeFilterCount = [typeFilter!=='All', locationFilter!=='All Locations', salaryFilter!==SALARY_RANGES[0]].filter(Boolean).length
  const clearFilters = () => { setSearch(''); setTypeFilter('All'); setLocationFilter('All Locations'); setSalaryFilter(SALARY_RANGES[0]) }

  const filtered = useMemo(() => jobs.filter(j => {
    const q = search.toLowerCase()
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.requirements.some(r=>r.toLowerCase().includes(q))
    const matchType = typeFilter==='All' || j.type===typeFilter
    const matchLoc = locationFilter==='All Locations' || j.location.toLowerCase().includes(locationFilter.toLowerCase())
    const salaryRef = j.rateType==='yr' ? j.salaryMin : j.salaryMin*2000
    const matchSalary = salaryRef>=salaryFilter.min && salaryRef<=salaryFilter.max
    return matchSearch && matchType && matchLoc && matchSalary
  }), [jobs, search, typeFilter, locationFilter, salaryFilter])

  const sponsored = filtered.filter(j=>j.sponsored)
  const free = filtered.filter(j=>!j.sponsored)

  const JOB_BOARDS = [
    { label:'LinkedIn',   url:'https://linkedin.com/jobs',           color:'#0a66c2' },
    { label:'Indeed',     url:'https://indeed.com',                  color:'#2164f3' },
    { label:'Glassdoor',  url:'https://glassdoor.com/Job/index.htm', color:'#0caa41' },
    { label:'Wellfound',  url:'https://wellfound.com/jobs',          color:'#fb4f4f' },
    { label:'Levels.fyi', url:'https://levels.fyi/jobs',             color:'#7c3aed' },
  ]

  return (
    <div style={{ maxWidth:1100, margin:'0 auto', fontFamily:SANS, display:'flex', gap:24, alignItems:'flex-start' }}>

      {/* ── Right sidebar ── */}
      <aside style={{ width:160, flexShrink:0, position:'sticky', top:72, paddingTop:4 }}>
        <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#2a3040', textTransform:'uppercase', marginBottom:8, padding:'0 8px' }}>Job Boards</p>
        {JOB_BOARDS.map(({ label, url, color }) => (
          <a key={label} href={url} target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 8px', textDecoration:'none', border:'0.5px solid transparent', transition:'all 0.15s', marginBottom:2 }}
            onMouseEnter={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.borderColor = `${color}25`; e.currentTarget.style.borderRadius = '6px' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:color, flexShrink:0 }}/>
            <span style={{ fontSize:12, fontWeight:500, color:'#6b7583', whiteSpace:'nowrap' }}>{label}</span>
          </a>
        ))}

        <div style={{ height:'0.5px', background:'rgba(163,201,255,0.05)', margin:'12px 8px' }}/>

        <p style={{ fontFamily:MONO, fontSize:7, fontWeight:700, letterSpacing:'0.1em', color:'#2a3040', textTransform:'uppercase', marginBottom:8, padding:'0 8px' }}>Categories</p>
        {['Engineering','Design','Product','Marketing','Data'].map(cat => (
          <button key={cat} onClick={() => setSearch(cat === search ? '' : cat)}
            style={{ display:'flex', alignItems:'center', gap:8, width:'100%', padding:'6px 8px', background:'transparent', border:'0.5px solid transparent', cursor:'pointer', textAlign:'left', transition:'all 0.15s', marginBottom:2 }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(163,201,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(163,201,255,0.08)'; e.currentTarget.style.borderRadius = '6px' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}>
            <span style={{ fontSize:12, fontWeight:500, color: search === cat ? '#a3c9ff' : '#6b7583' }}>{cat}</span>
            <span style={{ fontFamily:MONO, fontSize:9, color:'#2a3040', marginLeft:'auto' }}>
              {jobs.filter(j => j.category === cat).length}
            </span>
          </button>
        ))}
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex:1, minWidth:0 }}>

      {/* ── Hero Header ── */}
      <div style={{ marginBottom:28, display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <div style={{ width:4, height:4, background:'#a3c9ff' }} />
            <span style={{ fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.2em', color:'#a3c9ff', textTransform:'uppercase' }}>Job Board</span>
          </div>
          <h1 style={{ fontSize:32, fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, marginBottom:8 }}>
            <span style={{ color:'#e2e2e8' }}>Find Your </span>
            <span style={{ background:'linear-gradient(135deg, #a3c9ff 0%, #7ab4ff 50%, #4edea3 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Next Role</span>
          </h1>
          <p style={{ fontSize:13, color:'#5a6478', lineHeight:1.6 }}>
            Full-time, part-time and freelance from verified businesses.
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={()=>navigate('/board')}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'10px 16px', background:'rgba(163,201,255,0.07)', border:'0.5px solid rgba(163,201,255,0.25)', cursor:'pointer', color:'#a3c9ff', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', transition:'all 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(163,201,255,0.14)';e.currentTarget.style.borderColor='rgba(163,201,255,0.45)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(163,201,255,0.07)';e.currentTarget.style.borderColor='rgba(163,201,255,0.25)'}}>
              <LayoutGrid size={12}/> My Board
            </button>
            <button onClick={()=>setShowPostModal(true)}
              style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'linear-gradient(135deg, #a3c9ff, #7ab4ff)', border:'none', cursor:'pointer', color:'#070d1a', fontFamily:MONO, fontSize:10, fontWeight:800, letterSpacing:'0.08em', textTransform:'uppercase', boxShadow:'0 4px 20px rgba(163,201,255,0.3)', transition:'filter 0.15s, transform 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.filter='brightness(1.1)';e.currentTarget.style.transform='translateY(-1px)'}} onMouseLeave={e=>{e.currentTarget.style.filter='none';e.currentTarget.style.transform='none'}}>
              <Building2 size={13}/> Hiring? Post a Job
            </button>
          </div>
          <p style={{ fontFamily:MONO, fontSize:9, color:'#404753' }}>Free &amp; sponsored tiers</p>
        </div>
      </div>

      {/* ── Search + Controls ── */}
      <div style={{ marginBottom:6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, background:SURFACE, border:`0.5px solid ${BORDER}`, padding:8 }}>
          <div style={{ flex:1, position:'relative' }}>
            <Search size={13} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'#3a4455', pointerEvents:'none' }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search roles, companies, skills…"
              style={{ width:'100%', padding:'9px 32px', boxSizing:'border-box', background:'rgba(255,255,255,0.025)', border:`0.5px solid ${BORDER}`, color:'#e2e2e8', fontSize:13, fontFamily:SANS, outline:'none', transition:'border-color 0.2s' }}
              onFocus={e=>e.target.style.borderColor='rgba(163,201,255,0.35)'} onBlur={e=>e.target.style.borderColor=BORDER}/>
            {search && <button onClick={()=>setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#5a6478', display:'flex' }}><X size={12}/></button>}
          </div>
          <div style={{ width:'0.5px', height:28, background:BORDER }}/>
          <button onClick={()=>setFiltersOpen(v=>!v)} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 14px', background:filtersOpen||activeFilterCount>0?'rgba(163,201,255,0.1)':'rgba(255,255,255,0.025)', border:`0.5px solid ${filtersOpen||activeFilterCount>0?'rgba(163,201,255,0.35)':BORDER}`, cursor:'pointer', color:filtersOpen||activeFilterCount>0?'#a3c9ff':'#5a6478', fontFamily:MONO, fontSize:10, fontWeight:700, letterSpacing:'0.06em', transition:'all 0.15s' }}>
            <SlidersHorizontal size={12}/> Filters
            {activeFilterCount>0 && <span style={{ width:16, height:16, background:'#a3c9ff', color:'#070d1a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:MONO, fontSize:8, fontWeight:900 }}>{activeFilterCount}</span>}
          </button>
          <div style={{ width:'0.5px', height:28, background:BORDER }}/>
          <div style={{ display:'flex', border:`0.5px solid ${BORDER}` }}>
            {[['list',List],['grid',LayoutGrid]].map(([m,Icon],i) => (
              <button key={m} onClick={()=>setViewMode(m)} style={{ padding:'9px 11px', display:'flex', alignItems:'center', background:viewMode===m?'rgba(163,201,255,0.1)':'transparent', borderRight:i===0?`0.5px solid ${BORDER}`:'none', cursor:'pointer', color:viewMode===m?'#a3c9ff':'#3a4455', transition:'all 0.15s' }}>
                <Icon size={13}/>
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div style={{ background:SURFACE, border:`0.5px solid ${BORDER}`, borderTop:'none', padding:'10px 14px', display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, animation:'slideDown 0.15s ease' }}>
            <div style={{ display:'flex', gap:4 }}>
              {JOB_TYPES.map(t => (
                <button key={t} onClick={()=>setTypeFilter(t)} style={{ padding:'5px 12px', border:`0.5px solid ${typeFilter===t?'rgba(163,201,255,0.4)':BORDER}`, background:typeFilter===t?'rgba(163,201,255,0.1)':'rgba(255,255,255,0.02)', color:typeFilter===t?'#a3c9ff':'#5a6478', fontFamily:MONO, fontSize:9, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', cursor:'pointer', transition:'all 0.15s' }}>{t}</button>
              ))}
            </div>
            <div style={{ width:'0.5px', height:20, background:BORDER }}/>
            <FDD label="Location" options={LOCATIONS} value={locationFilter} onChange={setLocationFilter}/>
            <FDD label="Salary" options={SALARY_RANGES.map(s=>s.label)} value={typeof salaryFilter==='object'?salaryFilter.label:salaryFilter} onChange={v=>setSalaryFilter(SALARY_RANGES.find(s=>s.label===v)||SALARY_RANGES[0])}/>
            {activeFilterCount>0 && <button onClick={clearFilters} style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:9, fontWeight:700, color:'#ffb4ab', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}><X size={10}/>Clear</button>}
          </div>
        )}
      </div>

      {/* Meta */}
      <div style={{ display:'flex', alignItems:'center', padding:'8px 0', marginBottom:12 }}>
        <p style={{ fontFamily:MONO, fontSize:10, color:'#404753' }}>
          <span style={{ color:'#8a919f', fontWeight:700 }}>{filtered.length}</span> listings
          {sponsored.length>0 && <span style={{ marginLeft:10, color:'#ffb689' }}> · <Zap size={8} style={{display:'inline',marginBottom:1}}/> {sponsored.length} sponsored</span>}
        </p>
      </div>

      {/* No results */}
      {filtered.length===0 && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', textAlign:'center' }}>
          <div style={{ width:52, height:52, background:SURFACE, border:`0.5px solid ${BORDER}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <Briefcase size={20} style={{ color:'#3a4455' }}/>
          </div>
          <p style={{ fontFamily:MONO, fontSize:9, fontWeight:700, color:'#a3c9ff', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:8 }}>No Results</p>
          <p style={{ fontSize:13, color:'#5a6478', marginBottom:16 }}>Try adjusting your filters or search term.</p>
          <button onClick={clearFilters} style={{ fontFamily:MONO, fontSize:10, fontWeight:700, color:'#a3c9ff', background:'none', border:'none', cursor:'pointer', letterSpacing:'0.06em', textTransform:'uppercase' }}>Clear Filters</button>
        </div>
      )}

      {/* List View */}
      {viewMode==='list' && filtered.length>0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {sponsored.length>0 && (
            <section>
              <SectionHeader label="Sponsored" color="#ffb689" count={sponsored.length} icon={Zap}/>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5px', background:BORDER }}>
                {sponsored.map((job,i) => <ListCard key={job.id} job={job} onClick={setSelectedJob} index={i}/>)}
              </div>
            </section>
          )}
          {free.length>0 && (
            <section>
              <SectionHeader label="All Listings" color="#5a6478" count={free.length}/>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.5px', background:BORDER }}>
                {free.map((job,i) => <ListCard key={job.id} job={job} onClick={setSelectedJob} index={i}/>)}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Grid View */}
      {viewMode==='grid' && filtered.length>0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {sponsored.length>0 && (
            <section>
              <SectionHeader label="Sponsored" color="#ffb689" count={sponsored.length} icon={Zap}/>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5px', background:BORDER }}>
                {sponsored.map((job,i) => <GridCard key={job.id} job={job} onClick={setSelectedJob} index={i}/>)}
              </div>
            </section>
          )}
          {free.length>0 && (
            <section>
              <SectionHeader label="All Listings" color="#5a6478" count={free.length}/>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.5px', background:BORDER }}>
                {free.map((job,i) => <GridCard key={job.id} job={job} onClick={setSelectedJob} index={i}/>)}
              </div>
            </section>
          )}
        </div>
      )}

      {selectedJob && <JobDetailModal job={selectedJob} onClose={()=>setSelectedJob(null)}/>}
      {showPostModal && <PostJobModal onClose={()=>setShowPostModal(false)} onPost={j=>setJobs(p=>[j,...p])}/>}

      <style>{`
        @keyframes cardIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px) scale(0.97) } to { opacity:1; transform:none } }
        .job-card:hover { background: #1a2130 !important; transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
        .job-card:hover .job-title { color: #a3c9ff !important; }
        .job-card:hover .job-arrow { color: #a3c9ff !important; transform: translateX(3px); }
      `}</style>
      </div>
    </div>
  )
}

function SectionHeader({ label, color, count, icon: Icon }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
      {Icon && <Icon size={9} style={{ color }}/>}
      <span style={{ fontFamily:'Geist Mono, monospace', fontSize:9, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color }}>{label}</span>
      <div style={{ flex:1, height:'0.5px', background:`linear-gradient(90deg, ${color}40, transparent)` }}/>
      <span style={{ fontFamily:'Geist Mono, monospace', fontSize:9, color:'#404753' }}>{count}</span>
    </div>
  )
}

function FDD({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  const isActive = value && value !== options[0]
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button onClick={()=>setOpen(v=>!v)} style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 12px', background:isActive?'rgba(163,201,255,0.1)':'rgba(255,255,255,0.02)', border:`0.5px solid ${isActive?'rgba(163,201,255,0.35)':BORDER}`, cursor:'pointer', color:isActive?'#a3c9ff':'#5a6478', fontFamily:'Geist Mono, monospace', fontSize:9, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all 0.15s' }}>
        {isActive ? value : label} <ChevronDown size={9} style={{ transform:open?'rotate(180deg)':'none', transition:'transform 0.15s' }}/>
      </button>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:100, background:'#0a1628', border:`0.5px solid rgba(163,201,255,0.15)`, boxShadow:'0 20px 60px rgba(0,0,0,0.7)', minWidth:160 }}>
          {options.map((opt,i) => (
            <button key={opt} onClick={()=>{onChange(opt);setOpen(false)}} style={{ width:'100%', padding:'8px 14px', border:'none', borderBottom:i<options.length-1?`0.5px solid rgba(163,201,255,0.05)`:'none', background:value===opt?'rgba(163,201,255,0.08)':'transparent', color:value===opt?'#a3c9ff':'#8a919f', fontFamily:'Geist, Inter, sans-serif', fontSize:12, cursor:'pointer', textAlign:'left', transition:'background 0.1s' }}
              onMouseEnter={e=>{if(value!==opt)e.currentTarget.style.background='rgba(163,201,255,0.04)'}} onMouseLeave={e=>{if(value!==opt)e.currentTarget.style.background='transparent'}}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
