import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { context } = await req.json()
    
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ text: 'API key missing', error: 'no key' })
    }
    
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: context }]
      })
    })
    
    const data = await res.json()
    
    if (data.error) {
      return NextResponse.json({ text: 'Coach error: ' + data.error.message, error: data.error })
    }
    
    const text = (data.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') || 'Ask me again, CEO.'
    
    return NextResponse.json({ text })
  } catch (e: any) {
    return NextResponse.json({ text: 'Error: ' + e.message, error: e.message })
  }
}
