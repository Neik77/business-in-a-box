'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('password')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const login = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
  }

  const sendMagicLink = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' }
    })
    if (error) { setError(error.message) }
    else { setSuccess('Check your email for your login link!') }
    setLoading(false)
  }

  const inputStyle = {width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,color:'#F4F1E8',padding:'11px 13px',fontSize:14,outline:'none',boxSizing:'border-box' as const,marginBottom:14}

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(212,175,55,0.3)',borderRadius:18,padding:'48px 40px',width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:28,marginBottom:8}}>👑</div>
          <h1 style={{color:'#D4AF37',fontFamily:'Georgia,serif',fontSize:24,margin:'0 0 6px'}}>Business in a Box™</h1>
          <p style={{color:'#9B968A',fontSize:13,margin:0}}>Personalized Entrepreneur Headquarters</p>
          <p style={{color:'#9B968A',fontSize:12,margin:'4px 0 0'}}>Built by Coach Neik™ | AI Legacy Lounge™</p>
        </div>

        <div style={{display:'flex',gap:8,marginBottom:24}}>
          <button onClick={()=>{setMode('password');setError('');setSuccess('')}} 
            style={{flex:1,padding:'9px',borderRadius:8,border:'1px solid rgba(255,255,255,0.12)',background:mode==='password'?'rgba(212,175,55,0.15)':'none',color:mode==='password'?'#D4AF37':'#9B968A',cursor:'pointer',fontSize:13,fontFamily:'sans-serif'}}>
            Password
          </button>
          <button onClick={()=>{setMode('magic');setError('');setSuccess('')}}
            style={{flex:1,padding:'9px',borderRadius:8,border:'1px solid rgba(255,255,255,0.12)',background:mode==='magic'?'rgba(212,175,55,0.15)':'none',color:mode==='magic'?'#D4AF37':'#9B968A',cursor:'pointer',fontSize:13,fontFamily:'sans-serif'}}>
            Magic Link
          </button>
        </div>

        <div style={{marginBottom:16}}>
          <label style={{display:'block',color:'#9B968A',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@business.com" style={inputStyle} />
        </div>

        {mode==='password' && (
          <div style={{marginBottom:24}}>
            <label style={{display:'block',color:'#9B968A',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} type="password" placeholder="••••••••" style={inputStyle} />
          </div>
        )}

        {mode==='magic' && (
          <p style={{color:'#9B968A',fontSize:13,marginBottom:24,lineHeight:1.6}}>
            Enter your email and we will send you a magic link. Click it and you are in — no password needed.
          </p>
        )}

        {error && <p style={{color:'#E94560',fontSize:13,marginBottom:16,textAlign:'center'}}>{error}</p>}
        {success && <p style={{color:'#D4AF37',fontSize:13,marginBottom:16,textAlign:'center'}}>{success}</p>}

        <button onClick={mode==='password'?login:sendMagicLink} disabled={loading}
          style={{width:'100%',background:'linear-gradient(120deg,#F5E7A3,#D4AF37 50%,#b8952f)',border:'none',borderRadius:10,color:'#171204',fontWeight:700,fontSize:14,letterSpacing:'.06em',textTransform:'uppercase',padding:'15px',cursor:'pointer'}}>
          {loading ? 'Please wait...' : mode==='password' ? 'Enter My Headquarters' : 'Send Magic Link'}
        </button>
      </div>
    </div>
  )
}
