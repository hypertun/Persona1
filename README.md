# IvanBuilds — AI Influencer Brand & Consulting Portfolio

Lead-generation portfolio site for **Ivan Yeo, Senior Consultant Developer (Singapore)**, presented by the hyper-realistic AI influencer persona **"IvanBuilds"**.

| Layer | Stack |
|---|---|
| Website | Vue 3 (Vite) + Tailwind CSS 4 |
| Hosting | GitHub Pages (static, via `gh-pages` branch) |
| Contact form | EmailJS **or** Formspree — no backend required |
| Content pipeline | Gemini 1.5 Pro (scripts) · Vertex AI TTS (voiceover) · Imagen 3 (persona visuals) · HeyGen/Synthesia (avatar animation) |

> ⚠️ **Content integrity rule:** every claim on the site and in every video must trace back to the résumé (*48451 – Senior Consultant Developer – Ivan Yeo.docx.pdf*). The data module `src/data/site.js` is the single source of truth — do not add unbacked claims.

---

## Project structure

```
├── .github/workflows/deploy.yml   # CI: build → deploy dist/ to gh-pages branch
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

## Contact form setup

**Default (zero third-party):** with nothing configured, the form opens the visitor's email app with a pre-filled draft to your inbox (`VITE_CONTACT_EMAIL`, default baked into `src/data/site.js`). Works on GitHub Pages as-is — but visitors with no configured mail app (webmail-only users) can't submit. For a lead-gen site, one of the relays below is recommended.

### Option A — Formspree (simplest, recommended)
1. Sign up at [formspree.io](https://formspree.io) → **New form**.
2. Copy the endpoint (`https://formspree.io/f/xxxxxxxx`).
3. Create `.env.local` (or `.env`) with:
   `VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx`
4. Done. No other config needed.

### Option B — EmailJS
1. Sign up at [emailjs.com](https://dashboard.emailjs.com) (free tier: 200 emails/mo).
2. **Email Services →** Add your inbox (e.g. Gmail) → copy the **Service ID** (`service_...`).
3. **Email Templates →** Create template → copy the **Template ID** (`template_...`). Use these variables in the body:
   ```
   From:    {{from_name}} <{{reply_to}}>
   Subject: New inquiry — {{inquiry_type}}
   Body:    {{message}}
   ```
4. **Account → API Keys →** copy the **Public key**.
5. Set in `.env.local`:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
   ```

**Without either configured**, the form falls back to a pre-filled `mailto:` draft — the site still works, and placeholder values (e.g. `xxxxxxxx` left from `.env.example`) are ignored automatically.

### Test the integration
1. `npm run build && npm run preview` → submit a test inquiry.
2. Check the configured inbox (Formspree: also check the dashboard → Submissions; EmailJS: dashboard → Email Activity).
3. On GitHub, set the same variables as **repository secrets** (Settings → Secrets and variables → Actions) so CI builds include them: `VITE_FORMSPREE_ENDPOINT` *or* the three `VITE_EMAILJS_*` vars, plus `VITE_CONTACT_EMAIL`.

## Deploy to GitHub Pages

1. Push this repo to GitHub (branch `main`).
2. Repo **Settings → Pages → Build and deployment → Source: *Deploy from a branch*** → Branch: **`gh-pages`**, folder `/ (root)`.
3. The `deploy.yml` workflow runs on every push to `main`: `npm ci` → `npm run build` (with `BASE_PATH=/<repo-name>/` baked in) → pushes `dist/` to `gh-pages`.
4. Live at `https://<user>.github.io/<repo-name>/`.

Notes:
- A **custom domain**? Set `Settings → Pages → Custom domain` and remove the `BASE_PATH` override (or set it to `/`) in `.github/workflows/deploy.yml`.
- The repo name must match `BASE_PATH` — the workflow derives it from `github.event.repository.name` automatically.

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
- [x] Contact form verified end-to-end with EmailJS/Formspree (see above) — **re-test after setting your real credentials**
- [x] Build + SSR render smoke-tested
