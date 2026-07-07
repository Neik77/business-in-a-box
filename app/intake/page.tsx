'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Intake() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ownerName:'',businessName:'',email:'',phone:'',cityState:'',businessType:'',businessStage:'',description:'',productsServices:'',idealCustomer:'',biggestChallenge:'',ninetyDayGoal:'',hasLLC:'',hasEIN:'',hasBankAccount:'',tracksMoney:'',badgeNamePref:'owner'})
  const [saving, setSaving] = useState<boolean>(false)
  const [done, setDone] = useState<boolean>(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setForm(f => ({...f, ownerName:data.owner_name||'', businessName:data.business_name||'', email:data.email||'', phone:data.phone||'', cityState:data.city_state||'', businessType:data.business_type||'', businessStage:data.business_stage||'', description:data.description||'', productsServices:data.products_services||'', idealCustomer:data.ideal_customer||'', biggestChallenge:data.biggest_challenge||'', ninetyDayGoal:data.ninety_day_goal||'', hasLLC:data.has_llc||'', hasEIN:data.has_ein||'', hasBankAccount:data.has_bank_account||'', tracksMoney:data.tracks_money||'', badgeNamePref:data.badge_name_pref||'owner'}))
    }
    load()
  }, [])

  const set = (k, v) => setForm(f => ({...f, [k]:v}))

  const save = async () => {
    setSaving(true)
    await supabase.from('profiles').upsert({id:user.id, owner_name:form.ownerName, business_name:form.businessName, email:form.email, phone:form.phone, city_state:form.cityState, business_type:form.businessType, business_stage:form.businessStage, description:form.description, products_services:form.productsServices, ideal_customer:form.idealCustomer, biggest_challenge:form.biggestChallenge, ninety_day_goal:form.ninetyDayGoal, has_llc:form.hasLLC, has_ein:form.hasEIN, has_bank_account:form.hasBankAccount, tracks_money:form.tracksMoney, badge_name_pref:form.badgeNamePref, intake_done:true})
    setSaving(false)
    // Send email notification to coach
    try {
      await fetch('/api/notify-intake', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          ownerName: form.ownerName,
          businessName: form.businessName,
          email: form.email,
          businessType: form.businessType,
          businessStage: form.businessStage,
          description: form.description,
          biggestChallenge: form.biggestChallenge,
          ninetyDayGoal: form.ninetyDayGoal,
        })
      })
    } catch(e) { /* silent fail - don't block the user */ }
    router.push('/dashboard')
  }

  const s: any = {input:{width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,color:'#F4F1E8',padding:'11px 13px',fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:14}, label:{display:'block',color:'#9B968A',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}, card:{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'24px',marginBottom:18}}

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',color:'#F4F1E8',fontFamily:'sans-serif',padding:'40px 24px'}}>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <div style={{fontSize:11,letterSpacing:'.34em',color:'#D4AF37',textTransform:'uppercase',marginBottom:12,border:'1px solid rgba(212,175,55,0.3)',display:'inline-block',padding:'6px 14px',borderRadius:4}}>BUSINESS INTAKE</div>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:32,margin:'0 0 8px'}}>File Your Business Intake</h1>
        <p style={{color:'#9B968A',marginBottom:32}}>This is how we build your headquarters around your business.</p>

        <div style={s.card}>
          <p style={{color:'#D4AF37',fontWeight:700,marginTop:0}}>Section 1 — The Owner</p>
          <label style={s.label}>Owner Name *</label>
          <input style={s.input} value={form.ownerName} onChange={e=>set('ownerName',e.target.value)} placeholder="Your full name" />
          <label style={s.label}>Business Name *</label>
          <input style={s.input} value={form.businessName} onChange={e=>set('businessName',e.target.value)} placeholder="Your business name" />
          <label style={s.label}>Email *</label>
          <input style={s.input} value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@business.com" />
          <label style={s.label}>Phone</label>
          <input style={s.input} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="(___) ___-____" />
          <label style={s.label}>City & State</label>
          <input style={s.input} value={form.cityState} onChange={e=>set('cityState',e.target.value)} placeholder="City, ST" />
        </div>

        <div style={s.card}>
          <p style={{color:'#D4AF37',fontWeight:700,marginTop:0}}>Section 2 — The Business</p>
          <label style={s.label}>Business Type *</label>
          <select style={{...s.input,background:'#111'}} value={form.businessType} onChange={e=>set('businessType',e.target.value)}>
            <option value="">Select...</option>
            {['Service Business','Product / Retail','Food & Beverage','Beauty / Barber','Coaching / Consulting','Trades / Contracting','Online / Digital','Nonprofit','Other'].map(t=><option key={t}>{t}</option>)}
          </select>
          <label style={s.label}>Business Stage *</label>
          <select style={{...s.input,background:'#111'}} value={form.businessStage} onChange={e=>set('businessStage',e.target.value)}>
            <option value="">Select...</option>
            {['Idea Stage','Just Started (0-1 yr)','Building (1-3 yrs)','Established (3+ yrs)','Restarting / Rebranding'].map(t=><option key={t}>{t}</option>)}
          </select>
          <label style={s.label}>Business Description *</label>
          <textarea style={{...s.input,resize:'vertical'}} rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What does your business do?" />
          <label style={s.label}>Products or Services</label>
          <textarea style={{...s.input,resize:'vertical'}} rows={2} value={form.productsServices} onChange={e=>set('productsServices',e.target.value)} placeholder="What do you actually sell?" />
          <label style={s.label}>Ideal Customer</label>
          <textarea style={{...s.input,resize:'vertical'}} rows={2} value={form.idealCustomer} onChange={e=>set('idealCustomer',e.target.value)} placeholder="Who do you serve? Be specific." />
          <label style={s.label}>Biggest Challenge Right Now</label>
          <textarea style={{...s.input,resize:'vertical'}} rows={2} value={form.biggestChallenge} onChange={e=>set('biggestChallenge',e.target.value)} placeholder="What mess are we cleaning up?" />
          <label style={s.label}>Biggest 90-Day Goal *</label>
          <textarea style={{...s.input,resize:'vertical'}} rows={2} value={form.ninetyDayGoal} onChange={e=>set('ninetyDayGoal',e.target.value)} placeholder="If we only accomplish ONE thing in 90 days..." />
        </div>

        <div style={s.card}>
          <p style={{color:'#D4AF37',fontWeight:700,marginTop:0}}>Section 3 — Foundations</p>
          {[['hasLLC','Do you have an LLC?'],['hasEIN','Do you have an EIN?'],['hasBankAccount','Do you have a business bank account?'],['tracksMoney','Do you track income & expenses?']].map(([k,label])=>(
            <div key={k} style={{marginBottom:14}}>
              <label style={s.label}>{label}</label>
              <div style={{display:'flex',gap:8}}>
                {['Yes','No','Working on it'].map(v=>(
                  <button key={v} onClick={()=>set(k,v)} style={{background:form[k]===v?'#D4AF37':'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.14)',color:form[k]===v?'#171204':'#9B968A',borderRadius:999,padding:'8px 16px',fontSize:13,cursor:'pointer',fontWeight:form[k]===v?700:400}}>{v}</button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <p style={{color:'#D4AF37',fontWeight:700,marginTop:0}}>Badge Preference</p>
          <label style={s.label}>Issue badges with:</label>
          <div style={{display:'flex',gap:8}}>
            {['owner','business'].map(v=>(
              <button key={v} onClick={()=>set('badgeNamePref',v)} style={{background:form.badgeNamePref===v?'#D4AF37':'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.14)',color:form.badgeNamePref===v?'#171204':'#9B968A',borderRadius:999,padding:'8px 16px',fontSize:13,cursor:'pointer',fontWeight:form.badgeNamePref===v?700:400}}>{v==='owner'?'Owner Name':'Business Name'}</button>
            ))}
          </div>
        </div>

        <button onClick={save} disabled={saving} style={{width:'100%',background:'linear-gradient(120deg,#F5E7A3,#D4AF37 50%,#b8952f)',border:'none',borderRadius:10,color:'#171204',fontWeight:700,fontSize:15,letterSpacing:'.06em',textTransform:'uppercase',padding:'16px',cursor:'pointer'}}>
          {saving ? 'Saving...' : 'Establish My Headquarters →'}
        </button>
      </div>
    </div>
  )
}
