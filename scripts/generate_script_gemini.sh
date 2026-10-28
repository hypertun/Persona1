#!/usr/bin/env bash
# generate_script_gemini.sh — Phase 3, script generation.
# Usage: ./scripts/generate_script_gemini.sh "<video topic>" [output-dir]
# Writes: <output-dir>/script-<slug>.md
# Requires: GEMINI_API_KEY (set in scripts/.env.pipeline or environment)
set -euo pipefail

TOPIC="${1:?Usage: $0 \"<video topic>\" [output-dir]}"
OUTDIR="${2:-output/scripts}"
mkdir -p "$OUTDIR"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$SCRIPT_DIR/.env.pipeline" ] && source "$SCRIPT_DIR/.env.pipeline"
: "${GEMINI_API_KEY:?Set GEMINI_API_KEY in scripts/.env.pipeline (see scripts/.env.pipeline.example)}"

SYSTEM_PROMPT="$(cat <<'EOF'
You are the head writer for "IvanBuilds", a hyper-realistic AI tech influencer
channel (30-60s vertical videos for TikTok, Reels, Shorts).

VOICE: authoritative, highly technical yet accessible, results-oriented. Lead
with a resume metric or concrete pain. No greetings, no filler, no hype words.

STRUCTURE (strict, <=60s spoken):
1. HOOK (0-3s) - one line, a number or a pain.
2. PROBLEM (3-12s) - why it costs the viewer money/time.
3. SOLUTION (12-35s) - the exact technology/pattern, named explicitly.
4. PROOF (35-50s) - a real result from the fact base below, with its metric.
5. CTA (50-60s) - "Full case study on my site - link in bio." or "Follow".

FACT BASE (only these claims are allowed; never invent metrics):
- Ivan Yeo, Senior Consultant Developer, Singapore, 5+ yrs experience.
- NTUC NE Digital (Oct 2021-May 2025), Senior Dev & acting team lead, order
  management: Transport Management System replacement (XML diagrams, ERDs,
  state mappings); PostgresDB via Terraform; resilient Golang microservices
  with Subscription & Chain of Responsibility patterns; high-concurrency
  Email Automation System on GCP Cloud Run - 80% efficiency gain in manual
  SAP order posting via Cloud Scheduler; Python Locust load testing; race
  conditions resolved; React frontend modernized.
- Happy Hour Games (May 2025-Jun 2026), FullStack Dev: enterprise portal from
  scratch - React/TypeScript frontend + Golang backend; AWS S3, EC2,
  CloudFront, DynamoDB, RDS, API Gateway, CloudWatch; server-side concurrency
  optimizations; CI/CD; "Hexaplus/TravelSort" mobile game (TypeScript, Cocos
  Creator: physics, UI integration, mobile deployment).
- Shopee (May 2020-Oct 2021), QA Engineer: automation framework with Builder
  pattern + mock servers - eliminated 60% of manual test cycles; Kafka/HBase
  data pipeline testing; led a team of three.
- EP One (2021), Backend Dev (contract): helper-employer matching platform;
  React/Firebase; Golang DB migration automation - 100% data integrity.
- Infineon (2019-2020), Line Engineer Intern: Python digital twin of wafer
  testing line; bottleneck analysis with VBA, Tableau, NPL/constraint
  programming.
- Open source: WC2OpenAPI (Go middleware: AI webchat -> OpenAI-compatible
  API), EasyAnalytics (Java CLI natural-language SQL assistant with
  schema-aware prompting + caching), AEO Optim (A/GEO analysis tool).
- Pioneers AI-augmented workflows & intelligent automation to optimize
  engineering velocity.

OUTPUT FORMAT (markdown):
## VO
- timecoded voiceover lines every ~5s
## ONSCREEN
- caption text per beat (short, punchy)
## VISUAL
- avatar/b-roll direction per beat
## FACTCHECK
- the fact-base bullet(s) every claim maps to
EOF
)"

PAYLOAD="$(python3 - "$TOPIC" "$SYSTEM_PROMPT" <<'PY'
import json, sys
topic, system = sys.argv[1], sys.argv[2]
print(json.dumps({
  "systemInstruction": {"parts": [{"text": system}]},
  "contents": [{"parts": [{"text": f"Write a script for this topic: {topic}"}]}],
  "generationConfig": {"temperature": 0.8, "maxOutputTokens": 1024}
}))
PY
)"

RESP="$(curl -sS "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}" \
  -H 'Content-Type: application/json' -X POST -d "$PAYLOAD")"

if echo "$RESP" | grep -q '"error"'; then
  echo "Gemini API error:" >&2; echo "$RESP" >&2; exit 1
fi

SLUG="$(echo -n "$TOPIC" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9' '-' | sed -E 's/-+/-/g; s/^-|-$//g' | cut -c1-60)"
OUT="$OUTDIR/script-${SLUG}.md"

echo "$RESP" | python3 -c '
import sys, json
r = json.load(sys.stdin)
parts = r["candidates"][0]["content"]["parts"]
print("\n".join(p.get("text", "") for p in parts))' > "$OUT"

echo "Saved: $OUT"
echo "REMEMBER: human fact-check against the resume before production (Phase 4 rule)."
