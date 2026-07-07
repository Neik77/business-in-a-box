'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const TOOLS = [
  {id:'snapshot',title:'Business Snapshot',desc:'Get your whole business on one page.'},
  {id:'vision',title:'Business Vision Builder',desc:'Where this business is going.'},
  {id:'customer',title:'Ideal Customer Builder',desc:'Get crystal clear on who you serve.'},
  {id:'offer',title:'Offer Builder',desc:'Turn what you do into an offer people buy.'},
  {id:'goals',title:'Business Goals',desc:'Your top 3 goals written down and owned.'},
  {id:'plan',title:'90-Day Action Plan',desc:'Three months mapped. One focus per month.'},
  {id:'journal',title:'CEO Decision Journal',desc:'Log every decision like the CEO you are.'},
]

const EMPTY_OFFICE = {
  snapshot:{oneLiner:'',sells:'',serves:'',makesMoney:''},
  vision:{oneYear:'',threeYear:'',why:''},
  customer:{who:'',problem:'',hangout:'',triedBefore:''},
  offer:{name:'',included:'',price:'',promise:''},
  goals:{goal1:'',goal2:'',goal3:''},
  plan:{month1:'',month2:'',month3:'',topActions:''},
  journal:[],
}

export default function Office() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [office, setOffice] = useState(EMPTY_OFFICE)
  const [openTool, setOpenTool] = useState<any>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [q, setQ] = useState<string>('')
  const [msgs, setMsgs] = useState<any[]>([])
  const [busy, setBusy] = useState<boolean>(false)
  const [journalEntry, setJournalEntry] = useState({decision:'',why:''})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(p)
      const { data: o } = await supabase.from('ceo_office').select('*').eq('user_id', user.id).single()
      if (o) setOffice({
        snapshot: o.snapshot || EMPTY_OFFICE.snapshot,
        vision: o.vision || EMPTY_OFFICE.vision,
        customer: o.customer || EMPTY_OFFICE.customer,
        offer: o.offer || EMPTY_OFFICE.offer,
        goals: o.goals || EMPTY_OFFICE.goals,
        plan: o.plan || EMPTY_OFFICE.plan,
        journal: o.journal || [],
      })
      await supabase.from('badges').upsert({user_id:user.id, badge_id:'office', earned_at: new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}, {onConflict:'user_id,badge_id'})
    }
    load()
  }, [])

  const save = async (updated) => {
    if (!user) return
    setSaving(true)
    const existing = await supabase.from('ceo_office').select('id').eq('user_id', user.id).single()
    if (existing.data) {
      await supabase.from('ceo_office').update({...updated, updated_at: new Date().toISOString()}).eq('user_id', user.id)
    } else {
      await supabase.from('ceo_office').insert({user_id:user.id, ...updated, updated_at: new Date().toISOString()})
    }
    setSaving(false)
  }

  const setSection = (section, key, val) => {
    const updated = {...office, [section]:{...office[section],[key]:val}}
    setOffice(updated)
    save(updated)
  }

  const addJournal = async () => {
    if (!journalEntry.decision.trim()) return
    const entry = {date: new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}), ...journalEntry}
    const updated = {...office, journal:[entry, ...office.journal]}
    setOffice(updated)
    save(updated)
    setJournalEntry({decision:'',why:''})
  }

  const ask = async () => {
    const question = q.trim()
    if (!question || busy) return
    setQ('')
    setMsgs(m => [...m, {role:'user',text:question}])
    setBusy(true)
    try {
      const context = `You are the CEO Coach inside Business in a Box, built by Coach Neik. Voice: warm, direct, no fluff. Help messy entrepreneurs get focused. Under 150 words. One clear next action.
Owner: ${profile?.owner_name} | Business: ${profile?.business_name} | Type: ${profile?.business_type} | Stage: ${profile?.business_stage}
Description: ${profile?.description}
90-day goal: ${profile?.ninety_day_goal}
Vision: ${office.vision.oneYear || 'not written'}
Offer: ${office.offer.name || 'not built'} ${office.offer.price ? '@ '+office.offer.price : ''}
Question: ${question}`
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{'Content-Type':'application/json','x-api-key':process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},
        body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:1000,messages:[{role:'user',content:context}]})
      })
      const data = await res.json()
      const text = (data.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('') || 'Ask me again, CEO.'
      setMsgs(m => [...m, {role:'coach',text}])
    } catch(e) {
      setMsgs(m => [...m, {role:'coach',text:'Connection dropped. Ask me again.'}])
    }
    setBusy(false)
  }

  const s: any = {
    input:{width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,color:'#F4F1E8',padding:'11px 13px',fontSize:14,outline:'none',boxSizing:'border-box',marginBottom:14},
    label:{display:'block',color:'#9B968A',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6},
  }

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',color:'#F4F1E8',fontFamily:'sans-serif',padding:'40px 24px'}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <button onClick={()=>router.push('/dashboard')} style={{background:'none',border:'1px solid rgba(255,255,255,0.1)',color:'#9B968A',borderRadius:8,padding:'8px 16px',cursor:'pointer',fontSize:13,marginBottom:24}}>← Back to HQ</button>
        <div style={{fontSize:11,letterSpacing:'.34em',color:'#D4AF37',textTransform:'uppercase',marginBottom:12,border:'1px solid rgba(212,175,55,0.3)',display:'inline-block',padding:'6px 14px',borderRadius:4}}>CEO OFFICE</div>
        <h1 style={{fontFamily:'Georgia,serif',fontSize:32,margin:'8px 0 8px'}}>The <span style={{color:'#D4AF37'}}>{profile?.business_name}</span> CEO Office</h1>
        <p style={{color:'#9B968A',marginBottom:32}}>Seven rooms. One decision at a time. {saving ? 'Saving...' : 'Auto-saved.'}</p>

        <div style={{display:'grid',gap:12,marginBottom:32}}>
          {TOOLS.map(t => (
            <div key={t.id} style={{background:'rgba(255,255,255,0.03)',border:openTool===t.id?'1px solid #D4AF37':'1px solid rgba(255,255,255,0.08)',borderRadius:14,overflow:'hidden'}}>
              <button onClick={()=>setOpenTool(openTool===t.id?null:t.id)} style={{display:'flex',alignItems:'center',gap:14,width:'100%',background:'none',border:'none',padding:'16px 18px',cursor:'pointer',textAlign:'left',color:'#F4F1E8'}}>
                <span style={{fontSize:18}}>{openTool===t.id?'▼':'▶'}</span>
                <span style={{fontFamily:'Georgia,serif',fontSize:17,fontWeight:600}}>{t.title}</span>
                <span style={{color:'#9B968A',fontSize:13,marginLeft:'auto'}}>{t.desc}</span>
              </button>

              {openTool===t.id && (
                <div style={{padding:'4px 20px 20px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                  {t.id==='snapshot' && (<>
                    <label style={s.label}>My business in one sentence</label>
                    <input style={s.input} value={office.snapshot.oneLiner} onChange={e=>setSection('snapshot','oneLiner',e.target.value)} placeholder="We help ___ get ___ through ___." />
                    <label style={s.label}>What I sell</label>
                    <input style={s.input} value={office.snapshot.sells} onChange={e=>setSection('snapshot','sells',e.target.value)} placeholder="Products / services, plainly" />
                    <label style={s.label}>Who I serve</label>
                    <input style={s.input} value={office.snapshot.serves} onChange={e=>setSection('snapshot','serves',e.target.value)} placeholder="My people are..." />
                    <label style={s.label}>How this business makes money</label>
                    <input style={s.input} value={office.snapshot.makesMoney} onChange={e=>setSection('snapshot','makesMoney',e.target.value)} placeholder="Where does the money come from?" />
                  </>)}
                  {t.id==='vision' && (<>
                    <label style={s.label}>One year from today, this business is...</label>
                    <textarea style={{...s.input,resize:'vertical'}} rows={3} value={office.vision.oneYear} onChange={e=>setSection('vision','oneYear',e.target.value)} placeholder="Paint it. Revenue, customers, how your week looks." />
                    <label style={s.label}>Three years from today...</label>
                    <textarea style={{...s.input,resize:'vertical'}} rows={3} value={office.vision.threeYear} onChange={e=>setSection('vision','threeYear',e.target.value)} placeholder="Bigger. This is the legacy version." />
                    <label style={s.label}>Why this matters to me</label>
                    <textarea style={{...s.input,resize:'vertical'}} rows={2} value={office.vision.why} onChange={e=>setSection('vision','why',e.target.value)} placeholder="The real reason." />
                  </>)}
                  {t.id==='customer' && (<>
                    <label style={s.label}>Exactly who I serve</label>
                    <textarea style={{...s.input,resize:'vertical'}} rows={3} value={office.customer.who} onChange={e=>setSection('customer','who',e.target.value)} placeholder="Age, situation, what they care about" />
                    <label style={s.label}>The problem they need solved</label>
                    <textarea style={{...s.input,resize:'vertical'}} rows={2} value={office.customer.problem} onChange={e=>setSection('customer','problem',e.target.value)} placeholder="In their words, not yours" />
                    <label style={s.label}>Where they hang out</label>
                    <input style={s.input} value={office.customer.hangout} onChange={e=>setSection('customer','hangout',e.target.value)} placeholder="Facebook groups, churches, events..." />
                    <label style={s.label}>What they have already tried</label>
                    <input style={s.input} value={office.customer.triedBefore} onChange={e=>setSection('customer','triedBefore',e.target.value)} placeholder="Why did it not work?" />
                  </>)}
                  {t.id==='offer' && (<>
                    <label style={s.label}>Offer name</label>
                    <input style={s.input} value={office.offer.name} onChange={e=>setSection('offer','name',e.target.value)} placeholder="Give it a real name" />
                    <label style={s.label}>What is included</label>
                    <textarea style={{...s.input,resize:'vertical'}} rows={3} value={office.offer.included} onChange={e=>setSection('offer','included',e.target.value)} placeholder="Everything they get, listed out" />
                    <label style={s.label}>Price</label>
                    <input style={s.input} value={office.offer.price} onChange={e=>setSection('offer','price',e.target.value)} placeholder="$___ pick a number and own it" />
                    <label style={s.label}>The promise</label>
                    <textarea style={{...s.input,resize:'vertical'}} rows={2} value={office.offer.promise} onChange={e=>setSection('offer','promise',e.target.value)} placeholder="When they buy this they walk away with..." />
                  </>)}
                  {t.id==='goals' && (<>
                    <label style={s.label}>Goal 1 (the big one)</label>
                    <input style={s.input} value={office.goals.goal1} onChange={e=>setSection('goals','goal1',e.target.value)} placeholder="Specific and measurable" />
                    <label style={s.label}>Goal 2</label>
                    <input style={s.input} value={office.goals.goal2} onChange={e=>setSection('goals','goal2',e.target.value)} placeholder="Specific and measurable" />
                    <label style={s.label}>Goal 3</label>
                    <input style={s.input} value={office.goals.goal3} onChange={e=>setSection('goals','goal3',e.target.value)} placeholder="Specific and measurable" />
                  </>)}
                  {t.id==='plan' && (<>
                    <label style={s.label}>Month 1 focus</label>
                    <input style={s.input} value={office.plan.month1} onChange={e=>setSection('plan','month1',e.target.value)} placeholder="One focus. Not five." />
                    <label style={s.label}>Month 2 focus</label>
                    <input style={s.input} value={office.plan.month2} onChange={e=>setSection('plan','month2',e.target.value)} placeholder="Builds on month 1" />
                    <label style={s.label}>Month 3 focus</label>
                    <input style={s.input} value={office.plan.month3} onChange={e=>setSection('plan','month3',e.target.value)} placeholder="The payoff month" />
                    <label style={s.label}>Top 3 actions this week</label>
                    <textarea style={{...s.input,resize:'vertical'}} rows={3} value={office.plan.topActions} onChange={e=>setSection('plan','topActions',e.target.value)} placeholder="1. 2. 3." />
                  </>)}
                  {t.id==='journal' && (<>
                    <label style={s.label}>The decision I am making</label>
                    <input style={s.input} value={journalEntry.decision} onChange={e=>setJournalEntry(j=>({...j,decision:e.target.value}))} placeholder="e.g. Raising my price to $150 next month" />
                    <label style={s.label}>Why (in one line)</label>
                    <input style={s.input} value={journalEntry.why} onChange={e=>setJournalEntry(j=>({...j,why:e.target.value}))} placeholder="The reason a CEO would give" />
                    <button onClick={addJournal} style={{background:'none',border:'1px solid #D4AF37',color:'#D4AF37',borderRadius:8,padding:'9px 16px',cursor:'pointer',fontSize:13,marginBottom:16}}>Log Decision</button>
                    {office.journal.map((j,i)=>(
                      <div key={i} style={{borderLeft:'2px solid #D4AF37',padding:'8px 14px',background:'rgba(0,0,0,0.25)',borderRadius:'0 9px 9px 0',marginBottom:8}}>
                        <div style={{fontSize:11,color:'#D4AF37',letterSpacing:'.08em',textTransform:'uppercase'}}>{j.date}</div>
                        <div style={{fontWeight:500}}>{j.decision}</div>
                        {j.why && <div style={{color:'#9B968A',fontSize:13}}>{j.why}</div>}
                      </div>
                    ))}
                  </>)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{background:'linear-gradient(160deg,rgba(212,175,55,0.09),rgba(255,255,255,0.02))',border:'1px solid rgba(212,175,55,0.3)',borderRadius:18,padding:24}}>
          <div style={{fontSize:11,letterSpacing:'.34em',color:'#D4AF37',textTransform:'uppercase',marginBottom:8,border:'1px solid rgba(212,175,55,0.3)',display:'inline-block',padding:'6px 14px',borderRadius:4}}>AI CEO COACH</div>
          <p style={{color:'#9B968A',fontSize:14,marginBottom:16}}>Ask your CEO Coach anything. It already knows your business file.</p>
          <div style={{maxHeight:300,overflowY:'auto',marginBottom:14,display:'flex',flexDirection:'column',gap:10}}>
            {msgs.length===0 && <div style={{color:'#9B968A',fontStyle:'italic',fontFamily:'Georgia,serif',fontSize:15,padding:'8px 4px'}}>Hi CEO. What are we deciding today?</div>}
            {msgs.map((m,i)=>(
              <div key={i} style={{maxWidth:'85%',padding:'11px 15px',borderRadius:13,fontSize:14,lineHeight:1.6,alignSelf:m.role==='user'?'flex-end':'flex-start',background:m.role==='user'?'rgba(212,175,55,0.16)':'rgba(0,0,0,0.35)',border:m.role==='user'?'1px solid rgba(212,175,55,0.3)':'1px solid rgba(255,255,255,0.09)'}}>
                {m.text}
              </div>
            ))}
            {busy && <div style={{color:'#9B968A',fontSize:14,padding:'8px 4px'}}>Your coach is thinking...</div>}
          </div>
          <div style={{display:'flex',gap:10}}>
            <input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&ask()} placeholder="e.g. Should I raise my prices?" style={{flex:1,background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,color:'#F4F1E8',padding:'11px 13px',fontSize:14,outline:'none'}} />
            <button onClick={ask} disabled={busy} style={{background:'linear-gradient(120deg,#F5E7A3,#D4AF37)',border:'none',borderRadius:9,color:'#171204',fontWeight:700,padding:'0 20px',cursor:'pointer',fontSize:14}}>Ask</button>
          </div>
        </div>
      </div>
    </div>
  )
}
