import { useState, useEffect, useMemo } from 'react'
import { Search, Star, Headphones, BookOpen, Podcast, Play, X } from 'lucide-react'

const SANS = '"Geist", "Inter", system-ui, -apple-system, sans-serif'
const MONO = '"Geist Mono", "JetBrains Mono", monospace'
const BG   = '#070a0f'

/* ── Catalog ───────────────────────────────────────────────────── */

const SKILLS = ['All Skills','Sales','Negotiation','Leadership','Communication','Productivity','Money','Psychology','Career','Startups','Marketing']

const CATALOG = [
  { id:1,  type:'book',      title:'Never Split the Difference', author:'Chris Voss',               skill:'Negotiation',  rating:4.8, reviews:48211, price:14.99, cover:'#1a2744', accent:'#f97316', tag:'BESTSELLER' },
  { id:2,  type:'book',      title:'SPIN Selling',               author:'Neil Rackham',             skill:'Sales',        rating:4.6, reviews:12039, price:21.49, cover:'#200d3d', accent:'#a78bfa' },
  { id:3,  type:'book',      title:'To Sell Is Human',           author:'Daniel H. Pink',           skill:'Sales',        rating:4.5, reviews:9882,  price:12.99, cover:'#07281e', accent:'#34d399' },
  { id:4,  type:'book',      title:'The Challenger Sale',        author:'Dixon & Adamson',          skill:'Sales',        rating:4.5, reviews:7714,  price:18.00, cover:'#2a0a18', accent:'#fb7185' },
  { id:5,  type:'book',      title:'How to Win Friends & Influence People', author:'Dale Carnegie', skill:'Communication', rating:4.7, reviews:131044,price:9.99,  cover:'#271d06', accent:'#fbbf24', tag:'CLASSIC' },
  { id:6,  type:'book',      title:'Crucial Conversations',      author:'Patterson et al.',         skill:'Communication',rating:4.6, reviews:22980, price:16.20, cover:'#0a1f35', accent:'#38bdf8' },
  { id:7,  type:'book',      title:'The 7 Habits of Highly Effective People','author':'Stephen Covey', skill:'Productivity',rating:4.7,reviews:88412,price:13.49, cover:'#0b2228', accent:'#22d3ee', tag:'CLASSIC' },
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
  { id:19, type:'book',      title:"So Good They Can't Ignore You",'author':'Cal Newport',         skill:'Career',       rating:4.5, reviews:11820, price:13.20, cover:'#1a1230', accent:'#c4b5fd' },
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

const TYPES = [
  { key:'all',       label:'Everything' },
  { key:'book',      label:'Books',      icon:BookOpen },
  { key:'audiobook', label:'Audiobooks', icon:Headphones },
  { key:'podcast',   label:'Podcasts',   icon:Podcast },
]

const TYPE_META = {
  book:      { label:'Book',      icon:BookOpen },
  audiobook: { label:'Audiobook', icon:Headphones },
  podcast:   { label:'Podcast',   icon:Podcast },
}

const CSS = `
  @keyframes lib-rise { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lib-in   { from{opacity:0} to{opacity:1} }
  .lcard { transition:transform .24s cubic-bezier(.22,.8,.3,1); animation: lib-rise .4s ease both; }
  .lcard:hover { transform:translateY(-6px); }
  .lcard:hover .lcov { transform:scale(1.05); }
  .lcov { transition:transform .3s cubic-bezier(.22,.8,.3,1); }
  input::placeholder { color:rgba(163,201,255,0.28) !important; }
`

function Stars({ r }) {
  return (
    <span style={{ display:'inline-flex', gap:1.5 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={9} fill={i<=Math.round(r)?'#fbbf24':'none'} color={i<=Math.round(r)?'#fbbf24':'rgba(163,201,255,0.18)'} strokeWidth={1.5} />
      ))}
    </span>
  )
}

function fmt(n) { return n>=1000 ? `${(n/1000).toFixed(n>=10000?0:1)}k` : n }

function Cover({ item, h=200 }) {
  const Icon = TYPE_META[item.type].icon
  return (
    <div className="lcov" style={{ height:h, background:item.cover, position:'relative', overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'18px 16px 15px' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:item.accent }} />
      <div style={{ fontFamily:SANS, fontWeight:800, fontSize:item.title.length>30?13:16, lineHeight:1.22, color:'#f0f6ff', letterSpacing:'-0.025em' }}>
        {item.title}
      </div>
      <div>
        <div style={{ fontFamily:MONO, fontSize:8, color:item.accent, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:5 }}>
          {item.author.split('·')[0].trim()}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <Icon size={10} color={item.accent} strokeWidth={2} />
          <span style={{ fontFamily:MONO, fontSize:7, color:`${item.accent}99`, letterSpacing:'0.14em', textTransform:'uppercase' }}>
            {TYPE_META[item.type].label}
          </span>
        </div>
      </div>
      <div style={{ position:'absolute', right:-22, bottom:-22, width:72, height:72, border:`1px solid ${item.accent}28`, transform:'rotate(45deg)' }} />
      <div style={{ position:'absolute', right:-10, bottom:-10, width:48, height:48, border:`1px solid ${item.accent}18`, transform:'rotate(45deg)' }} />
    </div>
  )
}

export default function Library() {
  const [query,  setQuery]  = useState('')
  const [type,   setType]   = useState('all')
  const [skill,  setSkill]  = useState('All Skills')
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
      if (skill !== 'All Skills' && item.skill !== skill) return false
      if (q && !`${item.title} ${item.author} ${item.skill}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, type, skill])

  const featured = CATALOG.filter(c => c.tag === 'BESTSELLER').slice(0, 4)
  const showHero = !query && skill === 'All Skills' && type === 'all'

  return (
    <div style={{ background:BG, minHeight:'100vh', fontFamily:SANS, margin:'-12px -24px', paddingBottom:100 }}>
      <style>{CSS}</style>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{ paddingTop:56, paddingBottom:52, paddingLeft:40, paddingRight:40 }}>
        <div style={{ maxWidth:1160, margin:'0 auto' }}>

          <p style={{ fontFamily:MONO, fontSize:9, color:'#38bdf8', letterSpacing:'0.32em', textTransform:'uppercase', marginBottom:14 }}>
            Trackr Library
          </p>

          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
            <h1 style={{ fontSize:52, fontWeight:900, color:'#f0f6ff', margin:0, letterSpacing:'-0.055em', lineHeight:1, fontFamily:SANS }}>
              Read your way<br/>
              <span style={{ color:'#38bdf8' }}>into your next skill.</span>
            </h1>
            <p style={{ fontSize:14, color:'rgba(163,201,255,0.5)', maxWidth:340, lineHeight:1.7, margin:0 }}>
              Books, audiobooks and podcasts — every title matched to a skill that moves your career forward.
            </p>
          </div>

          {/* Search */}
          <div style={{ marginTop:34, maxWidth:600, position:'relative' }}>
            <Search size={16} color="rgba(163,201,255,0.35)" style={{ position:'absolute', left:18, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search titles, authors or skills…"
              style={{
                width:'100%', boxSizing:'border-box',
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(163,201,255,0.13)',
                color:'#f0f6ff', fontSize:15, fontFamily:SANS, fontWeight:400,
                padding:'15px 48px 15px 48px',
                outline:'none', transition:'border-color .18s',
              }}
              onFocus={e => e.target.style.borderColor='rgba(56,189,248,0.5)'}
              onBlur={e => e.target.style.borderColor='rgba(163,201,255,0.13)'}
            />
            {query && (
              <button onClick={() => setQuery('')}
                style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', color:'rgba(163,201,255,0.4)', cursor:'pointer', display:'flex', padding:4 }}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────── */}
      <div style={{ borderTop:'1px solid rgba(163,201,255,0.06)', borderBottom:'1px solid rgba(163,201,255,0.06)', padding:'0 40px', position:'sticky', top:0, zIndex:20, background:BG }}>
        <div style={{ maxWidth:1160, margin:'0 auto', display:'flex', alignItems:'center', gap:0 }}>

          {/* Type tabs */}
          {TYPES.map(t => {
            const active = type === t.key
            const Icon = t.icon
            return (
              <button key={t.key} onClick={() => setType(t.key)}
                style={{
                  display:'flex', alignItems:'center', gap:7,
                  background:'transparent', border:'none',
                  borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent',
                  color: active ? '#f0f6ff' : 'rgba(163,201,255,0.42)',
                  fontSize:13, fontWeight: active ? 600 : 400,
                  padding:'17px 20px', cursor:'pointer', fontFamily:SANS,
                  transition:'color .15s, border-color .15s',
                  whiteSpace:'nowrap',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color='rgba(163,201,255,0.75)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color='rgba(163,201,255,0.42)' }}
              >
                {Icon && <Icon size={13} strokeWidth={2} />}
                {t.label}
              </button>
            )
          })}

          <div style={{ width:1, height:18, background:'rgba(163,201,255,0.1)', margin:'0 8px' }} />

          {/* Skill chips — scrollable */}
          <div style={{ display:'flex', gap:0, overflowX:'auto', flex:1, scrollbarWidth:'none' }}>
            {SKILLS.map(s => {
              const active = skill === s
              return (
                <button key={s} onClick={() => setSkill(s)}
                  style={{
                    background:'transparent', border:'none',
                    borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent',
                    color: active ? '#38bdf8' : 'rgba(163,201,255,0.38)',
                    fontSize:13, fontWeight: active ? 600 : 400,
                    padding:'17px 14px', cursor:'pointer', fontFamily:SANS,
                    transition:'color .15s, border-color .15s',
                    whiteSpace:'nowrap', flexShrink:0,
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.color='rgba(163,201,255,0.7)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.color='rgba(163,201,255,0.38)' }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1160, margin:'0 auto', padding:'0 40px' }}>

        {/* ── Featured row ─────────────────────────────── */}
        {showHero && (
          <div style={{ marginTop:44, marginBottom:8 }}>
            <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(163,201,255,0.35)', letterSpacing:'0.26em', textTransform:'uppercase', marginBottom:16 }}>
              Most read this week
            </p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
              {featured.map((item, i) => (
                <div key={item.id} className="lcard" onClick={() => setDetail(item)}
                  style={{ cursor:'pointer', display:'flex', gap:0, animationDelay:`${i*0.07}s` }}>
                  <div style={{ flex:1, display:'flex', gap:12, alignItems:'center', border:'1px solid rgba(163,201,255,0.07)', padding:'12px 14px', background:'rgba(255,255,255,0.018)' }}>
                    <div style={{ width:44, height:60, flexShrink:0, overflow:'hidden', background:item.cover, position:'relative' }}>
                      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:item.accent }} />
                    </div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#eef5ff', letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.title}</div>
                      <div style={{ fontSize:10, color:'rgba(163,201,255,0.45)', marginTop:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.author.split('·')[0].trim()}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:6 }}>
                        <Stars r={item.rating} />
                        <span style={{ fontSize:10, color:'#fbbf24', fontWeight:600 }}>{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Results count ─────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:40, marginBottom:18 }}>
          <p style={{ fontFamily:MONO, fontSize:9, color:'rgba(163,201,255,0.35)', letterSpacing:'0.22em', textTransform:'uppercase', margin:0 }}>
            {skill !== 'All Skills' ? `${skill} · ` : ''}{TYPES.find(t=>t.key===type)?.label ?? 'Everything'}
          </p>
          <p style={{ fontFamily:MONO, fontSize:10, color:'rgba(163,201,255,0.25)', margin:0 }}>
            {results.length} title{results.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* ── Grid ─────────────────────────────────────── */}
        {results.length === 0 ? (
          <div style={{ padding:'80px 0', textAlign:'center', animation:'lib-in .3s ease' }}>
            <div style={{ fontSize:16, color:'rgba(163,201,255,0.45)', fontWeight:600 }}>Nothing here.</div>
            <div style={{ fontSize:13, color:'rgba(163,201,255,0.25)', marginTop:6 }}>Try a different search or filter.</div>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(188px,1fr))', gap:14 }}>
            {results.map((item, i) => {
              const Icon = TYPE_META[item.type].icon
              return (
                <div key={item.id} className="lcard" onClick={() => setDetail(item)}
                  style={{ cursor:'pointer', display:'flex', flexDirection:'column', border:'1px solid rgba(163,201,255,0.07)', background:'rgba(255,255,255,0.018)', overflow:'hidden', animationDelay:`${Math.min(i,16)*0.035}s` }}>

                  <div style={{ overflow:'hidden', position:'relative' }}>
                    <Cover item={item} />
                    {item.tag && (
                      <span style={{
                        position:'absolute', top:10, right:0,
                        background: item.tag==='FREE' ? '#4ade80' : '#fbbf24',
                        color:'#070a0f', fontFamily:MONO, fontSize:7, fontWeight:800,
                        letterSpacing:'0.12em', padding:'3px 8px',
                      }}>
                        {item.tag}
                      </span>
                    )}
                  </div>

                  <div style={{ padding:'14px 15px 16px', flex:1, display:'flex', flexDirection:'column' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'#eef5ff', letterSpacing:'-0.015em', lineHeight:1.3 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize:11, color:'rgba(163,201,255,0.45)', marginTop:3 }}>
                      {item.author}
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:9 }}>
                      <Stars r={item.rating} />
                      <span style={{ fontSize:10, color:'#fbbf24', fontWeight:700 }}>{item.rating}</span>
                      <span style={{ fontSize:10, color:'rgba(163,201,255,0.3)' }}>({fmt(item.reviews)})</span>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:13 }}>
                      <span style={{ fontSize:16, fontWeight:800, color: item.price===0 ? '#4ade80' : '#f0f6ff', letterSpacing:'-0.025em', fontFamily:SANS }}>
                        {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
                      </span>
                      <span style={{ display:'flex', alignItems:'center', gap:4, fontFamily:MONO, fontSize:8, color:`${item.accent}cc`, letterSpacing:'0.1em', textTransform:'uppercase' }}>
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

      {/* ── Detail modal ─────────────────────────────────── */}
      {detail && (
        <div onClick={() => setDetail(null)}
          style={{ position:'fixed', inset:0, background:'rgba(2,4,8,0.82)', zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:28, animation:'lib-in .18s ease' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background:'#0d1118', border:'1px solid rgba(163,201,255,0.1)', maxWidth:700, width:'100%', display:'flex', overflow:'hidden', animation:'lib-rise .22s ease' }}>
            <div style={{ width:240, flexShrink:0 }}>
              <Cover item={detail} h={340} />
            </div>
            <div style={{ padding:'30px 30px 26px', flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:8, color:detail.accent, letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:10 }}>
                    {TYPE_META[detail.type].label} · {detail.skill}
                  </div>
                  <h2 style={{ fontSize:22, fontWeight:800, color:'#eef5ff', margin:0, letterSpacing:'-0.03em', lineHeight:1.2 }}>
                    {detail.title}
                  </h2>
                  <div style={{ fontSize:13, color:'rgba(163,201,255,0.5)', marginTop:7 }}>{detail.author}</div>
                </div>
                <button onClick={() => setDetail(null)}
                  style={{ background:'transparent', border:'1px solid rgba(163,201,255,0.14)', color:'rgba(163,201,255,0.45)', cursor:'pointer', padding:7, display:'flex', flexShrink:0, transition:'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color='#a3c9ff'}
                  onMouseLeave={e => e.currentTarget.style.color='rgba(163,201,255,0.45)'}
                >
                  <X size={14} />
                </button>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:16 }}>
                <Stars r={detail.rating} />
                <span style={{ fontSize:13, color:'#fbbf24', fontWeight:700 }}>{detail.rating}</span>
                <span style={{ fontSize:12, color:'rgba(163,201,255,0.35)' }}>{fmt(detail.reviews)} ratings</span>
              </div>

              <p style={{ fontSize:13, color:'rgba(214,228,248,0.65)', lineHeight:1.72, marginTop:18 }}>
                One of the highest-rated {TYPE_META[detail.type].label.toLowerCase()}s for <strong style={{ color:detail.accent, fontWeight:600 }}>{detail.skill}</strong>. Add it to your shelf and close the gap between where you are and where you want to be.
              </p>

              <div style={{ display:'flex', gap:8, marginTop:'auto', paddingTop:22 }}>
                <button style={{
                  flex:1, background:'#38bdf8', border:'none', color:'#060a10',
                  fontSize:13, fontWeight:800, padding:'13px 20px', cursor:'pointer',
                  fontFamily:SANS, letterSpacing:'-0.01em',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  transition:'background .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background='#7dd3fc'}
                  onMouseLeave={e => e.currentTarget.style.background='#38bdf8'}
                >
                  {detail.type === 'podcast' ? <><Play size={14} fill="#060a10" /> Listen free</>
                    : detail.price === 0 ? 'Get it free'
                    : `Buy · $${detail.price.toFixed(2)}`}
                </button>
                <button style={{
                  background:'transparent', border:'1px solid rgba(163,201,255,0.18)',
                  color:'rgba(163,201,255,0.7)', fontSize:12, fontWeight:600,
                  padding:'13px 18px', cursor:'pointer', fontFamily:SANS,
                  transition:'all .15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(163,201,255,0.06)'; e.currentTarget.style.color='#a3c9ff' }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(163,201,255,0.7)' }}
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
