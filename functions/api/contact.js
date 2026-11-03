// Cloudflare Pages Function — POST /api/contact
//
// Receives the contact-form submission and forwards it to your inbox.
// Two transports, auto-selected by the environment variables you set
// (Cloudflare dashboard → Settings → Variables & Secrets, or .dev.vars locally):
//
//   A) Gmail SMTP (preferred — zero new vendors, the epone-web pattern):
//        GMAIL_USER         – Gmail address that sends the mail
//        GMAIL_APP_PASSWORD – its app password (https://myaccount.google.com/apppasswords,
//                             same credential you use in epone-web/functions/.env)
//      → speaks SMTP directly to smtp.gmail.com:465 via cloudflare:sockets
//        (hand-rolled protocol — see smtp-gmail.js; nodemailer can't run on Workers)
//
//   B) Resend fallback (optional, https://resend.com — 3000 emails/mo):
//        RESEND_API_KEY     – server-side secret
//      → simple HTTPS relay
//
//   Optional either way:
//        CONTACT_EMAIL – recipient inbox (defaults to the address baked into the site)

import { buildMessage, smtpDialog } from './smtp-gmail.js'

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

  const to = env.CONTACT_EMAIL || 'hvaneyeochonghan@gmail.com'

  // ── Transport selection ──────────────────────────────────────────────
  const gmailUser = env.GMAIL_USER || ''
  const gmailPass = env.GMAIL_APP_PASSWORD || ''

  if (gmailUser && gmailPass) {
    try {
      await sendViaGmail({ user: gmailUser, pass: gmailPass, to, name, email, inquiryType, message })
      return json({ ok: true })
    } catch (e) {
      console.error('Gmail SMTP relay failed:', e?.message)
      return json({ ok: false, error: 'relay_failed' }, 502)
    }
  }

  if (!env.RESEND_API_KEY) {
    console.error('No email transport configured (GMAIL_USER/GMAIL_APP_PASSWORD or RESEND_API_KEY)')
    return json({ ok: false, error: 'relay_not_configured' }, 500)
  }

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

// ── Transport A: Gmail SMTP via cloudflare:sockets ───────────────────────
// (The dynamic import keeps Node unit tests importable — cloudflare:sockets
//  only exists in the Workers runtime.)
async function sendViaGmail({ user, pass, to, name, email, inquiryType, message }) {
  const { connect } = await import('cloudflare:sockets')
  const socket = connect('smtp.gmail.com:465', { secureTransport: 'on' })

  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  const writer = socket.writable.getWriter()
  const reader = socket.readable.getReader()
  let buffer = ''

  const io = {
    async readLine() {
      let idx
      while ((idx = buffer.indexOf('\n')) === -1) {
        const { value, done } = await reader.read()
        if (done) throw new Error('SMTP connection closed unexpectedly')
        buffer += decoder.decode(value, { stream: true })
      }
      const line = buffer.slice(0, idx)
      buffer = buffer.slice(idx + 1)
      return line.replace(/\r$/, '')
    },
    async write(s) {
      await writer.write(encoder.encode(s))
    }
  }

  try {
    await smtpDialog(io, {
      user,
      pass,
      to,
      message: buildMessage({
        from: user, // Gmail rewrites this to the authenticated account anyway
        to,
        replyTo: email,
        subject: `[Consulting inquiry] ${inquiryType || 'General'} — from ${name}`,
        body: `Name: ${name}\nEmail: ${email}\nInquiry: ${inquiryType}\n\n${message}`
      })
    })
  } finally {
    try { await writer.close() } catch { /* socket may already be closed */ }
    try { socket.close() } catch { /* idem */ }
  }
}
