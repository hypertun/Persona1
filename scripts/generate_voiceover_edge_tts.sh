#!/usr/bin/env bash
# generate_voiceover_edge_tts.sh — free neural TTS via Microsoft Edge voices (edge-tts).
# Phase: docs/04 §3 (voiceover). Zero cost, no API key, no GCP billing.
#
# Usage:
#   ./scripts/generate_voiceover_edge_tts.sh output/voiceovers/day07.mp3 "Manual SAP order posting was eating an entire team's day. So we automated 80 percent of it."
#
# Voice notes (persona: docs/01 §3.3 — authoritative, results-oriented male):
#   en-US-AndrewNeural   confident, warm  (default)
#   en-US-GuyNeural      news-anchor energy
#   en-US-ChristopherNeural  calmer, deeper
# Install once:  pip install edge-tts   (or: pipx install edge-tts)
set -euo pipefail

OUT="${1:?Usage: $0 <output.mp3> \"<voiceover text>\"}"
TEXT="${2:?Usage: $0 <output.mp3> \"<voiceover text>\"}"
VOICE="${TTS_VOICE:-en-US-AndrewNeural}"
RATE="${TTS_RATE:-+10%}"   # slight pace-up; use "-5%" to slow down

command -v edge-tts >/dev/null || {
  echo "edge-tts not found — installing: pip install edge-tts" >&2
  python3 -m pip install --quiet edge-tts
}

mkdir -p "$(dirname "$OUT")"
edge-tts --voice "$VOICE" --rate "$RATE" --text "$TEXT" --write-media "$OUT"
echo "✅ voiceover → $OUT ($VOICE, rate $RATE)"
