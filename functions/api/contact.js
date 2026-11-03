// Cloudflare Pages Function — POST /api/contact
//
// Receives the contact-form submission and forwards it to your inbox via
// Resend (https://resend.com). The Resend API key lives SERVER-SIDE as a
// Cloudflare environment variable — nothing sensitive is in the client bundle.
//
// Environment variables (Cloudflare dashboard → Pages project → Settings →
// Variables and Secrets, or .dev.vars for local `wrangler pages dev`):
//   RESEND_API_KEY  – required, secret (https://resend.com → API Keys)
//   CONTACT_EMAIL   – recipient inbox (defaults to the address baked into the site)
//   CONTACT_FROM    – verified sender, e.g. "IvanBuilds Site <noreply@ivanbuilds.dev>"
//                     (for local testing only: "IvanBuilds Site <onboarding@resend.dev>")

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Strip control chars (header-injection safety) and cap length.
function clean(value, maxLen = 500) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, maxLen)
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

export async function onRequestPost(context) {
  const { request, env } = context

  let data
  try {
    data = await request.json()
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400)
  }

  // Honeypot: bots auto-fill hidden "website" field — silently accept & drop.
  if (clean(data.website, 200)) {
    return json({ ok: true })
  }

  const name = clean(data.name, 100)
  const email = clean(data.email, 200)
  const inquiryType = clean(data.inquiry_type, 120)
  const message = clean(data.message, 5000)

  if (!name || !EMAIL_RE.test(email) || message.length < 20) {
    return json({ ok: false, error: 'validation_failed' }, 400)
  }

  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured')
    return json({ ok: false, error: 'relay_not_configured' }, 500)
  }

  const to = env.CONTACT_EMAIL || 'hvaneyeochonghan@gmail.com'
  const from = env.CONTACT_FROM || 'IvanBuilds Site <onboarding@resend.dev>'

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: email,
      subject: `[Consulting inquiry] ${inquiryType || 'General'} — from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nInquiry: ${inquiryType}\n\n${message}`
    })
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('Contact relay failed:', res.status, detail)
    return json({ ok: false, error: 'relay_failed' }, 502)
  }

  return json({ ok: true })
}
