// Unit tests for functions/api/contact.js (Cloudflare Pages Function)
// Runs on plain Node (18+) — Request/Response/fetch are Web-standard globals.
// The Telegram API call is mocked to assert the exact delivered payload.
import assert from 'node:assert/strict'

const { onRequestPost } = await import('../functions/api/contact.js')

const ENV = {
  NOTIFY_TELEGRAM_TOKEN: 'tg-token',
  NOTIFY_TELEGRAM_CHAT_ID: '12345'
}

let fetchCalls = []
const realFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  fetchCalls.push({ url: String(url), init })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
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

const lastCall = () => fetchCalls[fetchCalls.length - 1]
const allPayloads = () => fetchCalls.map((c) => JSON.parse(c.init.body))

// 1. Valid submission → 200 + one Telegram message with full inquiry
await test('valid submission delivers one Telegram message with the full inquiry', async () => {
  fetchCalls = []
  const res = await post(valid)
  assert.equal(res.status, 200)
  assert.equal((await res.json()).ok, true)
  assert.equal(fetchCalls.length, 1)

  const call = fetchCalls[0]
  assert.equal(call.url, 'https://api.telegram.org/bottg-token/sendMessage')
  const payload = JSON.parse(call.init.body)
  assert.equal(payload.chat_id, '12345')
  assert.equal(payload.parse_mode, 'HTML')
  assert.match(payload.text, /📩 <b>New inquiry — IvanBuilds<\/b>/)
  assert.match(payload.text, /<b>From:<\/b> Jane Tan &lt;jane@acme\.com&gt;/)
  assert.match(payload.text, /<b>Inquiry:<\/b> Full-stack build/)
  assert.match(payload.text, /architecture review of our Golang order platform/)
  assert.match(payload.text, /<a href="mailto:jane%40acme\.com\?subject=Re%3A%20your%20inquiry%20%E2%80%94%20IvanBuilds">Reply to Jane Tan<\/a>/)
})

// 2. Honeypot filled → fake success, nothing delivered
await test('honeypot (website field) silently accepts and drops', async () => {
  fetchCalls = []
  const res = await post({ ...valid, website: 'http://spam.example' })
  assert.equal(res.status, 200)
  assert.equal((await res.json()).ok, true)
  assert.equal(fetchCalls.length, 0, 'bot submission must not ping Telegram')
})

// 3. Long message → chunked delivery, reply link on the last chunk
await test('5000-char message → chunked delivery with reply link on last chunk', async () => {
  fetchCalls = []
  // '§' appears nowhere in the header/footer boilerplate, so the count is exact
  const long = { ...valid, message: 'x'.repeat(40) + ' Detailed requirement. ' + '§'.repeat(4900) }
  const res = await post(long)
  assert.equal(res.status, 200)
  assert.ok(fetchCalls.length >= 2, `expected ≥2 messages, got ${fetchCalls.length}`)

  const payloads = allPayloads()
  assert.ok(!payloads[0].text.includes('Reply to'), 'first chunk has no reply link')
  assert.match(payloads[payloads.length - 1].text, /Reply to Jane Tan/)
  const totalMarks = payloads.reduce((n, p) => n + (p.text.match(/§/g) || []).length, 0)
  assert.equal(totalMarks, 4900, 'no content lost across chunks')
  for (const p of payloads) assert.ok(p.text.length <= 4096, 'every message within Telegram limit')
})

// 4–7. Validation rejections
await test('invalid JSON body → 400 invalid_json', async () => {
  const res = await post('not-json{')
  assert.equal(res.status, 400)
  assert.equal((await res.json()).error, 'invalid_json')
})

await test('missing name → 400 validation_failed', async () => {
  fetchCalls = []
  const res = await post({ ...valid, name: '' })
  assert.equal(res.status, 400)
  assert.equal((await res.json()).error, 'validation_failed')
  assert.equal(fetchCalls.length, 0)
})

await test('bad email → 400 validation_failed', async () => {
  fetchCalls = []
  const res = await post({ ...valid, email: 'not-an-email' })
  assert.equal(res.status, 400)
  assert.equal(fetchCalls.length, 0)
})

await test('message under 20 chars → 400 validation_failed', async () => {
  fetchCalls = []
  const res = await post({ ...valid, message: 'too short' })
  assert.equal(res.status, 400)
  assert.equal(fetchCalls.length, 0)
})

// 8. HTML injection in visitor input is escaped (parse_mode HTML safety)
await test('visitor-supplied HTML is escaped before parse_mode=HTML delivery', async () => {
  fetchCalls = []
  await post({ ...valid, name: '<b>Jane</b>', message: 'Rate: 5 < 10 && fine, details follow here.' })
  const payload = JSON.parse(lastCall().init.body)
  assert.ok(!payload.text.includes('<b>Jane</b>'), 'raw tags must not survive')
  assert.match(payload.text, /&lt;b&gt;Jane&lt;\/b&gt;/)
  assert.match(payload.text, /5 &lt; 10 &amp;&amp; fine/)
})

// 9. No Telegram config → 500 relay_not_configured
await test('no NOTIFY_TELEGRAM_* secrets → 500 relay_not_configured', async () => {
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

// 10. Telegram outage → 502 relay_failed (the ONLY path, so failure must surface)
await test('Telegram 503 → 502 relay_failed', async () => {
  globalThis.fetch = async () => new Response('overloaded', { status: 503 })
  const res = await post(valid)
  assert.equal(res.status, 502)
  assert.equal((await res.json()).error, 'relay_failed')
  globalThis.fetch = realFetch
})

// 11. Second chunk failing → 502 (first chunk may have been delivered — acceptable)
await test('mid-delivery chunk failure → 502, no ok:true lie', async () => {
  fetchCalls = []
  let call = 0
  globalThis.fetch = async (url, init) => {
    call++
    fetchCalls.push({ url: String(url), init })
    return call === 1
      ? new Response('{}', { status: 200 })
      : new Response('err', { status: 500 })
  }
  const long = { ...valid, message: 'z'.repeat(4200) }
  const res = await post(long)
  assert.equal(res.status, 502)
  globalThis.fetch = realFetch
})

globalThis.fetch = realFetch

console.log(results.join('\n'))
console.log(`\n${process.exitCode ? 'FAILED' : 'PASSED'}: ${results.filter((r) => r.startsWith('✅')).length}/${results.length} contact-function tests`)
