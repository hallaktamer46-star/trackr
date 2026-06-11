import { useState, useEffect, useMemo } from 'react'
import { Search, Star, Headphones, BookOpen, Podcast, Play, X } from 'lucide-react'

const MONO = '"Geist Mono", "JetBrains Mono", monospace'
const SANS = '"Geist", "Inter", system-ui, -apple-system, sans-serif'

/* ─────────────────────────── Catalog ─────────────────────────── */

const SKILLS = ['Sales','Negotiation','Leadership','Communication','Productivity','Money','Psychology','Career','Startups','Marketing']

const CATALOG = [
  // ── Books ──
  { id:1,  type:'book', title:'Never Split the Difference', author:'Chris Voss',           skill:'Negotiation',   rating:4.8, reviews:48211, price:14.99, cover:'#1b3a5c', accent:'#ffb689', tag:'BESTSELLER' },
  { id:2,  type:'book', title:'SPIN Selling',               author:'Neil Rackham',         skill:'Sales',         rating:4.6, reviews:12039, price:21.49, cover:'#27114d', accent:'#a78bfa' },
  { id:3,  type:'book', title:'To Sell Is Human',           author:'Daniel H. Pink',       skill:'Sales',         rating:4.5, reviews:9882,  price:12.99, cover:'#0d3b32', accent:'#4edea3' },
  { id:4,  type:'book', title:'The Challenger Sale',        author:'Dixon & Adamson',      skill:'Sales',         rating:4.5, reviews:7714,  price:18.00, cover:'#3b1020', accent:'#f472b6' },
  { id:5,  type:'book', title:'How to Win Friends & Influence People', author:'Dale Carnegie', skill:'Communication', rating:4.7, reviews:131044, price:9.99, cover:'#3a2a08', accent:'#fbbf24', tag:'CLASSIC' },
  { id:6,  type:'book', title:'Crucial Conversations',      author:'Patterson et al.',     skill:'Communication', rating:4.6, reviews:22980, price:16.20, cover:'#11324d', accent:'#60a5fa' },
  { id:7,  type:'book', title:'The 7 Habits of Highly Effective People', author:'Stephen Covey', skill:'Productivity', rating:4.7, reviews:88412, price:13.49, cover:'#10303b', accent:'#00d4ff', tag:'CLASSIC' },
  { id:8,  type:'book', title:'Deep Work',                  author:'Cal Newport',          skill:'Productivity',  rating:4.6, reviews:31755, price:15.99, cover:'#231140', accent:'#a3c9ff' },
  { id:9,  type:'book', title:'Atomic Habits',              author:'James Clear',          skill:'Productivity',  rating:4.8, reviews:194530, price:11.98, cover:'#0e3a26', accent:'#34d399', tag:'BESTSELLER' },
  { id:10, type:'book', title:'Leaders Eat Last',           author:'Simon Sinek',          skill:'Leadership',    rating:4.6, reviews:18233, price:17.00, cover:'#33140e', accent:'#fb923c' },
  { id:11, type:'book', title:'Extreme Ownership',          author:'Jocko Willink',        skill:'Leadership',    rating:4.8, reviews:41200, price:19.49, cover:'#101418', accent:'#ff6b6b' },
  { id:12, type:'book', title:'The Psychology of Money',    author:'Morgan Housel',        skill:'Money',         rating:4.7, reviews:67120, price:12.49, cover:'#0c2f3f', accent:'#4edea3', tag:'BESTSELLER' },
  { id:13, type:'book', title:'Rich Dad Poor Dad',          author:'Robert Kiyosaki',      skill:'Money',         rating:4.7, reviews:102338, price:8.99,  cover:'#3b0f2e', accent:'#e879f9', tag:'CLASSIC' },
  { id:14, type:'book', title:'Thinking, Fast and Slow',    author:'Daniel Kahneman',      skill:'Psychology',    rating:4.5, reviews:55410, price:13.99, cover:'#1f2a0e', accent:'#fbbf24' },
  { id:15, type:'book', title:'Influence',                  author:'Robert Cialdini',      skill:'Psychology',    rating:4.6, reviews:29047, price:14.50, cover:'#321515', accent:'#ff6b6b', tag:'CLASSIC' },
  { id:16, type:'book', title:'The Lean Startup',           author:'Eric Ries',            skill:'Startups',      rating:4.5, reviews:32115, price:16.99, cover:'#0b2d4d', accent:'#00d4ff' },
  { id:17, type:'book', title:'Zero to One',                author:'Peter Thiel',          skill:'Startups',      rating:4.6, reviews:28440, price:15.49, cover:'#131313', accent:'#a3c9ff', tag:'BESTSELLER' },
  { id:18, type:'book', title:'$100M Offers',               author:'Alex Hormozi',         skill:'Marketing',     rating:4.9, reviews:38755, price:0,     cover:'#3a2604', accent:'#fbbf24', tag:'FREE' },
  { id:19, type:'book', title:'So Good They Can\'t Ignore You', author:'Cal Newport',      skill:'Career',        rating:4.5, reviews:11820, price:13.20, cover:'#272040', accent:'#a78bfa' },
  { id:20, type:'book', title:'Designing Your Life',        author:'Burnett & Evans',      skill:'Career',        rating:4.4, reviews:8233,  price:14.75, cover:'#0d3540', accent:'#34d399' },

  // ── Audiobooks ──
  { id:21, type:'audiobook', title:'Never Split the Difference', author:'Chris Voss · 8h 7m',   skill:'Negotiation',  rating:4.9, reviews:21470, price:19.99, cover:'#1b3a5c', accent:'#ffb689' },
  { id:22, type:'audiobook', title:'Atomic Habits',           author:'James Clear · 5h 35m',    skill:'Productivity', rating:4.8, reviews:84210, price:17.49, cover:'#0e3a26', accent:'#34d399', tag:'BESTSELLER' },
  { id:23, type:'audiobook', title:'Extreme Ownership',       author:'Jocko Willink · 9h 33m',  skill:'Leadership',   rating:4.8, reviews:19822, price:21.99, cover:'#101418', accent:'#ff6b6b' },
  { id:24, type:'audiobook', title:'The Psychology of Money', author:'Morgan Housel · 5h 48m',  skill:'Money',        rating:4.7, reviews:30115, price:14.99, cover:'#0c2f3f', accent:'#4edea3' },
  { id:25, type:'audiobook', title:'$100M Leads',             author:'Alex Hormozi · 6h 11m',   skill:'Marketing',    rating:4.9, reviews:25030, price:0,     cover:'#3a2604', accent:'#fbbf24', tag:'FREE' },
  { id:26, type:'audiobook', title:'Start with Why',          author:'Simon Sinek · 7h 18m',    skill:'Leadership',   rating:4.6, reviews:15233, price:18.20, cover:'#33140e', accent:'#fb923c' },

  // ── Podcasts ──
  { id:27, type:'podcast', title:'The Diary of a CEO',       author:'Steven Bartlett',      skill:'Startups',      rating:4.8, reviews:91200, price:0, cover:'#181126', accent:'#e879f9', tag:'FREE' },
  { id:28, type:'podcast', title:'Lenny\'s Podcast',         author:'Lenny Rachitsky',      skill:'Career',        rating:4.9, reviews:12400, price:0, cover:'#0b2d4d', accent:'#00d4ff', tag:'FREE' },
  { id:29, type:'podcast', title:'The Game',                 author:'Alex Hormozi',         skill:'Sales',         rating:4.9, reviews:34800, price:0, cover:'#3a2604', accent:'#fbbf24', tag:'FREE' },
  { id:30, type:'podcast', title:'HBR IdeaCast',             author:'Harvard Business Review', skill:'Leadership', rating:4.5, reviews:22100, price:0, cover:'#321515', accent:'#ff6b6b', tag:'FREE' },
  { id:31, type:'podcast', title:'My First Million',         author:'Shaan Puri & Sam Parr', skill:'Startups',     rating:4.7, reviews:28900, price:0, cover:'#0d3b32', accent:'#4edea3', tag:'FREE' },
  { id:32, type:'podcast', title:'Negotiate Anything',       author:'Kwame Christian',      skill:'Negotiation',   rating:4.7, reviews:9400,  price:0, cover:'#27114d', accent:'#a78bfa', tag:'FREE' },
]

const TYPES = [
  { key:'all',       label:'All',        icon:null },
  { key:'book',      label:'Books',      icon:BookOpen },
  { key:'audiobook', label:'Audiobooks', icon:Headphones },
  { key:'podcast',   label:'Podcasts',   icon:Podcast },
]

/* ─────────────────────────── Helpers ─────────────────────────── */

const CSS = `
  @keyframes lib-up { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lib-fade { from{opacity:0} to{opacity:1} }
  .lib-card { animation: lib-up .35s ease both; transition: transform .22s cubic-bezier(.2,.8,.3,1); }
  .lib-card:hover { transform: translateY(-5px); }
  .lib-card:hover .lib-cover-art { transform: scale(1.04); }
  .lib-cover-art { transition: transform .35s cubic-bezier(.2,.8,.3,1); }
  .lib-pill { transition: all .15s ease; }
`

function Stars({ rating }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={10}
          fill={i <= Math.round(rating) ? '#fbbf24' : 'none'}
          color={i <= Math.round(rating) ? '#fbbf24' : 'rgba(163,201,255,0.25)'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  )
}

function fmtReviews(n) {
  return n >= 1000 ? `${(n/1000).toFixed(n >= 10000 ? 0 : 1)}k` : n
}

const TYPE_META = {
  book:      { label:'Book',      icon:BookOpen },
  audiobook: { label:'Audiobook', icon:Headphones },
  podcast:   { label:'Podcast',   icon:Podcast },
}

/* ─────────────────────────── Cover art ─────────────────────────── */

function Cover({ item, height = 190 }) {
  const Icon = TYPE_META[item.type].icon
  return (
    <div className="lib-cover-art" style={{
      height,
      background: item.cover,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '16px 14px',
      overflow: 'hidden',
    }}>
      {/* Accent rule */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:item.accent }} />
      {/* Big type-set title, like a designed cover */}
      <div style={{ fontFamily:SANS, fontWeight:800, fontSize: item.title.length > 28 ? 14 : 17, lineHeight:1.2, color:'#f2f7fc', letterSpacing:'-0.02em', marginTop:8 }}>
        {item.title}
      </div>
      <div>
        <div style={{ fontFamily:MONO, fontSize:8, color:item.accent, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:4 }}>
          {item.author.split('·')[0].trim()}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <Icon size={11} color={item.accent} strokeWidth={2} />
          <span style={{ fontFamily:MONO, fontSize:7, color:`${item.accent}aa`, letterSpacing:'0.16em', textTransform:'uppercase' }}>
            {TYPE_META[item.type].label}
          </span>
        </div>
      </div>
      {/* Corner geometric detail */}
      <div style={{ position:'absolute', right:-26, bottom:-26, width:80, height:80, border:`1.5px solid ${item.accent}33`, transform:'rotate(45deg)' }} />
      <div style={{ position:'absolute', right:-14, bottom:-14, width:56, height:56, border:`1.5px solid ${item.accent}22`, transform:'rotate(45deg)' }} />
    </div>
  )
}

/* ─────────────────────────── Page ─────────────────────────── */

export default function Library() {
  const [query,  setQuery]  = useState('')
  const [type,   setType]   = useState('all')
  const [skill,  setSkill]  = useState(null)
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = CSS
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CATALOG.filter(item => {
      if (type !== 'all' && item.type !== type) return false
      if (skill && item.skill !== skill) return false
      if (q && !`${item.title} ${item.author} ${item.skill}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, type, skill])

  const featured = CATALOG.filter(c => c.tag === 'BESTSELLER').slice(0, 3)

  return (
    <div style={{ background:'#0a0e14', minHeight:'100vh', fontFamily:SANS, margin:'-12px -24px', padding:'0 0 80px' }}>

      {/* ════ Hero band ════ */}
      <div style={{ background:'#0d1420', borderBottom:'1px solid rgba(163,201,255,0.07)' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'44px 32px 36px' }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:'#00d4ff', letterSpacing:'0.3em', textTransform:'uppercase', marginBottom:12 }}>
            Trackr Library
          </div>
          <h1 style={{ fontSize:38, fontWeight:850, color:'#eef4fa', margin:0, letterSpacing:'-0.045em', lineHeight:1.05 }}>
            Read your way into<br/>your next skill.
          </h1>
          <p style={{ fontSize:14, color:'rgba(163,201,255,0.55)', marginTop:14, maxWidth:480, lineHeight:1.6 }}>
            Books, audiobooks and podcasts — curated for the skills that actually move your career.
          </p>

          {/* Search */}
          <div style={{ marginTop:26, maxWidth:560, position:'relative' }}>
            <Search size={15} color="rgba(163,201,255,0.4)" style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search titles, authors, skills…"
              style={{
                width:'100%', boxSizing:'border-box',
                background:'#101a2a',
                border:'1px solid rgba(163,201,255,0.14)',
                color:'#eef4fa', fontSize:14, fontFamily:SANS,
                padding:'13px 42px', outline:'none',
                transition:'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,255,0.45)'}
              onBlur={e => e.target.style.borderColor = 'rgba(163,201,255,0.14)'}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', color:'rgba(163,201,255,0.5)', display:'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ════ Filter bar ════ */}
      <div style={{ position:'sticky', top:0, zIndex:10, background:'#0a0e14', borderBottom:'1px solid rgba(163,201,255,0.06)' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'14px 32px', display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
          {/* Type tabs */}
          <div style={{ display:'flex', gap:2 }}>
            {TYPES.map(t => {
              const active = type === t.key
              const Icon = t.icon
              return (
                <button key={t.key} className="lib-pill" onClick={() => setType(t.key)}
                  style={{
                    display:'flex', alignItems:'center', gap:7,
                    background: active ? '#00d4ff' : 'transparent',
                    border: active ? '1px solid #00d4ff' : '1px solid rgba(163,201,255,0.14)',
                    color: active ? '#0a0e14' : 'rgba(163,201,255,0.65)',
                    fontSize:12, fontWeight: active ? 700 : 500,
                    padding:'7px 16px', cursor:'pointer', fontFamily:SANS,
                  }}
                >
                  {Icon && <Icon size={12} strokeWidth={2.2} />}
                  {t.label}
                </button>
              )
            })}
          </div>

          <div style={{ width:1, height:20, background:'rgba(163,201,255,0.1)' }} />

          {/* Skill chips */}
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', flex:1 }}>
            {SKILLS.map(s => {
              const active = skill === s
              return (
                <button key={s} className="lib-pill" onClick={() => setSkill(active ? null : s)}
                  style={{
                    background: active ? 'rgba(0,212,255,0.12)' : 'transparent',
                    border:'none',
                    color: active ? '#00d4ff' : 'rgba(163,201,255,0.45)',
                    fontSize:11, fontWeight: active ? 700 : 500,
                    padding:'5px 10px', cursor:'pointer', fontFamily:SANS,
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 32px' }}>

        {/* ════ Featured row (only on clean view) ════ */}
        {!query && !skill && type === 'all' && (
          <div style={{ margin:'34px 0 10px' }}>
            <div style={{ fontFamily:MONO, fontSize:9, color:'rgba(163,201,255,0.4)', letterSpacing:'0.25em', textTransform:'uppercase', marginBottom:14 }}>
              Featured this week
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:14 }}>
              {featured.map((item, i) => (
                <div key={item.id} className="lib-card" onClick={() => setDetail(item)}
                  style={{ display:'flex', background:'#0e1622', border:'1px solid rgba(163,201,255,0.08)', cursor:'pointer', overflow:'hidden', animationDelay:`${i*0.08}s` }}>
                  <div style={{ width:104, flexShrink:0, overflow:'hidden' }}>
                    <Cover item={item} height={132} />
                  </div>
                  <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', justifyContent:'center', minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#eef4fa', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(163,201,255,0.5)', marginTop:3 }}>{item.author.split('·')[0].trim()}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:8 }}>
                      <Stars rating={item.rating} />
                      <span style={{ fontSize:10, color:'rgba(163,201,255,0.4)' }}>{item.rating}</span>
                    </div>
                    <div style={{ fontFamily:MONO, fontSize:8, color:item.accent, letterSpacing:'0.16em', marginTop:8 }}>★ {item.tag}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ Results header ════ */}
        <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', margin:'34px 0 16px' }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:'rgba(163,201,255,0.4)', letterSpacing:'0.25em', textTransform:'uppercase' }}>
            {skill ? `${skill} · ` : ''}{type === 'all' ? 'All titles' : TYPES.find(t=>t.key===type).label}
          </div>
          <div style={{ fontFamily:MONO, fontSize:10, color:'rgba(163,201,255,0.3)' }}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* ════ Grid ════ */}
        {results.length === 0 ? (
          <div style={{ padding:'70px 0', textAlign:'center', animation:'lib-fade .3s ease' }}>
            <div style={{ fontSize:15, color:'rgba(163,201,255,0.5)', fontWeight:600 }}>Nothing matches that.</div>
            <div style={{ fontSize:12, color:'rgba(163,201,255,0.3)', marginTop:6 }}>Try a different search or clear the filters.</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(196px, 1fr))', gap:14 }}>
            {results.map((item, i) => {
              const Icon = TYPE_META[item.type].icon
              return (
                <div key={item.id} className="lib-card" onClick={() => setDetail(item)}
                  style={{ background:'#0e1622', border:'1px solid rgba(163,201,255,0.08)', cursor:'pointer', overflow:'hidden', animationDelay:`${Math.min(i,12)*0.04}s`, display:'flex', flexDirection:'column' }}>

                  <div style={{ overflow:'hidden', position:'relative' }}>
                    <Cover item={item} />
                    {item.tag && (
                      <div style={{
                        position:'absolute', top:10, right:0,
                        background: item.tag === 'FREE' ? '#4edea3' : '#fbbf24',
                        color:'#0a0e14', fontFamily:MONO, fontSize:7, fontWeight:800,
                        letterSpacing:'0.14em', padding:'3px 8px',
                      }}>
                        {item.tag}
                      </div>
                    )}
                  </div>

                  <div style={{ padding:'13px 14px 15px', flex:1, display:'flex', flexDirection:'column' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#eef4fa', letterSpacing:'-0.01em', lineHeight:1.3 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(163,201,255,0.5)', marginTop:3 }}>
                      {item.author}
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:9 }}>
                      <Stars rating={item.rating} />
                      <span style={{ fontSize:10, color:'#fbbf24', fontWeight:600 }}>{item.rating}</span>
                      <span style={{ fontSize:10, color:'rgba(163,201,255,0.35)' }}>({fmtReviews(item.reviews)})</span>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:12 }}>
                      <span style={{ fontSize:15, fontWeight:800, color: item.price === 0 ? '#4edea3' : '#eef4fa', letterSpacing:'-0.02em' }}>
                        {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                      </span>
                      <span style={{
                        display:'flex', alignItems:'center', gap:5,
                        fontFamily:MONO, fontSize:8, color:'rgba(163,201,255,0.4)',
                        letterSpacing:'0.12em', textTransform:'uppercase',
                      }}>
                        <Icon size={10} /> {item.skill}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ════ Detail panel ════ */}
      {detail && (
        <div
          onClick={() => setDetail(null)}
          style={{ position:'fixed', inset:0, background:'rgba(5,8,12,0.75)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', animation:'lib-fade .2s ease', padding:24 }}
        >
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#0e1622', border:'1px solid rgba(163,201,255,0.12)', maxWidth:680, width:'100%', display:'flex', animation:'lib-up .25s ease', overflow:'hidden' }}>
            <div style={{ width:230, flexShrink:0 }}>
              <Cover item={detail} height={320} />
            </div>
            <div style={{ padding:'28px 28px 24px', display:'flex', flexDirection:'column', minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:8, color:detail.accent, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:8 }}>
                    {TYPE_META[detail.type].label} · {detail.skill}
                  </div>
                  <h2 style={{ fontSize:22, fontWeight:800, color:'#eef4fa', margin:0, letterSpacing:'-0.03em', lineHeight:1.2 }}>
                    {detail.title}
                  </h2>
                  <div style={{ fontSize:13, color:'rgba(163,201,255,0.55)', marginTop:6 }}>{detail.author}</div>
                </div>
                <button onClick={() => setDetail(null)}
                  style={{ background:'transparent', border:'1px solid rgba(163,201,255,0.15)', color:'rgba(163,201,255,0.5)', cursor:'pointer', padding:7, display:'flex', flexShrink:0 }}>
                  <X size={14} />
                </button>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:14 }}>
                <Stars rating={detail.rating} />
                <span style={{ fontSize:12, color:'#fbbf24', fontWeight:700 }}>{detail.rating}</span>
                <span style={{ fontSize:11, color:'rgba(163,201,255,0.4)' }}>{fmtReviews(detail.reviews)} ratings</span>
              </div>

              <p style={{ fontSize:13, color:'rgba(220,232,244,0.7)', lineHeight:1.7, marginTop:16 }}>
                One of the most recommended {TYPE_META[detail.type].label.toLowerCase()}s for {detail.skill.toLowerCase()}.
                Add it to your shelf and build the skill that gets you hired.
              </p>

              <div style={{ display:'flex', gap:8, marginTop:'auto', paddingTop:20 }}>
                <button style={{
                  flex:1, background:'#00d4ff', border:'none', color:'#0a0e14',
                  fontSize:13, fontWeight:800, padding:'12px 20px', cursor:'pointer',
                  fontFamily:SANS, letterSpacing:'-0.01em',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                }}>
                  {detail.type === 'podcast' ? <><Play size={14} fill="#0a0e14" /> Listen now</>
                    : detail.price === 0 ? 'Get it free'
                    : `Buy · $${detail.price.toFixed(2)}`}
                </button>
                <button style={{
                  background:'transparent', border:'1px solid rgba(163,201,255,0.2)',
                  color:'#a3c9ff', fontSize:12, fontWeight:600,
                  padding:'12px 18px', cursor:'pointer', fontFamily:SANS,
                }}>
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
