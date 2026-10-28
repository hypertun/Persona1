<script setup>
import SectionHeading from './SectionHeading.vue'
import Icon from './Icon.vue'
import { services } from '../data/site.js'
</script>

<template>
  <section id="services" class="scroll-mt-24 py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Consulting services"
        title="What I deliver"
        lead="Hands-on senior engineering, not decks. Every engagement maps to a track record you can verify in the case studies below."
      />

      <div class="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(s, i) in services"
          :key="s.title"
          class="panel panel-hover p-6"
          :class="i === services.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''"
        >
          <div
            class="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 ring-1 ring-cyan-400/30"
          >
            <Icon :name="s.icon" class="h-5 w-5 text-cyan-300" />
          </div>
          <h3 class="mt-5 font-display text-lg font-semibold text-slate-100">{{ s.title }}</h3>
          <p class="mt-3 text-sm leading-relaxed text-slate-400">{{ s.description }}</p>
          <div class="mt-5 flex flex-wrap gap-2">
            <span
              v-for="t in s.tags"
              :key="t"
              class="rounded-full bg-slate-800/60 px-2.5 py-1 font-mono text-[11px] text-slate-300 ring-1 ring-slate-700"
            >
              {{ t }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
