<script setup>
import { ref } from 'vue'
import Icon from './Icon.vue'

const links = [
  { href: '#services', label: 'Services' },
  { href: '#work', label: 'Work' },
  { href: '#open-source', label: 'Open Source' },
  { href: '#skills', label: 'Skills' }
]
const open = ref(false)
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
    <nav class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
      <a href="#top" class="flex items-center gap-2">
        <span
          class="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-violet-500 font-display text-sm font-bold text-slate-950"
        >
          IB
        </span>
        <span class="font-display text-lg font-semibold tracking-tight text-slate-100">
          Ivan<span class="text-cyan-400">Builds</span>
        </span>
      </a>

      <!-- Desktop links -->
      <div class="hidden items-center gap-7 md:flex">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          class="text-sm font-medium text-slate-300 transition hover:text-cyan-300"
        >
          {{ l.label }}
        </a>
        <a
          href="#contact"
          class="rounded-lg bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300 ring-1 ring-cyan-400/40 transition hover:bg-cyan-400/20"
        >
          Book a free consultation
        </a>
      </div>

      <!-- Mobile toggle -->
      <button
        class="grid h-10 w-10 place-items-center rounded-lg text-slate-300 ring-1 ring-slate-700 md:hidden"
        @click="open = !open"
        :aria-expanded="open"
        aria-label="Toggle menu"
      >
        <Icon :name="open ? 'x' : 'menu'" class="h-5 w-5" />
      </button>
    </nav>

    <!-- Mobile menu -->
    <div v-if="open" class="border-t border-slate-800/60 bg-slate-950/95 px-4 py-4 md:hidden">
      <div class="flex flex-col gap-1">
        <a
          v-for="l in links"
          :key="l.href"
          :href="l.href"
          class="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800/60"
          @click="open = false"
        >
          {{ l.label }}
        </a>
        <a
          href="#contact"
          class="mt-2 rounded-lg bg-cyan-400/10 px-3 py-2 text-center text-sm font-semibold text-cyan-300 ring-1 ring-cyan-400/40"
          @click="open = false"
        >
          Book a free consultation
        </a>
      </div>
    </div>
  </header>
</template>
