'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const BADGE_DEFS = [
  {id:'hq',title:'Headquarters Established',hint:'Complete your Business Intake'},
  {id:'office',title:'CEO Office Activated',hint:'Step into your CEO Office'},
  {id:'vision',title:'Vision Builder',hint:'Complete the Business Vision Builder'},
  {id:'offer',title:'Offer Builder',hint:'Complete the Offer Builder'},
  {id:'planner',title:'90-Day Planner',hint:'Complete your 90-Day Action Plan'},
  {id:'clarity',title:'Business Clarity Badge',hint:'Complete Snapshot, Customer + Goals'},
  {id:'legacy',title:'Legacy Builder Starter',hint:'Finish every room in CEO Office'},
]

export default function Badges() {
  const [profile, setProfile] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: b } = await supabase.from('badges').select('*').eq('user_id', user.id)
      setProfile(p)
      setBadges(b || [])
      setLoading(false)
    }
    load()
  }, [])

  const earned = (id: string) => badges.find((b: any) => b.badge_id === id)
  const displayName = profile?.badge_name_pref === 'business' ? profile?.business_name : profile?.owner_name

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#D4AF37',fontFamily:'Georgia,serif',fontSize:18}} role="status">Loading your badges…</div>
    </div>
  )

  const earnedCount = BADGE_DEFS.filter(b => earned(b.id)).length

  return (
    <div className="page-outer">
      <div style={{maxWidth:900,margin:'0 auto'}}>
        <button onClick={() => router.push('/dashboard')} className="btn btn-ghost" style={{marginBottom:24}}>← Back to HQ</button>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:32,margin:'0 0 8px'}}>The Wall of <span style={{color:'#D4AF37'}}>Proof</span></h1>
        <p style={{color:'#9B968A',marginBottom:24,fontSize:14}}>
          {earnedCount === 0
            ? 'No badges yet — they are earned, not given.'
            : `${earnedCount} of ${BADGE_DEFS.length} badges earned.`}
        </p>

        <div
          role="list"
          aria-label="Badge collection"
          style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:16}}
        >
          {BADGE_DEFS.map(b => {
            const e = earned(b.id)
            return (
              <div
                key={b.id}
                role="listitem"
                aria-label={e ? `${b.title} — earned by ${displayName} on ${e.earned_at}` : `${b.title} — locked. ${b.hint}`}
                style={{background:e?'rgba(212,175,55,0.1)':'rgba(255,255,255,0.02)',border:e?'1px solid rgba(212,175,55,0.5)':'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'24px',textAlign:'center',opacity:e?1:0.6}}
              >
                <div style={{fontSize:32,marginBottom:12}} aria-hidden="true">{e ? '🏆' : '🔒'}</div>
                <div style={{fontFamily:'Georgia,serif',fontSize:16,fontWeight:600,marginBottom:8}}>{b.title}</div>
                {e ? (
                  <>
                    <div style={{color:'#D4AF37',fontSize:14,fontWeight:500}}>{displayName}</div>
                    <div style={{color:'#9B968A',fontSize:11,marginTop:6}}>Earned {e.earned_at}</div>
                    <div style={{color:'#9B968A',fontSize:10,marginTop:8,borderTop:'1px solid rgba(212,175,55,0.2)',paddingTop:8}}>Coach Neik™ · AI Legacy Lounge™</div>
                  </>
                ) : (
                  <div style={{color:'#9B968A',fontSize:12}} aria-hidden="true">{b.hint}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
