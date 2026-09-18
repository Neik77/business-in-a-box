'use client'
export const dynamic = 'force-dynamic'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type ChatMessage = { role: 'assistant' | 'user'; content: string }

export default function CFOMoneyRoom() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState('income')
  const [completedRooms, setCompletedRooms] = useState<Set<string>>(new Set())
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({})
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const chatEndRef = useRef<HTMLDivElement>(null)

  const ROOMS = [
    { id: 'income',    icon: '$', label: 'Income Tracking',   num: 1 },
    { id: 'expenses',  icon: '%', label: 'Expense Tracking',  num: 2 },
    { id: 'pricing',   icon: '#', label: 'Pricing',           num: 3 },
    { id: 'budget',    icon: '=', label: 'Budget',            num: 4 },
    { id: 'profit',    icon: '+', label: 'Profit Planning',   num: 5 },
    { id: 'cashflow',  icon: '~', label: 'Cash Flow',         num: 6 },
    { id: 'breakeven', icon: '/', label: 'Break-Even',        num: 7 },
    { id: 'goals',     icon: '*', label: 'Financial Goals',   num: 8 },
    { id: 'coach',     icon: '>', label: 'CFO Coach',         num: 9 },
  ]

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)
      const biz = profile?.business_name || 'your business'
      const owner = profile?.owner_name?.split(' ')[0] || 'CEO'
      const welcomes: Record<string, string> = {
        income: `Welcome to Income Tracking, ${owner}. Let's get a clear picture of every dollar coming into ${biz}. What are your current income sources and roughly how much comes in each month?`,
        expenses: `Let's track every dollar going OUT of ${biz}. What are your top monthly expenses right now?`,
        pricing: `Pricing is where most small business owners leave money on the table. What are you currently charging and do you feel like it's enough?`,
        budget: `A budget tells your money where to go before it disappears. What does a typical month look like in terms of what you need to spend to operate?`,
        profit: `Right now, what percentage of your revenue do you think you're actually keeping as profit?`,
        cashflow: `Cash flow is the lifeblood of any business. Let's map out when money comes in and when it goes out for ${biz}.`,
        breakeven: `Your break-even point is the minimum you need to cover all costs. Let's calculate it for ${biz}.`,
        goals: `Let's set your financial goals with real numbers and real dates. What does financial success look like for ${biz} in the next 12 months?`,
        coach: `I'm your CFO Coach for ${biz}. I handle money, pricing, profit, and financial strategy. What's your most urgent money question right now?`,
      }
      const initialChats: Record<string, ChatMessage[]> = {}
      ROOMS.forEach(r => {
        initialChats[r.id] = [{ role: 'assistant', content: welcomes[r.id] || `Welcome to ${r.label}.` }]
      })
      setChatMessages(initialChats)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, activeRoom])

  const saveRoom = async (roomId: string) => {
    const updated = new Set(completedRooms)
    updated.add(roomId)
    setCompletedRooms(updated)
    showToast()
  }

  const showToast = () => {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2800)
  }

  const sendChat = async (roomId: string, messageOverride?: string) => {
    const message = messageOverride || chatInput.trim()
    if (!message || !profile) return
    setChatInput('')
    const userMsg: ChatMessage = { role: 'user', content: message }
    setChatMessages(prev => ({ ...prev, [roomId]: [...(prev[roomId] || []), userMsg] }))
    setChatLoading(true)
    try {
      const biz = profile?.business_name || 'your business'
      const owner = profile?.owner_name?.split(' ')[0] || 'CEO'
      const system = `You are the CFO Coach inside Business in a Box, built by Coach Neik. You are coaching ${owner}, CFO of ${biz}. Handle ALL financial questions - income, expenses, pricing, profit, cash flow, budgeting, break-even, financial goals. Be direct, specific, use real numbers. No fluff. Short punchy responses.`
      const history = chatMessages[roomId] || []
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ system, messages: [...history, userMsg].map(m => ({ role: m.role, content: m.content })) }),
      })
      const data = await res.json()
      setChatMessages(prev => ({ ...prev, [roomId]: [...(prev[roomId] || []), { role: 'assistant', content: data.reply || "Let's work through this." }] }))
    } catch {
      setChatMessages(prev => ({ ...prev, [roomId]: [...(prev[roomId] || []), { role: 'assistant', content: "Connection issue. Try again." }] }))
    }
    setChatLoading(false)
  }

  const gold = '#D4AF37'
  const goldDim = '#8B6E2A'
  const goldLight = '#E8C96B'
  const bg = '#0A0A0C'
  const card = '#111111'
  const border = 'rgba(212,175,55,0.2)'
  const white = '#FFFFFF'
  const whiteD = '#C8C8C8'
  const muted = '#888888'

  const s = {
    label: { fontFamily: 'monospace', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: goldDim, display: 'block', marginBottom: 6, marginTop: 18 },
    input: { width: '100%', background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 10, color: white, fontFamily: 'DM Sans,sans-serif', fontSize: 14, padding: '12px 16px', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const },
    section: { background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 28, marginBottom: 20 },
    sectionTitle: { fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: white, marginBottom: 6 },
    sectionDesc: { fontSize: 13, color: muted, marginBottom: 20, lineHeight: 1.6 },
    btnPrimary: { background: `linear-gradient(135deg,${goldDim},${gold})`, color: '#000', fontFamily: 'DM Sans,sans-serif', fontWeight: 800, fontSize: 13, padding: '13px 28px', borderRadius: 30, border: 'none', cursor: 'pointer' },
    btnSecondary: { background: 'none', border: `1px solid ${goldDim}`, color: gold, fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, padding: '11px 22px', borderRadius: 30, cursor: 'pointer' },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: gold, fontFamily: 'Georgia,serif', fontSize: 18 }}>Loading CFO Money Room...</div>
    </div>
  )

  const progressPct = Math.round((completedRooms.size / 9) * 100)

  const ChatPanel = ({ roomId }: { roomId: string }) => {
    const msgs = chatMessages[roomId] || []
    const prompts: Record<string, string[]> = {
      income: ['What income streams should I add?', 'How do I track income properly?', 'What should my monthly revenue goal be?'],
      expenses: ['What expenses can I cut?', 'How do I separate personal and business expenses?', 'What are normal business expenses?'],
      pricing: ['Am I charging enough?', 'How do I raise my prices?', 'What pricing model works best?'],
      budget: ['Help me build a monthly budget', 'What should I budget for marketing?', 'How much should I pay myself?'],
      profit: ['What is a good profit margin?', 'How do I increase my profit?', 'Why am I not keeping enough money?'],
      cashflow: ['How do I fix a cash flow problem?', 'How do I build a cash reserve?', 'When should I expect slow months?'],
      breakeven: ['Calculate my break-even point', 'How many sales do I need to break even?', 'What happens after I break even?'],
      goals: ['Set my financial goals', 'How do I hit $10K months?', 'What financial milestones should I aim for?'],
      coach: ['Review my money situation', 'What should I focus on financially?', 'How do I become more profitable?'],
    }
    return (
      <div style={{ marginTop: 24 }}>
        <div style={{ ...s.sectionTitle, marginBottom: 4 }}>CFO Coach - Ask Anything About Money</div>
        <p style={s.sectionDesc}>Ask your CFO Coach anything about money, pricing, profit, and financial strategy.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(prompts[roomId] || []).map(p => (
            <button key={p} onClick={() => sendChat(roomId, p)} style={{ background: 'rgba(212,175,55,0.05)', border: `1px solid ${border}`, borderRadius: 20, color: whiteD, fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
        <div style={{ background: '#0c0c0c', border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: 20, minHeight: 180, maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', maxWidth: '88%' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.role === 'assistant' ? goldDim : '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: white, flexShrink: 0 }}>
                  {m.role === 'assistant' ? 'CF' : (profile?.owner_name?.charAt(0) || 'U')}
                </div>
                <div style={{ background: m.role === 'user' ? 'rgba(212,175,55,0.1)' : '#1a1a1a', border: `1px solid ${m.role === 'user' ? goldDim : border}`, borderRadius: 14, padding: '10px 14px', fontSize: 13, color: m.role === 'user' ? white : whiteD, lineHeight: 1.6 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: white }}>CF</div>
                <div style={{ background: '#1a1a1a', border: `1px solid ${border}`, borderRadius: 14, padding: '10px 14px', fontSize: 13, color: muted }}>Thinking...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: 10, padding: 14, borderTop: `1px solid ${border}`, background: '#0e0e0e' }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(roomId) } }} placeholder="Ask your CFO Coach..." style={{ flex: 1, background: '#111', border: `1px solid ${border}`, borderRadius: 30, color: white, fontFamily: 'DM Sans,sans-serif', fontSize: 13, padding: '10px 18px', outline: 'none' }} />
            <button onClick={() => sendChat(roomId)} style={{ background: `linear-gradient(135deg,${goldDim},${gold})`, color: '#000', fontWeight: 800, fontSize: 12, padding: '10px 20px', borderRadius: 30, border: 'none', cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      </div>
    )
  }

  const renderRoom = () => {
    switch (activeRoom) {
      case 'income': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>Room 1 of 9 - Income Tracking</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Track Your Income</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>You cannot grow what you do not measure. Let's get every dollar documented and organized.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Income Sources</div>
            <p style={s.sectionDesc}>List every way money comes into your business right now.</p>
            {['Primary Income Source', 'Secondary Income Source', 'Passive / Recurring Income', 'Other Income'].map((label, i) => (
              <div key={i}>
                <label style={s.label}>{label}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. 1:1 coaching, digital products, templates..." />
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder="$/month" />
                </div>
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Monthly Income Summary</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <div><label style={s.label}>Best Month Ever</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
              <div><label style={s.label}>Average Month</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
              <div><label style={s.label}>Slowest Month</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
            </div>
            <label style={s.label}>When are your slowest months?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. January, summer months, holidays..." />
            <label style={s.label}>What would need to happen to double your income?</label>
            <textarea style={s.input} placeholder="More clients, higher prices, new offers, more content..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Recurring vs One-Time Income</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={s.label}>Monthly Recurring Revenue</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0/month guaranteed" /></div>
              <div><label style={s.label}>One-Time Revenue (avg/month)</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0/month estimated" /></div>
            </div>
            <label style={s.label}>What can you turn into recurring income?</label>
            <textarea style={s.input} placeholder="memberships, retainers, subscriptions, monthly templates..." />
          </div>
          <ChatPanel roomId="income" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('income'); setActiveRoom('expenses') }}>Save and Continue to Expense Tracking</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('income')}>Save Progress</button>
          </div>
        </div>
      )
      case 'expenses': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>Room 2 of 9 - Expense Tracking</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Track Your Expenses</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Every dollar out needs to be accounted for. Let's find where your money is going.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Fixed Monthly Expenses</div>
            <p style={s.sectionDesc}>Same every month regardless of revenue.</p>
            {['Software and Subscriptions', 'Phone and Internet', 'Storage / Workspace', 'Insurance', 'Loan / Debt Payments', 'Other Fixed'].map((label, i) => (
              <div key={i}>
                <label style={s.label}>{label}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder="Description..." />
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder="$/month" />
                </div>
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Variable Monthly Expenses</div>
            <p style={s.sectionDesc}>Change month to month based on activity and revenue.</p>
            {['Marketing and Advertising', 'Supplies and Materials', 'Contractor / Freelancer Costs', 'Shipping and Fulfillment', 'Professional Development', 'Other Variable'].map((label, i) => (
              <div key={i}>
                <label style={s.label}>{label}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder="Description..." />
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder="$/month avg" />
                </div>
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Expense Audit</div>
            <label style={s.label}>Subscriptions or expenses you are not sure you need</label>
            <textarea style={s.input} placeholder="List anything you are paying for but not fully using..." />
            <label style={s.label}>Expenses you could reduce or eliminate</label>
            <textarea style={s.input} placeholder="Be honest - what could go?" />
            <label style={s.label}>Total estimated monthly expenses</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0/month total" />
          </div>
          <ChatPanel roomId="expenses" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('expenses'); setActiveRoom('pricing') }}>Save and Continue to Pricing</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('expenses')}>Save Progress</button>
          </div>
        </div>
      )
      case 'pricing': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>Room 3 of 9 - Pricing</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Price for Profit</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Most small business owners underprice and overdeliver. Let's fix that.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Pricing Philosophy</div>
            <label style={s.label}>How did you come up with your current prices?</label>
            <textarea style={s.input} placeholder="e.g. Guessed, looked at competitors, calculated costs..." />
            <label style={s.label}>Do you feel like you are charging enough? Why or why not?</label>
            <textarea style={s.input} placeholder="Be honest with yourself here..." />
            <label style={s.label}>What stops you from raising your prices?</label>
            <textarea style={s.input} placeholder="e.g. Fear of losing clients, don't feel worth it, unsure of my value..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Pricing Calculator</div>
            <p style={s.sectionDesc}>Work backwards from what you need to earn to set the right price.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <div><label style={s.label}>Monthly Income Goal</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$5,000" /></div>
              <div><label style={s.label}>Monthly Expenses</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$1,500" /></div>
              <div><label style={s.label}>Hours Available Per Week</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="20 hrs" /></div>
            </div>
            <label style={s.label}>Minimum hourly rate needed</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="Calculate: (income goal + expenses) divided by monthly hours" />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Offer Pricing Review</div>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                <label style={{ ...s.label, marginTop: 0 }}>Offer {i}</label>
                <input type="text" style={{ ...s.input, resize: undefined, marginBottom: 10 }} placeholder="Offer name..." />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div><label style={s.label}>Current Price</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
                  <div><label style={s.label}>Cost to Deliver</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
                  <div><label style={s.label}>Should Be Priced At</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
                </div>
              </div>
            ))}
          </div>
          <ChatPanel roomId="pricing" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('pricing'); setActiveRoom('budget') }}>Save and Continue to Budget</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('pricing')}>Save Progress</button>
          </div>
        </div>
      )
      case 'budget': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>Room 4 of 9 - Budget</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Build Your Budget</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>A budget tells your money where to go before it disappears.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Monthly Budget Plan</div>
            {[
              { label: 'Owner Pay / Salary', placeholder: 'How much do you pay yourself?' },
              { label: 'Operating Expenses', placeholder: 'Fixed costs - software, phone, workspace...' },
              { label: 'Marketing Budget', placeholder: 'Ads, content tools, promotions...' },
              { label: 'Education and Growth', placeholder: 'Courses, coaching, books...' },
              { label: 'Emergency / Savings Fund', placeholder: 'At least 10% of revenue' },
              { label: 'Taxes Set Aside', placeholder: 'At least 25-30% of profit' },
              { label: 'Reinvestment in Business', placeholder: 'New tools, team, systems...' },
            ].map((item, i) => (
              <div key={i}>
                <label style={s.label}>{item.label}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder={item.placeholder} />
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0/month" />
                </div>
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Budget Blockers</div>
            <label style={s.label}>What makes it hard to stick to a budget?</label>
            <textarea style={s.input} placeholder="Irregular income, impulse purchases, emergencies, no tracking system..." />
            <label style={s.label}>What system will you use to track your budget?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Spreadsheet, QuickBooks, Wave, simple notebook, weekly check-in..." />
          </div>
          <ChatPanel roomId="budget" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('budget'); setActiveRoom('profit') }}>Save and Continue to Profit Planning</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('budget')}>Save Progress</button>
          </div>
        </div>
      )
      case 'profit': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>Room 5 of 9 - Profit Planning</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Plan Your Profit</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Revenue is vanity. Profit is sanity. Let's make sure {profile?.business_name} is built to actually keep money.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Current Profit Picture</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <div><label style={s.label}>Monthly Revenue</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
              <div><label style={s.label}>Monthly Expenses</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
              <div><label style={s.label}>Monthly Profit</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
            </div>
            <label style={s.label}>Current profit margin % (profit divided by revenue times 100)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. 40% means you keep $0.40 of every $1 earned" />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Profit Goals</div>
            <label style={s.label}>Target profit margin %</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. 50% - industry standard for service businesses" />
            <label style={s.label}>3 ways you can increase profit without increasing revenue</label>
            <textarea style={s.input} placeholder="1. Cut unnecessary subscriptions&#10;2. Raise prices on underpriced offers&#10;3. Reduce time on low-profit services..." />
            <label style={s.label}>3 ways you can increase revenue to grow profit</label>
            <textarea style={s.input} placeholder="1. Add a high-ticket offer&#10;2. Launch a recurring membership&#10;3. Increase content to grow audience..." />
          </div>
          <ChatPanel roomId="profit" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('profit'); setActiveRoom('cashflow') }}>Save and Continue to Cash Flow</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('profit')}>Save Progress</button>
          </div>
        </div>
      )
      case 'cashflow': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>Room 6 of 9 - Cash Flow</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Manage Your Cash Flow</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>You can be profitable on paper and still broke. Cash flow is about timing.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Cash Flow Calendar</div>
            <label style={s.label}>When does most of your income arrive?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Most income hits 1st-15th, slower last two weeks..." />
            <label style={s.label}>When are your biggest bills due?</label>
            <textarea style={s.input} placeholder="e.g. Rent 1st, software subscriptions 15th, contractor pay end of month..." />
            <label style={s.label}>How many months of expenses do you have saved as a cash reserve?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. 0 months, 1 month, 3 months..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Cash Flow Problems</div>
            <label style={s.label}>Do you ever run low on cash before the next payment comes in?</label>
            <textarea style={s.input} placeholder="Describe what happens and when it typically occurs..." />
            <label style={s.label}>What is your plan to build a 3-month cash reserve?</label>
            <textarea style={s.input} placeholder="e.g. Save 10% of every payment, cut X expense, add a low-cost offer..." />
          </div>
          <ChatPanel roomId="cashflow" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('cashflow'); setActiveRoom('breakeven') }}>Save and Continue to Break-Even</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('cashflow')}>Save Progress</button>
          </div>
        </div>
      )
      case 'breakeven': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>Room 7 of 9 - Break-Even</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Know Your Break-Even</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Your break-even is the minimum you need to cover all costs. Everything above it is profit.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Break-Even Calculator</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={s.label}>Total Monthly Fixed Expenses</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
              <div><label style={s.label}>Average Revenue Per Sale</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
              <div><label style={s.label}>Cost to Deliver Each Sale</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
              <div><label style={s.label}>Gross Profit Per Sale</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="Revenue minus Cost to Deliver" /></div>
            </div>
            <label style={s.label}>Estimated Break-Even (Fixed Costs divided by Gross Profit Per Sale)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. $2,000 divided by $200 = 10 sales needed to break even" />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Break-Even by Offer</div>
            <label style={s.label}>How many sales of your main offer do you need to break even monthly?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. 8 template sales at $97 - need 21 sales to hit $2,000" />
            <label style={s.label}>What does that number tell you about your pricing or offer?</label>
            <textarea style={s.input} placeholder="Does your price need to go up? Do you need a higher-ticket offer? More volume?" />
          </div>
          <ChatPanel roomId="breakeven" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('breakeven'); setActiveRoom('goals') }}>Save and Continue to Financial Goals</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('breakeven')}>Save Progress</button>
          </div>
        </div>
      )
      case 'goals': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>Room 8 of 9 - Financial Goals</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Set Financial Goals</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Real financial goals have numbers and dates. Let's set them.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Short-Term Goals (Next 90 Days)</div>
            <label style={s.label}>Revenue target</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. $9,000 in 90 days" />
            <label style={s.label}>Profit target</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Keep $4,500 after expenses" />
            <label style={s.label}>Savings target</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Save $1,000 as emergency fund" />
            <label style={s.label}>One financial habit to build in 90 days</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Weekly money check every Sunday" />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>Annual Financial Goals</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <div><label style={s.label}>Annual Revenue Goal</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
              <div><label style={s.label}>Annual Profit Goal</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
              <div><label style={s.label}>Annual Savings Goal</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" /></div>
            </div>
            <label style={s.label}>What will hitting these numbers make possible?</label>
            <textarea style={s.input} placeholder="Pay off debt, hire help, move, stop working a job, travel, build wealth..." />
          </div>
          <ChatPanel roomId="goals" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('goals'); setActiveRoom('coach') }}>Save and Continue to CFO Coach</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('goals')}>Save Progress</button>
          </div>
        </div>
      )
      case 'coach': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>Room 9 of 9 - CFO Coach</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Your CFO Coach</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Ask anything about money, pricing, profit, cash flow, and financial strategy.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {[
              { num: '01', title: 'Know Your Numbers Weekly', body: 'Set up a 10-minute weekly money check every Sunday. Revenue in, expenses out, profit kept. Consistency beats perfection.' },
              { num: '02', title: 'Separate Business and Personal', body: 'If you do not have a separate business bank account, get one this week. Mixing money is the number one reason small business owners cannot see their real profit.' },
              { num: '03', title: 'Price for Profit Not Survival', body: 'Your price should cover your costs, pay you a real wage, AND leave profit. If it does not, raise your price or cut your costs.' },
            ].map(tip => (
              <div key={tip.num} style={{ background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 12, padding: 18, borderLeft: `3px solid ${gold}` }}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: goldDim, letterSpacing: '1.5px', marginBottom: 6 }}>CFO PRIORITY {tip.num}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: white, marginBottom: 4 }}>{tip.title}</div>
                <div style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>{tip.body}</div>
              </div>
            ))}
          </div>
          <ChatPanel roomId="coach" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={{ ...s.btnPrimary, fontSize: 14, padding: '15px 32px' }} onClick={() => { ROOMS.forEach(r => saveRoom(r.id)); showToast() }}>Complete CFO Money Room</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('coach')}>Save Progress</button>
            <button style={{ ...s.btnSecondary, borderColor: 'rgba(255,255,255,0.1)', color: muted }} onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
          </div>
        </div>
      )
      default: return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: bg, color: white, fontFamily: 'DM Sans,sans-serif' }}>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: `1px solid ${border}`, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 200, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: '#111', border: `1.5px solid ${gold}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: gold }}>CFO</div>
          <div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 700 }}>{profile?.business_name || 'Your Business'}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: gold, letterSpacing: '1.5px', textTransform: 'uppercase' }}>CFO Money Room - V2</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(212,175,55,0.6)' }}>CFO: {profile?.owner_name || 'Loading...'}</span>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: `1px solid ${border}`, color: muted, fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'monospace' }}>Back to Dashboard</button>
        </div>
      </nav>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 67px)' }}>
        <aside style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${border}`, background: '#0c0c0c', padding: '24px 0', position: 'sticky', top: 67, height: 'calc(100vh - 67px)', overflowY: 'auto' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: goldDim, padding: '0 20px 12px' }}>CFO Money Rooms</div>
          {ROOMS.map(r => (
            <div key={r.id} onClick={() => setActiveRoom(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', borderLeft: `3px solid ${activeRoom === r.id ? gold : 'transparent'}`, background: activeRoom === r.id ? 'rgba(212,175,55,0.08)' : 'transparent', fontSize: 13, color: activeRoom === r.id ? white : muted, transition: 'all 0.15s' }}>
              <span style={{ fontSize: 14, flexShrink: 0, fontFamily: 'monospace', fontWeight: 700, color: activeRoom === r.id ? gold : muted }}>{r.icon}</span>
              <span style={{ flex: 1 }}>{r.label}</span>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${completedRooms.has(r.id) ? gold : border}`, background: completedRooms.has(r.id) ? gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#000', flexShrink: 0 }}>
                {completedRooms.has(r.id) ? 'v' : ''}
              </div>
            </div>
          ))}
          <div style={{ padding: '16px 20px 0', borderTop: `1px solid ${border}`, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 9, color: muted, marginBottom: 8 }}><span>Progress</span><span>{completedRooms.size} / 9</span></div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, height: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg,${goldDim},${goldLight})`, borderRadius: 20, width: `${progressPct}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </aside>
        <main style={{ flex: 1, padding: '36px 40px 80px', minWidth: 0, overflowX: 'hidden' }}>
          {renderRoom()}
        </main>
      </div>
      {savedToast && (
        <div style={{ position: 'fixed', bottom: 30, right: 30, background: '#111108', border: `1px solid ${gold}`, borderRadius: 12, padding: '14px 22px', fontSize: 13, color: gold, fontFamily: 'monospace', zIndex: 999 }}>
          Progress saved
        </div>
      )}
    </div>
  )
}
