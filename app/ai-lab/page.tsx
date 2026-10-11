'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AILAB_COACH, AILAB_ROOMS, AILAB_COMPLETION_REWARD } from '@/lib/aiLabRooms'

function ReeCoach({ completedCount, totalRooms, certified }) {
  return (
    <div style={{marginBottom:32,padding:24,background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:16}}>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
        <div style={{width:48,height:48,borderRadius:12,background:'rgba(99,102,241,0.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#818cf8',fontWeight:900,fontSize:13}}>RE</div>
        <div>
          <div style={{color:'white',fontWeight:700}}>{AILAB_COACH.name}</div>
          <div style={{color:'#818cf8',fontSize:12}}>{AILAB_COACH.role}</div>
        </div>
      </div>
      <p style={{color:'#cbd5e1',fontSize:14,fontStyle:'italic',margin:0}}>"{AILAB_COACH.quote}"</p>
      {certified && <div style={{marginTop:12,textAlign:'center',fontSize:12,color:'#818cf8',fontWeight:700}}>{AILAB_COMPLETION_REWARD.emoji} {AILAB_COMPLETION_REWARD.badge}</div>}
    </div>
  )
}

function AILabRoomCard({ room, isCompleted, isLocked, onClick }) {
  return (
    <div onClick={!isLocked ? onClick : undefined} style={{borderRadius:16,border:`1px solid ${isLocked?'rgba(255,255,255,0.06)':isCompleted?'rgba(34,197,94,0.4)':'rgba(99,102,241,0.3)'}`,padding:24,background:isLocked?'rgba(255,255,255,0.01)':isCompleted?'rgba(34,197,94,0.05)':'rgba(255,255,255,0.03)',cursor:isLocked?'not-allowed':'pointer',opacity:isLocked?0.5:1,transition:'all 0.2s'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
        <div style={{width:44,height:44,borderRadius:10,background:'rgba(99,102,241,0.15)',display:'flex',alignItems:'center',justifyContent:'center',color:'#818cf8',fontWeight:900,fontSize:12}}>{room.icon}</div>
        <div>{isLocked?<span style={{color:'#4b5563',fontSize:11}}>LOCKED</span>:isCompleted?<span style={{color:'#4ade80',fontSize:11,fontWeight:700}}>COMPLETE</span>:<span style={{color:'#818cf8',fontSize:11,fontWeight:700}}>Room {room.number}</span>}</div>
      </div>
      <h3 style={{color:'white',fontWeight:700,fontSize:16,margin:'0 0 4px'}}>{room.title}</h3>
      <p style={{color:'#9ca3af',fontSize:13,margin:0}}>{room.subtitle}</p>
    </div>
  )
}

export default function AILabPage() {
  const router = useRouter()
  const [completed, setCompleted] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('ailab_completed').eq('id', user.id).single()
      if (data) { try { setCompleted(JSON.parse(data.ailab_completed || '[]')) } catch {} }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{minHeight:'100vh',background:'#0A0A0C',display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{color:'#818cf8'}}>Loading AI Innovation Lab...</p></div>

  const totalRooms = AILAB_ROOMS.length
  const completedCount = completed.length
  const progressPct = Math.round((completedCount / totalRooms) * 100)
  const certified = completedCount === totalRooms

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',color:'white',fontFamily:'sans-serif',paddingBottom:60}}>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 24px'}}>
        <button type="button" onClick={() => router.push('/dashboard')} style={{color:'#818cf8',background:'none',border:'none',cursor:'pointer',fontSize:14,marginBottom:24}}>← Back to Dashboard</button>
        <div style={{marginBottom:32}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <span style={{background:'rgba(99,102,241,0.2)',color:'#818cf8',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:999}}>V8</span>
            <span style={{color:'#4b5563',fontSize:12}}>AI Innovation Lab</span>
          </div>
          <h1 style={{fontSize:36,fontWeight:900,margin:'0 0 8px'}}>AI Innovation Lab</h1>
          <p style={{color:'#9ca3af',fontSize:15,margin:0}}>Your guide is <strong style={{color:'#818cf8'}}>Ree</strong> — Builder and Testing Specialist. She has tested every tool, broken every workflow, and built the systems that actually work.</p>
        </div>
        <ReeCoach completedCount={completedCount} totalRooms={totalRooms} certified={certified} />
        <div style={{marginBottom:32}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#6b7280',marginBottom:8}}>
            <span>{completedCount} of {totalRooms} rooms complete</span>
            <span>{progressPct}%</span>
          </div>
          <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${progressPct}%`,background:'linear-gradient(90deg,#6366f1,#818cf8)',borderRadius:3,transition:'width 0.4s'}} />
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:20}}>
          {AILAB_ROOMS.map((room, idx) => (
            <AILabRoomCard key={room.id} room={room} isCompleted={completed.includes(room.id)} isLocked={idx > 0 && !completed.includes(AILAB_ROOMS[idx-1].id)} onClick={() => router.push('/ai-lab/room/' + room.id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
