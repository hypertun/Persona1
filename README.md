# IvanBuilds — AI Influencer Brand & Consulting Portfolio

Lead-generation portfolio site for **Ivan Yeo, Senior Consultant Developer (Singapore)**, presented by the hyper-realistic AI influencer persona **"IvanBuilds"**.

| Layer | Stack |
|---|---|
| Website | Vue 3 (Vite) + Tailwind CSS 4 |
| Hosting | **Cloudflare Pages** (recommended — adds a free serverless function) *or* GitHub Pages |
| Contact form | Own CF Pages Function (`/api/contact` → Gmail SMTP **or** Resend) · Formspree · EmailJS · mailto fallback — auto-detected |
| Content pipeline | Gemini 1.5 Pro (scripts) · Vertex AI TTS (voiceover) · Imagen 3 (persona visuals) · HeyGen/Synthesia (avatar animation) |

> ⚠️ **Content integrity rule:** every claim on the site and in every video must trace back to the résumé (*48451 – Senior Consultant Developer – Ivan Yeo.docx.pdf*). The data module `src/data/site.js` is the single source of truth — do not add unbacked claims.

---

## Project structure

```
├── .github/workflows/deploy.yml   # CI: build → deploy dist/ to gh-pages branch (GitHub Pages path)
├── functions/api/contact.js       # Cloudflare Pages Function: /api/contact → Gmail SMTP / Resend
├── functions/api/smtp-gmail.js    # Hand-rolled Gmail SMTP client (cloudflare:sockets)
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

The form auto-detects its routing mode from environment variables — highest priority first.

### Mode 1 — Own Cloudflare Pages Function (recommended)
`functions/api/contact.js` receives the POST at `/api/contact` and relays to your inbox — either directly via **Gmail SMTP** (your app password, stored server-side; zero new vendors) or via **Resend** (optional fallback). Credentials never appear in the client bundle — they're Cloudflare secrets. Activate with the build variable `VITE_CONTACT_API=/api/contact` — full setup in "Deploy to Cloudflare Pages" below.

### Mode 2 — Formspree (if staying on GitHub Pages)
1. Sign up at [formspree.io](https://formspree.io) → **New form** (free: 50 submissions/mo).
2. Copy the endpoint (`https://formspree.io/f/xxxxxxxx`) → set in `.env.local`:
   `VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxxxxx`

### Mode 3 — EmailJS
1. Sign up at [emailjs.com](https://dashboard.emailjs.com) (free tier: 200 emails/mo).
2. **Email Services →** Add your inbox (e.g. Gmail) → copy the **Service ID** (`service_...`).
3. **Email Templates →** Create template → copy the **Template ID** (`template_...`). Use these variables in the body:
   ```
   From:    {{from_name}} <{{reply_to}}>
   Subject: New inquiry — {{inquiry_type}}
   Body:    {{message}}
   ```
4. **Account → API Keys →** copy the **Public key** → set in `.env.local`:
   ```
   VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
   VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
   VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
   ```

### Mode 4 — mailto fallback (zero third-party)
With nothing configured, submitting opens the visitor's email app with a pre-filled draft to your inbox (`VITE_CONTACT_EMAIL`, default baked into `src/data/site.js`). Works anywhere — but visitors with no configured mail app (webmail-only users) can't submit. Placeholder values (e.g. `xxxxxxxx` left from `.env.example`) are ignored automatically, so a half-configured env can never break the form.

### Test the integration
1. `npm run build && npm run preview` → submit a test inquiry.
2. Check the configured inbox (Formspree: dashboard → Submissions; EmailJS: dashboard → Email Activity; Cloudflare function: `npx wrangler pages dev` logs + your inbox).
3. On GitHub, set the same variables as **repository secrets** (Settings → Secrets and variables → Actions) so CI builds include them: `VITE_CONTACT_API` *or* `VITE_FORMSPREE_ENDPOINT` *or* the three `VITE_EMAILJS_*` vars, plus `VITE_CONTACT_EMAIL`.

## Deploy to Cloudflare Pages (recommended — adds the email superpower)

**Why:** identical free static hosting, but Cloudflare Pages includes **Pages Functions** (serverless, 100k req/day free) — the repo ships with `functions/api/contact.js`, which makes the contact form deliver straight to your inbox with server-side secrets (no Formspree/EmailJS, no public keys). Cloudflare also serves from the root domain (no `/Persona1/` base path) and gives every branch a preview URL.

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → select this repo.
2. Build settings (auto-detected for Vite): build command `npm run build`, output `dist`.
3. Build environment variables (Settings → Variables, **Production**):
   - `VITE_CONTACT_API=/api/contact`
   - `VITE_CONTACT_EMAIL=<your inbox>` (optional — defaults to the one in `src/data/site.js`)
4. Runtime secrets for the function (Settings → Variables & Secrets — server-side only). **Pick one transport:**

   **Transport A — Gmail SMTP (recommended: zero new vendors, the epone-web pattern):**
   - `GMAIL_USER` — the Gmail address that sends the mail
   - `GMAIL_APP_PASSWORD` — its app password ([myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords); 2FA must be on — the same kind of credential epone-web uses). The function speaks SMTP directly to `smtp.gmail.com:465` via `cloudflare:sockets` (hand-rolled protocol in `functions/api/smtp-gmail.js` — nodemailer can't run on Workers). ~500 recipients/day Gmail limit — ample for lead-gen.

   **Transport B — Resend (optional fallback, only used if `GMAIL_*` are unset):**
   - `RESEND_API_KEY` — create a free account at [resend.com](https://resend.com) → API Keys (free: 3,000 emails/mo). Verify a sending domain for production and set `CONTACT_FROM` to e.g. `IvanBuilds Site <noreply@yourdomain.com>`.

   **Either way:** `CONTACT_EMAIL` — recipient inbox (defaults to the baked-in address).
5. Deploy. Live at `https://ivanbuilds.pages.dev` (or your custom domain → Custom domains → add).

**Test locally with functions:**
```bash
cp .dev.vars.example .dev.vars   # add your Gmail app password
npm run build && npx wrangler pages dev   # serves dist/ + /api/contact at localhost:8788
```

> Security notes: all transport credentials only exist server-side (never in the client bundle); submissions are validated and header-sanitized in the function; a honeypot field filters bots. The Gmail app password is more powerful than a scoped API key (it also grants IMAP access to the account if leaked) — consider a dedicated Gmail account for site mail. Optional hardening: enable [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) (free) on the form.

## Deploy to GitHub Pages (zero-dependency alternative)

1. Push this repo to GitHub (branch `main`).
2. Repo **Settings → Pages → Build and deployment → Source: *Deploy from a branch*** → Branch: **`gh-pages`**, folder `/ (root)`.
3. The `deploy.yml` workflow runs on every push to `main`: `npm ci` → `npm run build` (with `BASE_PATH=/<repo-name>/` baked in) → pushes `dist/` to `gh-pages`.
4. Live at `https://<user>.github.io/<repo-name>/`.

Notes:
- GitHub Pages is static-only → the contact form there uses `mailto:` fallback, Formspree, or EmailJS (see "Contact form setup" above).
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
- [x] Contact form verified across all routing modes (own CF function / Formspree / EmailJS / mailto) — **re-test after setting your real credentials**
- [x] Build + SSR render smoke-tested
