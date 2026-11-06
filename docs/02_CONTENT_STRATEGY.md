# 02 — Content Strategy: 30-Day Launch Calendar

> Phase 3 deliverable — TikTok (primary) + Instagram Reels + YouTube Shorts (cross-post).
> Every topic traces back to Ivan's résumé. Nothing is invented.

---

## 1. Positioning & funnel

**Who it's for:** startup CTOs, engineering managers, and founders (Singapore/SEA-first, global async) who have scaling or velocity problems — a buckling backend, manual ops, a QA process eating sprints.

**Funnel:**
```
Hook (TikTok/Reels/Shorts) → Value (30–60s teach) → Proof (résumé metric)
  → CTA "Full case study on my site — link in bio" → ivanbuilds site → Contact form → consult
```

**Cadence:** 1 vertical video per day (30 total). The same asset is posted to all three platforms with per-platform captions.

**Posting times (SGT):** 7:30–9:00pm on weekdays; 11:00am–1:00pm on weekends. (Early metrics in month 1 will refine this — check per-platform analytics.)

**AI disclosure:** enable each platform's AI-content label (TikTok "AI-generated content" toggle, YouTube "altered content" declaration, Instagram AI label) + keep the "AI presenter" watermark on all videos.

---

## 2. Content pillars

| Pillar | Share | What it does | Sourced from |
|--------|------|--------------|--------------|
| **A — Architecture Tips** | ~33% | Authority & SEO: concrete patterns for Golang/AWS/GCP | NTUC microservices, HHG AWS stack, resume skills |
| **B — AI-Augmented Workflows** | ~23% | Differentiator: LLM tooling, RAG, agents, automation | "Pioneering AI-augmented workflows", WC2OpenAPI, EasyAnalytics, AEO Optim, AI cert track |
| **C — Engineering Velocity** | ~23% | Process/value: CI/CD, TDD, load testing, load, reviews | HHG CI/CD pipelines, Locust testing, Agile lead experience |
| **D — Case Studies** | ~20% | Proof → conversion. Résumé stories with metrics | All five résumé roles |

Weekly rhythm: **Mon A · Tue C · Wed D · Thu B · Fri A · Sat B · Sun D**

---

## 3. The 30-day calendar

Legend — Format: 🎤 talking-head (HeyGen avatar) · 🖥 screen-share + VO · 🎞 b-roll stills + VO

### Week 1 — Authority launch

| Day | Pillar | Topic | Hook (first 3 s) | Format |
|-----|--------|-------|------------------|--------|
| 1 | D | Persona launch: who I am, what I deliver | "5 years. 3 industries. One specialty: systems that don't fall over. Let me show you." | 🎤 |
| 2 | A | Golang concurrency for order systems | "Your backend doesn't need more servers. It needs goroutines and channels." | 🖥 |
| 3 | C | The QA framework that killed 60% of manual testing (Builder pattern + mock servers) | "We deleted 60% of our manual test cycles. Here's the pattern that did it." | 🎤 |
| 4 | B | AI-augmented engineering: 3 workflows I actually use | "AI won't replace developers. Developers using AI will. Here are my 3 workflows." | 🎤 |
| 5 | A | Stop hand-provisioning databases | "I stopped clicking through AWS consoles in 2021. Terraform. Every time." | 🖥 |
| 6 | B | WC2OpenAPI story | "I turned an AI webchat into an OpenAI-compatible API. It's open source. Link in bio." | 🎞 |
| 7 | D | Case study: NTUC email automation | "Manual SAP order posting ate an entire team's day. We automated 80% of it — on Cloud Run." | 🎤 |

### Week 2 — Backend depth

| Day | Pillar | Topic | Hook | Format |
|-----|--------|-------|------|--------|
| 8 | A | Race conditions & how I actually catch them | "Race conditions don't announce themselves. Locust does." | 🖥 |
| 9 | C | Load-test before launch, not after the outage | "Your load test is scheduled… for after your traffic spike? Let's fix that." | 🎤 |
| 10 | D | Case study: Happy Hour Games — portal + shipped mobile game in the same engagement | "Enterprise portal in React and Golang — and a mobile game in the same year. Same architect." | 🎤 |
| 11 | A | Chain of Responsibility for third-party integrations | "Every third-party API you add is a new failure mode. Here's the pattern that keeps them from cascading." | 🖥 |
| 12 | B | EasyAnalytics: natural-language SQL with schema-aware prompting | "What if you could ask your Postgres questions in plain English? I built the CLI." | 🎞 |
| 13 | C | CI/CD isn't a tool, it's a design | "You bought a CI tool and kept your Friday deploy freeze. That's the problem." | 🎤 |
| 14 | A | Cloud Run vs EC2 — when serverless wins | "80% of a manual posting workflow, automated — on a stack with zero servers to patch." | 🎤 |

### Week 3 — Cloud + QA

| Day | Pillar | Topic | Hook | Format |
|-----|--------|-------|------|--------|
| 15 | A | AWS full-suite anatomy of a scalable portal | "S3, CloudFront, DynamoDB, RDS, API Gateway — what each one is actually for." | 🖥 |
| 16 | C | TDD: why I write the failing test first | "The test fails first. That's not pessimism — that's the design." | 🎤 |
| 17 | D | Case study: Shopee QA automation teardown | "A team of 3. Kafka and HBase pipelines. And we made 60% of manual testing disappear." | 🎤 |
| 18 | A | DynamoDB vs Postgres — a consultant's decision tree | "DynamoDB or Postgres is not a vibes question. Here's the decision tree." | 🖥 |
| 19 | B | What I'm learning in the AI Engineer track (LLM, RAG, QLoRA, agents) — and what's already useful at work | "QLoRA sounds like a research toy. Parts of it are already in my production toolkit." | 🎤 |
| 20 | C | Trunk-based development | "Your long-lived feature branch is a lie you tell yourself daily." | 🎤 |
| 21 | D | Case study: Infineon digital twin | "We simulated an entire wafer-testing line in Python — without stopping production once." | 🎞 |

### Week 4 — Leadership + velocity

| Day | Pillar | Topic | Hook | Format |
|-----|--------|-------|------|--------|
| 22 | C | Acting team lead: Agile sprints without killing velocity | "Sprint planning shouldn't be theatre. Here's what I changed as acting team lead." | 🎤 |
| 23 | A | Microservice boundaries: ERDs and state mappings before code | "We replaced a whole Transport Management System. The code wasn't the hard part." | 🖥 |
| 24 | B | Intelligent automation: jobs nobody should do manually | "If a human pastes it between two systems, it's already a defect." | 🎤 |
| 25 | A | Kubernetes: 3 mistakes I see in every 'migrated' monolith | "You lifted-and-shifted into Kubernetes. Now you have 3 problems plus YAML." | 🎤 |
| 26 | C | The 10-minute code review rule | "Code review queues are where velocity dies. 10 minutes. Here's the rule." | 🎤 |
| 27 | D | Case study: EP One — matching platform with 100% data integrity | "Zero data loss on every migration. Not luck — Golang automation." | 🎞 |
| 28 | B | My open-source stack tour (WC2OpenAPI, EasyAnalytics, AEO Optim) | "Three tools. All free. All things I needed at work first." | 🎞 |

### Week 5 — Conversion

| Day | Pillar | Topic | Hook | Format |
|-----|--------|-------|------|--------|
| 29 | A | "First hour of a cloud architecture review: 5 things I check" | "Give me 60 seconds and I'll tell you what's wrong with your architecture." | 🎤 |
| 30 | D | "Why hire a consultant developer — and when NOT to" + metrics recap | "80% efficiency gains. 60% less manual testing. But here's when you *shouldn't* hire me." CTA: link in bio. | 🎤 |

---

## 4. Hashtag pools (rotate 3–5 per post)

- **Broad:** #softwareengineering #backend #golang #cloudcomputing #devtok #techtok
- **Niche:** #aws #gcp #microservices #concurrency #terraform #cicd #testautomation #llm #aiengineering
- **Local:** #sgtech #singaporetech #sgdevs

## 5. Batch production plan (repeat weekly)

1. **Sunday PM — Script batch (Day n..n+6):** run the 7 weekly topics through the Gemini prompt embedded in `scripts/generate_script_gemini.sh` (one call per script; review & fact-check each against the résumé).
2. **Voiceover pass:** batch-generate all 7 voiceovers (provider pending new techstack).
3. **Avatar & b-roll pass:** regenerate talking-head renders for the week's 🎤 videos with HeyGen (Imagen-3 master portrait → photo avatar); for 🎞 videos, batch Imagen-3 b-roll stills.
4. **Edit pass (CapCut / Shotcut):** avatar or b-roll + captions + brand outro card ("Full case study → ivanbuilds.site") + AI presenter watermark. 9:16, ≤60 s.
5. **Schedule:** TikTok Scheduler (or Later/Buffer) — 1/day, times per §1. Cross-post Reels/Shorts natively (do not use watermarked TikTok downloads).

## 6. KPIs — month 1

| Metric | Target | Notes |
|---------|--------|-------|
| Videos published | 30 (1/day) | Consistency beats polish in month 1 |
| Avg views / video (combined) | 2–5k | Expect variance; double down on top quartile formats |
| Profile → site click-through | ≥1% of viewers | Track "link in bio" via site analytics |
| Contact form leads | 5–10 | Primary business KPI |
| Follower base (combined) | 1–2k | Seed for month 2 case-study series |

**Monthly review:** rank all 30 by 3-second retention & completion rate; clone the top-3 formats for month 2, retire the bottom-3.
