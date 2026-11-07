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
- [x] Gemini script-generation prompt (persona voice + résumé fact base + 5-beat structure) → embedded in `scripts/generate_script_gemini.sh`
- [x] Runnable scripts kept: `generate_script_gemini.sh` (scriptwriting), `generate_avatar_imagen3.sh` (portrait/scene edits) — voiceover + video scripts removed in the stack reset
- [ ] ⬜ **Generate the actual media** — master portrait ✅ done; voiceover + talking-head renders pending the new techstack

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

- [ ] **4. Media pipeline — techstack TBD** — second stack (ComfyUI + Wan 2.2 Q4 + edge-tts + ffmpeg assembler) was built end-to-end and produced a complete Day-1 video, then removed for a new approach. Montage Presenter format spec in docs/03 survives (stack-agnostic); portrait set + assets regenerated per the next stack.
- [x] **5. Master persona portrait** — ✅ done: Gemini web app master (§2.1 prompt) → raw kept at output/imagen/master-raw.jpg (gitignored) → served as public/images/avatar.jpg (1600px, 265 KB) — hero + OG live on the deployed site
- [ ] **6. Living-portrait set** — pending the next techstack (previous 5-clip set + Day-1 video deleted in the second stack reset)