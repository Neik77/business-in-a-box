'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const COACH_EMAIL = 'dsmultiservice1@gmail.com'

export default function CoachDashboard() {
  const [user, setUser] = useState<any>(null)
  const [clients, setClients] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [office, setOffice] = useState<any>(null)
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.email !== COACH_EMAIL) {
        router.push('/dashboard')
        return
      }
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
      setClients(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const viewClient = async (client: any) => {
    setSelected(client)
    const { data: o } = await supabase.from('ceo_office').select('*').eq('user_id', client.id).single()
    const { data: b } = await supabase.from('badges').select('*').eq('user_id', client.id)
    setOffice(o)
    setBadges(b || [])
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{color:'#D4AF37',fontFamily:'Georgia,serif',fontSize:18}}>Loading coach dashboard...</div>
    </div>
  )

  const cardStyle: any = {background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'20px',marginBottom:16}
  const labelStyle: any = {color:'#9B968A',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4,display:'block'}

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',color:'#F4F1E8',fontFamily:'sans-serif',padding:'40px 24px'}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:32}}>
          <div>
            <div style={{fontSize:11,letterSpacing:'.34em',color:'#D4AF37',textTransform:'uppercase',marginBottom:8,border:'1px solid rgba(212,175,55,0.3)',display:'inline-block',padding:'6px 14px',borderRadius:4}}>COACH DASHBOARD</div>
            <h1 style={{fontFamily:'Georgia,serif',fontSize:32,margin:'8px 0 0'}}>Client <span style={{color:'#D4AF37'}}>Headquarters</span></h1>
          </div>
          <button onClick={()=>router.push('/dashboard')} style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'#9B968A',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13}}>My Dashboard</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:selected?'320px 1fr':'1fr',gap:24}}>
          <div>
            <h2 style={{fontSize:14,letterSpacing:'.1em',textTransform:'uppercase',color:'#9B968A',marginBottom:16}}>All Clients ({clients.length})</h2>
            {clients.map(c => (
              <div key={c.id} onClick={()=>viewClient(c)}
                style={{...cardStyle,cursor:'pointer',border:selected?.id===c.id?'1px solid #D4AF37':'1px solid rgba(255,255,255,0.08)'}}>
                <div style={{fontFamily:'Georgia,serif',fontSize:16,fontWeight:600,marginBottom:4}}>{c.business_name || 'Unnamed Business'}</div>
                <div style={{color:'#9B968A',fontSize:13,marginBottom:8}}>{c.owner_name || c.email}</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  <span style={{fontSize:11,background:c.intake_done?'rgba(212,175,55,0.2)':'rgba(255,255,255,0.05)',color:c.intake_done?'#D4AF37':'#9B968A',padding:'3px 8px',borderRadius:999}}>{c.intake_done?'Intake Done':'No Intake'}</span>
                  {c.business_stage && <span style={{fontSize:11,background:'rgba(255,255,255,0.05)',color:'#9B968A',padding:'3px 8px',borderRadius:999}}>{c.business_stage}</span>}
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h2 style={{fontFamily:'Georgia,serif',fontSize:22,margin:0}}>{selected.business_name} <span style={{color:'#D4AF37'}}>File</span></h2>
                <button onClick={()=>setSelected(null)} style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'#9B968A',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontSize:12}}>Close</button>
              </div>

              <div style={cardStyle}>
                <p style={{color:'#D4AF37',fontWeight:700,marginTop:0,marginBottom:16}}>Business Intake</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  {[
                    ['Owner','owner_name'],['Email','email'],['Phone','phone'],['City','city_state'],
                    ['Type','business_type'],['Stage','business_stage'],['LLC','has_llc'],['EIN','has_ein'],
                    ['Bank Account','has_bank_account'],['Tracks Money','tracks_money'],
                  ].map(([label,key])=>(
                    <div key={key}>
                      <span style={labelStyle}>{label}</span>
                      <span style={{fontSize:14}}>{selected[key] || '—'}</span>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:16}}>
                  <span style={labelStyle}>Description</span>
                  <p style={{margin:0,fontSize:14,color:'#DAD6CB'}}>{selected.description || '—'}</p>
                </div>
                <div style={{marginTop:12}}>
                  <span style={labelStyle}>90-Day Goal</span>
                  <p style={{margin:0,fontSize:14,color:'#DAD6CB'}}>{selected.ninety_day_goal || '—'}</p>
                </div>
                <div style={{marginTop:12}}>
                  <span style={labelStyle}>Biggest Challenge</span>
                  <p style={{margin:0,fontSize:14,color:'#DAD6CB'}}>{selected.biggest_challenge || '—'}</p>
                </div>
              </div>

              {office && (
                <div style={cardStyle}>
                  <p style={{color:'#D4AF37',fontWeight:700,marginTop:0,marginBottom:16}}>CEO Office Progress</p>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    {[
                      ['Business Snapshot', office.snapshot?.oneLiner],
                      ['Vision (1yr)', office.vision?.oneYear],
                      ['Ideal Customer', office.customer?.who],
                      ['Offer', office.offer?.name ? `${office.offer.name} @ ${office.offer.price||'?'}` : null],
                      ['Goal #1', office.goals?.goal1],
                      ['Month 1 Focus', office.plan?.month1],
                    ].map(([label,val])=>(
                      <div key={label as string}>
                        <span style={labelStyle}>{label}</span>
                        <p style={{margin:0,fontSize:13,color:val?'#DAD6CB':'#555'}}>{val || 'Not completed yet'}</p>
                      </div>
                    ))}
                  </div>
                  {office.journal?.length > 0 && (
                    <div style={{marginTop:16}}>
                      <span style={labelStyle}>Latest Decision</span>
                      <p style={{margin:0,fontSize:13,color:'#DAD6CB'}}>{office.journal[0].decision}</p>
                    </div>
                  )}
                </div>
              )}

              <div style={cardStyle}>
                <p style={{color:'#D4AF37',fontWeight:700,marginTop:0,marginBottom:12}}>Badges Earned ({badges.length}/7)</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {badges.map((b:any)=>(
                    <span key={b.badge_id} style={{background:'rgba(212,175,55,0.15)',border:'1px solid rgba(212,175,55,0.4)',color:'#D4AF37',fontSize:12,padding:'5px 12px',borderRadius:999}}>
                      🏆 {b.badge_id}
                    </span>
                  ))}
                  {badges.length === 0 && <span style={{color:'#555',fontSize:13}}>No badges earned yet</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{marginTop:32,padding:'16px 24px',background:'rgba(212,175,55,0.05)',border:'1px solid rgba(212,175,55,0.2)',borderRadius:12,textAlign:'center'}}>
          <p style={{color:'#9B968A',fontSize:11,margin:0,letterSpacing:'.04em'}}>
            Business in a Box™ Coach Dashboard | Built by Coach Neik™ | AI Legacy Lounge™
          </p>
        </div>
      </div>
    </div>
  )
}
