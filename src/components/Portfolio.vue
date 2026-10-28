<script setup>
import SectionHeading from './SectionHeading.vue'
import Icon from './Icon.vue'
import { projects } from '../data/site.js'
</script>

<template>
  <section id="work" class="scroll-mt-24 border-t border-slate-800/60 bg-slate-900/20 py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Case studies"
        title="Work that shipped"
        lead="Projects and metrics drawn directly from Ivan's professional record — gaming, e-commerce, logistics, and manufacturing."
      />

      <div class="mt-14 space-y-6">
        <article
          v-for="p in projects"
          :key="p.id"
          class="panel panel-hover overflow-hidden p-6 sm:p-8"
        >
          <div class="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:gap-10">
            <!-- Main column -->
            <div>
              <div class="flex flex-wrap items-center gap-2 text-xs">
                <span class="rounded-full bg-cyan-400/10 px-3 py-1 font-mono uppercase tracking-wider text-cyan-300 ring-1 ring-cyan-400/30">
                  {{ p.category }}
                </span>
                <span class="text-slate-500">{{ p.period }} · {{ p.location }}</span>
              </div>

              <h3 class="mt-4 font-display text-xl font-bold text-slate-100 sm:text-2xl">
                {{ p.title }}
              </h3>
              <p class="mt-1 text-sm font-semibold text-cyan-300/90">
                {{ p.company }} — {{ p.role }}
              </p>
              <p class="mt-4 text-sm leading-relaxed text-slate-400">{{ p.summary }}</p>

              <ul class="mt-5 space-y-2.5">
                <li v-for="h in p.highlights" :key="h" class="flex gap-3 text-sm text-slate-300">
                  <Icon name="check" class="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                  <span>{{ h }}</span>
                </li>
              </ul>

              <div
                v-if="p.result"
                class="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/30"
              >
                <Icon name="bolt" class="h-4 w-4" />
                {{ p.result }}
              </div>
            </div>

            <!-- Side column -->
            <div class="rounded-2xl bg-slate-950/50 p-5 ring-1 ring-slate-800">
              <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Domain</p>
              <p class="mt-1 text-sm font-medium text-slate-300">{{ p.domain }}</p>

              <p class="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">Tech stack</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span
                  v-for="t in p.stack"
                  :key="t"
                  class="rounded-md bg-slate-800/70 px-2 py-1 font-mono text-[11px] text-slate-300 ring-1 ring-slate-700"
                >
                  {{ t }}
                </span>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>
