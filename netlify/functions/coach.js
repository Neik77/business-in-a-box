const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ text: 'Method not allowed' }) }
  }

  try {
    const { context: prompt } = JSON.parse(event.body || '{}')
    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return { statusCode: 200, headers, body: JSON.stringify({ text: 'API key not configured' }) }
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
        messages: [{ role: 'user', content: prompt }]
      })
    })

    const data = await res.json()

    if (data.error) {
      return { statusCode: 200, headers, body: JSON.stringify({ text: 'Coach error: ' + data.error.message }) }
    }

    const text = (data.content || [])
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('') || 'Ask me again, CEO.'

    return { statusCode: 200, headers, body: JSON.stringify({ text }) }
  } catch (e) {
    return { statusCode: 200, headers, body: JSON.stringify({ text: 'Error: ' + e.message }) }
  }
}
