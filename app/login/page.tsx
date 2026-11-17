'use client'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('password')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  // ATTEMPT GUARD (Muse amendment 2).
  // Every password attempt claims the next token. Only the attempt whose token
  // is still the current one may touch state or navigate. A late success, a
  // late error, or a late timeout belonging to a superseded attempt is
  // discarded: it cannot reset loading, cannot navigate, and cannot show an
  // error that belongs to an older attempt. Promise.race on its own would not
  // prevent this, because it cannot cancel the underlying Supabase request.
  const attemptRef = useRef(0)
  const SIGN_IN_TIMEOUT_MS = 15000

  const login = async () => {
    const attemptId = ++attemptRef.current
    const isCurrentAttempt = () => attemptRef.current === attemptId

    setLoading(true)
    setError('')

    let timeoutId: ReturnType<typeof setTimeout> | undefined

    try {
      const outcome = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        new Promise<{ __timeout: true }>(resolve => {
          timeoutId = setTimeout(() => resolve({ __timeout: true }), SIGN_IN_TIMEOUT_MS)
        })
      ])

      if (!isCurrentAttempt()) return

      if ('__timeout' in outcome) {
        setError('Sign-in is taking longer than expected. Please check your connection and try again.')
        return
      }

      if (outcome.error) {
        setError(outcome.error.message)
        return
      }

      router.replace('/dashboard')
    } catch {
      if (!isCurrentAttempt()) return
      setError('We could not sign you in. Please check your connection and try again.')
    } finally {
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      if (isCurrentAttempt()) setLoading(false)
    }
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
