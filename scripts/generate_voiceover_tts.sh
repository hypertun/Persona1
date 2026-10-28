#!/usr/bin/env bash
# generate_voiceover_tts.sh — Phase 3, Step A (voiceover).
# Usage: ./scripts/generate_voiceover_tts.sh <output.mp3> "<VO text>"
# Requires: gcloud auth + GCP_PROJECT_ID (scripts/.env.pipeline)
set -euo pipefail

OUT="${1:?Usage: $0 <output.mp3> \"<VO text>\"}"
TEXT="${2:?Usage: $0 <output.mp3> \"<VO text>\"}"
# Persona voice: see docs/01_AI_PERSONA.md §3.3
VOICE="${TTS_VOICE:-en-US-Neural2-J}"
RATE="${TTS_RATE:-1.05}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$SCRIPT_DIR/.env.pipeline" ] && source "$SCRIPT_DIR/.env.pipeline"
: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID in scripts/.env.pipeline}"

TOKEN="$(gcloud auth print-access-token)"

PAYLOAD="$(python3 - "$TEXT" "$VOICE" "$RATE" <<'PY'
import json, sys
text, voice, rate = sys.argv[1], sys.argv[2], sys.argv[3]
print(json.dumps({
  "input": {"text": text},
  "voice": {"languageCode": "en-US", "name": voice},
  "audioConfig": {"audioEncoding": "MP3", "speakingRate": float(rate)}
}))
PY
)"

curl -sS -X POST \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "https://texttospeech.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/global/text:synthesize" \
| python3 -c '
import sys, json, base64
r = json.load(sys.stdin)
if "audioContent" not in r:
    sys.stderr.write(json.dumps(r, indent=2)); sys.exit(1)
sys.stdout.buffer.write(base64.b64decode(r["audioContent"]))' > "$OUT"

echo "Saved: $OUT (voice: ${VOICE}, rate: ${RATE})"
