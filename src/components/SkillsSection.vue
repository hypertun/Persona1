<script setup>
import SectionHeading from './SectionHeading.vue'
import { skillGroups, profile } from '../data/site.js'
</script>

<template>
  <section id="skills" class="scroll-mt-24 border-t border-slate-800/60 bg-slate-900/20 py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Capabilities"
        title="The full toolbox"
        lead="Languages, clouds, data streams and methodologies — the stack behind every case study on this page."
      />

      <div class="mt-14 grid gap-5 md:grid-cols-2">
        <div v-for="g in skillGroups" :key="g.title" class="panel p-6">
          <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">{{ g.title }}</h3>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="s in g.skills"
              :key="s"
              class="rounded-md bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 ring-1 ring-slate-700"
            >
              {{ s }}
            </span>
          </div>
        </div>
      </div>

      <!-- Credentials -->
      <div class="mt-8 grid gap-5 lg:grid-cols-2">
        <div class="panel p-6">
          <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">Certifications</h3>
          <ul class="mt-4 space-y-2">
            <li v-for="c in profile.certifications" :key="c" class="flex gap-3 text-sm text-slate-300">
              <span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"></span>
              {{ c }}
            </li>
          </ul>
        </div>
        <div class="panel p-6">
          <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-cyan-400">Education</h3>
          <p class="mt-4 text-sm leading-relaxed text-slate-300">{{ profile.education }}</p>
          <p class="mt-4 text-sm leading-relaxed text-slate-400">{{ profile.inProgress }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
