<script setup>
import { metrics } from '../data/site.js'
</script>

<template>
  <section class="border-y border-slate-800/60 bg-slate-900/40">
    <div class="mx-auto grid max-w-6xl grid-cols-2 gap-px px-4 sm:px-6 lg:grid-cols-4">
      <div v-for="m in metrics" :key="m.label" class="px-2 py-8 text-center sm:py-10">
        <p class="font-display text-4xl font-bold text-gradient sm:text-5xl">{{ m.value }}</p>
        <p class="mx-auto mt-2 max-w-[16rem] text-sm leading-snug text-slate-400">{{ m.label }}</p>
      </div>
    </div>
  </section>
</template>
