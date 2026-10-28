<script setup>
defineProps({
  eyebrow: { type: String, required: true },
  title: { type: String, required: true },
  lead: { type: String, default: '' }
})
</script>

<template>
  <div class="mx-auto max-w-2xl text-center">
    <p class="font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">{{ eyebrow }}</p>
    <h2 class="mt-3 font-display text-3xl font-bold text-slate-100 sm:text-4xl">
      <slot>{{ title }}</slot>
    </h2>
    <p v-if="lead" class="mt-4 text-base leading-relaxed text-slate-400">{{ lead }}</p>
  </div>
</template>
