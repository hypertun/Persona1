# IvanBuilds — AI Influencer Brand & Consulting Portfolio

Lead-generation portfolio site for **Ivan Yeo, Senior Consultant Developer (Singapore)**, presented by the hyper-realistic AI influencer persona **"IvanBuilds"**.

| Layer | Stack |
|---|---|
| Website | Vue 3 (Vite) + Tailwind CSS 4 |
| Hosting | **Cloudflare Pages** (recommended — adds a free serverless function) *or* GitHub Pages |
| Contact form | Own CF Pages Function (`/api/contact` → Telegram message to your phone) · mailto fallback when absent — auto-detected |
| Content pipeline | Gemini 1.5 Pro (scripts) · Vertex AI TTS (voiceover) · Imagen 3 (persona visuals) · HeyGen/Synthesia (avatar animation) |

> ⚠️ **Content integrity rule:** every claim on the site and in every video must trace back to the résumé (*48451 – Senior Consultant Developer – Ivan Yeo.docx.pdf*). The data module `src/data/site.js` is the single source of truth — do not add unbacked claims.

---

## Project structure

```
├── .github/workflows/deploy.yml   # CI: build → deploy dist/ to gh-pages branch (GitHub Pages path)
├── functions/api/contact.js       # Cloudflare Pages Function: /api/contact → Telegram delivery
├── wrangler.toml                  # Cloudflare Pages config (wrangler dev / deploy)
├── docs/
│   ├── 01_AI_PERSONA.md           # Persona: name/handles, Imagen 3 blueprint, voice bible
│   ├── 02_CONTENT_STRATEGY.md     # 30-day content calendar (TikTok/Reels/Shorts)
│   ├── 03_VIDEO_SCRIPTS.md        # First 5 fully-produced scripts
│   └── 04_GENERATION_PIPELINE.md  # Gemini → TTS → Imagen 3 → HeyGen workflow
├── scripts/
│   ├── .env.pipeline.example      # GCP / Gemini / HeyGen credentials template
│   ├── generate_script_gemini.sh  # Script writing (Gemini 1.5 Pro)
│   ├── generate_voiceover_tts.sh  # Voiceover (Vertex AI TTS)
│   └── generate_avatar_imagen3.sh # Persona stills (Imagen 3 + reference-image edits)
├── public/images/
│   ├── avatar.png                 # ← drop your Imagen 3 master portrait here
│   └── avatar-placeholder.svg     # fallback shown until then
└── src/
    ├── App.vue
    ├── data/site.js               # ALL resume-extracted content (projects, metrics, skills)
    └── components/                # HeroSection, MetricsBar, Services, Portfolio,
                                   # OpenSource, Skills, ContactForm, Footer, Nav, Icon
```

## Quickstart (local)

```bash
npm install
npm run dev            # http://localhost:5173
npm run build          # production build → dist/
npm run preview        # serve the production build locally
```

## Contact form routing (priority order)

The form auto-detects its routing mode from the build environment — highest priority first.

### Mode 1 — Own Cloudflare Pages Function (the delivery path)
`functions/api/contact.js` receives the POST at `/api/contact` and delivers the inquiry to your phone as a **Telegram message** — that's the only path: every submission arrives in your Telegram chat, with a tappable "Reply to &lt;lead&gt;" mailto link (replies are composed from your Gmail, but the site never touches email). Credentials never appear in the client bundle — they're Cloudflare secrets. Activate with the build variable `VITE_CONTACT_API=/api/contact` — full setup in "Deploy to Cloudflare Pages" below.

### Mode 2 — mailto fallback (automatic, only when the flag is absent)
Without the flag (e.g. a plain local dev or a GitHub Pages deploy without the function), submitting opens the visitor's email app with a pre-filled draft to your inbox (`VITE_CONTACT_EMAIL`, default baked into `src/data/site.js`). On a properly configured Cloudflare deploy this branch never runs. Junk values (e.g. a placeholder left in a dashboard build var) are ignored automatically.

### Test the integration

> **Which mode am I in?** The submit button tells you: **"Send inquiry"** = the Cloudflare function (Telegram delivery) is wired up; **"Open email draft"** = the build lacks `VITE_CONTACT_API`, so the mailto fallback is active (e.g. plain `npm run dev`). Note that only `wrangler` (via `npm run dev:cf`) can serve the `/api/contact` function locally — plain Vite dev can't.

1. `npm run dev:cf` → submit a test inquiry from the served site.
2. Confirm the Telegram message arrives on your phone (bot logs: `https://api.telegram.org/bot<TOKEN>/getUpdates`, or the Cloudflare function logs).
3. In production, Cloudflare builds bake the flag from the build env var — no repo secrets needed beyond `VITE_CONTACT_API` (optional) and `VITE_CONTACT_EMAIL`.

## Deploy to Cloudflare Pages (recommended — the full funnel)

**Why:** identical free static hosting, but Cloudflare Pages includes **Pages Functions** (serverless, 100k req/day free) — the repo ships with `functions/api/contact.js`, which delivers every form submission to your phone as a Telegram message (server-side secrets, no email vendor, no public keys). Cloudflare also serves from the root domain (no `/Persona1/` base path) and gives every branch a preview URL.

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → select this repo.
2. Build settings (auto-detected for Vite): build command `npm run build`, output `dist`.
3. Build environment variables (Settings → Variables, **Production**):
   - `VITE_CONTACT_API=/api/contact`
   - `VITE_CONTACT_EMAIL=<your inbox>` (optional — defaults to the one in `src/data/site.js`)
4. Runtime secrets for the function (Settings → Variables & Secrets — server-side only):
   - `NOTIFY_TELEGRAM_TOKEN` — bot token: message [@BotFather](https://t.me/BotFather) → `/newbot` → copy the token
   - `NOTIFY_TELEGRAM_CHAT_ID` — your chat id: send your bot a "hi", then open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the `chat.id`

   Every inquiry then arrives in your Telegram chat with the lead's message and a tappable "Reply to &lt;lead&gt;" link.
5. Deploy. Live at `https://ivanbuilds.pages.dev` (or your custom domain → Custom domains → add).

**Test locally with the function:**
```bash
cp .dev.vars.example .dev.vars   # add your bot token + chat id
npm run dev:cf                   # builds with the flag, serves dist/ + /api/contact at localhost:8788
```

> Security notes: the bot token only exists server-side (never in the client bundle); submissions are validated and HTML-escaped in the function; a honeypot field filters bots; long messages are chunked within Telegram's 4096-char limit. Optional hardening: enable [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) (free) on the form.

## Deploy to GitHub Pages (zero-dependency alternative)

1. Push this repo to GitHub (branch `main`).
2. Repo **Settings → Pages → Build and deployment → Source: *Deploy from a branch*** → Branch: **`gh-pages`**, folder `/ (root)`.
3. The `deploy.yml` workflow runs on every push to `main`: `npm ci` → `npm run build` (with `BASE_PATH=/<repo-name>/` baked in) → pushes `dist/` to `gh-pages`.
4. Live at `https://<user>.github.io/<repo-name>/`.

Notes:
- GitHub Pages is static-only → the contact form there falls back to the `mailto:` draft mode (see "Contact form routing" above).
- A **custom domain**? Set `Settings → Pages → Custom domain` and remove the `BASE_PATH` override (or set it to `/`) in `.github/workflows/deploy.yml`.
- The repo name must match `BASE_PATH` — the workflow derives it from `github.event.repository.name` automatically.
- Both platforms can coexist from this one repo — CF Git integration doesn't touch the `gh-pages` branch.

## Generate the AI persona portrait (one-time)

1. `cp scripts/.env.pipeline.example scripts/.env.pipeline` and fill in `GCP_PROJECT_ID` (enable `aiplatform.googleapis.com`, `texttospeech.googleapis.com`; `gcloud auth application-default login`).
2. Run:
   ```bash
   ./scripts/generate_avatar_imagen3.sh output/imagen/avatar.png \
     "Photorealistic portrait of a Singaporean-Chinese male tech consultant in his early 30s, ..."
   # full master prompt + negative prompt: docs/01_AI_PERSONA.md §2.1–2.2
   ```
3. Pick the best candidate → save as `public/images/avatar.png`. The hero, OG image and favicon pick it up automatically (the SVG placeholder is the on-error fallback).
4. For all scene variations, always pass the master as the **reference image** (identity preservation) — see `docs/04_GENERATION_PIPELINE.md` §4.2.

## Social media pipeline (30-day run)

Read in order:
1. `docs/01_AI_PERSONA.md` — persona, Imagen 3 blueprint, voice bible
2. `docs/02_CONTENT_STRATEGY.md` — calendar, hashtags, KPIs
3. `docs/03_VIDEO_SCRIPTS.md` — first 5 scripts, production-ready
4. `docs/04_GENERATION_PIPELINE.md` — Gemini/TTS/Imagen/HeyGen API recipes + QA checklist

Weekly loop: batch 7 scripts (Gemini) → fact-check vs résumé → batch TTS → batch avatar renders → edit → schedule daily posts.

## Integrity checklist (Phase 4)

- [x] Every metric on the site (80%, 60%, 100%, 5+ yrs) matches the résumé
- [x] Project descriptions extracted verbatim-in-substance from the résumé
- [x] AI-presenter disclosure on hero, footer, and in every video spec
- [x] Contact form verified across its routing modes (CF function → Telegram / mailto fallback) — **re-test after setting your real bot credentials**
- [x] Build + SSR render smoke-tested
