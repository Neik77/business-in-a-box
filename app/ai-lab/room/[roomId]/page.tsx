'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AILAB_ROOMS, AILAB_COACH } from '@/lib/aiLabRooms'

export default function AILabRoomPage() {
  const router = useRouter()
  const { roomId } = useParams()
  const room = AILAB_ROOMS.find(r => r.id === roomId)
  const [profile, setProfile] = useState(null)
  const [answers, setAnswers] = useState({})
  const [completed, setCompleted] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        try { setCompleted(JSON.parse(data.ailab_completed || '[]')) } catch {}
        try { setAnswers((JSON.parse(data.ailab_answers || '{}'))[roomId] || {}) } catch {}
      }
      setLoading(false)
    }
    load()
  }, [roomId])

  if (!room) return <div style={{minHeight:'100vh',background:'#0A0A0C',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>Room not found.</div>
  if (loading) return <div style={{minHeight:'100vh',background:'#0A0A0C',display:'flex',alignItems:'center',justifyContent:'center'}}><p style={{color:'#818cf8'}}>Loading...</p></div>

  const isCompleted = completed.includes(room.id)
  const nextRoom = AILAB_ROOMS[AILAB_ROOMS.findIndex(r => r.id === room.id) + 1] || null
  const allTasksAnswered = () => room.tasks.every(t => answers[t.id] && String(answers[t.id]).trim())

  const saveProgress = async () => {
    if (!profile) return
    setSaving(true)
    let all = {}
    try { all = JSON.parse(profile.ailab_answers || '{}') } catch {}
    all[roomId] = answers
    await supabase.from('profiles').update({ ailab_answers: JSON.stringify(all) }).eq('id', profile.id)
    setSaving(false)
  }

  const completeRoom = async () => {
    if (!profile || !allTasksAnswered()) return
    setSaving(true)
    const newCompleted = completed.includes(room.id) ? completed : [...completed, room.id]
    let all = {}
    try { all = JSON.parse(profile.ailab_answers || '{}') } catch {}
    all[roomId] = answers
    await supabase.from('profiles').update({ ailab_completed: JSON.stringify(newCompleted), ailab_answers: JSON.stringify(all) }).eq('id', profile.id)
    setCompleted(newCompleted)
    setSaving(false)
  }

  const s = { input: { width:'100%', background:'#111', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'12px 16px', color:'white', fontSize:14, fontFamily:'sans-serif', boxSizing:'border-box' } }

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',color:'white',fontFamily:'sans-serif'}}>
      <div style={{maxWidth:720,margin:'0 auto',padding:'40px 24px'}}>
        <button type="button" onClick={() => router.push('/ai-lab')} style={{color:'#818cf8',background:'none',border:'none',cursor:'pointer',fontSize:14,marginBottom:32}}>← Back to AI Innovation Lab</button>
        <div style={{marginBottom:32}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
            <span style={{background:'rgba(99,102,241,0.2)',color:'#818cf8',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:999}}>Room {room.number}</span>
            {isCompleted && <span style={{background:'rgba(34,197,94,0.15)',color:'#4ade80',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:999}}>COMPLETE</span>}
          </div>
          <h1 style={{fontSize:28,fontWeight:900,margin:'0 0 8px'}}>{room.title}</h1>
          <p style={{color:'#818cf8',fontWeight:600,margin:'0 0 12px'}}>{room.subtitle}</p>
          <p style={{color:'#9ca3af',margin:0}}>{room.description}</p>
        </div>
        <div style={{marginBottom:32,padding:16,background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:12,display:'flex',gap:12}}>
          <div style={{width:36,height:36,borderRadius:8,background:'rgba(99,102,241,0.2)',display:'flex',alignItems:'center',justifyContent:'center',color:'#818cf8',fontWeight:900,fontSize:11,flexShrink:0}}>RE</div>
          <p style={{color:'#c7d2fe',fontSize:13,margin:0,fontStyle:'italic'}}>Ree says: {room.coach_tip}</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:20,marginBottom:32}}>
          {room.tasks.map(task => (
            <div key={task.id} style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:24}}>
              <label style={{display:'block',color:'white',fontWeight:600,marginBottom:12,fontSize:14}}>{task.label}</label>
              {task.type === 'select' ? (
                <select value={answers[task.id] || ''} onChange={e => setAnswers({...answers,[task.id]:e.target.value})} style={{...s.input,cursor:'pointer'}}>
                  <option value="">Select an option</option>
                  {task.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : task.type === 'textarea' ? (
                <textarea value={answers[task.id] || ''} onChange={e => setAnswers({...answers,[task.id]:e.target.value})} placeholder={task.placeholder} rows={4} style={{...s.input,resize:'none'}} />
              ) : (
                <input value={answers[task.id] || ''} onChange={e => setAnswers({...answers,[task.id]:e.target.value})} placeholder={task.placeholder} style={s.input} />
              )}
            </div>
          ))}
        </div>
        {room.leadMagnet && (
          <div style={{background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:12,padding:24,marginBottom:32}}>
            <h3 style={{color:'#818cf8',fontWeight:700,margin:'0 0 4px',fontSize:15}}>Free Resource: {room.leadMagnet.title}</h3>
            <p style={{color:'#9ca3af',fontSize:13,margin:'0 0 16px'}}>{room.leadMagnet.description}</p>
            <button type="button" style={{background:'linear-gradient(135deg,#6366f1,#818cf8)',color:'white',border:'none',padding:'10px 20px',borderRadius:8,cursor:'pointer',fontSize:13,fontWeight:700}}>Download {room.leadMagnet.type}</button>
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <button type="button" onClick={saveProgress} disabled={saving} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'white',fontWeight:600,padding:'14px',borderRadius:12,cursor:'pointer',fontSize:14}}>{saving?'Saving...':'Save Progress'}</button>
          {!isCompleted ? (
            <button type="button" onClick={completeRoom} disabled={saving||!allTasksAnswered()} style={{width:'100%',background:allTasksAnswered()?'linear-gradient(135deg,#6366f1,#818cf8)':'rgba(255,255,255,0.05)',border:'none',color:allTasksAnswered()?'white':'#4b5563',fontWeight:900,padding:'14px',borderRadius:12,cursor:allTasksAnswered()?'pointer':'not-allowed',fontSize:14}}>{saving?'Completing...':!allTasksAnswered()?'Complete All Tasks First':'Complete Room '+room.number}</button>
          ) : (
            <button type="button" onClick={() => nextRoom ? router.push('/ai-lab/room/'+nextRoom.id) : router.push('/ai-lab')} style={{width:'100%',background:'linear-gradient(135deg,#6366f1,#818cf8)',border:'none',color:'white',fontWeight:900,padding:'14px',borderRadius:12,cursor:'pointer',fontSize:14}}>{nextRoom?'Next: '+nextRoom.title:'View Lab Summary'}</button>
          )}
        </div>
      </div>
    </div>
  )
}
