#!/usr/bin/env bash
# lipsync_latentsync.sh — per-video lip-sync: repaint the mouth of the base
# video to match a new voiceover (LatentSync, ByteDance — open source).
#
# The identity-preserving loop of the pipeline (docs/04 §6):
#     ONE base clip (from generate_base_video_wan.py, vetted once)
#         + voiceover.mp3 (edge-tts)
#         → LatentSync → final talking-head video
# Same face in every video; only the mouth changes.
#
# Usage:
#   ./scripts/lipsync_latentsync.sh <base_video.mp4> <voiceover.mp3> <output.mp4>
#
# Requirements:
#   - CUDA GPU is REQUIRED (LatentSync is CUDA-first). Options:
#       a) rented 4090 (RunPod/Vast.ai, ~$0.30-0.50/hr → cents per video)
#       b) Kaggle notebook GPU T4 (30 GPU-hours/week free)
#   - ffmpeg + ffprobe on PATH (brew install ffmpeg)
#   - first run clones LatentSync into $LATENTSYNC_DIR (default ~/tools/LatentSync)
#     and installs its requirements into a venv (~5 min, one time)
set -euo pipefail

BASE="${1:?Usage: $0 <base_video.mp4> <voiceover.mp3> <output.mp4>}"
AUDIO="${2:?Usage: $0 <base_video.mp4> <voiceover.mp3> <output.mp4>}"
OUT="${3:?Usage: $0 <base_video.mp4> <voiceover.mp3> <output.mp4>}"

command -v ffmpeg >/dev/null || { echo "ffmpeg missing: brew install ffmpeg" >&2; exit 1; }
command -v nvidia-smi >/dev/null || cat >&2 <<'WARN'
⚠️  No CUDA GPU detected. LatentSync needs CUDA — run this on a rented GPU
    (RunPod/Vast) or a Kaggle T4 notebook. See docs/04 §6.
    (Continuing anyway in case CUDA is present but nvidia-smi isn't on PATH.)
WARN

LATENTSYNC_DIR="${LATENTSYNC_DIR:-$HOME/tools/LatentSync}"

# ── 0. Clone + install LatentSync (one time) ────────────────────────────────
if [ ! -d "$LATENTSYNC_DIR" ]; then
  echo "[latentsync] cloning into $LATENTSYNC_DIR…"
  git clone --depth 1 https://github.com/bytedance/LatentSync "$LATENTSYNC_DIR"
fi
cd "$LATENTSYNC_DIR"
if [ ! -d .venv ]; then
  python3 -m venv .venv
  source .venv/bin/activate
  pip install --quiet --upgrade pip
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu124
  pip install --quiet -e . 2>/dev/null || pip install --quiet -r requirements.txt
else
  source .venv/bin/activate
fi

BASE_ABS="$(cd "$(dirname "$BASE")" && pwd)/$(basename "$BASE")"
AUDIO_ABS="$(cd "$(dirname "$AUDIO")" && pwd)/$(basename "$AUDIO")"
OUT_ABS="$(cd "$(dirname "$OUT")" && pwd 2>/dev/null || mkdir -p "$OUT" && cd "$OUT" && pwd)/$(basename "$OUT")"

# ── 1. Extend the base clip to the voiceover length ───────────────────────
# Boomerang (forward → reverse → …) so the loop has no visible jump cut.
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AUDIO_ABS")"
LOOPED="${TMPDIR:-/tmp}/lipsync_base_$$ .mp4"
LOOPED="$(echo "$LOOPED" | tr -d ' ')"
echo "[latentsync] extending base to ${DUR}s (boomerang loop)…"
ffmpeg -hide_banner -loglevel error -y -i "$BASE_ABS" -filter_complex \
  "[0:v]reverse[rev];[0:v][rev]concat=n=2:v=1:a=0,loop=-1:0" \
  -t "$DUR" -an "$LOOPED"

# ── 2. LatentSync inference ────────────────────────────────────────────────
# Checkpoints auto-download from Hugging Face on first run (~8 GB).
echo "[latentsync] syncing mouth to audio…"
python inference.py \
  --inference_config configs/inference/inference_v2.yaml \
  --video_path "$LOOPED" \
  --audio_path "$AUDIO_ABS" \
  --output_path "$OUT_ABS" \
  || cat >&2 <<'FALLBACK'
If the flag names were rejected by your LatentSync version, set the three paths
manually in configs/inference/inference_v2.yaml and re-run:
    python inference.py --inference_config configs/inference/inference_v2.yaml
FALLBACK

rm -f "$LOOPED"
echo "✅ talking-head video → $OUT_ABS"
echo "   QA before posting: mouth phonemes match? teeth clean? no face wobble at loop seams?"
echo "   If uncanny in close-up → fall back to the B-roll format (docs/04 §7) — calendar works either way."
