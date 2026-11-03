// SSR integration test: ContactForm in Cloudflare "api" mode
// (VITE_CONTACT_API=/api/contact) — mocks fetch to assert the POST payload.
import assert from 'node:assert/strict'

// Set env BEFORE the Vite server compiles the component (import.meta.env injection)
process.env.VITE_CONTACT_API = '/api/contact'
process.env.VITE_CONTACT_EMAIL = 'hvaneyeochonghan@gmail.com'
delete process.env.VITE_FORMSPREE_ENDPOINT
delete process.env.VITE_EMAILJS_SERVICE_ID
delete process.env.VITE_EMAILJS_TEMPLATE_ID
delete process.env.VITE_EMAILJS_PUBLIC_KEY

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
await renderToString(app)
const s = instance.$.setupState

const results = []
const test = (name, fn) =>
  fn().then(() => results.push(`✅ ${name}`)).catch((e) => {
    results.push(`❌ ${name} — ${e.message}`)
    process.exitCode = 1
  })

// 1. Mode detection
await test('mode is "api" when VITE_CONTACT_API is set', async () => {
  assert.equal(s.mode, 'api')
  assert.equal(s.submitLabel, 'Send inquiry')
})

// 2. Placeholder values ignored — api endpoint of "xxxxxxxx" must not activate api mode
// (regression: a leftover .env.example value must never activate a mode)
await test('placeholder VITE_CONTACT_API (xxxxxxxx) falls back to mailto', async () => {
  assert.equal(typeof s.submit, 'function')
  process.env.VITE_CONTACT_API = 'https://api.xxxxxxxxxxxxxxxx'
  const server2 = await createServer({
    root: process.cwd(), server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent'
  })
  const mod2 = await server2.ssrLoadModule('/src/components/ContactForm.vue')
  let inst2 = null
  const app2 = Vue.createApp({ render: () => Vue.h(mod2.default ?? mod2) })
  app2.mixin({ created() { if (this.$options.__name === 'ContactForm') inst2 = this } })
  await renderToString(app2)
  assert.equal(inst2.$.setupState.mode, 'mailto', 'placeholder endpoint must not activate api mode')
  assert.equal(inst2.$.setupState.submitLabel, 'Open email draft')
  await server2.close()
  process.env.VITE_CONTACT_API = '/api/contact'
})

// 3. Valid submit → POSTs JSON to the endpoint with honeypot field
let captured = []
const realFetch = globalThis.fetch
globalThis.fetch = async (url, init) => {
  captured.push({ url: String(url), init })
  return new Response(JSON.stringify({ ok: true }), { status: 200 })
}
s.form.name = 'Jane Tan'
s.form.email = 'jane@acme.com'
s.form.type = 'Cloud architecture review'
s.form.message = 'We need a review of our AWS architecture and a modernization roadmap.'
await s.submit()
await new Promise((r) => setTimeout(r, 10))

await test('submit POSTs to VITE_CONTACT_API with full payload + honeypot', async () => {
  assert.equal(captured.length, 1)
  assert.equal(captured[0].url, '/api/contact')
  assert.equal(captured[0].init.method, 'POST')
  const payload = JSON.parse(captured[0].init.body)
  assert.equal(payload.name, 'Jane Tan')
  assert.equal(payload.email, 'jane@acme.com')
  assert.equal(payload.inquiry_type, 'Cloud architecture review')
  assert.equal(typeof payload.website, 'string', 'honeypot field must be sent')
})

// 4. Success state + form reset
await test('success state set and form reset after api send', async () => {
  assert.equal(s.status, 'success')
  assert.equal(s.form.name, '')
  assert.equal(s.form.message, '')
  assert.equal(s.form.website, '')
})

// 5. Relay failure (502) → error state with direct email fallback text
captured = []
globalThis.fetch = async () => new Response('upstream', { status: 502 })
s.form.name = 'Jane Tan'
s.form.email = 'jane@acme.com'
s.form.message = 'Another valid inquiry message over twenty characters long.'
await s.submit()
await new Promise((r) => setTimeout(r, 10))
await test('api 502 → error banner with direct email address', async () => {
  assert.equal(s.status, 'error')
  assert.ok(s.errorMsg.includes('hvaneyeochonghan@gmail.com'))
})

// 6. Validation still blocks short messages client-side (no fetch)
captured = []
s.form.name = 'Jane'
s.form.email = 'jane@acme.com'
s.form.message = 'short'
await s.submit()
await new Promise((r) => setTimeout(r, 10))
await test('client validation blocks short message — no POST sent', async () => {
  assert.equal(s.status, 'error') // still in error state from before — but crucially:
  assert.equal(captured.length, 0, 'must not POST an invalid form')
})

globalThis.fetch = realFetch
await server.close()

console.log(results.join('\n'))
console.log(`\n${process.exitCode ? 'FAILED' : 'PASSED'}: ${results.filter((r) => r.startsWith('✅')).length}/${results.length} api-mode tests`)
