# 03 — Video Scripts (First 5)

> Phase 3 deliverable — 30–60s, hook-driven, built for TikTok/Reels/Shorts.
> Voice: see `docs/01_AI_PERSONA.md` §3. Production pipeline: `docs/04_GENERATION_PIPELINE.md`.
> ✅ **Fact-check column** shows the exact résumé source for every claim — do not deviate.

**Standard elements for every video**
- Captions burned in (auto-captions + brand colors).
- Persistent small badge: **"AI presenter"** (bottom-left).
- Outro card (last 2 s): "Full case study → link in bio · IvanBuilds".
- 9:16 · 1080×1920 · ≤60 s.

---

## Script 1 — "80% of manual order posting, automated" (Day 7 · Pillar D · 55 s)

**Fact-check:** NTUC NE Digital (Oct 2021–May 2025) — "high-concurrency Email Automation System on GCP Cloud Run, achieving an 80% efficiency gain in manual SAP order posting via Cloud Scheduler."

| Time | VO (persona) | On-screen text | Visual |
|------|--------------|----------------|-------|
| 0:00–0:03 | "Manual SAP order posting was eating an entire team's day. So we automated 80% of it." | **80% — automated** (bold, cyan) | Hook: face-to-cam, leaning in |
| 0:03–0:10 | "Here's how I reduced server latency and built a high-concurrency order system using Golang and GCP — while leading order management as acting team lead." | Golang + GCP · Cloud Run · Cloud Scheduler | Talking head, overlay stack chips |
| 0:10–0:25 | "The old flow: a human opens an order, copies fields, pastes into SAP, and prays nothing breaks. Every paste is a defect waiting to happen." | every manual paste = a future defect | B-roll: hands typing, calendar pages |
| 0:25–0:40 | "The new flow: Golang microservices on Cloud Run, triggered by Cloud Scheduler. Subscription and Chain of Responsibility patterns isolate every third-party dependency, so one failure never cascades." | pattern diagram: Publisher → Chain → SAP | Screen: animated architecture diagram |
| 0:40–0:50 | "Before rollout: Python Locust load tests. We found the race conditions before your customers did." | Locust load testing → zero race conditions in prod | Screen: Locust chart |
| 0:50–0:55 | "80% of the manual effort — gone. Full case study on my site. Link in bio." | **Full case study → link in bio** | Outro card |

**Caption:** 80% of manual SAP order posting — automated with Golang, Cloud Run & Cloud Scheduler 🚀 Full breakdown on the site. #golang #gcp #microservices #sap #automation #sgtech

---

## Script 2 — "60% of your manual tests, deleted" (Day 3 · Pillar C · 50 s)

**Fact-check:** Shopee (May 2020–Oct 2021) — "framework with the Builder pattern and mock servers that eliminated 60% of manual test cycles… data pipeline testing scripts for Kafka and HBase… managing a team of three."

| Time | VO (persona) | On-screen text | Visual |
|------|--------------|----------------|-------|
| 0:00–0:03 | "We deleted 60% of our manual test cycles. Not with a tool you can buy — with a design pattern." | **60% — deleted** | Hook, face-to-cam |
| 0:03–0:12 | "At Shopee, regression meant hours of clicking the same flows by hand. Slow, boring, and nobody trusts a bored tester at hour six." | hour 6 of manual clicking 🥱 | B-roll: repetitive clicking |
| 0:12–0:28 | "The fix: an automation framework built on the Builder pattern. Each test is composed like Lego — build the request, add the assertions, run it in parallel. Mock servers fake every third-party dependency, so tests don't die when someone else's sandbox does." | Builder pattern = test as Lego · mock servers = no flaky deps | Screen: test DSL snippet |
| 0:28–0:38 | "Then we pointed the same framework at Kafka and HBase data pipelines — end-to-end API evaluations, low-latency transmission verified, not assumed." | Kafka + HBase pipelines under test | Screen: pipeline diagram |
| 0:38–0:46 | "A team of three shipped it. Sixty percent of the manual testing — gone, and coverage went up, not down." | team of 3 · coverage ↑ | Talking head |
| 0:46–0:50 | "Want the full teardown? Link in bio." | **Full teardown → link in bio** | Outro card |

**Caption:** The Builder pattern killed 60% of our manual test cycles at Shopee. Design patterns aren't interview trivia — they're leverage. #testautomation #java #kafka #designpatterns #qa #sgtech

---

## Script 3 — "Your backend doesn't need more servers" (Day 2 · Pillar A · 45 s)

**Fact-check:** Resume — "server-side concurrency optimizations to reduce latency and enhance throughput" (Happy Hour Games); "Multithreading, Concurrency & Performance Optimization" (Java competencies); "resolving concurrency and race conditions" (NTUC, via Locust).

| Time | VO (persona) | On-screen text | Visual |
|------|--------------|----------------|-------|
| 0:00–0:03 | "Your backend doesn't need more servers. It needs concurrency." | more servers ≠ more throughput | Hook |
| 0:03–0:14 | "The first thing everyone does under load: scale out. Bigger fleet, same bottleneck — because the bottleneck was never machine count. It was waiting. I/O waits, lock waits, thread waits." | bottleneck = waiting, not servers | Screen: request queue animation |
| 0:14–0:30 | "In Golang that means goroutines and channels — thousands of cheap workers that share state through messages, not locks. On one enterprise portal I cut latency by redesigning the hot path around concurrent fan-out, so requests stopped queuing behind each other." | goroutines + channels · fan-out, not lock-wait | Screen: before/after latency bars |
| 0:30–0:40 | "And you don't ship it on faith. Locust load tests under production-shaped traffic — find the race conditions before your users find them for you." | load-test it. then ship it. | Screen: Locust run |
| 0:40–0:45 | "Architecture tips like this weekly. Follow." | **Follow @IvanBuilds** | Outro card |

**Caption:** More servers ≠ more throughput. Fix the concurrency first. #golang #concurrency #goroutines #backend #latency #performance

---

## Script 4 — "I ship 80% faster with AI workflows" (Day 4 · Pillar B · 50 s)

**Fact-check:** Resume intro — "By pioneering AI-augmented workflows and intelligent automation, he optimizes engineering velocity"; open source WC2OpenAPI (Go middleware, AI webchat → OpenAI-compatible API) & EasyAnalytics (CLI SQL assistant, natural-language queries, schema-aware prompting).

| Time | VO (persona) | On-screen text | Visual |
|------|--------------|----------------|-------|
| 0:00–0:03 | "AI won't replace developers. Developers using AI will replace the ones who don't." | AI won't replace you. AI users will. | Hook |
| 0:03–0:10 | "I'm a senior dev — and AI-augmented workflows are a core part of how I deliver. Here are three I actually use, not just demo." | 3 workflows. production-tested. | Talking head |
| 0:10–0:22 | "One: specification before generation. The LLM drafts the design doc, tests, and edge cases first — I approve, then it writes code. Typos are cheap; architecture errors aren't." | 1 · spec-first generation | Screen: doc → tests → code |
| 0:22–0:34 | "Two: natural-language access to data. I built EasyAnalytics — an open-source CLI SQL assistant with schema-aware prompting and caching. Productivity, for people who don't live in psql." | 2 · NL → SQL (EasyAnalytics, open source) | Screen: CLI demo |
| 0:34–0:44 | "Three: turning every AI chat into an API. My Go middleware, WC2OpenAPI, wraps AI webchat behind OpenAI-compatible endpoints — so the team automates against LLMs like any other service." | 3 · any AI chat → OpenAI-compatible API | Screen: repo + request |
| 0:44–0:50 | "All open source — links in bio. Follow for more AI-augmented engineering." | **open source → link in bio** | Outro card |

**Caption:** 3 AI workflows I actually use in production (not demos). Both tools are open source — link in bio. #aiengineering #llm #developerproductivity #golang #opensource #rag

---

## Script 5 — "Cloud-native systems. Measurable results." (Day 1 · Pillar D · 55 s — channel launch)

**Fact-check:** Resume intro (5+ years, scalable cloud-native systems, Golang/React/AWS/GCP, AI-augmented workflows) + NTUC (80%) + Shopee (60%) + EP One (100% data integrity).

| Time | VO (persona) | On-screen text | Visual |
|------|--------------|----------------|-------|
| 0:00–0:04 | "Five years. Three industries. One obsession: systems that don't fall over." | 5 yrs · 3 industries · 1 obsession | Hook, face-to-cam |
| 0:04–0:12 | "I'm Ivan — a senior consultant developer from Singapore. I build cloud-native systems and I measure my work the way finance measures money." | consultant dev · Singapore | Talking head |
| 0:12–0:30 | "The receipts: an email automation system that cut manual SAP order posting by 80%. A QA framework that deleted 60% of manual testing at one of the biggest e-commerce platforms in the region. Database migrations with 100% data integrity — across every single one." | 80% ↓ manual posting · 60% ↓ manual testing · 100% data integrity | Metric cards stamp in |
| 0:30–0:42 | "On this channel: the architecture patterns behind those numbers — Golang concurrency, AWS and GCP design, and the AI-augmented workflows that keep my delivery fast." | Golang · AWS · GCP · AI workflows | Rapid B-roll of topics |
| 0:42–0:50 | "Every video is a real system I've built — no hypotheticals, no recycled slide decks." | real systems. real numbers. | Talking head |
| 0:50–0:55 | "Follow — and if you have a system that's buckling, the consultation link is in my bio." | **Follow @IvanBuilds · consult → link in bio** | Outro card |

**Caption:** New here? I'm Ivan — senior consultant developer (Singapore). Cloud-native systems, measured in results. This channel = the architecture behind the numbers. Follow along 🚀 #softwareengineering #golang #aws #gcp #devtok #sgtech

---

## How the next 25 get written

Each remaining calendar entry is generated with the Gemini prompt template in `docs/04_GENERATION_PIPELINE.md` §Gemini (it embeds the résumé extract + persona voice + this 5-beat structure), then fact-checked against the résumé before production. Batch 7 per week — see the strategy doc §5.
