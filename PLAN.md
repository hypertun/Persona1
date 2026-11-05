# IvanBuilds — Project Plan & Status Tracker

> Status legend: ✅ done by the build agent · ⬜ **your** next actions
> Last updated: 2026-10-28 · Commit: `feat: IvanBuilds — AI influencer brand + Vue 3 consulting portfolio`

---

## Phase 1 — Data Extraction & Persona Development · ✅ COMPLETE

- [x] Extract all technical expertise, projects, and metrics from **"48451 – Senior Consultant Developer – Ivan Yeo.docx.pdf"** (3 pages, 5 roles, 3 open-source projects, 8 skill groups, 5+ certs)
- [x] Extract key consulting selling points — cloud architecture (AWS/GCP), high-performance Golang backends, React/TypeScript frontends, leadership & optimization metrics (80% efficiency gain, 60% test-cycle reduction, 100% data integrity)
- [x] Define AI persona — name/handle options generated with recommendation: **"Ivan" digital twin, `@IvanBuilds`** (alternatives: `@neo.builds`, `@atlas.codes`) → `docs/01_AI_PERSONA.md`
- [x] Visual prompt blueprint for Google Imagen 3 — master identity prompt, negative prompt, consistency protocol (fixed seed + reference-image editing), output matrix per platform → `docs/01_AI_PERSONA.md` §2
- [x] Voice/tone definition — authoritative, highly technical yet accessible, results-oriented; 5 voice rules + sample lines + brand kit → `docs/01_AI_PERSONA.md` §3
- [x] AI-presenter disclosure policy (site badge + platform labels + video watermark)

## Phase 2 — Web Development (Vue.js) · ✅ COMPLETE

- [x] Scaffold Vue 3 project with Vite (`package.json`, `vite.config.js`, Tailwind CSS 4 via `@tailwindcss/vite`)
- [x] `HeroSection.vue` — AI-influencer portrait slot (Imagen 3 render + SVG placeholder fallback), value proposition from the résumé, CTAs
- [x] `Portfolio.vue` — all 5 résumé projects mapped with roles, periods, highlights, tech stacks, and result badges (Happy Hour Games, NTUC NE Digital, Shopee, EP One, Infineon)
- [x] `ContactForm.vue` — Name / Email / Inquiry type / Message with full client-side validation
- [x] Inquiry delivery — Cloudflare Worker (`src/worker.js` + `src/contact.js`): form → `/api/contact` → **Telegram message to your phone** (the only delivery path, no email fallback — if delivery is impossible the form shows an honest error banner); bot token + chat id stay server-side, honeypot + validation + HTML-escaping server-side
- [x] Extra sections for lead-gen: sticky nav, metrics bar, services, open source, skills/certs, footer
- [x] `deploy.yml` GitHub Action — `npm ci` → build with `BASE_PATH=/<repo>/` → publish `dist/` to the **`gh-pages`** branch
- [x] Client env wiring in CI workflow (optional secret overrides; defaults baked into `src/data/site.js`)
- [x] Production build verified (107 KB JS / 40 KB gzip) + SSR render smoke test + `BASE_PATH` build test

## Phase 3 — Content Generation Pipeline · ✅ DOCS & TOOLS COMPLETE · ⬜ MEDIA ASSETS PENDING

- [x] 30-day content calendar for TikTok / Reels / Shorts — 4 pillars (Architecture Tips, AI-Augmented Workflows, Engineering Velocity, Case Studies), day-by-day hooks, hashtag pools, batch plan, KPIs → `docs/02_CONTENT_STRATEGY.md`
- [x] First 5 fully-produced scripts (30–60 s, hook-driven, résumé-verified, with VO/onscreen/visual beats + fact-check columns) → `docs/03_VIDEO_SCRIPTS.md`
- [x] Gemini 1.5 Pro script-generation prompt (persona voice + résumé fact base + 5-beat structure) → `docs/04_GENERATION_PIPELINE.md` §2
- [x] Runnable pipeline scripts:
  - [x] `scripts/generate_script_gemini.sh` — Gemini scriptwriting
  - [x] `scripts/generate_voiceover_tts.sh` — Vertex AI TTS voiceover (persona voice `en-US-Neural2-J`)
  - [x] `scripts/generate_avatar_imagen3.sh` — Imagen 3 portrait + identity-preserving scene edits
- [x] Avatar lip-sync API payloads (HeyGen v2 + Synthesia) → `docs/04_GENERATION_PIPELINE.md` §5
- [x] Assembly & QA checklist (captions, AI-presenter watermark, 9:16 export, funnel test) → `docs/04_GENERATION_PIPELINE.md` §6–7
- [ ] ⬜ **Generate the actual media** — master Imagen 3 portrait, TTS voiceovers, HeyGen renders (needs your GCP credentials — see "Next actions" #5–#7)

## Phase 4 — Review & Handoff · ✅ COMPLETE

- [x] Verify all claims strictly match the résumé — **automated audit: 30/30 claims traced to the PDF** (metrics, roles, projects, stacks, certifications)
- [x] Test inquiry delivery — functional tests passing (mode detection, validation blocking, correct JSON payload POST, Telegram payload + chunking + escaping, success/error/reset states; error paths handled gracefully)
- [x] Finalized codebase, deployment instructions (`README.md`), and first 5 social scripts committed
- [x] Contact mode fallback set with real address baked in (`src/data/site.js`)

---

## ⬜ NEXT ACTIONS — for Ivan (in order)

### A. Launch the website (≈15 min — hosting choice)

**Recommended: Cloudflare Workers** — Workers with static assets is Cloudflare's current platform (Pages is in maintenance mode): free serverless function (`src/worker.js` → `src/contact.js`, built ✅) that delivers every contact-form submission to your phone as a **Telegram message** — the only delivery path. Two server-side secrets, nothing else; replies to leads are composed from Gmail via the tappable mailto link. Also: root-domain serving (no base-path config), preview URLs per branch, edge CDN with a Singapore PoP.

- [x] **1. Cloudflare deploy** — ✅ done: live at https://ivanbuilds.ivangemini930.workers.dev (Workers + static assets; build `npm run build`, deploy `npx wrangler deploy`)
- [x] **2. Funnel verified live** — ✅ production POST → `200 {"ok":true}` → Telegram ping delivered; still worth one manual browser-form pass (visitor UX: green banner → phone ping → tap "Reply to…")
- [ ] **3. (Alternative: GitHub Pages)** — works from the same repo via `deploy.yml` → `git push origin main` → repo **Settings → Pages → Source: `gh-pages` branch** → live at `https://hypertun.github.io/Persona1/` — but the form there falls back to the mailto draft (no serverless function available on GH Pages)
- [ ] **4. (Optional custom domain)** — add `ivanbuilds.dev` (or similar) in Cloudflare → Custom domains

### B. Set up the AI generation pipeline (≈30 min, one-time)

- [ ] **4. Pipeline setup (free stack)** — `pip install edge-tts` + `pip install torch diffusers transformers accelerate` · optional `GEMINI_API_KEY` (AI Studio, free) in `scripts/.env.pipeline` · `brew install ffmpeg` — **no GCP billing, no HeyGen** (full architecture: docs/04)
- [x] **5. Master persona portrait** — ✅ done: Gemini web app master (§2.1 prompt) → raw kept at output/imagen/master-raw.jpg (gitignored) → served as public/images/avatar.jpg (1600px, 265 KB) — hero + OG live on the deployed site
- [ ] **6. One base talking-head clip, then free lip-sync per video** — ✅ base clip generated (33f @24fps, 480×832, ~5 min on M5 Pro) — vet by eye → per voiceover: `./scripts/lipsync_latentsync.sh base.mp4 voice.mp3 out.mp4` (Wan 2.2-TI2V-5B: subtle motion, NEUTRAL mouth — vet this clip by eye, it's the persona forever) → per voiceover: `./scripts/lipsync_latentsync.sh base.mp4 voice.mp3 out.mp4` (LatentSync repaints the mouth per audio; CUDA — Kaggle T4 free or ~$0.50/hr rented 4090 → cents/video) — **quality gate: if video #1's mouth is uncanny, fall back to the B-roll format** (LTX-2 in ComfyUI, local & free)

### C. Start the content engine (ongoing)

- [ ] **7. Batch Week 1 videos** — the 5 finished scripts are in `docs/03_VIDEO_SCRIPTS.md`; generate scripts for Days 5–7 with `./scripts/generate_script_gemini.sh` → fact-check each against the résumé → generate voiceovers with `./scripts/generate_voiceover_edge_tts.sh` → lip-sync + assemble per `docs/04` §6–7
- [ ] **8. Post Day 1 video** ("Cloud-native systems. Measurable results.") → enable each platform's AI-content label + keep the "AI presenter" watermark → set "link in bio" to the live site
- [ ] **9. Run the weekly loop** — batch 7 scripts → TTS → renders → edit → schedule daily (rhythm & times in `docs/02` §1 & §5)
- [ ] **10. Day 30 review** — check KPIs vs targets (`docs/02` §6); clone top-3 formats, retire bottom-3; adjust posting times using platform analytics
- [ ] **11. Every posting session** — one-click funnel test: confirm "link in bio" → site → contact form all still work end-to-end (on Cloudflare: also check the function logs)
- [ ] **12. (Optional) Upgrade: Cloudflare Turnstile on the form + D1/KV lead storage** — free; the function is yours to extend

---

### Status summary

| Phase | Status |
|---|---|
| 1 — Persona development | ✅ 100% |
| 2 — Web development | ✅ 100% (media: placeholder avatar) |
| 3 — Content pipeline | ✅ docs/tools 100% · ⬜ media generation pending (actions #5–#6) |
| 4 — Review & handoff | ✅ 100% (re-verify form after #1–#2) |
| **Your remaining work** | **12 checklist items above (~45 min setup, then a weekly cadence)** |
