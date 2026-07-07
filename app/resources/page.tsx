'use client'
import { useRouter } from 'next/navigation'

export default function Resources() {
  const router = useRouter()
  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',color:'#F4F1E8',fontFamily:'sans-serif',padding:'40px 24px'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <button onClick={()=>router.push('/dashboard')} style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'#9B968A',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13,marginBottom:24}}>← Back to HQ</button>
        <div style={{fontSize:11,letterSpacing:'.34em',color:'#D4AF37',textTransform:'uppercase',marginBottom:12,border:'1px solid rgba(212,175,55,0.3)',display:'inline-block',padding:'6px 14px',borderRadius:4}}>RESOURCE LIBRARY</div>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:32,margin:'8px 0 32px'}}>The <span style={{color:'#D4AF37'}}>Library</span></h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:18}}>
          {[
            {t:'AI Legacy Lounge™ Community',d:'Coaching, classes, and a room full of builders like you.',url:'https://www.skool.com/legacy-lounge-lab/about',cta:'Join the Lounge'},
            {t:'Coach Neik™ Hub',d:'Every tool, product, and program in one place.',url:'https://beacons.ai/mzcookie',cta:'Open the Hub'},
            {t:'CEO Weekly Ritual',d:'Every Monday: open your dashboard, read your vision, pick ONE focus, log one decision. 10 minutes. Non-negotiable.'},
            {t:'The 90-Day Rule',d:'Businesses do not change in a year of thinking. They change in 90 days of doing. Work the plan you built in the CEO Office.'},
          ].map(r=>(
            <div key={r.t} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'24px'}}>
              <h3 style={{fontFamily:'Georgia,serif',margin:'0 0 8px',fontSize:17,color:'#D4AF37'}}>{r.t}</h3>
              <p style={{color:'#9B968A',fontSize:14,margin:'0 0 16px'}}>{r.d}</p>
              {r.url && <a href={r.url} target="_blank" rel="noreferrer" style={{color:'#D4AF37',fontSize:13,textDecoration:'none',border:'1px solid rgba(212,175,55,0.4)',padding:'8px 14px',borderRadius:8}}>{r.cta} →</a>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
