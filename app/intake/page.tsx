'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Intake() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ownerName:'',businessName:'',email:'',phone:'',cityState:'',businessType:'',businessStage:'',description:'',productsServices:'',idealCustomer:'',biggestChallenge:'',ninetyDayGoal:'',hasLLC:'',hasEIN:'',hasBankAccount:'',tracksMoney:'',badgeNamePref:'owner'})
  const [saving, setSaving] = useState<boolean>(false)
  const [validationError, setValidationError] = useState<string>('')
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

  const set = (k: string, v: string) => setForm(f => ({...f, [k]:v}))

  const save = async () => {
    setValidationError('')
    if (!form.ownerName.trim()) { setValidationError('Owner name is required.'); return }
    if (!form.businessName.trim()) { setValidationError('Business name is required.'); return }
    if (!form.businessType) { setValidationError('Please select a business type.'); return }
    if (!form.businessStage) { setValidationError('Please select a business stage.'); return }
    if (!form.description.trim()) { setValidationError('Business description is required.'); return }
    if (!form.ninetyDayGoal.trim()) { setValidationError('Your 90-day goal is required.'); return }

    setSaving(true)
    try {
      await supabase.from('profiles').upsert({id:user.id, owner_name:form.ownerName, business_name:form.businessName, email:form.email, phone:form.phone, city_state:form.cityState, business_type:form.businessType, business_stage:form.businessStage, description:form.description, products_services:form.productsServices, ideal_customer:form.idealCustomer, biggest_challenge:form.biggestChallenge, ninety_day_goal:form.ninetyDayGoal, has_llc:form.hasLLC, has_ein:form.hasEIN, has_bank_account:form.hasBankAccount, tracks_money:form.tracksMoney, badge_name_pref:form.badgeNamePref, intake_done:true})
    } catch {
      setValidationError('Failed to save. Please try again.')
      setSaving(false)
      return
    }
    setSaving(false)
    try {
      await fetch('/api/notify-intake', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ownerName:form.ownerName,businessName:form.businessName,email:form.email,businessType:form.businessType,businessStage:form.businessStage,description:form.description,biggestChallenge:form.biggestChallenge,ninetyDayGoal:form.ninetyDayGoal})
      })
    } catch { /* silent — don't block the user */ }
    router.push('/dashboard')
  }

  const cardStyle: any = {background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:'24px',marginBottom:18}

  return (
    <div className="page-outer">
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:32,margin:'0 0 8px'}}>File Your Business Intake</h1>
        <p style={{color:'#9B968A',marginBottom:32}}>This is how we build your headquarters around your business.</p>

        <div style={cardStyle}>
          <p style={{color:'#D4AF37',fontWeight:700,marginTop:0}}>Section 1 — The Owner</p>
          <label htmlFor="in-owner" className="field-label">Owner Name <span aria-hidden="true" style={{color:'#D4AF37'}}>*</span></label>
          <input id="in-owner" className="field-input" value={form.ownerName} onChange={e=>set('ownerName',e.target.value)} placeholder="Your full name" aria-required="true" maxLength={120} />
          <label htmlFor="in-biz" className="field-label">Business Name <span aria-hidden="true" style={{color:'#D4AF37'}}>*</span></label>
          <input id="in-biz" className="field-input" value={form.businessName} onChange={e=>set('businessName',e.target.value)} placeholder="Your business name" aria-required="true" maxLength={120} />
          <label htmlFor="in-email" className="field-label">Email <span aria-hidden="true" style={{color:'#D4AF37'}}>*</span></label>
          <input id="in-email" className="field-input" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@business.com" type="email" aria-required="true" />
          <label htmlFor="in-phone" className="field-label">Phone</label>
          <input id="in-phone" className="field-input" value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="(___) ___-____" type="tel" />
          <label htmlFor="in-city" className="field-label">City &amp; State</label>
          <input id="in-city" className="field-input" value={form.cityState} onChange={e=>set('cityState',e.target.value)} placeholder="City, ST" maxLength={80} />
        </div>

        <div style={cardStyle}>
          <p style={{color:'#D4AF37',fontWeight:700,marginTop:0}}>Section 2 — The Business</p>
          <label htmlFor="in-type" className="field-label">Business Type <span aria-hidden="true" style={{color:'#D4AF37'}}>*</span></label>
          <select id="in-type" className="field-input" style={{background:'#111'}} value={form.businessType} onChange={e=>set('businessType',e.target.value)} aria-required="true">
            <option value="">Select…</option>
            {['Service Business','Product / Retail','Food & Beverage','Beauty / Barber','Coaching / Consulting','Trades / Contracting','Online / Digital','Nonprofit','Other'].map(t=><option key={t}>{t}</option>)}
          </select>
          <label htmlFor="in-stage" className="field-label">Business Stage <span aria-hidden="true" style={{color:'#D4AF37'}}>*</span></label>
          <select id="in-stage" className="field-input" style={{background:'#111'}} value={form.businessStage} onChange={e=>set('businessStage',e.target.value)} aria-required="true">
            <option value="">Select…</option>
            {['Idea Stage','Just Started (0-1 yr)','Building (1-3 yrs)','Established (3+ yrs)','Restarting / Rebranding'].map(t=><option key={t}>{t}</option>)}
          </select>
          <label htmlFor="in-desc" className="field-label">Business Description <span aria-hidden="true" style={{color:'#D4AF37'}}>*</span></label>
          <textarea id="in-desc" className="field-input" style={{resize:'vertical'}} rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What does your business do?" aria-required="true" maxLength={1000} />
          <label htmlFor="in-products" className="field-label">Products or Services</label>
          <textarea id="in-products" className="field-input" style={{resize:'vertical'}} rows={2} value={form.productsServices} onChange={e=>set('productsServices',e.target.value)} placeholder="What do you actually sell?" maxLength={500} />
          <label htmlFor="in-customer" className="field-label">Ideal Customer</label>
          <textarea id="in-customer" className="field-input" style={{resize:'vertical'}} rows={2} value={form.idealCustomer} onChange={e=>set('idealCustomer',e.target.value)} placeholder="Who do you serve? Be specific." maxLength={500} />
          <label htmlFor="in-challenge" className="field-label">Biggest Challenge Right Now</label>
          <textarea id="in-challenge" className="field-input" style={{resize:'vertical'}} rows={2} value={form.biggestChallenge} onChange={e=>set('biggestChallenge',e.target.value)} placeholder="What mess are we cleaning up?" maxLength={500} />
          <label htmlFor="in-goal" className="field-label">Biggest 90-Day Goal <span aria-hidden="true" style={{color:'#D4AF37'}}>*</span></label>
          <textarea id="in-goal" className="field-input" style={{resize:'vertical'}} rows={2} value={form.ninetyDayGoal} onChange={e=>set('ninetyDayGoal',e.target.value)} placeholder="If we only accomplish ONE thing in 90 days…" aria-required="true" maxLength={500} />
        </div>

        <div style={cardStyle}>
          <p style={{color:'#D4AF37',fontWeight:700,marginTop:0}}>Section 3 — Foundations</p>
          {[
            ['hasLLC','Do you have an LLC?'] as const,
            ['hasEIN','Do you have an EIN?'] as const,
            ['hasBankAccount','Do you have a business bank account?'] as const,
            ['tracksMoney','Do you track income &amp; expenses?'] as const,
          ].map(([k, label])=>(
            <fieldset key={k} style={{border:'none',padding:0,marginBottom:14}}>
              <legend className="field-label" dangerouslySetInnerHTML={{__html: label}} />
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {['Yes','No','Working on it'].map(v=>(
                  <button
                    key={v}
                    type="button"
                    onClick={() => set(k, v)}
                    aria-pressed={form[k] === v}
                    style={{background:form[k]===v?'#D4AF37':'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.14)',color:form[k]===v?'#171204':'#9B968A',borderRadius:999,padding:'8px 16px',fontSize:13,cursor:'pointer',fontWeight:form[k]===v?700:400,minHeight:44,transition:'background 0.15s, color 0.15s'}}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div style={cardStyle}>
          <p style={{color:'#D4AF37',fontWeight:700,marginTop:0}}>Badge Preference</p>
          <fieldset style={{border:'none',padding:0}}>
            <legend className="field-label">Issue badges with:</legend>
            <div style={{display:'flex',gap:8}}>
              {['owner','business'].map(v=>(
                <button
                  key={v}
                  type="button"
                  onClick={() => set('badgeNamePref', v)}
                  aria-pressed={form.badgeNamePref === v}
                  style={{background:form.badgeNamePref===v?'#D4AF37':'rgba(0,0,0,0.3)',border:'1px solid rgba(255,255,255,0.14)',color:form.badgeNamePref===v?'#171204':'#9B968A',borderRadius:999,padding:'8px 16px',fontSize:13,cursor:'pointer',fontWeight:form.badgeNamePref===v?700:400,minHeight:44,transition:'background 0.15s, color 0.15s'}}
                >
                  {v==='owner' ? 'Owner Name' : 'Business Name'}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {validationError && (
          <div role="alert" style={{background:'rgba(233,69,96,0.1)',border:'1px solid rgba(233,69,96,0.4)',borderRadius:10,padding:'12px 16px',marginBottom:16,color:'#E94560',fontSize:14}}>
            {validationError}
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="btn btn-gold"
          style={{width:'100%',fontSize:15,letterSpacing:'.06em',textTransform:'uppercase',padding:'16px'}}
        >
          {saving ? 'Saving…' : 'Establish My Headquarters →'}
        </button>
      </div>
    </div>
  )
}
