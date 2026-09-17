'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// ── TYPES ──────────────────────────────────────────────────────────────────
type Profile = {
  id: string
  owner_name: string
  business_name: string
  business_type: string
  business_stage: string
  description: string
  products_services: string
  ideal_customer: string
  biggest_challenge: string
  ninety_day_goal: string
  brand_colors: string
  has_llc: string
  has_ein: string
  has_bank_account: string
  tracks_money: string
  ceo_office_complete: boolean
  badges_earned: string
  rooms_unlocked: string
  orientation_complete: boolean
}

type ChatMessage = { role: 'assistant' | 'user'; content: string }

// ── ROOM CONFIG ─────────────────────────────────────────────────────────────
const ROOMS = [
  { id: 'vision',   icon: '🔭', label: 'Vision Builder',          num: 1 },
  { id: 'icp',      icon: '👥', label: 'Ideal Customer Builder',   num: 2 },
  { id: 'offers',   icon: '📦', label: 'Offer Builder',            num: 3 },
  { id: 'goals',    icon: '🎯', label: 'Business Goals',           num: 4 },
  { id: 'plan',     icon: '🗓️', label: '90-Day Action Plan',       num: 5 },
  { id: 'journal',  icon: '📓', label: 'CEO Decision Journal',     num: 6 },
  { id: 'coach',    icon: '🤖', label: 'AI CEO Coach',             num: 7 },
]

// ── COACH SYSTEM PROMPTS ────────────────────────────────────────────────────
function getCoachPrompt(roomId: string, profile: Profile): string {
  const biz = profile?.business_name || 'your business'
  const owner = profile?.owner_name?.split(' ')[0] || 'CEO'
  const challenge = profile?.biggest_challenge || ''
  const goal = profile?.ninety_day_goal || ''
  const stage = profile?.business_stage || 'building'

  const base = `You are the AI CEO Coach inside Business in a Box™, built by Coach Neik™. 
You are coaching ${owner}, the CEO of ${biz}. 
Business stage: ${stage}. 
Their biggest challenge: ${challenge}. 
Their 90-day goal: ${goal}.
Be direct, strategic, and specific to their business. No fluff. No generic advice. Short, punchy responses.`

  const roomContext: Record<string, string> = {
    vision: `${base} You are in the Vision Builder room. Help ${owner} craft a clear vision statement, define their 3-year picture, build their mission statement, and get crystal clear on their WHY. Challenge vague answers. Push for specificity.`,
    icp: `${base} You are in the Ideal Customer Builder room. Help ${owner} define their exact ideal customer for ${biz}. Push past surface-level demographics. Get to pain points, language, dream outcomes. Their products/services are: ${profile?.products_services || 'not yet defined'}.`,
    offers: `${base} You are in the Offer Builder room. Help ${owner} simplify and structure their offers for ${biz}. Their current products/services include: ${profile?.products_services || 'not defined'}. The goal is a clear, simple offer suite — no more scattered products. Push them to pick a hero offer.`,
    goals: `${base} You are in the Business Goals room. Help ${owner} set specific, dated, measurable goals for ${biz} across revenue, growth, systems, and personal development. Push for real numbers and real deadlines.`,
    plan: `${base} You are in the 90-Day Action Plan room. Help ${owner} break their 90-day goal into 3 phases of 30 days each with specific weekly actions. Their goal: ${goal}. Make it concrete and executable.`,
    journal: `${base} You are in the CEO Decision Journal room. Help ${owner} process business decisions, document lessons learned, and think through pivots and wins. Ask powerful questions that help them see clearly.`,
    coach: `${base} You are the full AI CEO Coach for ${biz}. You know everything about this business. Answer any business question directly and specifically. Route complex financial questions to the CFO Coach (coming in V2), legal questions to the Compliance Coach (V6), and funding questions to the Funding Coach (V7).`,
  }

  return roomContext[roomId] || base
}

// ── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function OfficePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState('vision')
  const [completedRooms, setCompletedRooms] = useState<Set<string>>(new Set())
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({})
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [journalEntries, setJournalEntries] = useState<any[]>([])
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({ title: '', category: 'Decision', what: '', why: '', outcome: '', lesson: '' })
  const [offerCount, setOfferCount] = useState(2)
  const [savedToast, setSavedToast] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── LOAD USER + PROFILE ──
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)
      // Load existing CEO office data
      const { data: officeData } = await supabase.from('ceo_office').select('*').eq('user_id', user.id).single()
      if (officeData?.completed_rooms) {
        try { setCompletedRooms(new Set(JSON.parse(officeData.completed_rooms))) } catch {}
      }
      if (officeData?.journal_entries) {
        try { setJournalEntries(JSON.parse(officeData.journal_entries)) } catch {}
      }
      // Seed first journal entry if empty
      if (!officeData?.journal_entries) {
        setJournalEntries([{
          id: 1,
          title: 'CEO Office Activated',
          category: 'Decision',
          date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          what: `${profile?.owner_name || 'CEO'} stepped into the CEO Office and began building the foundation of ${profile?.business_name || 'the business'}.`,
          lesson: 'Every empire starts with one decision to begin.',
        }])
      }
      // Seed welcome chat message for each room
      const welcomes: Record<string, string> = {
        vision: `Welcome to the Vision Builder, ${profile?.owner_name?.split(' ')[0] || 'CEO'}. Let's get clear on where ${profile?.business_name || 'your business'} is going. Start by telling me — what does success look like for you in 3 years?`,
        icp: `Let's build your ideal customer profile for ${profile?.business_name || 'your business'}. Forget demographics for a second — tell me: who is the ONE person who needs what you offer more than anyone else?`,
        offers: `Time to simplify your offers. You mentioned you have multiple products and services. Tell me everything you currently sell or offer, and let's figure out which one should be your hero offer.`,
        goals: `Let's set real goals — not wishes, not vague intentions. Give me a number: what does ${profile?.business_name || 'your business'} need to bring in per month for you to feel like this is working?`,
        plan: `Your 90-day goal is: "${profile?.ninety_day_goal || 'not yet set'}". Let's break that down into 3 phases. What's the single most important thing that needs to happen in the first 30 days?`,
        journal: `This is your CEO Decision Journal. Every decision you make, every lesson you learn, every win and every pivot gets documented here. What's the most important business decision you're facing right now?`,
        coach: `I'm your AI CEO Coach — built for ${profile?.business_name || 'your business'}. I know your challenge: ${profile?.biggest_challenge?.substring(0, 100) || 'building clarity'}. I know your 90-day goal. Ask me anything. What do you need right now?`,
      }
      const initialChats: Record<string, ChatMessage[]> = {}
      ROOMS.forEach(r => {
        initialChats[r.id] = [{ role: 'assistant', content: welcomes[r.id] || `Welcome to the ${r.label}.` }]
      })
      setChatMessages(initialChats)
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, activeRoom])

  // ── SAVE ROOM PROGRESS ──
  const saveRoom = async (roomId: string) => {
    const updated = new Set(completedRooms)
    updated.add(roomId)
    setCompletedRooms(updated)
    const allDone = ROOMS.every(r => updated.has(r.id))
    // Save to ceo_office table
    await supabase.from('ceo_office').upsert({
      user_id: user?.id,
      completed_rooms: JSON.stringify([...updated]),
      journal_entries: JSON.stringify(journalEntries),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    // Update profile if all done
    if (allDone) {
      await supabase.from('profiles').update({
        ceo_office_complete: true,
        badges_earned: JSON.stringify(['headquarters_established', 'ceo_office_activated', 'vision_builder', 'offer_builder', 'ninety_day_planner', 'business_clarity', 'legacy_builder_starter']),
      }).eq('id', user?.id)
    }
    showToast()
  }

  const showToast = () => {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2800)
  }

  // ── AI COACH CHAT ──
  const sendChat = async (roomId: string, messageOverride?: string) => {
    const message = messageOverride || chatInput.trim()
    if (!message || !profile) return
    setChatInput('')
    const userMsg: ChatMessage = { role: 'user', content: message }
    setChatMessages(prev => ({ ...prev, [roomId]: [...(prev[roomId] || []), userMsg] }))
    setChatLoading(true)
    try {
      const systemPrompt = getCoachPrompt(roomId, profile)
      const history = chatMessages[roomId] || []
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [...history, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      const reply = data.reply || "I'm here. Tell me more."
      setChatMessages(prev => ({ ...prev, [roomId]: [...(prev[roomId] || []), { role: 'assistant', content: reply }] }))
    } catch {
      setChatMessages(prev => ({ ...prev, [roomId]: [...(prev[roomId] || []), { role: 'assistant', content: "Connection issue. Try again in a moment." }] }))
    }
    setChatLoading(false)
  }

  // ── JOURNAL ──
  const saveJournalEntry = async () => {
    if (!newEntry.title) return
    const entry = {
      id: Date.now(),
      title: newEntry.title,
      category: newEntry.category,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      what: newEntry.what,
      why: newEntry.why,
      outcome: newEntry.outcome,
      lesson: newEntry.lesson,
    }
    const updated = [entry, ...journalEntries]
    setJournalEntries(updated)
    setNewEntry({ title: '', category: 'Decision', what: '', why: '', outcome: '', lesson: '' })
    setShowNewEntry(false)
    await supabase.from('ceo_office').upsert({
      user_id: user?.id,
      journal_entries: JSON.stringify(updated),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    showToast()
  }

  // ── STYLES ──
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

  const s = {
    label: { fontFamily: 'monospace', fontSize: 9, letterSpacing: '1.5px', textTransform: 'uppercase' as const, color: goldDim, display: 'block', marginBottom: 6, marginTop: 18 },
    input: { width: '100%', background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 10, color: white, fontFamily: 'DM Sans,sans-serif', fontSize: 14, padding: '12px 16px', outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const },
    section: { background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 28, marginBottom: 20 },
    sectionTitle: { fontFamily: 'Georgia,serif', fontSize: 17, fontWeight: 700, color: white, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 },
    sectionDesc: { fontSize: 13, color: muted, marginBottom: 20, lineHeight: 1.6 },
    btnPrimary: { background: `linear-gradient(135deg,${goldDim},${gold})`, color: '#000', fontFamily: 'DM Sans,sans-serif', fontWeight: 800, fontSize: 13, padding: '13px 28px', borderRadius: 30, border: 'none', cursor: 'pointer' },
    btnSecondary: { background: 'none', border: `1px solid ${goldDim}`, color: gold, fontFamily: 'DM Sans,sans-serif', fontWeight: 600, fontSize: 13, padding: '11px 22px', borderRadius: 30, cursor: 'pointer' },
  }

  // ── LOADING ──
  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: gold, fontFamily: 'Georgia,serif', fontSize: 18 }}>Loading CEO Office...</div>
    </div>
  )

  const progressPct = Math.round((completedRooms.size / 7) * 100)

  // ── CHAT PANEL (shared across rooms) ──
  const ChatPanel = ({ roomId }: { roomId: string }) => {
    const msgs = chatMessages[roomId] || []
    const prompts: Record<string, string[]> = {
      vision: ['Write my vision statement', 'What should my 3-year picture look like?', 'Help me define my mission', 'What is my WHY?'],
      icp: ['Who is my ideal customer?', 'What pain points should I focus on?', 'Write my customer avatar', 'What language does my customer use?'],
      offers: ['Help me pick my hero offer', 'How should I price this?', 'What offers should I retire?', 'Build my offer suite'],
      goals: ['Set my revenue goal', 'What should my 90-day number be?', 'Help me set a growth goal', 'What systems do I need?'],
      plan: ['Break my goal into 3 phases', 'What do I do in month one?', 'What could block me?', 'Build my weekly action plan'],
      journal: ['Help me process this decision', 'What did I learn this week?', 'Document a business win', 'I need to think through a pivot'],
      coach: ['What should I focus on first?', 'Help me simplify my offers', 'I feel overwhelmed — what do I do?', 'How do I get my first 10 buyers?'],
    }
    return (
      <div style={{ marginTop: 24 }}>
        <div style={{ ...s.sectionTitle, marginBottom: 4 }}>🤖 Your AI Coach — Ask Anything</div>
        <p style={s.sectionDesc}>Your coach knows your business. Ask for guidance, get direct answers.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(prompts[roomId] || []).map(p => (
            <button key={p} onClick={() => sendChat(roomId, p)} style={{ background: 'rgba(212,175,55,0.05)', border: `1px solid ${border}`, borderRadius: 20, color: whiteD, fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
        <div style={{ background: '#0c0c0c', border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: 20, minHeight: 200, maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', maxWidth: '88%' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.role === 'assistant' ? goldDim : '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                  {m.role === 'assistant' ? '👑' : (profile?.owner_name?.charAt(0) || 'U')}
                </div>
                <div style={{ background: m.role === 'user' ? 'rgba(212,175,55,0.1)' : '#1a1a1a', border: `1px solid ${m.role === 'user' ? goldDim : border}`, borderRadius: 14, padding: '10px 14px', fontSize: 13, color: m.role === 'user' ? white : whiteD, lineHeight: 1.6 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', gap: 10, maxWidth: '88%' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>👑</div>
                <div style={{ background: '#1a1a1a', border: `1px solid ${border}`, borderRadius: 14, padding: '10px 14px', fontSize: 13, color: muted }}>Thinking...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: 10, padding: 14, borderTop: `1px solid ${border}`, background: '#0e0e0e' }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(roomId) } }}
              placeholder="Ask your CEO Coach..."
              style={{ flex: 1, background: '#111', border: `1px solid ${border}`, borderRadius: 30, color: white, fontFamily: 'DM Sans,sans-serif', fontSize: 13, padding: '10px 18px', outline: 'none' }}
            />
            <button onClick={() => sendChat(roomId)} style={{ background: `linear-gradient(135deg,${goldDim},${gold})`, color: '#000', fontWeight: 800, fontSize: 12, padding: '10px 20px', borderRadius: 30, border: 'none', cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      </div>
    )
  }

  // ── ROOM RENDERER ──
  const renderRoom = () => {
    switch (activeRoom) {

      // ── VISION BUILDER ──
      case 'vision': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>🔭 Room 1 of 7 — Vision Builder</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Build Your Vision</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Your vision is the anchor for every decision. Get clear on where you're going, why it matters, and what success looks like.</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#0e0e05,#111108)', border: `1px solid ${borderGlow}`, borderRadius: 16, padding: 28, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 56, color: goldDim, lineHeight: 0.5, marginBottom: 12, opacity: 0.4 }}>"</div>
            <textarea placeholder="Type your vision statement here... (e.g. To become the go-to AI education resource for creative entrepreneurs who want to build smarter, not harder.)" style={{ ...s.input, background: 'transparent', border: 'none', textAlign: 'center', fontFamily: 'Georgia,serif', fontSize: 18, fontStyle: 'italic', resize: 'none', minHeight: 80 }} />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🌟 The Big Picture</div>
            <p style={s.sectionDesc}>Answer these to build the foundation of your vision.</p>
            <label style={s.label}>What does {profile?.business_name} look like in 3 years?</label>
            <textarea style={s.input} placeholder="Revenue, team, audience, impact, what changed..." />
            <label style={s.label}>What do you want to be known for?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. The woman who made AI simple for creative business owners" />
            <label style={s.label}>Who do you want to serve at your highest level?</label>
            <textarea style={s.input} placeholder="Describe your ideal client at the peak of your business..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>💡 Mission Statement</div>
            <p style={s.sectionDesc}>What you do and who you do it for — one clear sentence.</p>
            <label style={s.label}>I help _____ do _____ so they can _____</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. I help Canva users use AI tools so they can build digital products without the overwhelm" />
            <label style={s.label}>Values that drive {profile?.business_name}</label>
            <textarea style={s.input} placeholder="e.g. Simplicity, accessibility, real results, community..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🔥 Your Why</div>
            <label style={s.label}>Why did you start {profile?.business_name}?</label>
            <textarea style={s.input} placeholder="Be honest. The real reason — not the polished version." />
            <label style={s.label}>Who are you building this for beyond yourself?</label>
            <textarea style={s.input} placeholder="Family, community, future clients, a version of yourself from the past..." />
          </div>
          <ChatPanel roomId="vision" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('vision'); setActiveRoom('icp') }}>Save & Continue to Ideal Customer →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('vision')}>Save Progress</button>
          </div>
        </div>
      )

      // ── ICP BUILDER ──
      case 'icp': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>👥 Room 2 of 7 — Ideal Customer Builder</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Know Your Customer</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Stop guessing who you're talking to. Build a clear picture of the exact person who needs what you offer.</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg,#0f0f0f,#141408)', border: `1px solid ${borderGlow}`, borderRadius: 20, padding: 28, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>👩🏾</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 20, fontWeight: 700, color: gold, marginBottom: 4 }}>Your Ideal Client</div>
            <div style={{ fontSize: 13, color: muted }}>Fill in the details below to bring them to life</div>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>👤 Who They Are</div>
            <p style={s.sectionDesc}>Give your ideal client a name and a face so they feel real.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={s.label}>First Name (made up)</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Maya" /></div>
              <div><label style={s.label}>Age Range</label>
                <select style={{ ...s.input, resize: undefined }}>
                  <option>25–34</option><option>35–44</option><option>45–54</option><option>18–24</option><option>55+</option>
                </select>
              </div>
            </div>
            <label style={s.label}>What do they do for work?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Small business owner, side hustler, crafter..." />
            <label style={s.label}>Where do they hang out online?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Instagram, TikTok, Facebook groups, Pinterest, YouTube..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>😤 Their Pain Points</div>
            <p style={s.sectionDesc}>What keeps them up at night? What are they frustrated about right now?</p>
            <label style={s.label}>Top 3 Frustrations</label>
            <textarea style={s.input} placeholder="1. Too many ideas, don't know where to start&#10;2. AI feels too complicated&#10;3. Content that doesn't convert..." />
            <label style={s.label}>What have they already tried that didn't work?</label>
            <textarea style={s.input} placeholder="Courses they didn't finish, tools too complex, coaches too expensive..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>✨ Their Dream Outcome</div>
            <label style={s.label}>What does their life look like after working with you?</label>
            <textarea style={s.input} placeholder="They have a clear offer, consistent income, products that sell while they sleep..." />
            <label style={s.label}>What do they want to be able to say after working with you?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. 'I finally feel like a real business owner with a plan.'" />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>💬 Their Language</div>
            <p style={s.sectionDesc}>What words do they use? This becomes your marketing copy.</p>
            <label style={s.label}>Exact phrases they use to describe their problem</label>
            <textarea style={s.input} placeholder="'I don't know where to start', 'I feel overwhelmed', 'nothing is making money'..." />
            <label style={s.label}>What would make them say YES immediately?</label>
            <textarea style={s.input} placeholder="A clear promise, a fast result, a specific price point, someone who gets them..." />
          </div>
          <ChatPanel roomId="icp" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('icp'); setActiveRoom('offers') }}>Save & Continue to Offer Builder →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('icp')}>Save Progress</button>
          </div>
        </div>
      )

      // ── OFFER BUILDER ──
      case 'offers': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>📦 Room 3 of 7 — Offer Builder</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Build Your Offers</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Stop selling everything. Build a clear offer suite — what you sell, who it's for, what it costs, how they buy. Max 3 core offers to start.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🎯 Offer Strategy First</div>
            <p style={s.sectionDesc}>Before listing offers, get clear on your overall strategy.</p>
            <label style={s.label}>What is your MAIN offer — the one that pays the bills?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. AI consulting, AI Training Vault, Canva Template Shop..." />
            <label style={s.label}>How do people find you and then pay you? (Your buyer journey)</label>
            <textarea style={s.input} placeholder="e.g. Free content on TikTok → lead magnet → email → offer → upsell..." />
          </div>
          {Array.from({ length: offerCount }, (_, i) => (
            <div key={i} style={{ background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 14, padding: 22, marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: gold, letterSpacing: '1.5px' }}>OFFER 0{i + 1}</span>
                {i > 0 && <button onClick={() => setOfferCount(c => c - 1)} style={{ background: 'none', border: '1px solid rgba(192,57,43,0.4)', color: '#c0392b', fontSize: 11, padding: '4px 10px', borderRadius: 20, cursor: 'pointer' }}>Remove</button>}
              </div>
              <label style={s.label}>Offer Name</label>
              <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. AI Starter Kit, 1:1 Clarity Call, Canva Bundle..." />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 18 }}>
                <div><label style={s.label}>Type</label>
                  <select style={{ ...s.input, resize: undefined }}>
                    <option>Digital Product</option><option>1:1 Coaching</option><option>Group Program</option>
                    <option>Membership</option><option>Template / Resource</option><option>Course</option><option>Service</option>
                  </select>
                </div>
                <div><label style={s.label}>Price</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$97" /></div>
              </div>
              <label style={s.label}>What's included?</label>
              <textarea style={s.input} placeholder="List everything included..." />
              <label style={s.label}>Who is this for?</label>
              <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Beginners who want to start with AI..." />
              <label style={s.label}>Where do they buy it?</label>
              <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Beacons link, Stan Store, direct DM..." />
            </div>
          ))}
          <button onClick={() => setOfferCount(c => Math.min(c + 1, 5))} style={{ width: '100%', background: 'rgba(212,175,55,0.05)', border: `1px dashed ${goldDim}`, borderRadius: 14, color: gold, fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, padding: 16, cursor: 'pointer', marginBottom: 16 }}>+ Add Another Offer</button>
          <div style={s.section}>
            <div style={s.sectionTitle}>🗑️ Offers to Archive or Kill</div>
            <p style={s.sectionDesc}>What's not working or not aligned? Name them here so you can let them go.</p>
            <label style={s.label}>Offers you're retiring or pausing</label>
            <textarea style={s.input} placeholder="List what's not working or not aligned with your core offer..." />
            <label style={s.label}>Why are you keeping these off the table for now?</label>
            <textarea style={s.input} placeholder="e.g. Too much time, not my zone of genius, not aligned with ideal client..." />
          </div>
          <ChatPanel roomId="offers" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('offers'); setActiveRoom('goals') }}>Save & Continue to Business Goals →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('offers')}>Save Progress</button>
          </div>
        </div>
      )

      // ── BUSINESS GOALS ──
      case 'goals': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>🎯 Room 4 of 7 — Business Goals</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Set Your Goals</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>No more vague intentions. Set real, specific, dated goals across the four areas that move the needle.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>💰 Revenue Goals</div>
            <p style={s.sectionDesc}>Be specific. A number and a date.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
              <div><label style={s.label}>Monthly Revenue Goal</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$3,000/mo" /></div>
              <div><label style={s.label}>90-Day Target</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$9,000" /></div>
              <div><label style={s.label}>Annual Goal</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="$50,000" /></div>
            </div>
            <label style={s.label}>Primary income source</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Digital product sales, 1:1 coaching, template shop..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>📈 Growth Goals</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={s.label}>Email List Goal (by when?)</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="500 subscribers by Oct 2026" /></div>
              <div><label style={s.label}>Social Following Goal</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="5K TikTok followers by year end" /></div>
            </div>
            <label style={s.label}>Platform you're focusing on to grow</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. TikTok for growth, email for revenue" />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>⚙️ Systems Goals</div>
            <label style={s.label}>3 systems you need in place this quarter</label>
            <textarea style={s.input} placeholder="1. Working email funnel that sells my offer automatically&#10;2. Content system so I'm not creating from scratch daily&#10;3. Tracking system for income and expenses..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🧠 Personal Goals</div>
            <label style={s.label}>1 skill you need to develop this quarter</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Short-form video, email copywriting, ad strategy..." />
            <label style={s.label}>1 thing you're saying NO to this quarter</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Starting new offers before finishing current ones..." />
          </div>
          <ChatPanel roomId="goals" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('goals'); setActiveRoom('plan') }}>Save & Continue to 90-Day Plan →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('goals')}>Save Progress</button>
          </div>
        </div>
      )

      // ── 90-DAY PLAN ──
      case 'plan': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>🗓️ Room 5 of 7 — 90-Day Action Plan</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Your 90-Day Plan</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Break your 90-day goal into 3 phases of 30 days each. What happens in each phase to get you where you said you're going?</p>
          </div>
          {profile?.ninety_day_goal && (
            <div style={{ background: '#0f0f0f', border: `1px solid ${borderGlow}`, borderRadius: 14, padding: '16px 20px', marginBottom: 20, borderLeft: `3px solid ${gold}` }}>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: goldDim, letterSpacing: '1.5px', marginBottom: 6 }}>YOUR 90-DAY GOAL (FROM INTAKE)</div>
              <p style={{ fontSize: 14, color: whiteD, margin: 0, lineHeight: 1.6 }}>{profile.ninety_day_goal}</p>
            </div>
          )}
          <div style={s.section}>
            <div style={s.sectionTitle}>🎯 The 90-Day Focus</div>
            <label style={s.label}>Your 90-Day Headline Goal</label>
            <input type="text" style={{ ...s.input, resize: undefined }} defaultValue={profile?.ninety_day_goal?.substring(0, 120)} placeholder="e.g. Launch 2 core offers and build a steady income path" />
            <label style={s.label}>How will you know when you've won at day 90?</label>
            <textarea style={s.input} placeholder="Specific, measurable. What does success look like?" />
          </div>
          {[
            { num: 1, title: 'Phase 1 — Foundation', range: 'Days 1–30', placeholder: 'e.g. Simplify offers, pick your lane, set up systems' },
            { num: 2, title: 'Phase 2 — Build & Launch', range: 'Days 31–60', placeholder: 'e.g. Launch main offer, build content system, grow email list' },
            { num: 3, title: 'Phase 3 — Scale & Optimize', range: 'Days 61–90', placeholder: 'e.g. Analyze what worked, double down on revenue drivers' },
          ].map(phase => (
            <div key={phase.num} style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 24, marginBottom: 16, borderLeft: `3px solid ${gold}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, background: `linear-gradient(135deg,${goldDim},${gold})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 900, color: '#000', flexShrink: 0 }}>{phase.num}</div>
                <div>
                  <h3 style={{ fontFamily: 'Georgia,serif', fontSize: 16, fontWeight: 700, margin: 0 }}>{phase.title}</h3>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: goldDim, letterSpacing: '1px' }}>{phase.range}</div>
                </div>
              </div>
              <label style={{ ...s.label, marginTop: 0 }}>Phase Focus</label>
              <input type="text" style={{ ...s.input, resize: undefined }} placeholder={phase.placeholder} />
              <label style={s.label}>Key Actions</label>
              <textarea style={s.input} placeholder="List your key actions for this phase..." />
            </div>
          ))}
          <div style={s.section}>
            <div style={s.sectionTitle}>🚧 Potential Roadblocks</div>
            <label style={s.label}>Top 3 things that could slow you down</label>
            <textarea style={s.input} placeholder="1. Shiny object syndrome&#10;2. Not enough time&#10;3. Self-doubt when launching publicly..." />
            <label style={s.label}>How will you handle them?</label>
            <textarea style={s.input} placeholder="Your plan for when things get hard..." />
          </div>
          <ChatPanel roomId="plan" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('plan'); setActiveRoom('journal') }}>Save & Continue to CEO Journal →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('plan')}>Save Progress</button>
          </div>
        </div>
      )

      // ── CEO JOURNAL ──
      case 'journal': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>📓 Room 6 of 7 — CEO Decision Journal</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>CEO Decision Journal</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Document your decisions, lessons, pivots, and wins. This is your record of how you built {profile?.business_name} into what it becomes.</p>
          </div>
          <button onClick={() => setShowNewEntry(true)} style={{ width: '100%', background: 'rgba(212,175,55,0.05)', border: `1px dashed ${goldDim}`, borderRadius: 14, color: gold, fontFamily: 'DM Sans,sans-serif', fontSize: 13, fontWeight: 600, padding: 16, cursor: 'pointer', marginBottom: 16 }}>+ Write a New Entry</button>
          {showNewEntry && (
            <div style={s.section}>
              <div style={s.sectionTitle}>📝 New Journal Entry</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div><label style={s.label}>Entry Title</label><input type="text" value={newEntry.title} onChange={e => setNewEntry(p => ({ ...p, title: e.target.value }))} style={{ ...s.input, resize: undefined }} placeholder="e.g. Decision to pause community membership" /></div>
                <div><label style={s.label}>Category</label>
                  <select value={newEntry.category} onChange={e => setNewEntry(p => ({ ...p, category: e.target.value }))} style={{ ...s.input, resize: undefined }}>
                    <option>Decision</option><option>Win</option><option>Lesson Learned</option><option>Pivot</option><option>Reflection</option><option>Strategy</option>
                  </select>
                </div>
              </div>
              <label style={s.label}>What happened / What is the decision?</label>
              <textarea value={newEntry.what} onChange={e => setNewEntry(p => ({ ...p, what: e.target.value }))} style={s.input} placeholder="Be specific. What did you decide or what happened?" />
              <label style={s.label}>Why did you make this decision?</label>
              <textarea value={newEntry.why} onChange={e => setNewEntry(p => ({ ...p, why: e.target.value }))} style={s.input} placeholder="What data, feeling, or situation led to this?" />
              <label style={s.label}>What did you learn?</label>
              <textarea value={newEntry.lesson} onChange={e => setNewEntry(p => ({ ...p, lesson: e.target.value }))} style={s.input} placeholder="Win or loss — what's the takeaway?" />
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button style={s.btnPrimary} onClick={saveJournalEntry}>Save Entry</button>
                <button style={s.btnSecondary} onClick={() => setShowNewEntry(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
            {journalEntries.map(entry => (
              <div key={entry.id} style={{ background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 14, padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: goldDim }}>{entry.date}</span>
                  <span style={{ fontSize: 10, padding: '2px 10px', borderRadius: 20, border: `1px solid ${border}`, color: muted }}>{entry.category}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: white }}>{entry.title}</div>
                <div style={{ fontSize: 12, color: muted, lineHeight: 1.5 }}>{entry.what?.substring(0, 200)}{entry.what?.length > 200 ? '...' : ''}</div>
                {entry.lesson && <div style={{ marginTop: 10, fontSize: 12, color: gold, fontStyle: 'italic' }}>"{entry.lesson}"</div>}
              </div>
            ))}
          </div>
          <ChatPanel roomId="journal" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('journal'); setActiveRoom('coach') }}>Continue to AI CEO Coach →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('journal')}>Save Progress</button>
          </div>
        </div>
      )

      // ── AI CEO COACH ──
      case 'coach': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>🤖 Room 7 of 7 — AI CEO Coach</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Your AI CEO Coach</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Ask anything about your business. Get direct, strategic coaching built around {profile?.business_name} and everything in your CEO Office.</p>
          </div>
          {/* Executive Team Cards */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: goldDim, marginBottom: 14 }}>Your Executive Team — Coming as You Unlock Rooms</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 12 }}>
              {[
                { icon: '👑', title: 'CEO Coach', desc: 'Business strategy & direction', active: true },
                { icon: '💰', title: 'CFO Coach', desc: 'Money, pricing & profit', active: false, v: 'V2' },
                { icon: '⚙️', title: 'COO Coach', desc: 'Operations & systems', active: false, v: 'V5' },
                { icon: '📣', title: 'Marketing Coach', desc: 'Brand, content & audience', active: false, v: 'V3' },
                { icon: '🎯', title: 'Sales Coach', desc: 'Leads, scripts & revenue', active: false, v: 'V4' },
                { icon: '⚖️', title: 'Compliance Coach', desc: 'Legal & business setup', active: false, v: 'V6' },
                { icon: '💼', title: 'Funding Coach', desc: 'Credit, loans & grants', active: false, v: 'V7' },
                { icon: '🤖', title: 'AI Coach', desc: 'Prompts & AI workflows', active: false, v: 'V8' },
              ].map(coach => (
                <div key={coach.title} style={{ background: coach.active ? 'linear-gradient(135deg,#111108,#0f0f09)' : '#0d0d0d', border: coach.active ? `1px solid ${borderGlow}` : `1px solid rgba(255,255,255,0.05)`, borderRadius: 14, padding: 18, opacity: coach.active ? 1 : 0.45, position: 'relative' }}>
                  {!coach.active && <div style={{ position: 'absolute', top: 8, right: 10, fontFamily: 'monospace', fontSize: 9, color: '#555' }}>{coach.v} 🔒</div>}
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{coach.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: coach.active ? white : '#555', marginBottom: 4 }}>{coach.title}</div>
                  <div style={{ fontSize: 12, color: coach.active ? muted : '#444' }}>{coach.desc}</div>
                  {coach.active && <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 9, color: gold, letterSpacing: '1px' }}>ACTIVE</div>}
                </div>
              ))}
            </div>
          </div>
          {/* CEO Coach priorities from intake */}
          {profile?.biggest_challenge && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2px', textTransform: 'uppercase', color: goldDim, marginBottom: 4 }}>Your Starting Priorities — Based on Your Intake</div>
              {[
                { num: '01', title: 'Pick Your Hero Offer', body: `You have multiple products, ${profile?.owner_name?.split(' ')[0] || 'CEO'}. Pick ONE that you can point all traffic to for the next 90 days. Everything else goes on pause. One offer, one path, one focus.` },
                { num: '02', title: 'Define the Free-to-Paid Bridge', body: 'Your content is getting people in the door but they\'re not converting. Build one clear bridge: free content → lead magnet → email → offer. That\'s the only funnel you need right now.' },
                { num: '03', title: 'Track Your Money Weekly', body: 'Set up a simple weekly money check — 10 minutes every Sunday. What came in, what went out, what\'s the number this week. Consistency beats perfection.' },
              ].map(tip => (
                <div key={tip.num} style={{ background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 12, padding: 18, borderLeft: `3px solid ${gold}` }}>
                  <div style={{ fontFamily: 'monospace', fontSize: 9, color: goldDim, letterSpacing: '1.5px', marginBottom: 6 }}>PRIORITY {tip.num}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: white, marginBottom: 4 }}>{tip.title}</div>
                  <div style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>{tip.body}</div>
                </div>
              ))}
            </div>
          )}
          <ChatPanel roomId="coach" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={{ ...s.btnPrimary, fontSize: 14, padding: '15px 32px' }} onClick={() => {
              ROOMS.forEach(r => saveRoom(r.id))
              showToast()
            }}>🎉 Complete CEO Office</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('coach')}>Save Progress</button>
            <button style={{ ...s.btnSecondary, borderColor: 'rgba(255,255,255,0.1)', color: muted }} onClick={() => router.push('/dashboard')}>← Back to Dashboard</button>
          </div>
        </div>
      )

      default: return null
    }
  }

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: bg, color: white, fontFamily: 'DM Sans,sans-serif' }}>

      {/* NAV */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: `1px solid ${border}`, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 200, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, background: '#111', border: `1.5px solid ${gold}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontSize: 15, fontWeight: 900, color: gold }}>{profile?.business_name?.charAt(0) || 'B'}</div>
          <div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 700 }}>{profile?.business_name || 'Your Business'}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: gold, letterSpacing: '1.5px', textTransform: 'uppercase' }}>CEO Office</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(212,175,55,0.6)' }}>CEO: {profile?.owner_name || 'Loading...'}</span>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: `1px solid ${border}`, color: muted, fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'monospace' }}>← Dashboard</button>
        </div>
      </nav>

      {/* APP */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 67px)' }}>

        {/* SIDEBAR */}
        <aside style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${border}`, background: '#0c0c0c', padding: '24px 0', position: 'sticky', top: 67, height: 'calc(100vh - 67px)', overflowY: 'auto' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: goldDim, padding: '0 20px 12px' }}>CEO Office Rooms</div>
          {ROOMS.map(r => (
            <div key={r.id} onClick={() => setActiveRoom(r.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', cursor: 'pointer', borderLeft: `3px solid ${activeRoom === r.id ? gold : 'transparent'}`, background: activeRoom === r.id ? 'rgba(212,175,55,0.08)' : 'transparent', fontSize: 13, color: activeRoom === r.id ? white : muted, transition: 'all 0.15s' }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{r.icon}</span>
              <span style={{ flex: 1 }}>{r.label}</span>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: `1.5px solid ${completedRooms.has(r.id) ? gold : border}`, background: completedRooms.has(r.id) ? gold : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#000', flexShrink: 0 }}>
                {completedRooms.has(r.id) ? '✓' : ''}
              </div>
            </div>
          ))}
          <div style={{ padding: '16px 20px 0', borderTop: `1px solid ${border}`, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: 9, color: muted, marginBottom: 8 }}>
              <span>Progress</span><span>{completedRooms.size} / 7</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, height: 5, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(90deg,${goldDim},${goldLight})`, borderRadius: 20, width: `${progressPct}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        </aside>

        {/* CONTENT */}
        <main style={{ flex: 1, padding: '36px 40px 80px', minWidth: 0, overflowX: 'hidden' }}>
          {renderRoom()}
        </main>
      </div>

      {/* TOAST */}
      {savedToast && (
        <div style={{ position: 'fixed', bottom: 30, right: 30, background: '#111108', border: `1px solid ${gold}`, borderRadius: 12, padding: '14px 22px', fontSize: 13, color: gold, fontFamily: 'monospace', zIndex: 999, animation: 'fadeIn 0.3s ease' }}>
          ✓ Progress saved
        </div>
      )}
    </div>
  )
}
