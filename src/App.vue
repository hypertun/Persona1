<script setup>
import SiteNav from './components/SiteNav.vue'
import HeroSection from './components/HeroSection.vue'
import MetricsBar from './components/MetricsBar.vue'
import ServicesSection from './components/ServicesSection.vue'
import Portfolio from './components/Portfolio.vue'
import OpenSourceSection from './components/OpenSourceSection.vue'
import SkillsSection from './components/SkillsSection.vue'
import ContactForm from './components/ContactForm.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <div class="min-h-screen">
    <SiteNav />
    <main>
      <HeroSection />
      <MetricsBar />
      <ServicesSection />
      <Portfolio />
      <OpenSourceSection />
      <SkillsSection />
      <ContactForm />
    </main>
    <SiteFooter />
  </div>
</template>
