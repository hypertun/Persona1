<script setup>
import { reactive, ref, computed } from 'vue'
import SectionHeading from './SectionHeading.vue'
import Icon from './Icon.vue'
import { inquiryTypes, CONTACT_EMAIL } from '../data/site.js'

/**
 * Inquiry delivery — the single path: POST to the Cloudflare Pages Function
 * (functions/api/contact.js), which sends the inquiry as a Telegram message
 * to the site owner's phone. No email is sent by this site, ever.
 *
 * There is no configuration flag: if the function or its Telegram secrets
 * are missing (e.g. plain `npm run dev` without wrangler), the submit shows
 * the honest error banner with the owner's direct email as the manual path.
 */
const CONTACT_API = '/api/contact'

const form = reactive({
  name: '',
  email: '',
  type: inquiryTypes[0],
  message: '',
  website: '' // honeypot — real users never fill this
})

const touched = reactive({ name: false, email: false, message: false })
const status = ref('idle') // idle | sending | success | error
const errorMsg = ref('')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const errors = computed(() => ({
  name: !form.name.trim() ? 'Please tell me your name.' : '',
  email: !EMAIL_RE.test(form.email) ? 'Please enter a valid email address.' : '',
  message: form.message.trim().length < 20
    ? 'Tell me a little more — at least 20 characters.'
    : ''
}))
const valid = computed(() => !errors.value.name && !errors.value.email && !errors.value.message)

async function submit() {
  touched.name = touched.email = touched.message = true
  if (!valid.value) return

  status.value = 'sending'
  errorMsg.value = ''

  try {
    const res = await fetch(CONTACT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        inquiry_type: form.type,
        message: form.message,
        website: form.website
      })
    })
    if (!res.ok) throw new Error(`Contact API responded ${res.status}`)

    status.value = 'success'
    form.name = ''
    form.email = ''
    form.type = inquiryTypes[0]
    form.message = ''
    form.website = ''
    touched.name = touched.email = touched.message = false
  } catch (e) {
    status.value = 'error'
    errorMsg.value =
      'Something went wrong delivering your message. Please retry, or email me directly at ' +
      CONTACT_EMAIL + '.'
    console.error('[ContactForm]', e)
  }
}
</script>

<template>
  <section id="contact" class="scroll-mt-24 py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Get in touch"
        title="Let's ship something"
        lead="Tell me about your system, your bottleneck, or your roadmap. I reply to every serious inquiry within one business day."
      />

      <div class="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <!-- Left: pitch -->
        <div class="space-y-6">
          <div class="panel p-6">
            <Icon name="quote" class="h-6 w-6 text-cyan-400" />
            <p class="mt-4 text-sm leading-relaxed text-slate-300">
              Whether it's a greenfield build, a legacy system that's buckling under load, or a QA
              process eating your sprint — I'll audit where you are, design where you need to be,
              and build it with your team.
            </p>
          </div>

          <div class="panel space-y-4 p-6">
            <div class="flex items-center gap-3">
              <Icon name="mail" class="h-5 w-5 text-cyan-300" />
              <span class="text-sm text-slate-300">Or email me directly:</span>
              <a :href="`mailto:${CONTACT_EMAIL}`" class="font-mono text-sm text-cyan-300 hover:underline">
                {{ CONTACT_EMAIL }}
              </a>
            </div>
            <p class="text-xs leading-relaxed text-slate-500">
              Based in Singapore · Working with teams worldwide · Free 30-minute scoping call
            </p>
          </div>
        </div>

        <!-- Right: form -->
        <form
          class="panel space-y-5 p-6 sm:p-8"
          novalidate
          @submit.prevent="submit"
        >
          <div class="grid gap-5 sm:grid-cols-2">
            <div>
              <label for="cf-name" class="mb-1.5 block text-sm font-medium text-slate-300">Name *</label>
              <input
                id="cf-name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                placeholder="Jane Tan"
                class="w-full rounded-xl border-0 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 ring-1 ring-slate-700 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
              />
              <p v-if="touched.name && errors.name" class="mt-1.5 text-xs text-rose-400">{{ errors.name }}</p>
            </div>
            <div>
              <label for="cf-email" class="mb-1.5 block text-sm font-medium text-slate-300">Email *</label>
              <input
                id="cf-email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="jane@company.com"
                class="w-full rounded-xl border-0 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 ring-1 ring-slate-700 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
              />
              <p v-if="touched.email && errors.email" class="mt-1.5 text-xs text-rose-400">{{ errors.email }}</p>
            </div>
          </div>

          <div>
            <label for="cf-type" class="mb-1.5 block text-sm font-medium text-slate-300">What do you need?</label>
            <select
              id="cf-type"
              v-model="form.type"
              class="w-full rounded-xl border-0 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 ring-1 ring-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
            >
              <option v-for="t in inquiryTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div>
            <label for="cf-message" class="mb-1.5 block text-sm font-medium text-slate-300">Inquiry *</label>
            <textarea
              id="cf-message"
              v-model="form.message"
              rows="5"
              placeholder="We run an order management platform on Golang and Postgres, and our posting pipeline to SAP is manual. We'd like an architecture review and a modernization plan…"
              class="w-full resize-y rounded-xl border-0 bg-slate-950/60 px-4 py-2.5 text-sm leading-relaxed text-slate-100 ring-1 ring-slate-700 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
            ></textarea>
            <p v-if="touched.message && errors.message" class="mt-1.5 text-xs text-rose-400">{{ errors.message }}</p>
          </div>

          <input
            type="text"
            v-model="form.website"
            name="website"
            class="hidden"
            tabindex="-1"
            autocomplete="off"
            aria-hidden="true"
          />
          <button
            type="submit"
            :disabled="status === 'sending'"
            class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <template v-if="status === 'sending'">Sending…</template>
            <template v-else>
              Send inquiry
              <Icon name="arrow-right" class="h-4 w-4" />
            </template>
          </button>

          <!-- Status banners -->
          <div
            v-if="status === 'success'"
            class="flex items-start gap-3 rounded-xl bg-emerald-400/10 p-4 text-sm text-emerald-300 ring-1 ring-emerald-400/30"
          >
            <Icon name="check" class="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              <strong>Message sent.</strong> Thanks for reaching out — I'll get back to you within
              one business day.
            </span>
          </div>
          <div
            v-if="status === 'error'"
            class="flex items-start gap-3 rounded-xl bg-rose-400/10 p-4 text-sm text-rose-300 ring-1 ring-rose-400/30"
          >
            <Icon name="x" class="mt-0.5 h-4 w-4 shrink-0" />
            <span>{{ errorMsg }}</span>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>
