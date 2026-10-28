<script setup>
import Icon from './Icon.vue'
import { profile, CONTACT_EMAIL, openSource } from '../data/site.js'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-slate-800/60 bg-slate-950/80 py-12">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <div class="grid gap-10 md:grid-cols-3">
        <!-- Brand -->
        <div>
          <a href="#top" class="flex items-center gap-2">
            <span
              class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 font-display text-sm font-bold text-slate-950"
            >
              IB
            </span>
            <span class="font-display text-lg font-semibold text-slate-100">
              Ivan<span class="text-cyan-400">Builds</span>
            </span>
          </a>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            {{ profile.role }} in {{ profile.location }}. Scalable, cloud-native systems —
            engineered velocity, measured results.
          </p>
        </div>

        <!-- Site -->
        <div>
          <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Site</h3>
          <ul class="mt-4 space-y-2 text-sm text-slate-400">
            <li><a href="#services" class="hover:text-cyan-300">Services</a></li>
            <li><a href="#work" class="hover:text-cyan-300">Case studies</a></li>
            <li><a href="#open-source" class="hover:text-cyan-300">Open source</a></li>
            <li><a href="#skills" class="hover:text-cyan-300">Skills</a></li>
            <li><a href="#contact" class="hover:text-cyan-300">Contact</a></li>
          </ul>
        </div>

        <!-- Links -->
        <div>
          <h3 class="font-mono text-xs uppercase tracking-[0.2em] text-slate-400">Elsewhere</h3>
          <ul class="mt-4 space-y-2 text-sm text-slate-400">
            <li v-for="o in openSource" :key="o.name">
              <a :href="o.url" target="_blank" rel="noopener" class="inline-flex items-center gap-2 hover:text-cyan-300">
                <Icon name="github" class="h-4 w-4" /> {{ o.name }}
              </a>
            </li>
            <li>
              <a :href="`mailto:${CONTACT_EMAIL}`" class="inline-flex items-center gap-2 hover:text-cyan-300">
                <Icon name="mail" class="h-4 w-4" /> {{ CONTACT_EMAIL }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 flex flex-col gap-2 border-t border-slate-800/60 pt-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {{ year }} Ivan Yeo. All projects and metrics reflect real professional experience.</p>
        <p>
          Site presented by an AI-generated persona
          <span class="text-slate-700">·</span> visuals via Google Imagen 3
        </p>
      </div>
    </div>
  </footer>
</template>
