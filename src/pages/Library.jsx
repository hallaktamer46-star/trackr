import { useState, useEffect, useMemo } from 'react'
import { Search, Headphones, BookOpen, Podcast, Play, X, ChevronDown } from 'lucide-react'

const SANS = '"Geist", "Inter", system-ui, -apple-system, sans-serif'
const MONO = '"Geist Mono", "JetBrains Mono", monospace'
const BG   = '#070a0f'

const SKILLS = ['All','Sales','Negotiation','Leadership','Communication','Productivity','Money','Psychology','Career','Startups','Marketing']

const SKILL_COLORS = {
  Sales:         '#f97316',
  Negotiation:   '#a78bfa',
  Leadership:    '#f43f5e',
  Communication: '#38bdf8',
  Productivity:  '#4ade80',
  Money:         '#06b6d4',
  Psychology:    '#a3e635',
  Career:        '#c084fc',
  Startups:      '#fb923c',
  Marketing:     '#fbbf24',
}

const CATALOG = [
  { id:1,  type:'book',      title:'Never Split the Difference', author:'Chris Voss',               skill:'Negotiation',  rating:4.8, reviews:48211, price:14.99, cover:'#1a2744', accent:'#f97316', tag:'BESTSELLER' },
  { id:2,  type:'book',      title:'SPIN Selling',               author:'Neil Rackham',             skill:'Sales',        rating:4.6, reviews:12039, price:21.49, cover:'#200d3d', accent:'#a78bfa' },
  { id:3,  type:'book',      title:'To Sell Is Human',           author:'Daniel H. Pink',           skill:'Sales',        rating:4.5, reviews:9882,  price:12.99, cover:'#07281e', accent:'#34d399' },
  { id:4,  type:'book',      title:'The Challenger Sale',        author:'Dixon & Adamson',          skill:'Sales',        rating:4.5, reviews:7714,  price:18.00, cover:'#2a0a18', accent:'#fb7185' },
  { id:5,  type:'book',      title:'How to Win Friends & Influence People', author:'Dale Carnegie', skill:'Communication', rating:4.7, reviews:131044,price:9.99,  cover:'#271d06', accent:'#fbbf24', tag:'CLASSIC' },
  { id:6,  type:'book',      title:'Crucial Conversations',      author:'Patterson et al.',         skill:'Communication', rating:4.6, reviews:22980, price:16.20, cover:'#0a1f35', accent:'#38bdf8' },
  { id:7,  type:'book',      title:'The 7 Habits',               author:'Stephen Covey',            skill:'Productivity', rating:4.7, reviews:88412, price:13.49, cover:'#0b2228', accent:'#22d3ee', tag:'CLASSIC' },
  { id:8,  type:'book',      title:'Deep Work',                  author:'Cal Newport',              skill:'Productivity', rating:4.6, reviews:31755, price:15.99, cover:'#180d30', accent:'#818cf8' },
  { id:9,  type:'book',      title:'Atomic Habits',              author:'James Clear',              skill:'Productivity', rating:4.8, reviews:194530,price:11.98, cover:'#072318', accent:'#4ade80', tag:'BESTSELLER' },
  { id:10, type:'book',      title:'Leaders Eat Last',           author:'Simon Sinek',              skill:'Leadership',   rating:4.6, reviews:18233, price:17.00, cover:'#261107', accent:'#fb923c' },
  { id:11, type:'book',      title:'Extreme Ownership',          author:'Jocko Willink',            skill:'Leadership',   rating:4.8, reviews:41200, price:19.49, cover:'#0f1214', accent:'#f43f5e', tag:'BESTSELLER' },
  { id:12, type:'book',      title:'The Psychology of Money',    author:'Morgan Housel',            skill:'Money',        rating:4.7, reviews:67120, price:12.49, cover:'#072030', accent:'#06b6d4', tag:'BESTSELLER' },
  { id:13, type:'book',      title:'Rich Dad Poor Dad',          author:'Robert Kiyosaki',          skill:'Money',        rating:4.7, reviews:102338,price:8.99,  cover:'#240a22', accent:'#e879f9', tag:'CLASSIC' },
  { id:14, type:'book',      title:'Thinking, Fast and Slow',    author:'Daniel Kahneman',          skill:'Psychology',   rating:4.5, reviews:55410, price:13.99, cover:'#161a06', accent:'#a3e635' },
  { id:15, type:'book',      title:'Influence',                  author:'Robert Cialdini',          skill:'Psychology',   rating:4.6, reviews:29047, price:14.50, cover:'#250808', accent:'#f87171', tag:'CLASSIC' },
  { id:16, type:'book',      title:'The Lean Startup',           author:'Eric Ries',                skill:'Startups',     rating:4.5, reviews:32115, price:16.99, cover:'#061c30', accent:'#0ea5e9' },
  { id:17, type:'book',      title:'Zero to One',                author:'Peter Thiel',              skill:'Startups',     rating:4.6, reviews:28440, price:15.49, cover:'#0d0f12', accent:'#94a3b8', tag:'BESTSELLER' },
  { id:18, type:'book',      title:'$100M Offers',               author:'Alex Hormozi',             skill:'Marketing',    rating:4.9, reviews:38755, price:0,     cover:'#281a02', accent:'#fbbf24', tag:'FREE' },
  { id:19, type:'book',      title:"So Good They Can't Ignore You", author:'Cal Newport',           skill:'Career',       rating:4.5, reviews:11820, price:13.20, cover:'#1a1230', accent:'#c4b5fd' },
  { id:20, type:'book',      title:'Designing Your Life',        author:'Burnett & Evans',          skill:'Career',       rating:4.4, reviews:8233,  price:14.75, cover:'#072520', accent:'#2dd4bf' },
  { id:21, type:'audiobook', title:'Never Split the Difference', author:'Chris Voss · 8h 7m',      skill:'Negotiation',  rating:4.9, reviews:21470, price:19.99, cover:'#1a2744', accent:'#f97316' },
  { id:22, type:'audiobook', title:'Atomic Habits',              author:'James Clear · 5h 35m',    skill:'Productivity', rating:4.8, reviews:84210, price:17.49, cover:'#072318', accent:'#4ade80', tag:'BESTSELLER' },
  { id:23, type:'audiobook', title:'Extreme Ownership',          author:'Jocko Willink · 9h 33m',  skill:'Leadership',   rating:4.8, reviews:19822, price:21.99, cover:'#0f1214', accent:'#f43f5e' },
  { id:24, type:'audiobook', title:'The Psychology of Money',    author:'Morgan Housel · 5h 48m',  skill:'Money',        rating:4.7, reviews:30115, price:14.99, cover:'#072030', accent:'#06b6d4' },
  { id:25, type:'audiobook', title:'$100M Leads',                author:'Alex Hormozi · 6h 11m',   skill:'Marketing',    rating:4.9, reviews:25030, price:0,     cover:'#281a02', accent:'#fbbf24', tag:'FREE' },
  { id:26, type:'audiobook', title:'Start with Why',             author:'Simon Sinek · 7h 18m',    skill:'Leadership',   rating:4.6, reviews:15233, price:18.20, cover:'#1a0c04', accent:'#fb923c' },
  { id:27, type:'podcast',   title:'The Diary of a CEO',         author:'Steven Bartlett',          skill:'Startups',     rating:4.8, reviews:91200, price:0,     cover:'#130b22', accent:'#c084fc', tag:'FREE' },
  { id:28, type:'podcast',   title:"Lenny's Podcast",            author:'Lenny Rachitsky',          skill:'Career',       rating:4.9, reviews:12400, price:0,     cover:'#062030', accent:'#22d3ee', tag:'FREE' },
  { id:29, type:'podcast',   title:'The Game',                   author:'Alex Hormozi',             skill:'Sales',        rating:4.9, reviews:34800, price:0,     cover:'#281a02', accent:'#fbbf24', tag:'FREE' },
  { id:30, type:'podcast',   title:'HBR IdeaCast',               author:'Harvard Business Review',  skill:'Leadership',   rating:4.5, reviews:22100, price:0,     cover:'#1e0404', accent:'#f87171', tag:'FREE' },
  { id:31, type:'podcast',   title:'My First Million',           author:'Shaan Puri & Sam Parr',    skill:'Startups',     rating:4.7, reviews:28900, price:0,     cover:'#062018', accent:'#34d399', tag:'FREE' },
  { id:32, type:'podcast',   title:'Negotiate Anything',         author:'Kwame Christian',          skill:'Negotiation',  rating:4.7, reviews:9400,  price:0,     cover:'#160926', accent:'#a78bfa', tag:'FREE' },
]

const TYPE_META = {
  book:      { label:'Book',      icon:BookOpen },
  audiobook: { label:'Audiobook', icon:Headphones },
  podcast:   { label:'Podcast',   icon:Podcast },
}

const CSS = `
  @keyframes lib-rise { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lib-in   { from{opacity:0} to{opacity:1} }
  .lcard { transition:transform .22s cubic-bezier(.22,.8,.3,1); animation:lib-rise .38s ease both; }
  .lcard:hover { transform:translateY(-5px); }
  .lcard:hover .lcov { transform:scale(1.04); }
  .lcov { transition:transform .28s cubic-bezier(.22,.8,.3,1); }
  .lskill { transition:all .14s ease; }
  input[type=text]::-webkit-input-placeholder { color:rgba(163,201,255,0.28); }
  ::-webkit-scrollbar { width:0; height:0; }
`

function Stars({ r }) {
  return (
    <span style={{ display:'inline-flex', gap:1.5, verticalAlign:'middle' }}>
      {[1,2,3,4,5].map(i=>(
        <svg key={i} width="9" height="9" viewBox="0 0 24 24" fill={i<=Math.round(r)?'#fbbf24':'none'} stroke={i<=Math.round(r)?'#fbbf24':'rgba(163,201,255,0.2)'} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

function fmt(n) { return n>=1000 ? `${(n/1000).toFixed(n>=10000?0:1)}k` : n }

function Cover({ item, h=200 }) {
  const Icon = TYPE_META[item.type].icon
  return (
    <div className="lcov" style={{ height:h, background:item.cover, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'16px 14px 14px' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:item.accent }} />
      <div style={{ fontFamily:SANS, fontWeight:800, fontSize:item.title.length>28?13:16, lineHeight:1.2, color:'#f0f6ff', letterSpacing:'-0.02em', paddingRight:4 }}>
        {item.title}
      </div>
      <div>
        <div style={{ fontFamily:SANS, fontSize:10, color:item.accent, marginBottom:5, fontWeight:500 }}>
          {item.author.split('·')[0].trim()}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <Icon size={9} color={item.accent} strokeWidth={2} />
          <span style={{ fontFamily:MONO, fontSize:7, color:`${item.accent}88`, letterSpacing:'0.12em', textTransform:'uppercase' }}>
            {TYPE_META[item.type].label}
          </span>
        </div>
      </div>
      <div style={{ position:'absolute', right:-20, bottom:-20, width:64, height:64, border:`1px solid ${item.accent}22`, transform:'rotate(45deg)' }} />
    </div>
  )
}

export default function Library() {
  const [query,  setQuery]  = useState('')
  const [type,   setType]   = useState('all')
  const [skill,  setSkill]  = useState('All')
  const [detail, setDetail] = useState(null)
  const [typeOpen, setTypeOpen] = useState(false)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = CSS
    document.head.appendChild(el)

    // Force every ancestor to match — override Tailwind bg classes with !important
    const bgOverride = document.createElement('style')
    bgOverride.textContent = `html,body,#root,#root>div,#root>div>div { background: ${BG} !important; }`
    document.head.appendChild(bgOverride)

    return () => {
      document.head.removeChild(el)
      document.head.removeChild(bgOverride)
    }
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CATALOG.filter(item => {
      if (type !== 'all' && item.type !== type) return false
      if (skill !== 'All' && item.skill !== skill) return false
      if (q && !`${item.title} ${item.author} ${item.skill}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, type, skill])

  const typeLabel = type === 'all' ? 'All types' : TYPE_META[type].label + 's'
  const skillColor = skill !== 'All' ? SKILL_COLORS[skill] : '#38bdf8'
  const activeSkillCount = skill !== 'All' ? CATALOG.filter(c => c.skill === skill).length : CATALOG.length

  return (
    <div style={{ background:BG, minHeight:'100vh', fontFamily:SANS, margin:'-12px -24px', paddingBottom:100 }} onClick={() => setTypeOpen(false)}>
      <style>{CSS}</style>

      {/* ── Search hero ──────────────────────────────────── */}
      <div style={{ padding:'52px 48px 40px', maxWidth:1200, margin:'0 auto' }}>

        {/* Search bar */}
        <div style={{ position:'relative', display:'flex', alignItems:'stretch', border:'1px solid rgba(163,201,255,0.14)', background:'rgba(255,255,255,0.025)', transition:'border-color .2s', maxWidth:720 }}
          onFocusCapture={e => e.currentTarget.style.borderColor='rgba(56,189,248,0.4)'}
          onBlurCapture={e => e.currentTarget.style.borderColor='rgba(163,201,255,0.14)'}
        >
          {/* Type selector */}
          <div style={{ position:'relative' }}>
            <button onClick={e => { e.stopPropagation(); setTypeOpen(v => !v) }}
              style={{
                height:'100%', padding:'0 18px', background:'rgba(255,255,255,0.04)',
                borderRight:'1px solid rgba(163,201,255,0.1)', border:'none', borderRight:'1px solid rgba(163,201,255,0.1)',
                color:'#a3c9ff', fontSize:13, fontWeight:500, fontFamily:SANS,
                display:'flex', alignItems:'center', gap:7, cursor:'pointer',
                whiteSpace:'nowrap', minWidth:126,
              }}
            >
              {type !== 'all' && (() => { const Icon = TYPE_META[type].icon; return <Icon size={13} strokeWidth={2} /> })()}
              {typeLabel}
              <ChevronDown size={12} color="rgba(163,201,255,0.4)" style={{ marginLeft:'auto', transition:'transform .15s', transform: typeOpen ? 'rotate(180deg)' : 'none' }} />
            </button>
            {typeOpen && (
              <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, background:'#0d1420', border:'1px solid rgba(163,201,255,0.12)', zIndex:30, minWidth:150, animation:'lib-in .15s ease' }}>
                {[
                  { key:'all', label:'All types', icon:null },
                  { key:'book', label:'Books', icon:BookOpen },
                  { key:'audiobook', label:'Audiobooks', icon:Headphones },
                  { key:'podcast', label:'Podcasts', icon:Podcast },
                ].map(t => {
                  const Icon = t.icon
                  return (
                    <button key={t.key} onClick={e => { e.stopPropagation(); setType(t.key); setTypeOpen(false) }}
                      style={{
                        width:'100%', display:'flex', alignItems:'center', gap:9,
                        background: type===t.key ? 'rgba(56,189,248,0.08)' : 'transparent',
                        border:'none', color: type===t.key ? '#38bdf8' : '#a3c9ff',
                        fontSize:13, fontWeight: type===t.key ? 600 : 400,
                        padding:'11px 16px', cursor:'pointer', fontFamily:SANS, textAlign:'left',
                        transition:'background .12s',
                      }}
                      onMouseEnter={e => { if(type!==t.key) e.currentTarget.style.background='rgba(163,201,255,0.04)' }}
                      onMouseLeave={e => { if(type!==t.key) e.currentTarget.style.background='transparent' }}
                    >
                      {Icon ? <Icon size={13} strokeWidth={2} /> : <span style={{ width:13 }} />}
                      {t.label}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Text input */}
          <div style={{ flex:1, position:'relative', display:'flex', alignItems:'center' }}>
            <Search size={15} color="rgba(163,201,255,0.3)" style={{ position:'absolute', left:16, pointerEvents:'none' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search titles, authors…"
              style={{
                width:'100%', background:'transparent', border:'none', outline:'none',
                color:'#eef5ff', fontSize:15, fontFamily:SANS, fontWeight:400,
                padding:'16px 44px 16px 44px',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')}
                style={{ position:'absolute', right:14, background:'transparent', border:'none', color:'rgba(163,201,255,0.4)', cursor:'pointer', display:'flex', padding:4 }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Active filters */}
        {(skill !== 'All' || type !== 'all' || query) && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12, animation:'lib-in .2s ease' }}>
            <span style={{ fontSize:11, color:'rgba(163,201,255,0.35)', fontFamily:MONO }}>Showing</span>
            {skill !== 'All' && (
              <span style={{ fontSize:11, color:skillColor, fontFamily:MONO, fontWeight:600, letterSpacing:'0.04em' }}>
                {skill}
              </span>
            )}
            {type !== 'all' && (
              <span style={{ fontSize:11, color:'#38bdf8', fontFamily:MONO }}>· {typeLabel}</span>
            )}
            <span style={{ fontSize:11, color:'rgba(163,201,255,0.3)', fontFamily:MONO }}>— {results.length} result{results.length!==1?'s':''}</span>
            <button onClick={() => { setSkill('All'); setType('all'); setQuery('') }}
              style={{ background:'transparent', border:'none', color:'rgba(163,201,255,0.35)', cursor:'pointer', fontSize:11, fontFamily:MONO, display:'flex', alignItems:'center', gap:3 }}
              onMouseEnter={e => e.currentTarget.style.color='#a3c9ff'}
              onMouseLeave={e => e.currentTarget.style.color='rgba(163,201,255,0.35)'}
            >
              <X size={10} /> clear
            </button>
          </div>
        )}
      </div>

      {/* ── Body: sidebar + grid ─────────────────────────── */}
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 48px', display:'grid', gridTemplateColumns:'180px 1fr', gap:48, alignItems:'start' }}>

        {/* ── Skill sidebar ── */}
        <div style={{ position:'sticky', top:20 }}>
          <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(163,201,255,0.28)', letterSpacing:'0.28em', textTransform:'uppercase', margin:'0 0 18px', paddingLeft:10 }}>
            Browse by skill
          </p>
          <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
            {SKILLS.map(s => {
              const active = skill === s
              const col = s === 'All' ? '#38bdf8' : (SKILL_COLORS[s] || '#38bdf8')
              const count = s === 'All' ? CATALOG.length : CATALOG.filter(c => c.skill === s).length
              return (
                <button key={s} className="lskill" onClick={() => setSkill(s)}
                  style={{
                    width:'100%', background: active ? `${col}12` : 'transparent',
                    border:'none', borderLeft: active ? `2px solid ${col}` : '2px solid transparent',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'9px 12px 9px 14px', cursor:'pointer', textAlign:'left',
                  }}
                >
                  <span style={{ fontSize:14, fontWeight: active ? 700 : 400, color: active ? col : 'rgba(163,201,255,0.55)', fontFamily:SANS, letterSpacing:'-0.01em' }}>
                    {s}
                  </span>
                  <span style={{ fontSize:10, color: active ? `${col}99` : 'rgba(163,201,255,0.2)', fontFamily:MONO, fontWeight: active ? 600 : 400 }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Grid ── */}
        <div>
          {results.length === 0 ? (
            <div style={{ padding:'80px 0', textAlign:'center', animation:'lib-in .3s ease' }}>
              <div style={{ fontSize:16, color:'rgba(163,201,255,0.4)', fontWeight:600 }}>Nothing found.</div>
              <div style={{ fontSize:13, color:'rgba(163,201,255,0.22)', marginTop:6 }}>Try a different search or skill.</div>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(178px,1fr))', gap:14 }}>
              {results.map((item, i) => {
                const Icon = TYPE_META[item.type].icon
                return (
                  <div key={item.id} className="lcard" onClick={() => setDetail(item)}
                    style={{ cursor:'pointer', display:'flex', flexDirection:'column', border:'1px solid rgba(163,201,255,0.07)', background:'rgba(255,255,255,0.02)', overflow:'hidden', animationDelay:`${Math.min(i,20)*0.03}s` }}>
                    <div style={{ overflow:'hidden', position:'relative' }}>
                      <Cover item={item} />
                      {item.tag && (
                        <span style={{ position:'absolute', top:9, right:0, background:item.tag==='FREE'?'#4ade80':'#fbbf24', color:'#070a0f', fontFamily:MONO, fontSize:7, fontWeight:800, letterSpacing:'0.1em', padding:'3px 7px' }}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <div style={{ padding:'12px 13px 14px', flex:1, display:'flex', flexDirection:'column', gap:0 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'#eef5ff', letterSpacing:'-0.015em', lineHeight:1.3 }}>{item.title}</div>
                      <div style={{ fontSize:11, color:'rgba(163,201,255,0.42)', marginTop:3 }}>{item.author}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:8 }}>
                        <Stars r={item.rating} />
                        <span style={{ fontSize:10, color:'#fbbf24', fontWeight:700 }}>{item.rating}</span>
                        <span style={{ fontSize:10, color:'rgba(163,201,255,0.28)' }}>({fmt(item.reviews)})</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:12 }}>
                        <span style={{ fontSize:16, fontWeight:800, color:item.price===0?'#4ade80':'#f0f6ff', letterSpacing:'-0.025em' }}>
                          {item.price===0?'Free':`$${item.price.toFixed(2)}`}
                        </span>
                        <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:7, color:`${item.accent}bb`, letterSpacing:'0.1em', textTransform:'uppercase' }}>
                          <Icon size={9} /> {item.skill}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Detail modal ─────────────────────────────────── */}
      {detail && (
        <div onClick={() => setDetail(null)}
          style={{ position:'fixed', inset:0, background:'rgba(2,4,8,0.85)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:28, animation:'lib-in .18s ease' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#0c1018', border:'1px solid rgba(163,201,255,0.1)', maxWidth:680, width:'100%', display:'flex', overflow:'hidden', animation:'lib-rise .22s ease' }}>
            <div style={{ width:230, flexShrink:0 }}>
              <Cover item={detail} h={320} />
            </div>
            <div style={{ padding:'28px 28px 24px', flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:8, color:detail.accent, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:10 }}>
                    {TYPE_META[detail.type].label} · {detail.skill}
                  </div>
                  <h2 style={{ fontSize:21, fontWeight:800, color:'#eef5ff', margin:0, letterSpacing:'-0.03em', lineHeight:1.2 }}>
                    {detail.title}
                  </h2>
                  <div style={{ fontSize:13, color:'rgba(163,201,255,0.48)', marginTop:6 }}>{detail.author}</div>
                </div>
                <button onClick={() => setDetail(null)}
                  style={{ background:'transparent', border:'1px solid rgba(163,201,255,0.13)', color:'rgba(163,201,255,0.4)', cursor:'pointer', padding:7, display:'flex', flexShrink:0, transition:'color .14s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#a3c9ff'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(163,201,255,0.4)'}
                >
                  <X size={13} />
                </button>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:14 }}>
                <Stars r={detail.rating} />
                <span style={{ fontSize:13, color:'#fbbf24', fontWeight:700 }}>{detail.rating}</span>
                <span style={{ fontSize:11, color:'rgba(163,201,255,0.32)' }}>{fmt(detail.reviews)} ratings</span>
              </div>
              <p style={{ fontSize:13, color:'rgba(210,226,248,0.62)', lineHeight:1.75, marginTop:16 }}>
                One of the highest-rated {TYPE_META[detail.type].label.toLowerCase()}s for <strong style={{ color:detail.accent, fontWeight:600 }}>{detail.skill}</strong>. Add it to your shelf and close the gap between where you are and where you want to be.
              </p>
              <div style={{ display:'flex', gap:8, marginTop:'auto', paddingTop:20 }}>
                <button style={{ flex:1, background:'#38bdf8', border:'none', color:'#060a10', fontSize:13, fontWeight:800, padding:'13px 20px', cursor:'pointer', fontFamily:SANS, letterSpacing:'-0.01em', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .14s' }}
                  onMouseEnter={e => e.currentTarget.style.background='#7dd3fc'}
                  onMouseLeave={e => e.currentTarget.style.background='#38bdf8'}
                >
                  {detail.type==='podcast' ? <><Play size={13} fill="#060a10" />Listen free</> : detail.price===0 ? 'Get it free' : `Buy · $${detail.price.toFixed(2)}`}
                </button>
                <button style={{ background:'transparent', border:'1px solid rgba(163,201,255,0.16)', color:'rgba(163,201,255,0.65)', fontSize:12, fontWeight:600, padding:'13px 18px', cursor:'pointer', fontFamily:SANS, transition:'all .14s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(163,201,255,0.05)'; e.currentTarget.style.color='#a3c9ff' }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(163,201,255,0.65)' }}
                >
                  + Shelf
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
