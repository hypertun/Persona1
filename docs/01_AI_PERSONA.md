# 01 — AI Persona: "IvanBuilds"

> Phase 1 deliverable — persona definition, visual blueprint, and voice bible.
> The persona is the **public-facing AI presenter** of Ivan Yeo's real, verified consulting practice.

---

## 1. Name & handle options

| # | Persona concept | Handle | Rationale | Risk |
|---|----------------|--------|-----------|------|
| **1 ✅ (recommended)** | **"Ivan" — digital twin of Ivan Yeo** | **`@IvanBuilds`** (TikTok/IG/YouTube) | Consulting is a trust business. Keeping the real name makes every claim on the site & videos directly attributable to a real, verifiable résumé. "Builds" doubles as brand verb: *Ivan builds cloud systems.* | Lowest |
| 2 | "NEO" — stylized AI alter ego | `@neo.builds` | Playful (letters riff on "Yeo"), more room for a distinctive visual identity | Audience confusion about who does the work |
| 3 | "Atlas" — abstract brand mascot | `@atlas.codes` | Maximum creative freedom, no personal brand tie-in | Hardest to convert to consulting leads; claims feel unverifiable |

**Decision: Option 1.** The influencer *character* is AI-generated, but the expertise, name, and results belong to the real Ivan. This aligns with the Phase-4 requirement that all claims strictly match the résumé.

- **Brand name:** IvanBuilds
- **Tagline:** *"Cloud-native systems. Measurable results."*
- **Positioning:** Senior Consultant Developer (Singapore) — Golang backends, AWS/GCP architecture, React/TypeScript frontends, AI-augmented engineering velocity.
- **AI disclosure (mandatory on all channels):** profile bios carry *"AI-generated presenter · Real engineering experience"*, and every video includes a small "AI presenter" watermark. This protects trust and complies with platform AI-content labeling policies (TikTok AI-generated content toggle, YouTube "altered/synthetic content" declaration, Instagram AI label).

---

## 2. Visual prompt blueprint (Google Imagen 3)

### 2.1 Master identity prompt

Use this as the canonical description block in **every** generation so facial features stay consistent:

```
Photorealistic portrait of a Singaporean-Chinese male tech consultant in his
early 30s, short neat black hair with a slight side part, clean-shaven, warm
confident closed-lip smile, defined jawline, wearing a charcoal merino
crew-neck sweater over a white collared shirt, slim silver smartwatch on left
wrist, seated at a modern glass-walled office in Singapore with softly blurred
monitors showing code in the background, cinematic soft key lighting from the
left with a cool teal rim light from behind, shallow depth of field, 85mm
lens look, sharp focus on the eyes, natural skin texture with visible pores,
professional LinkedIn-style executive headshot, high detail, no visible text
or logos
```

### 2.2 Negative prompt

```
cartoon, illustration, 3d render, anime, deformed face, extra fingers,
asymmetric eyes, plastic skin, oversaturated, watermark, text, distorted hands
```

### 2.3 Consistency protocol (critical)

Imagen 3 does not perfectly reproduce a face from a text prompt alone. Use this 3-step loop:

1. **Generate a master portrait once** (using the script in `scripts/generate_avatar_imagen3.sh`, fixed `seed=20260101`). Review candidates; pick the one that best matches the master prompt.
2. **Save the winner as `public/images/avatar.jpg`** (site) **and** as `output/imagen/master-raw.jpg` in your generation folder.
3. **For every subsequent scene/pose**, use Imagen 3 *image editing* (`imagen-3.0-capability-001` on Vertex AI) with the master portrait as the reference input image, plus a scene delta prompt, e.g.:
   ```
   Same person, now standing at a whiteboard drawing a Golang microservices
   architecture diagram, arms crossed, smart-casual navy blazer over charcoal
   sweater, modern office background, cinematic lighting
   ```
   This preserves identity while changing pose/scene/outfit.

### 2.4 Output matrix

| Asset | Aspect ratio / size | Imagen 3 config |
|-------|--------------------|-----------------|
| Website hero (public/images/avatar.jpg) | 4:5, ≥1024×1280 | `imagen-3.0-generate-002`, sampleCount 4-8 |
| TikTok/Reels/Shorts talking-head frame | 9:16, 1080×1920 | edit endpoint, master portrait as reference |
| Profile pictures | 1:1, 1024×1024 | edit endpoint, face-forward crop |
| YouTube thumbnails | 16:9, 1280×720 | edit endpoint + platform-safe padding |
| B-roll stills (whiteboard, laptop, server room) | 16:9 + 9:16 | edit endpoint, scene delta prompts |

> Aspect ratios are set in the request `parameters` (`sampleImageSize`) or via prompt suffix — see the runnable script and `docs/04_GENERATION_PIPELINE.md`.

### 2.5 Brand kit (site + video consistency)

| Token | Value |
|-------|-------|
| Ink background | `#020617` (slate-950) |
| Primary accent | `#22d3ee` (cyan-400) |
| Secondary accent | `#8b5cf6` (violet-500) |
| Body text | `#e2e8f0` on slate-950 |
| Headline font | Space Grotesk |
| Body font | Inter |
| Code/mono font | JetBrains Mono |
| Logo monogram | "IB" on cyan→violet gradient square |

---

## 3. Voice & tone bible

**Three words: authoritative, technical, results-oriented.**

### 3.1 Rules

1. **Lead with the number.** Every video opens on a metric from the résumé ("80%", "60%") or a concrete pain ("your order pipeline is manual and it's killing your team").
2. **Technical but accessible.** Name real technologies (Golang, Cloud Run, Locust, Terraform), then translate in one plain sentence for non-engineers.
3. **Show, don't hype.** Reference the actual design pattern or trade-off ("Builder pattern + mock servers") instead of adjectives ("amazing framework").
4. **CTA every time.** One consistent funnel line: *"Full case study on my site — link in bio."*
5. **No fake intimacy, no filler.** No "hey guys, welcome back to my channel". Start mid-value.

### 3.2 Sample lines (persona voice)

- ✅ "Manual SAP order posting was eating an entire team's day. I automated it on Cloud Run with Cloud Scheduler — 80% of that effort, gone."
- ✅ "Race conditions don't announce themselves. Locust does."
- ❌ "Hey fam! Today we're going to *spice up* our microservices! 🎉" (wrong register, no substance)

### 3.3 Visual/audio persona on video

- **Pacing:** brisk — one idea per 4–6 seconds of VO; captions on every video.
- **Look (avatar render):** smart-casual (charcoal sweater/blazer), modern office, cyan accent lighting to match brand kit.
- **Voice (TTS profile):** clear male voice, Singaporean-neutral accent, confident and warm; recommended Google voice: `en-US-Neural2-J` (tuned ~1.05× rate) — see `docs/04_GENERATION_PIPELINE.md` §TTS.
