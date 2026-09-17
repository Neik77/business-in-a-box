'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type ChatMessage = { role: 'assistant' | 'user'; content: string }

export default function MarketingStudio() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState('brand')
  const [completedRooms, setCompletedRooms] = useState<Set<string>>(new Set())
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({})
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const chatEndRef = useRef<HTMLDivElement>(null)

  const ROOMS = [
    { id: 'brand',    icon: '🎨', label: 'Brand Message',       num: 1 },
    { id: 'audience', icon: '👥', label: 'Audience Messaging',  num: 2 },
    { id: 'plan',     icon: '📋', label: 'Marketing Plan',      num: 3 },
    { id: 'content',  icon: '📅', label: 'Content Calendar',    num: 4 },
    { id: 'social',   icon: '📱', label: 'Social Planning',     num: 5 },
    { id: 'promos',   icon: '🎯', label: 'Promotions',          num: 6 },
    { id: 'local',    icon: '📍', label: 'Local Marketing',     num: 7 },
    { id: 'email',    icon: '📧', label: 'Email Marketing',     num: 8 },
    { id: 'coach',    icon: '🤖', label: 'Marketing Coach',     num: 9 },
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
      const icp = profile?.ideal_customer || 'your ideal customer'

      const welcomes: Record<string, string> = {
        brand: `Welcome to the Brand Message room, ${owner}. Before you can market ${biz} effectively, you need a clear, consistent message. What do you want people to think of immediately when they hear your business name?`,
        audience: `Let's get crystal clear on who you're talking to. ${biz} serves ${icp}. But how well do you know what to say to them? Tell me — what's the one thing your audience needs to hear from you right now?`,
        plan: `A marketing plan is just a system for getting your message in front of the right people consistently. Let's build one for ${biz} that you can actually stick to. What platforms are you currently using to market?`,
        content: `Content is how you build trust before the sale. Let's build a content calendar for ${biz} that creates consistently without burning you out. How many days a week can you realistically create content?`,
        social: `Social media is a tool, not a strategy. Let's pick the right platforms for ${biz} and build a plan that actually gets results. Where does your ideal customer spend the most time online?`,
        promos: `Promotions create urgency and spike revenue. Let's plan them strategically for ${biz} so you're not just discounting randomly. What upcoming dates, seasons, or milestones can you build promotions around?`,
        local: `Local marketing is often the most underused tool for small businesses. Even if ${biz} is primarily online, there are local opportunities. Are you visible in your local community and online search?`,
        email: `Email is the highest-converting marketing channel that exists. You own your list — no algorithm can take it from you. Does ${biz} have an email list? If so, how many subscribers and how often do you email them?`,
        coach: `I'm your Marketing Coach for ${biz}. I handle brand messaging, content strategy, social media, promotions, and audience growth. What's your most urgent marketing challenge right now?`,
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
      const icp = profile?.ideal_customer?.substring(0, 150) || 'creative entrepreneurs'
      const system = `You are the Marketing Coach inside Business in a Box™, built by Coach Neik™. You are coaching ${owner}, the marketing lead of ${biz}. Their ideal customer: ${icp}. You handle ALL marketing questions — brand messaging, content strategy, social media, email marketing, promotions, audience growth, and local marketing. Be direct, specific, and platform-aware. No fluff. If asked about money/pricing route to CFO Coach. If asked about sales/leads route to Sales Coach (V4). If asked about business strategy route to CEO Coach.`
      const history = chatMessages[roomId] || []
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          messages: [...history, userMsg].map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await res.json()
      setChatMessages(prev => ({ ...prev, [roomId]: [...(prev[roomId] || []), { role: 'assistant', content: data.reply || "Let's build your marketing together." }] }))
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
      <div style={{ color: gold, fontFamily: 'Georgia,serif', fontSize: 18 }}>Loading Marketing Studio...</div>
    </div>
  )

  const progressPct = Math.round((completedRooms.size / 9) * 100)

  const ChatPanel = ({ roomId }: { roomId: string }) => {
    const msgs = chatMessages[roomId] || []
    const prompts: Record<string, string[]> = {
      brand: ['Write my brand tagline', 'What makes my brand different?', 'Help me define my brand voice'],
      audience: ['Write my audience messaging', 'What should I say to get attention?', 'What content resonates with my audience?'],
      plan: ['Build my marketing plan', 'What should I focus on first?', 'How do I market with no budget?'],
      content: ['Build my content calendar', 'What content should I create this week?', 'Give me 30 content ideas'],
      social: ['Which platform should I focus on?', 'How often should I post?', 'What gets the most engagement?'],
      promos: ['Plan a flash sale', 'What promotions work best?', 'Help me create urgency without discounting'],
      local: ['How do I get found locally?', 'Should I do local events?', 'Help me with Google Business Profile'],
      email: ['Help me write a welcome email', 'How do I grow my email list?', 'What should I send my list this week?'],
      coach: ['Review my marketing strategy', 'What should I prioritize?', 'How do I get more visibility fast?'],
    }
    return (
      <div style={{ marginTop: 24 }}>
        <div style={{ ...s.sectionTitle, marginBottom: 4 }}>📣 Your Marketing Coach</div>
        <p style={s.sectionDesc}>Ask your Marketing Coach anything about brand, content, social, email, and audience growth.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {(prompts[roomId] || []).map(p => (
            <button key={p} onClick={() => sendChat(roomId, p)} style={{ background: 'rgba(212,175,55,0.05)', border: `1px solid ${border}`, borderRadius: 20, color: whiteD, fontSize: 12, padding: '6px 14px', cursor: 'pointer' }}>{p}</button>
          ))}
        </div>
        <div style={{ background: '#0c0c0c', border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: 20, minHeight: 180, maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', maxWidth: '88%' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: m.role === 'assistant' ? goldDim : '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                  {m.role === 'assistant' ? '📣' : (profile?.owner_name?.charAt(0) || 'U')}
                </div>
                <div style={{ background: m.role === 'user' ? 'rgba(212,175,55,0.1)' : '#1a1a1a', border: `1px solid ${m.role === 'user' ? goldDim : border}`, borderRadius: 14, padding: '10px 14px', fontSize: 13, color: m.role === 'user' ? white : whiteD, lineHeight: 1.6 }}>
                  {m.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: goldDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>📣</div>
                <div style={{ background: '#1a1a1a', border: `1px solid ${border}`, borderRadius: 14, padding: '10px 14px', fontSize: 13, color: muted }}>Thinking...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: 'flex', gap: 10, padding: 14, borderTop: `1px solid ${border}`, background: '#0e0e0e' }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(roomId) } }} placeholder="Ask your Marketing Coach..." style={{ flex: 1, background: '#111', border: `1px solid ${border}`, borderRadius: 30, color: white, fontFamily: 'DM Sans,sans-serif', fontSize: 13, padding: '10px 18px', outline: 'none' }} />
            <button onClick={() => sendChat(roomId)} style={{ background: `linear-gradient(135deg,${goldDim},${gold})`, color: '#000', fontWeight: 800, fontSize: 12, padding: '10px 20px', borderRadius: 30, border: 'none', cursor: 'pointer' }}>Send</button>
          </div>
        </div>
      </div>
    )
  }

  const renderRoom = () => {
    switch (activeRoom) {

      case 'brand': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>🎨 Room 1 of 9 — Brand Message</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Define Your Brand Message</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Your brand message is what you stand for, how you sound, and why people choose you over everyone else. Let's get it locked in.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🎯 Brand Positioning</div>
            <p style={s.sectionDesc}>How {profile?.business_name} stands out in the market.</p>
            <label style={s.label}>What is your brand's one-sentence promise?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. I help creative entrepreneurs use AI to build digital businesses without the overwhelm." />
            <label style={s.label}>What makes {profile?.business_name} different from competitors?</label>
            <textarea style={s.input} placeholder="Your approach, your story, your results, your personality..." />
            <label style={s.label}>What do you want people to feel when they encounter your brand?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Empowered, seen, capable, ready to take action..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🗣️ Brand Voice</div>
            <p style={s.sectionDesc}>Your brand voice is how you sound consistently across all platforms.</p>
            <label style={s.label}>3 words that describe how your brand sounds</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Bold, warm, real — or Professional, encouraging, direct" />
            <label style={s.label}>What words or phrases are OFF-brand for you?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Corporate jargon, overly formal language, fear-based messaging..." />
            <label style={s.label}>Who do you sound like? (an influencer, a friend, a mentor, a coach?)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="Describe the vibe — not who you copy, but the energy you bring" />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>✨ Brand Tagline</div>
            <label style={s.label}>Current tagline (or what you've been using)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="Leave blank if you don't have one yet" />
            <label style={s.label}>What would your ideal tagline communicate?</label>
            <textarea style={s.input} placeholder="The feeling, the transformation, the promise — let your Marketing Coach help you craft it" />
          </div>
          <ChatPanel roomId="brand" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('brand'); setActiveRoom('audience') }}>Save & Continue to Audience Messaging →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('brand')}>Save Progress</button>
          </div>
        </div>
      )

      case 'audience': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>👥 Room 2 of 9 — Audience Messaging</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Message Your Audience</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>The right message to the wrong audience does nothing. The right message to the right audience changes everything. Let's nail both.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🎯 Audience Segments</div>
            <p style={s.sectionDesc}>You may have more than one audience. Define each one.</p>
            {['Primary Audience', 'Secondary Audience'].map((label, i) => (
              <div key={i} style={{ background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: goldDim, letterSpacing: '1.5px', marginBottom: 12 }}>{label.toUpperCase()}</div>
                <label style={{ ...s.label, marginTop: 0 }}>Who they are</label>
                <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Women entrepreneurs, 30-45, building online businesses..." />
                <label style={s.label}>Their #1 pain point right now</label>
                <input type="text" style={{ ...s.input, resize: undefined }} placeholder="What keeps them up at night?" />
                <label style={s.label}>What they want most</label>
                <input type="text" style={{ ...s.input, resize: undefined }} placeholder="Their dream outcome..." />
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>💬 Messaging Framework</div>
            <p style={s.sectionDesc}>The building blocks of everything you say in your marketing.</p>
            <label style={s.label}>Hook — what stops them from scrolling?</label>
            <textarea style={s.input} placeholder="e.g. 'If you've been trying to use AI but it feels overwhelming and complicated, this is for you.'" />
            <label style={s.label}>Problem — what are they struggling with?</label>
            <textarea style={s.input} placeholder="Describe their problem in their own words..." />
            <label style={s.label}>Solution — how does your offer solve it?</label>
            <textarea style={s.input} placeholder="Your offer positioned as the bridge from their problem to their goal..." />
            <label style={s.label}>Proof — why should they believe you?</label>
            <textarea style={s.input} placeholder="Results, testimonials, your story, credentials, specific outcomes..." />
            <label style={s.label}>Call to Action — what do you want them to do?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Click the link, DM me the word START, join the free challenge..." />
          </div>
          <ChatPanel roomId="audience" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('audience'); setActiveRoom('plan') }}>Save & Continue to Marketing Plan →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('audience')}>Save Progress</button>
          </div>
        </div>
      )

      case 'plan': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>📋 Room 3 of 9 — Marketing Plan</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Build Your Marketing Plan</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>A marketing plan is a system for getting your message in front of the right people consistently. Let's build one you can actually stick to.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🗺️ Marketing Overview</div>
            <label style={s.label}>Primary marketing goal for the next 90 days</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Grow email list to 500, generate 20 new clients, hit $5K/month..." />
            <label style={s.label}>Marketing budget per month</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. $0 (organic only), $100, $500, $1,000+" />
            <label style={s.label}>How many hours per week can you dedicate to marketing?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. 5 hours/week, 1 hour/day, weekends only..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>📣 Marketing Channels</div>
            <p style={s.sectionDesc}>Where will you show up? Pick your top 2-3 and commit.</p>
            <label style={s.label}>Primary Channel (where you'll focus 80% of your energy)</label>
            <select style={{ ...s.input, resize: undefined }}>
              <option>TikTok</option><option>Instagram</option><option>Facebook</option>
              <option>YouTube</option><option>LinkedIn</option><option>Pinterest</option>
              <option>Email List</option><option>Podcast</option><option>Blog / SEO</option>
            </select>
            <label style={s.label}>Secondary Channel</label>
            <select style={{ ...s.input, resize: undefined }}>
              <option>Email List</option><option>Instagram</option><option>Facebook</option>
              <option>TikTok</option><option>YouTube</option><option>LinkedIn</option>
              <option>Pinterest</option><option>Podcast</option><option>Blog / SEO</option>
            </select>
            <label style={s.label}>Why these channels? (where is your audience?)</label>
            <textarea style={s.input} placeholder="Explain why you chose these platforms for your specific audience..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🔄 Marketing Funnel</div>
            <p style={s.sectionDesc}>How does a stranger become a buyer? Map your funnel.</p>
            <label style={s.label}>Awareness (how people find you)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. TikTok videos, Instagram Reels, word of mouth, Google..." />
            <label style={s.label}>Interest (how you capture them)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Free lead magnet, email list, follow on social, freebie..." />
            <label style={s.label}>Decision (how they become buyers)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Email sequence, DM conversation, sales page, webinar..." />
            <label style={s.label}>Retention (how you keep them coming back)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Newsletter, community, upsell offers, follow-up sequence..." />
          </div>
          <ChatPanel roomId="plan" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('plan'); setActiveRoom('content') }}>Save & Continue to Content Calendar →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('plan')}>Save Progress</button>
          </div>
        </div>
      )

      case 'content': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>📅 Room 4 of 9 — Content Calendar</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Build Your Content Calendar</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Content without a plan is just noise. Let's build a content system that creates consistency without burning you out.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>📌 Content Pillars</div>
            <p style={s.sectionDesc}>Your content pillars are the 3-5 topics you talk about consistently. Everything you post falls into one of these.</p>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i}>
                <label style={s.label}>Pillar {i}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder={`e.g. ${['AI Tools', 'Business Tips', 'Behind the Scenes', 'Client Wins', 'Personal Story'][i-1]}`} />
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder="What types of content fall under this pillar?" />
                </div>
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🗓️ Weekly Content Schedule</div>
            <p style={s.sectionDesc}>How many times per week will you post on each platform?</p>
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
              <div key={day}>
                <label style={s.label}>{day}</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                  <select style={{ ...s.input, resize: undefined }}>
                    <option>Rest Day</option><option>Post Day</option><option>Engagement Day</option><option>Batch Day</option>
                  </select>
                  <input type="text" style={{ ...s.input, resize: undefined }} placeholder="What type of content? Which platform?" />
                </div>
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>💡 Content Batching System</div>
            <label style={s.label}>When will you batch create content? (day + time)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Every Sunday 2-4pm, First Saturday of the month..." />
            <label style={s.label}>How many pieces of content will you create in one batch session?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. 7 posts for the week, 30 posts for the month..." />
            <label style={s.label}>What tools will you use to schedule and post content?</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Buffer, Later, Metricool, manually, Canva scheduler..." />
          </div>
          <ChatPanel roomId="content" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('content'); setActiveRoom('social') }}>Save & Continue to Social Planning →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('content')}>Save Progress</button>
          </div>
        </div>
      )

      case 'social': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>📱 Room 5 of 9 — Social Planning</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Plan Your Social Media</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Social media is a tool, not a strategy. Let's pick the right platforms and build a plan that actually gets results for {profile?.business_name}.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>📱 Platform Strategy</div>
            {['TikTok', 'Instagram', 'Facebook', 'YouTube', 'LinkedIn', 'Pinterest'].map(platform => (
              <div key={platform} style={{ background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 12, padding: 18, marginBottom: 14 }}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: goldDim, letterSpacing: '1.5px', marginBottom: 12 }}>{platform.toUpperCase()}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ ...s.label, marginTop: 0 }}>Using?</label>
                    <select style={{ ...s.input, resize: undefined }}>
                      <option>Yes — Active</option><option>Yes — Inconsistent</option><option>No — Considering</option><option>No — Not relevant</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ ...s.label, marginTop: 0 }}>Followers</label>
                    <input type="text" style={{ ...s.input, resize: undefined }} placeholder="0" />
                  </div>
                  <div>
                    <label style={{ ...s.label, marginTop: 0 }}>Posts/Week</label>
                    <input type="text" style={{ ...s.input, resize: undefined }} placeholder="0" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>📊 Social Media Goals</div>
            <label style={s.label}>Primary social media goal (next 90 days)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Reach 5K TikTok followers, get 100 email signups from social..." />
            <label style={s.label}>What type of content gets the most engagement for you?</label>
            <textarea style={s.input} placeholder="Educational, behind the scenes, personal stories, tutorials, trending audio..." />
            <label style={s.label}>What's your biggest social media challenge?</label>
            <textarea style={s.input} placeholder="Consistency, ideas, engagement, growth, algorithm, time..." />
          </div>
          <ChatPanel roomId="social" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('social'); setActiveRoom('promos') }}>Save & Continue to Promotions →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('social')}>Save Progress</button>
          </div>
        </div>
      )

      case 'promos': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>🎯 Room 6 of 9 — Promotions</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Plan Your Promotions</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Promotions create urgency and spike revenue. Plan them strategically so you're not discounting randomly or burning out your audience.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🗓️ Promotion Calendar</div>
            <p style={s.sectionDesc}>Map out your promotional opportunities for the year.</p>
            {['Q1 (Jan-Mar)', 'Q2 (Apr-Jun)', 'Q3 (Jul-Sep)', 'Q4 (Oct-Dec)'].map(q => (
              <div key={q}>
                <label style={s.label}>{q} — Key Promotions</label>
                <textarea style={{ ...s.input, minHeight: 70 }} placeholder={`e.g. New Year launch, Valentine's bundle, spring sale, back to school, Black Friday, holiday special...`} />
              </div>
            ))}
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🔥 Promotion Types</div>
            <p style={s.sectionDesc}>Not all promotions have to be discounts. Here are your options.</p>
            <label style={s.label}>What promotion types work best for your audience?</label>
            <textarea style={s.input} placeholder="e.g. Flash sales, bundle deals, bonuses for fast action, free challenges, limited enrollment, price increases..." />
            <label style={s.label}>What's your policy on discounting? (Do you discount or not?)</label>
            <textarea style={s.input} placeholder="Some businesses never discount — they use bonuses instead. What's your approach?" />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>📣 Next Promotion Plan</div>
            <label style={s.label}>Your next planned promotion</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Back to school AI bundle, fall launch, flash sale..." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={s.label}>Start Date</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. September 1" /></div>
              <div><label style={s.label}>End Date</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. September 7" /></div>
            </div>
            <label style={s.label}>Revenue goal for this promotion</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="$0" />
            <label style={s.label}>How will you promote it? (channels + content plan)</label>
            <textarea style={s.input} placeholder="e.g. 3 TikToks, 5 Instagram stories, 2 emails, DMs to warm leads..." />
          </div>
          <ChatPanel roomId="promos" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('promos'); setActiveRoom('local') }}>Save & Continue to Local Marketing →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('promos')}>Save Progress</button>
          </div>
        </div>
      )

      case 'local': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>📍 Room 7 of 9 — Local Marketing</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Local Marketing Strategy</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Even if {profile?.business_name} is primarily online, local visibility can drive serious traffic. Let's make sure you're showing up where your community can find you.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🗺️ Local Presence</div>
            <label style={s.label}>Do you have a Google Business Profile set up?</label>
            <select style={{ ...s.input, resize: undefined }}>
              <option>Yes — fully optimized</option><option>Yes — basic setup only</option><option>No — need to set it up</option><option>Not applicable</option>
            </select>
            <label style={s.label}>Are you listed in any local directories?</label>
            <textarea style={s.input} placeholder="Yelp, Chamber of Commerce, local Facebook groups, Nextdoor, city directories..." />
            <label style={s.label}>What local networking opportunities exist for your business?</label>
            <textarea style={s.input} placeholder="Business networking groups, local events, markets, expos, community organizations..." />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🤝 Local Partnerships</div>
            <label style={s.label}>What local businesses could you partner with?</label>
            <textarea style={s.input} placeholder="Complementary businesses, referral partners, co-marketing opportunities..." />
            <label style={s.label}>What local events could {profile?.business_name} participate in?</label>
            <textarea style={s.input} placeholder="Pop-ups, markets, speaking opportunities, sponsorships, workshops..." />
            <label style={s.label}>Local marketing goal for the next 90 days</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Set up Google Business Profile, join 2 local networking groups, host 1 local workshop..." />
          </div>
          <ChatPanel roomId="local" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('local'); setActiveRoom('email') }}>Save & Continue to Email Marketing →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('local')}>Save Progress</button>
          </div>
        </div>
      )

      case 'email': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>📧 Room 8 of 9 — Email Marketing</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Build Your Email System</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Your email list is the one audience you actually own. No algorithm. No platform risk. Let's build it and use it to drive consistent revenue.</p>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>📬 Email Foundation</div>
            <label style={s.label}>Email platform you're using or plan to use</label>
            <select style={{ ...s.input, resize: undefined }}>
              <option>Kit (formerly ConvertKit)</option><option>Flodesk</option><option>Mailchimp</option>
              <option>Beehiiv</option><option>ActiveCampaign</option><option>None yet</option><option>Other</option>
            </select>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><label style={s.label}>Current List Size</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="0 subscribers" /></div>
              <div><label style={s.label}>Average Open Rate</label><input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. 30%, unknown" /></div>
            </div>
            <label style={s.label}>How often do you currently email your list?</label>
            <select style={{ ...s.input, resize: undefined }}>
              <option>Never</option><option>Rarely (a few times a year)</option><option>Monthly</option>
              <option>Bi-weekly</option><option>Weekly</option><option>Multiple times a week</option>
            </select>
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>🧲 List Growth Strategy</div>
            <label style={s.label}>What is your lead magnet? (the free thing you offer to get emails)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Free AI prompt guide, Canva template, mini course, checklist, challenge..." />
            <label style={s.label}>Where do people find your lead magnet?</label>
            <textarea style={s.input} placeholder="e.g. Link in bio, Beacons page, landing page, social posts, podcast..." />
            <label style={s.label}>Email list growth goal (next 90 days)</label>
            <input type="text" style={{ ...s.input, resize: undefined }} placeholder="e.g. Grow from 100 to 500 subscribers" />
          </div>
          <div style={s.section}>
            <div style={s.sectionTitle}>✉️ Email Strategy</div>
            <label style={s.label}>What does your welcome sequence look like?</label>
            <textarea style={s.input} placeholder="Email 1: deliver freebie. Email 2: your story. Email 3: your offer. Email 4: social proof. Email 5: pitch..." />
            <label style={s.label}>What will you email your list about weekly?</label>
            <textarea style={s.input} placeholder="Tips, behind the scenes, promotions, stories, content roundup, new offers..." />
            <label style={s.label}>How will email connect to your offers and sales?</label>
            <textarea style={s.input} placeholder="e.g. Every email has a soft CTA, monthly offer emails, promotional sequences for launches..." />
          </div>
          <ChatPanel roomId="email" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={s.btnPrimary} onClick={() => { saveRoom('email'); setActiveRoom('coach') }}>Save & Continue to Marketing Coach →</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('email')}>Save Progress</button>
          </div>
        </div>
      )

      case 'coach': return (
        <div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 10, letterSpacing: '2.5px', textTransform: 'uppercase', color: gold, marginBottom: 8 }}>🤖 Room 9 of 9 — Marketing Coach</div>
            <h1 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, marginBottom: 8 }}>Your Marketing Coach</h1>
            <p style={{ fontSize: 14, color: muted, lineHeight: 1.65, maxWidth: 560 }}>Ask anything about brand, content, social media, email, promotions, and audience growth for {profile?.business_name}.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {[
              { num: '01', title: 'Pick One Platform and Go Deep', body: 'You cannot be everywhere at once. Pick the platform where your audience lives and master it before adding another. Consistency on one platform beats inconsistency on five.' },
              { num: '02', title: 'Content Must Drive to an Offer', body: 'Every piece of content you create should eventually point to something people can buy. If your content doesn\'t connect to your business, it\'s just content — not marketing.' },
              { num: '03', title: 'Build Your Email List Every Single Day', body: 'Your social following can disappear overnight. Your email list is yours. Every piece of content, every post, every story should have a path to your email list.' },
            ].map(tip => (
              <div key={tip.num} style={{ background: '#0f0f0f', border: `1px solid ${border}`, borderRadius: 12, padding: 18, borderLeft: `3px solid ${gold}` }}>
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: goldDim, letterSpacing: '1.5px', marginBottom: 6 }}>MARKETING PRIORITY {tip.num}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: white, marginBottom: 4 }}>{tip.title}</div>
                <div style={{ fontSize: 13, color: muted, lineHeight: 1.6 }}>{tip.body}</div>
              </div>
            ))}
          </div>
          <ChatPanel roomId="coach" />
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button style={{ ...s.btnPrimary, fontSize: 14, padding: '15px 32px' }} onClick={() => { ROOMS.forEach(r => saveRoom(r.id)); showToast() }}>🎉 Complete Marketing Studio</button>
            <button style={s.btnSecondary} onClick={() => saveRoom('coach')}>Save Progress</button>
            <button style={{ ...s.btnSecondary, borderColor: 'rgba(255,255,255,0.1)', color: muted }} onClick={() => router.push('/dashboard')}>← Back to Dashboard</button>
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
          <div style={{ width: 38, height: 38, background: '#111', border: `1.5px solid ${gold}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📣</div>
          <div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 14, fontWeight: 700 }}>{profile?.business_name || 'Your Business'}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 9, color: gold, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Marketing Studio — V3</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(212,175,55,0.6)' }}>CMO: {profile?.owner_name || 'Loading...'}</span>
          <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: `1px solid ${border}`, color: muted, fontSize: 11, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', fontFamily: 'monospace' }}>← Dashboard</button>
        </div>
      </nav>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 67px)' }}>
        <aside style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${border}`, background: '#0c0c0c', padding: '24px 0', position: 'sticky', top: 67, height: 'calc(100vh - 67px)', overflowY: 'auto' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 9, letterSpacing: '2px', textTransform: 'uppercase', color: goldDim, padding: '0 20px 12px' }}>Marketing Studio Rooms</div>
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
          ✓ Progress saved
        </div>
      )}
    </div>
  )
}
