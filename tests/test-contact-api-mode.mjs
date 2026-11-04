// SSR integration test: ContactForm — single delivery path (/api/contact →
// Cloudflare Function → Telegram). No email, no fallback modes, no flags:
// the form always POSTs to /api/contact and surfaces an honest error banner
// (with the owner's direct email) when the function is unreachable.
import assert from 'node:assert/strict'

const { createServer } = await import('vite')

const server = await createServer({
  root: process.cwd(),
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'silent'
})

let instance = null
const { renderToString } = await import('vue/server-renderer')
const Vue = await import('vue')
const mod = await server.ssrLoadModule('/src/components/ContactForm.vue')
const ContactForm = mod.default ?? mod
const app = Vue.createApp({
  render: () => Vue.h(ContactForm)
})
app.mixin({
  created() {
    if (this.$options.__name === 'ContactForm') instance = this
  }
})
const html = await renderToString(app)
const s = instance.$.setupState

const results = []
const test = (name, fn) =>
  fn().then(() => results.push(`✅ ${name}`)).catch((e) => {
    results.push(`❌ ${name} — ${e.message}`)
    process.exitCode = 1
  })

// 1. Rendered form: single path — "Send inquiry" button, no mailto-draft copy
await test('renders the Telegram-path form (Send inquiry, no email-draft copy)', async () => {
  assert.ok(html.includes('Send inquiry'), 'button says Send inquiry')
  assert.ok(!html.includes('Open email draft'), 'no mailto-mode button label')
  assert.ok(!html.includes('email app has opened'), 'no mailto success copy')
})

// 2. Valid submit → POSTs JSON to /api/contact with honeypot field
let captured = []
const realFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  captured.push({ url: String(url), init })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
s.form.name = 'Jane Tan'
s.form.email = 'jane@acme.com'
s.form.type = 'Architecture & Modernization'
s.form.message = 'We need a review of our architecture and a modernization roadmap.'
await s.submit()
await new Promise((r) => setTimeout(r, 10))

await test('submit POSTs to /api/contact with full payload + honeypot', async () => {
  assert.equal(captured.length, 1)
  assert.equal(captured[0].url, '/api/contact')
  assert.equal(captured[0].init.method, 'POST')
  const payload = JSON.parse(captured[0].init.body)
  assert.equal(payload.name, 'Jane Tan')
  assert.equal(payload.email, 'jane@acme.com')
  assert.equal(payload.inquiry_type, 'Architecture & Modernization')
  assert.equal(typeof payload.website, 'string', 'honeypot field must be sent')
})

// 3. Success state + form reset
await test('success state set and form reset after send', async () => {
  assert.equal(s.status, 'success')
  assert.equal(s.form.name, '')
  assert.equal(s.form.message, '')
  assert.equal(s.form.website, '')
})

// 4. Function failure (502) → error banner with direct email as manual path
captured = []
globalThis.fetch = async () => new Response('upstream', { status: 502 })
s.form.name = 'Jane Tan'
s.form.email = 'jane@acme.com'
s.form.message = 'Another valid inquiry message over twenty characters long.'
await s.submit()
await new Promise((r) => setTimeout(r, 10))
await test('function 502 → error banner with direct email address', async () => {
  assert.equal(s.status, 'error')
  assert.ok(s.errorMsg.includes('hvaneyeochonghan@gmail.com'))
})

// 5. No function at all (plain local dev: 404) → same honest error, never a draft
captured = []
globalThis.fetch = async (url, init) => {
  captured.push({ url: String(url), init })
  return new Response('not found', { status: 404 })
}
s.form.name = 'Jane Tan'
s.form.email = 'jane@acme.com'
s.form.message = 'A third valid inquiry message over twenty characters long.'
await s.submit()
await new Promise((r) => setTimeout(r, 10))
await test('missing function (404) → error banner, no silent email fallback', async () => {
  assert.equal(s.status, 'error')
  assert.equal(captured.length, 1)
})

// 6. Validation still blocks short messages client-side (no POST)
captured = []
s.form.name = 'Jane'
s.form.email = 'jane@acme.com'
s.form.message = 'short'
await s.submit()
await new Promise((r) => setTimeout(r, 10))
await test('client validation blocks short message — no POST sent', async () => {
  assert.equal(captured.length, 0, 'must not POST an invalid form')
})

globalThis.fetch = realFetch
await server.close()

console.log(results.join('\n'))
console.log(`\n${process.exitCode ? 'FAILED' : 'PASSED'}: ${results.filter((r) => r.startsWith('✅')).length}/${results.length} contact-form tests`)
