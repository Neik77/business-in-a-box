import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { context } = await req.json()
  
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: context }]
    })
  })
  
  const data = await res.json()
  const text = (data.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('') || 'Ask me again, CEO.'
  
  return NextResponse.json({ text })
}
