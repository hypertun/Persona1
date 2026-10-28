<script setup>
import SectionHeading from './SectionHeading.vue'
import Icon from './Icon.vue'
import { openSource } from '../data/site.js'
</script>

<template>
  <section id="open-source" class="scroll-mt-24 py-20 sm:py-28">
    <div class="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Open source"
        title="Tools I build in public"
        lead="Side projects that show how I work — LLM middleware, natural-language data tooling, and SEO utilities."
      />

      <div class="mt-14 grid gap-5 md:grid-cols-3">
        <a
          v-for="o in openSource"
          :key="o.name"
          :href="o.url"
          target="_blank"
          rel="noopener"
          class="panel panel-hover group p-6"
        >
          <div class="flex items-center justify-between">
            <h3 class="font-display text-lg font-semibold text-slate-100 group-hover:text-cyan-300">
              {{ o.name }}
            </h3>
            <Icon name="external-link" class="h-4 w-4 text-slate-500 group-hover:text-cyan-400" />
          </div>
          <p class="mt-3 text-sm leading-relaxed text-slate-400">{{ o.description }}</p>
          <p class="mt-4 truncate font-mono text-xs text-slate-500">{{ o.url }}</p>
        </a>
      </div>
    </div>
  </section>
</template>
