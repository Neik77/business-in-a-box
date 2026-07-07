import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  const body = await req.json()
  const { ownerName, businessName, businessType, businessStage, description, ninetyDayGoal, email, biggestChallenge } = body

  await resend.emails.send({
    from: 'Business in a Box <onboarding@resend.dev>',
    to: 'dsmultiservice1@gmail.com',
    subject: `New Client Intake: ${businessName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0C;color:#F4F1E8;padding:32px;border-radius:12px">
        <h1 style="color:#D4AF37;font-family:Georgia,serif">New Client Intake Filed</h1>
        <p style="color:#9B968A">A new client just established their headquarters.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:24px">
          <tr><td style="padding:10px;border-bottom:1px solid #333;color:#9B968A;width:40%">Owner Name</td><td style="padding:10px;border-bottom:1px solid #333">${ownerName}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #333;color:#9B968A">Business Name</td><td style="padding:10px;border-bottom:1px solid #333">${businessName}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #333;color:#9B968A">Email</td><td style="padding:10px;border-bottom:1px solid #333">${email}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #333;color:#9B968A">Business Type</td><td style="padding:10px;border-bottom:1px solid #333">${businessType}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #333;color:#9B968A">Business Stage</td><td style="padding:10px;border-bottom:1px solid #333">${businessStage}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #333;color:#9B968A">Description</td><td style="padding:10px;border-bottom:1px solid #333">${description}</td></tr>
          <tr><td style="padding:10px;border-bottom:1px solid #333;color:#9B968A">Biggest Challenge</td><td style="padding:10px;border-bottom:1px solid #333">${biggestChallenge}</td></tr>
          <tr><td style="padding:10px;color:#9B968A">90-Day Goal</td><td style="padding:10px">${ninetyDayGoal}</td></tr>
        </table>
        <p style="margin-top:32px;color:#9B968A;font-size:12px">Business in a Box™ | Built by Coach Neik™ | AI Legacy Lounge™</p>
      </div>
    `
  })

  return NextResponse.json({ success: true })
}
