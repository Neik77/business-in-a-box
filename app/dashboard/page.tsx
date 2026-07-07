'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)
      setLoading(false)
    }
    load()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#D4AF37',fontFamily:'Georgia,serif',fontSize:18}}>Loading your headquarters...</div>
    </div>
  )

  const rooms = [
    {title:'CEO Office',desc:'7 tools to build your business foundation.',path:'/office',icon:'👑'},
    {title:'Badge Wall',desc:'Your earned proof of progress.',path:'/badges',icon:'🏆'},
    {title:'Resource Library',desc:'Tools, links, and community.',path:'/resources',icon:'📚'},
    {title:'Future Rooms',desc:'CFO Money Room, Marketing Studio + more.',path:'/locked',icon:'🔒'},
  ]

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',color:'#F4F1E8',fontFamily:'sans-serif',padding:'40px 24px'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:40}}>
          <div>
            <div style={{fontSize:11,letterSpacing:'.34em',color:'#D4AF37',textTransform:'uppercase',marginBottom:8,border:'1px solid rgba(212,175,55,0.3)',display:'inline-block',padding:'6px 14px',borderRadius:4}}>HOME DASHBOARD</div>
            <h1 style={{fontFamily:'Georgia,serif',fontSize:32,margin:'8px 0 4px'}}>
              Welcome to <span style={{color:'#D4AF37'}}>{profile?.business_name || 'Your'}</span> Headquarters
            </h1>
            <p style={{color:'#9B968A',margin:'0 0 4px'}}>Owner: {profile?.owner_name || user?.email}</p>
            {profile?.business_stage && <p style={{color:'#9B968A',margin:0,fontSize:13}}>Stage: {profile.business_stage}</p>}
          </div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>router.push('/intake')} style={{background:'none',border:'1px solid rgba(212,175,55,0.4)',color:'#D4AF37',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13}}>Edit Intake</button>
            <button onClick={signOut} style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'#9B968A',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13}}>Sign Out</button>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:18}}>
          {rooms.map(r => (
            <div key={r.path} onClick={()=>router.push(r.path)}
              style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'24px',cursor:'pointer',transition:'all .2s'}}>
              <div style={{fontSize:28,marginBottom:12}}>{r.icon}</div>
              <h3 style={{fontFamily:'Georgia,serif',margin:'0 0 6px',fontSize:18}}>{r.title}</h3>
              <p style={{color:'#9B968A',fontSize:13,margin:0}}>{r.desc}</p>
            </div>
          ))}
        </div>

        {!profile?.intake_done && (
          <div style={{background:'rgba(212,175,55,0.08)',border:'1px solid rgba(212,175,55,0.3)',borderRadius:16,padding:'32px',textAlign:'center',marginTop:24}}>
            <h2 style={{fontFamily:'Georgia,serif',color:'#D4AF37',margin:'0 0 8px'}}>Complete your Business Intake</h2>
            <p style={{color:'#9B968A',marginBottom:24}}>Your headquarters needs your business info to personalize.</p>
            <button onClick={()=>router.push('/intake')}
              style={{background:'linear-gradient(120deg,#F5E7A3,#D4AF37 50%,#b8952f)',border:'none',borderRadius:10,color:'#171204',fontWeight:700,fontSize:14,padding:'14px 28px',cursor:'pointer'}}>
              File My Business Intake
            </button>
          </div>
        )}

        <div style={{marginTop:32,padding:'20px 24px',background:'rgba(212,175,55,0.05)',border:'1px solid rgba(212,175,55,0.2)',borderRadius:12}}>
          <p style={{color:'#9B968A',fontSize:12,margin:0,textAlign:'center',letterSpacing:'.04em'}}>
            Business in a Box™ — Personalized Entrepreneur Headquarters<br/>
            <span style={{color:'#D4AF37'}}>Built by Coach Neik™ | AI Legacy Lounge™ | Legacy Labs™</span>
          </p>
        </div>
      </div>
    </div>
  )
}
