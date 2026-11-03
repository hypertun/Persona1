// Unit tests for functions/api/contact.js (Cloudflare Pages Function)
// Runs on plain Node (18+) — Request/Response/fetch are Web-standard globals.
// The Resend HTTP call is mocked to assert the exact relayed payload.
import assert from 'node:assert/strict'

const { onRequestPost } = await import('../functions/api/contact.js')

const ENV = {
  RESEND_API_KEY: 're_test_key_123',
  CONTACT_EMAIL: 'hvaneyeochonghan@gmail.com',
  CONTACT_FROM: 'IvanBuilds Site <noreply@ivanbuilds.dev>'
}

let fetchCalls = []
const realFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  fetchCalls.push({ url: String(url), init })
  return new Response(JSON.stringify({ id: 'email-123' }), { status: 200 })
}

function post(body) {
  const request = new Request('https://ivanbuilds.pages.dev/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  })
  return onRequestPost({ request, env: { ...ENV } })
}

const valid = {
  name: 'Jane Tan',
  email: 'jane@acme.com',
  inquiry_type: 'Full-stack build',
  message: 'We need an architecture review of our Golang order platform. Budget approved.',
  website: ''
}

const results = []
const test = (name, fn) =>
  fn().then(() => results.push(`✅ ${name}`)).catch((e) => {
    results.push(`❌ ${name} — ${e.message}`)
    process.exitCode = 1
  })

// 1. Valid submission → 200 + correct Resend payload
await test('valid submission relays to Resend with correct payload', async () => {
  fetchCalls = []
  const res = await post(valid)
  assert.equal(res.status, 200)
  assert.equal((await res.json()).ok, true)
  assert.equal(fetchCalls.length, 1)

  const call = fetchCalls[0]
  assert.equal(call.url, 'https://api.resend.com/emails')
  assert.equal(call.init.headers.Authorization, 'Bearer re_test_key_123')

  const payload = JSON.parse(call.init.body)
  assert.equal(payload.to, 'hvaneyeochonghan@gmail.com')
  assert.equal(payload.from, 'IvanBuilds Site <noreply@ivanbuilds.dev>')
  assert.equal(payload.reply_to, 'jane@acme.com')
  assert.match(payload.subject, /^\[Consulting inquiry\] Full-stack build — from Jane Tan$/)
  assert.match(payload.text, /^Name: Jane Tan\nEmail: jane@acme\.com\nInquiry: Full-stack build\n\n/)
})

// 2. Honeypot filled → fake success, no relay
await test('honeypot (website field) silently accepts and drops', async () => {
  fetchCalls = []
  const res = await post({ ...valid, website: 'http://spam.example' })
  assert.equal(res.status, 200)
  assert.equal((await res.json()).ok, true)
  assert.equal(fetchCalls.length, 0)
})

// 3–6. Validation rejections
await test('invalid JSON body → 400 invalid_json', async () => {
  const res = await post('not-json{')
  assert.equal(res.status, 400)
  assert.equal((await res.json()).error, 'invalid_json')
})

await test('missing name → 400 validation_failed', async () => {
  const res = await post({ ...valid, name: '' })
  assert.equal(res.status, 400)
  assert.equal((await res.json()).error, 'validation_failed')
})

await test('bad email → 400 validation_failed', async () => {
  const res = await post({ ...valid, email: 'not-an-email' })
  assert.equal(res.status, 400)
  assert.equal((await res.json()).error, 'validation_failed')
})

await test('message under 20 chars → 400 validation_failed', async () => {
  const res = await post({ ...valid, message: 'too short' })
  assert.equal(res.status, 400)
  assert.equal((await res.json()).error, 'validation_failed')
})

// 7. Header-injection attempt is sanitized
await test('control chars (header injection) are stripped', async () => {
  fetchCalls = []
  const res = await post({ ...valid, name: 'Jane\r\nBcc: evil@attacker.com' })
  assert.equal(res.status, 200)
  const payload = JSON.parse(fetchCalls[0].init.body)
  assert.ok(!/[\r\n]/.test(payload.subject), 'subject must be single-line (no header injection)')
  assert.match(payload.subject, /Jane\s+Bcc: evil@attacker\.com/)
})

// 8. Missing API key → 500 relay_not_configured
await test('no RESEND_API_KEY → 500 relay_not_configured', async () => {
  fetchCalls = []
  const request = new Request('https://x.pages.dev/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(valid)
  })
  const res = await onRequestPost({ request, env: { CONTACT_EMAIL: 'a@b.co' } })
  assert.equal(res.status, 500)
  assert.equal((await res.json()).error, 'relay_not_configured')
  assert.equal(fetchCalls.length, 0)
})

// 9. Resend failure → 502 relay_failed
await test('Resend 500 → 502 relay_failed', async () => {
  globalThis.fetch = async () => new Response('boom', { status: 500 })
  const res = await post(valid)
  assert.equal(res.status, 502)
  assert.equal((await res.json()).error, 'relay_failed')
  globalThis.fetch = realFetch
})

// 10. Defaults without CONTACT_EMAIL/CONTACT_FROM env
await test('falls back to baked-in recipient/from defaults', async () => {
  fetchCalls = []
  globalThis.fetch = async (url, init) => {
    fetchCalls.push({ url: String(url), init })
    return new Response(JSON.stringify({ id: 'e' }), { status: 200 })
  }
  const request = new Request('https://x.pages.dev/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(valid)
  })
  const res = await onRequestPost({ request, env: { RESEND_API_KEY: 're_k' } })
  assert.equal(res.status, 200)
  const payload = JSON.parse(fetchCalls[0].init.body)
  assert.equal(payload.to, 'hvaneyeochonghan@gmail.com')
  assert.match(payload.from, /onboarding@resend\.dev/)
})

// 11. Transport selection: Gmail creds → SMTP path, Resend never called
//    (In Node, cloudflare:sockets doesn't exist, so the SMTP send fails — which
//    is exactly what lets us prove the SMTP branch was selected: 502 with zero
//    Resend calls. On Cloudflare the same path completes the real delivery.)
await test('GMAIL_* creds present → SMTP transport selected (not Resend)', async () => {
  fetchCalls = []
  globalThis.fetch = async () => {
    fetchCalls.push('resend-should-not-be-called')
    return new Response('{}', { status: 200 })
  }
  const request = new Request('https://x.pages.dev/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(valid)
  })
  const res = await onRequestPost({
    request,
    env: { GMAIL_USER: 'sender@gmail.com', GMAIL_APP_PASSWORD: 'abcd efgh ijkl mnop' }
  })
  assert.equal(res.status, 502, 'SMTP attempt fails in Node (no cloudflare:sockets)')
  assert.equal((await res.json()).error, 'relay_failed')
  assert.equal(fetchCalls.length, 0, 'must NOT call Resend when Gmail creds are set')
})

globalThis.fetch = realFetch

console.log(results.join('\n'))
console.log(`\n${process.exitCode ? 'FAILED' : 'PASSED'}: ${results.filter((r) => r.startsWith('✅')).length}/${results.length} contact-function tests`)
