'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const login = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(212,175,55,0.3)',borderRadius:18,padding:'48px 40px',width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:28,marginBottom:8}}>👑</div>
          <h1 style={{color:'#D4AF37',fontFamily:'Georgia,serif',fontSize:24,margin:'0 0 6px'}}>Business in a Box™</h1>
          <p style={{color:'#9B968A',fontSize:13,margin:0}}>Personalized Entrepreneur Headquarters</p>
          <p style={{color:'#9B968A',fontSize:12,margin:'4px 0 0'}}>Built by Coach Neik™ | AI Legacy Lounge™</p>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:'block',color:'#9B968A',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@business.com"
            style={{width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,color:'#F4F1E8',padding:'11px 13px',fontSize:14,outline:'none',boxSizing:'border-box'}} />
        </div>
        <div style={{marginBottom:24}}>
          <label style={{display:'block',color:'#9B968A',fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&login()} type="password" placeholder="••••••••"
            style={{width:'100%',background:'rgba(0,0,0,0.4)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,color:'#F4F1E8',padding:'11px 13px',fontSize:14,outline:'none',boxSizing:'border-box'}} />
        </div>
        {error && <p style={{color:'#E94560',fontSize:13,marginBottom:16,textAlign:'center'}}>{error}</p>}
        <button onClick={login} disabled={loading}
          style={{width:'100%',background:'linear-gradient(120deg,#F5E7A3,#D4AF37 50%,#b8952f)',border:'none',borderRadius:10,color:'#171204',fontWeight:700,fontSize:14,letterSpacing:'.06em',textTransform:'uppercase',padding:'15px',cursor:'loading'?'default':'pointer'}}>
          {loading ? 'Signing in…' : 'Enter My Headquarters'}
        </button>
      </div>
    </div>
  )
}
