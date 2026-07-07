'use client'
import { useRouter } from 'next/navigation'

export default function Locked() {
  const router = useRouter()
  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',color:'#F4F1E8',fontFamily:'sans-serif',padding:'40px 24px'}}>
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <button onClick={()=>router.push('/dashboard')} style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'#9B968A',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13,marginBottom:24}}>← Back to HQ</button>
        <div style={{fontSize:11,letterSpacing:'.34em',color:'#D4AF37',textTransform:'uppercase',marginBottom:12,border:'1px solid rgba(212,175,55,0.3)',display:'inline-block',padding:'6px 14px',borderRadius:4}}>FUTURE ROOMS</div>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:32,margin:'8px 0 32px'}}>Rooms Under <span style={{color:'#D4AF37'}}>Construction</span></h1>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}>
          {[
            {name:'CFO Money Room',icon:'💰',blurb:'Money systems, pricing math, and profit tracking.'},
            {name:'Marketing Studio',icon:'📣',blurb:'Content, visibility, and getting customers on repeat.'},
            {name:'Operations Center',icon:'⚙️',blurb:'SOPs, workflows, and running your business without chaos.'},
            {name:'Funding Department',icon:'🏦',blurb:'Business credit, capital, and funding readiness.'},
            {name:'AI Innovation Lab',icon:'🤖',blurb:'AI tools and systems working for your business 24/7.'},
          ].map(r=>(
            <div key={r.name} style={{border:'1px dashed rgba(212,175,55,0.3)',borderRadius:16,padding:'24px',textAlign:'center',opacity:0.7}}>
              <div style={{fontSize:28,marginBottom:10}}>{r.icon}</div>
              <div style={{fontFamily:'Georgia,serif',fontSize:17,fontWeight:600,marginBottom:6}}>{r.name}</div>
              <p style={{color:'#9B968A',fontSize:13,margin:'0 0 14px'}}>{r.blurb}</p>
              <div style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:11,color:'#D4AF37',border:'1px solid rgba(212,175,55,0.3)',borderRadius:999,padding:'6px 12px'}}>🔒 Coming Soon. Complete your CEO Office first.</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
