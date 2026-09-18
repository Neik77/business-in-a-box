'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
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

  let badgesEarned: string[] = []
  let roomsUnlocked: string[] = ['ceo_office']
  try { badgesEarned = JSON.parse(profile?.badges_earned || '["headquarters_established"]') } catch {}
  try { roomsUnlocked = JSON.parse(profile?.rooms_unlocked || '["ceo_office"]') } catch {}

  const currentVersion = profile?.current_version || 'V1'
  const ceoComplete = profile?.ceo_office_complete || false
  const completedRooms = ceoComplete ? 7 : 0
  const progressPct = Math.round((completedRooms / 7) * 100)

  const gold = '#D4AF37'
  const goldDim = '#8B6E2A'
  const goldLight = '#E8C96B'
  const bg = '#0A0A0C'
  const card = '#111111'
  const border = 'rgba(212,175,55,0.2)'
  const borderGlow = 'rgba(212,175,55,0.5)'
  const white = '#FFFFFF'
  const whiteD = '#C8C8C8'
  const muted = '#888888'

  const rooms = [
    { title:'CEO Office', desc:'7 tools to build your business foundation.', path:'/office', key:'ceo_office', v:'V1', unlocked: true },
    { title:'Badge Wall', desc:'Your earned proof of progress.', path:'/badges', key:'badges', v:'V1', unlocked: true },
    { title:'Resource Library', desc:'Tools, links, and community.', path:'/resources', key:'resources', v:'V1', unlocked: true },
    { title:'CFO Money Room', desc:'Income, expenses, pricing, and profit.', path:'/cfo', key:'cfo_money', v:'V2', unlocked: true },
    { title:'Marketing Studio', desc:'Brand message, content, and promotions.', path:'/marketing', key:'marketing', v:'V3', unlocked: true },
    { title:'Sales Room', desc:'Leads, scripts, and revenue tracking.', path:'/locked', key:'sales', v:'V4', unlocked: false },
    { title:'Operations Center', desc:'SOPs, workflows, and client systems.', path:'/locked', key:'operations', v:'V5', unlocked: false },
    { title:'Legal & Setup Room', desc:'LLC, EIN, contracts, and compliance.', path:'/locked', key:'legal', v:'V6', unlocked: false },
    { title:'Funding Department', desc:'Business credit, loans, and grants.', path:'/locked', key:'funding', v:'V7', unlocked: false },
    { title:'AI Innovation Lab', desc:'Prompts, workflows, and AI systems.', path:'/locked', key:'ai_lab', v:'V8', unlocked: false },
  ]

  const allBadges = [
    { id:'headquarters_established', label:'Headquarters Established' },
    { id:'ceo_office_activated', label:'CEO Office Activated' },
    { id:'vision_builder', label:'Vision Builder' },
    { id:'offer_builder', label:'Offer Builder' },
    { id:'ninety_day_planner', label:'90-Day Planner' },
    { id:'business_clarity', label:'Business Clarity' },
    { id:'legacy_builder_starter', label:'Legacy Builder Starter' },
  ]

  const firstName = profile?.owner_name?.split(' ')[0] || 'CEO'

  return (
    <div style={{minHeight:'100vh',background:bg,color:white,fontFamily:'DM Sans,sans-serif'}}>

      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 28px',borderBottom:`1px solid ${border}`,background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:100,gap:12,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,background:'#111',border:`1.5px solid ${gold}`,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Georgia,serif',fontSize:15,fontWeight:900,color:gold}}>
            {profile?.business_name?.charAt(0) || 'B'}
          </div>
          <div>
            <div style={{fontFamily:'Georgia,serif',fontSize:15,fontWeight:700}}>{profile?.business_name || 'Your Business'}</div>
            <div style={{fontFamily:'monospace',fontSize:9,color:gold,letterSpacing:'1.5px',textTransform:'uppercase'}}>Business Headquarters</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
          <span style={{fontFamily:'monospace',fontSize:10,color:'rgba(212,175,55,0.6)',border:`1px solid ${border}`,padding:'4px 10px',borderRadius:20}}>{currentVersion} - Business in a Box</span>
          <button onClick={() => router.push('/intake')} style={{background:'none',border:`1px solid rgba(212,175,55,0.4)`,color:gold,fontSize:11,padding:'5px 12px',borderRadius:20,cursor:'pointer',fontFamily:'monospace'}}>Edit Profile</button>
          <button onClick={signOut} style={{background:'none',border:`1px solid rgba(255,255,255,0.1)`,color:muted,fontSize:11,padding:'5px 12px',borderRadius:20,cursor:'pointer'}}>Sign Out</button>
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:'0 auto',padding:'36px 24px 80px'}}>

        <div style={{position:'relative',marginBottom:28,padding:'40px 36px',borderRadius:20,border:`1px solid ${border}`,background:'linear-gradient(135deg,#0e0e0e 0%,#141414 50%,#0e0b05 100%)',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-60,right:-60,width:260,height:260,background:'radial-gradient(circle,rgba(212,175,55,0.08) 0%,transparent 70%)',pointerEvents:'none'}}/>
          <div style={{fontFamily:'monospace',fontSize:10,letterSpacing:'2.5px',textTransform:'uppercase',color:gold,marginBottom:8}}>Welcome to Your Headquarters</div>
          <h1 style={{fontFamily:'Georgia,serif',fontSize:'clamp(22px,4vw,34px)',fontWeight:900,lineHeight:1.15,marginBottom:6}}>
            {profile?.business_name || 'Your Business'} <span style={{color:gold}}>HQ</span>
          </h1>
          <p style={{color:whiteD,fontSize:14,marginBottom:20}}>
            CEO: <strong style={{color:white}}>{profile?.owner_name || user?.email}</strong>
            {profile?.business_stage && <> &nbsp;-&nbsp; {profile.business_stage}</>}
            {profile?.business_type && <> &nbsp;-&nbsp; {profile.business_type}</>}
          </p>
          <div style={{marginBottom:4}}>
            <div style={{display:'flex',justifyContent:'space-between',fontFamily:'monospace',fontSize:10,color:muted,marginBottom:6}}>
              <span>CEO Office Progress</span>
              <span>{completedRooms} / 7 rooms complete</span>
            </div>
            <div style={{background:'rgba(255,255,255,0.06)',borderRadius:30,height:6,overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:30,background:`linear-gradient(90deg,${goldDim},${goldLight})`,width:`${progressPct}%`,transition:'width 1s ease'}}/>
            </div>
          </div>
        </div>

        {!profile?.intake_done && (
          <div style={{background:'rgba(212,175,55,0.08)',border:`1px solid rgba(212,175,55,0.3)`,borderRadius:16,padding:'24px 28px',marginBottom:24}}>
            <h2 style={{fontFamily:'Georgia,serif',color:gold,margin:'0 0 8px'}}>Complete your Business Intake</h2>
            <p style={{color:muted,marginBottom:20,fontSize:14}}>Your headquarters needs your business information to personalize your experience.</p>
            <button onClick={() => router.push('/intake')} style={{background:`linear-gradient(135deg,${goldDim},${gold})`,color:'#000',fontWeight:800,fontSize:14,padding:'13px 28px',borderRadius:30,border:'none',cursor:'pointer'}}>File My Business Intake</button>
          </div>
        )}

        {profile?.intake_done && (
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:16,padding:'20px 24px',marginBottom:24,borderLeft:`3px solid ${gold}`}}>
            <div style={{fontFamily:'monospace',fontSize:10,letterSpacing:'2px',textTransform:'uppercase',color:gold,marginBottom:6}}>Today's Mission</div>
            <p style={{fontSize:14,color:whiteD,lineHeight:1.65,margin:0}}>
              {ceoComplete
                ? `${firstName}, your CEO Office is complete. Your CFO Money Room and Marketing Studio are now open.`
                : `${firstName}, your next step is inside the CEO Office. Complete your Vision Builder and Offer Builder to unlock your full business roadmap.`
              }
            </p>
          </div>
        )}

        <div style={{fontFamily:'monospace',fontSize:10,letterSpacing:'2.5px',textTransform:'uppercase',color:'rgba(212,175,55,0.6)',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          Your Departments
          <span style={{flex:1,height:1,background:'rgba(212,175,55,0.15)',display:'inline-block',marginLeft:8}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14,marginBottom:36}}>
          {rooms.map(r => (
            <button
              key={r.key}
              onClick={() => router.push(r.unlocked ? r.path : '/locked')}
              style={{
                background: r.unlocked ? 'linear-gradient(135deg,#111108,#0f0f09)' : '#0d0d0d',
                border: r.unlocked ? `1px solid ${border}` : '1px solid rgba(255,255,255,0.05)',
                borderRadius:16,
                padding:22,
                textAlign:'left',
                cursor:'pointer',
                opacity: r.unlocked ? 1 : 0.45,
                transition:'border-color 0.2s',
                position:'relative',
              }}
              onMouseEnter={e => { if (r.unlocked) (e.currentTarget as HTMLElement).style.borderColor = borderGlow }}
              onMouseLeave={e => { if (r.unlocked) (e.currentTarget as HTMLElement).style.borderColor = border }}
            >
              {!r.unlocked && <div style={{position:'absolute',top:10,right:12,fontSize:11,color:'#555',fontFamily:'monospace'}}>{r.v}</div>}
              <div style={{fontFamily:'monospace',fontSize:9,letterSpacing:'1.5px',textTransform:'uppercase',color: r.unlocked ? 'rgba(212,175,55,0.5)' : '#444',marginBottom:6}}>
                {r.unlocked ? 'Open' : 'Coming in ' + r.v}
              </div>
              <h3 style={{fontFamily:'Georgia,serif',fontSize:16,fontWeight:700,color: r.unlocked ? white : '#555',margin:'0 0 6px'}}>{r.title}</h3>
              <p style={{color: r.unlocked ? muted : '#444',fontSize:13,margin:0,lineHeight:1.5}}>{r.desc}</p>
            </button>
          ))}
        </div>

        <div style={{fontFamily:'monospace',fontSize:10,letterSpacing:'2.5px',textTransform:'uppercase',color:'rgba(212,175,55,0.6)',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
          Badge Wall
          <span style={{flex:1,height:1,background:'rgba(212,175,55,0.15)',display:'inline-block',marginLeft:8}}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:12,marginBottom:36}}>
          {allBadges.map(b => {
            const earned = badgesEarned.includes(b.id)
            return (
              <div key={b.id} style={{background: earned ? 'linear-gradient(135deg,#111108,#0f0f09)' : '#0d0d0d',border: earned ? `1px solid rgba(212,175,55,0.4)` : `1px solid rgba(255,255,255,0.04)`,borderRadius:14,padding:'18px 14px',textAlign:'center',opacity: earned ? 1 : 0.3}}>
                <div style={{fontFamily:'Georgia,serif',fontSize:12,fontWeight:700,color: earned ? white : '#555',lineHeight:1.3}}>{b.label}</div>
                {earned && <div style={{fontFamily:'monospace',fontSize:9,color:gold,marginTop:4,letterSpacing:'1px'}}>EARNED</div>}
              </div>
            )
          })}
        </div>

        <div style={{textAlign:'center',padding:'24px',borderTop:`1px solid rgba(212,175,55,0.1)`,fontFamily:'monospace',fontSize:11,color:'#555',letterSpacing:'1px'}}>
          <span style={{color:'rgba(212,175,55,0.5)'}}>Business in a Box</span> - Built by Coach Neik - AI Legacy Lounge
        </div>

      </div>
    </div>
  )
}
