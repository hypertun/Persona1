<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'
import { profile } from '../data/site.js'

// The hero image is an AI-generated persona render (Google Imagen 3).
// Drop the generated portrait at public/images/avatar.jpg to replace the
// placeholder — see docs/04_GENERATION_PIPELINE.md for the generation script.
const base = import.meta.env.BASE_URL
const avatarSrc = ref(base + 'images/avatar.jpg')
const placeholderSrc = base + 'images/avatar-placeholder.svg'

function onAvatarError() {
  avatarSrc.value = placeholderSrc
}
</script>

<template>
  <section id="top" class="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24">
    <div class="grid-overlay absolute inset-0" aria-hidden="true"></div>

    <div class="relative mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr]">
      <!-- Copy -->
      <div>
        <p class="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
          {{ profile.role }} · {{ profile.location }}
        </p>
        <h1 class="mt-4 font-display text-4xl font-bold leading-tight text-slate-100 sm:text-6xl">
          Cloud-native systems.<br />
          <span class="text-gradient">Measurable results.</span>
        </h1>
        <p class="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
          I help teams ship scalable, high-performance software — from
          <span class="font-semibold text-slate-200">Golang backends</span> handling
          high-concurrency order flows to
          <span class="font-semibold text-slate-200">AWS &amp; GCP infrastructure</span>
          that scales with your business. 80% efficiency gains, not slideware.
        </p>

        <div class="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="#contact"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:brightness-110"
          >
            Book a free consultation
            <Icon name="arrow-right" class="h-4 w-4" />
          </a>
          <a
            href="#work"
            class="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-slate-200 ring-1 ring-slate-700 transition hover:ring-cyan-400/60"
          >
            View case studies
          </a>
        </div>

        <div class="mt-8 flex flex-wrap gap-2">
          <span
            v-for="tag in ['Golang', 'React / TypeScript', 'AWS', 'GCP', 'Kubernetes', 'Terraform']"
            :key="tag"
            class="rounded-full bg-slate-800/60 px-3 py-1 font-mono text-xs text-slate-300 ring-1 ring-slate-700"
          >
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Persona portrait -->
      <div class="relative mx-auto w-full max-w-sm">
        <div
          class="glow-ring absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-cyan-400/15 to-violet-500/15 blur-2xl"
          aria-hidden="true"
        ></div>
        <figure class="panel relative overflow-hidden rounded-3xl p-3">
          <img
            :src="avatarSrc"
            @error="onAvatarError"
            alt="AI-generated portrait of the IvanBuilds persona"
            class="aspect-[4/5] w-full rounded-2xl object-cover"
          />
          <figcaption
            class="absolute bottom-6 left-6 right-6 flex items-center justify-between gap-2 rounded-xl bg-slate-950/70 px-3 py-2 backdrop-blur"
          >
            <span class="font-display text-sm font-semibold text-slate-100">{{ profile.personaHandle }}</span>
            <span class="rounded-full bg-violet-500/20 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-violet-300 ring-1 ring-violet-400/40">
              AI presenter
            </span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
