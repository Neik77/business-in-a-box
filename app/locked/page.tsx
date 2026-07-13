'use client'
import { useRouter } from 'next/navigation'

export default function Locked() {
  const router = useRouter()
  return (
    <div className="page-outer">
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <button onClick={()=>router.push('/dashboard')} className="btn btn-ghost" style={{marginBottom:24}}>← Back to HQ</button>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:32,margin:'0 0 32px'}}>Rooms Under <span style={{color:'#D4AF37'}}>Construction</span></h1>
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
