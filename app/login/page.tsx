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

  const switchMode = (next: string) => {
    setMode(next)
    setError('')
    setSuccess('')
  }

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0C',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(212,175,55,0.3)',borderRadius:18,padding:'48px 40px',width:'100%',maxWidth:420,boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:28,marginBottom:8}} aria-hidden="true">👑</div>
          <h1 style={{color:'#D4AF37',fontFamily:'Georgia,serif',fontSize:24,margin:'0 0 6px'}}>Business in a Box™</h1>
          <p style={{color:'#9B968A',fontSize:13,margin:0}}>Personalized Entrepreneur Headquarters</p>
          <p style={{color:'#9B968A',fontSize:12,margin:'4px 0 0'}}>Built by Coach Neik™ | AI Legacy Lounge™</p>
        </div>

        <div role="tablist" aria-label="Login method" style={{display:'flex',gap:8,marginBottom:24}}>
          <button
            role="tab"
            aria-selected={mode === 'password' ? 'true' : 'false'}
            onClick={() => switchMode('password')}
            className="login-tab"
          >
            Password
          </button>
          <button
            role="tab"
            aria-selected={mode === 'magic' ? 'true' : 'false'}
            onClick={() => switchMode('magic')}
            className="login-tab"
          >
            Magic Link
          </button>
        </div>

        <div style={{marginBottom:16}}>
          <label htmlFor="login-email" className="field-label">Email</label>
          <input
            id="login-email"
            className="field-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            placeholder="you@business.com"
            autoComplete="email"
            aria-required="true"
            aria-describedby={error ? 'login-error' : undefined}
          />
        </div>

        {mode === 'password' && (
          <div style={{marginBottom:24}}>
            <label htmlFor="login-password" className="field-label">Password</label>
            <input
              id="login-password"
              className="field-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-required="true"
            />
          </div>
        )}

        {mode === 'magic' && (
          <p style={{color:'#9B968A',fontSize:13,marginBottom:24,lineHeight:1.6}}>
            Enter your email and we will send you a magic link. Click it and you are in — no password needed.
          </p>
        )}

        <div aria-live="polite" aria-atomic="true">
          {error && (
            <p id="login-error" style={{color:'#E94560',fontSize:13,marginBottom:16,textAlign:'center',margin:'0 0 16px'}}>
              {error}
            </p>
          )}
          {success && (
            <p style={{color:'#D4AF37',fontSize:13,marginBottom:16,textAlign:'center',margin:'0 0 16px'}}>
              {success}
            </p>
          )}
        </div>

        <button
          onClick={mode === 'password' ? login : sendMagicLink}
          disabled={loading}
          className="btn btn-gold"
          style={{width:'100%',fontSize:14,letterSpacing:'.06em',textTransform:'uppercase',padding:'15px'}}
        >
          {loading ? 'Please wait…' : mode === 'password' ? 'Enter My Headquarters' : 'Send Magic Link'}
        </button>
      </div>
    </div>
  )
}
