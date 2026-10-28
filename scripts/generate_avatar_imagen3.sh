#!/usr/bin/env bash
# generate_avatar_imagen3.sh — Phase 3, Step B (persona stills).
#
# Mode 1 — generate master portrait / new scene (no reference):
#   ./scripts/generate_avatar_imagen3.sh out.png "<master prompt from docs/01 §2.1>"
#
# Mode 2 — identity-preserving scene edit (with reference = master portrait):
#   ./scripts/generate_avatar_imagen3.sh out.png "<scene delta prompt>" master.png
#
# Optional env: IMAGEN_MODEL (default imagen-3.0-generate-002),
#              IMAGEN_ASPECT (default 4:5), IMAGEN_SEED (default 20260101),
#              GCP_PROJECT_ID, GCP_REGION (scripts/.env.pipeline)
set -euo pipefail

OUT="${1:?Usage: $0 <output.png> \"<prompt>\" [reference.png]}"
PROMPT="${2:?Usage: $0 <output.png> \"<prompt>\" [reference.png]}"
REF="${3:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$SCRIPT_DIR/.env.pipeline" ] && source "$SCRIPT_DIR/.env.pipeline"
: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID in scripts/.env.pipeline}"
GCP_REGION="${GCP_REGION:-asia-southeast1}"
IMAGEN_MODEL="${IMAGEN_MODEL:-imagen-3.0-generate-002}"
ASPECT="${IMAGEN_ASPECT:-4:5}"
SEED="${IMAGEN_SEED:-20260101}"

NEGATIVE="cartoon, illustration, 3d render, anime, deformed face, extra fingers, asymmetric eyes, plastic skin, oversaturated, watermark, text, distorted hands"

TOKEN="$(gcloud auth print-access-token)"

# Build instance (with/without reference image) via python for safe base64.
INSTANCE="$(python3 - "$PROMPT" "$REF" <<'PY'
import json, sys, os
prompt, ref = sys.argv[1], sys.argv[2]
inst = {"prompt": prompt}
if ref:
    with open(ref, "rb") as f:
        inst["image"] = {"bytesBase64Encoded": __import__("base64").b64encode(f.read()).decode()}
print(json.dumps(inst))
PY
)"

PARAMS="$(python3 - "$ASPECT" "$SEED" "$NEGATIVE" <<'PY'
import json, sys
print(json.dumps({
    "sampleCount": 4,
    "aspectRatio": sys.argv[1],
    "seed": int(sys.argv[2]),
    "negativePrompt": sys.argv[3]
}))
PY
)"

PAYLOAD="{\"instances\": [${INSTANCE}], \"parameters\": ${PARAMS}}"

ENDPOINT="https://aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/${IMAGEN_MODEL}:predict"

RESP="$(curl -sS -X POST -H "Authorization: Bearer ${TOKEN}" -H "Content-Type: application/json" -d "$PAYLOAD" "$ENDPOINT")"

if echo "$RESP" | grep -q '"error"'; then
  echo "Imagen API error:" >&2; echo "$RESP" >&2; exit 1
fi

# Save all candidates; copy the winner manually, or the first if script is pipelined.
TMP_RESP="$(mktemp)"
printf '%s' "$RESP" > "$TMP_RESP"
python3 - "$OUT" "$TMP_RESP" <<'PY'
import json, sys, base64, os
out, tmp = sys.argv[1], sys.argv[2]
with open(tmp) as f:
    resp = json.load(f)
preds = resp.get("predictions", [])
if not preds:
    sys.stderr.write("No predictions returned\n"); sys.exit(1)
os.makedirs(os.path.dirname(out) or ".", exist_ok=True)
for i, p in enumerate(preds):
    img = base64.b64decode(p["bytesBase64Encoded"])
    target = out if i == 0 else out.rsplit(".", 1)[0] + f"-alt{i}." + out.rsplit(".", 1)[1]
    with open(target, "wb") as f:
        f.write(img)
    print("Saved:", target)
PY
rm -f "$TMP_RESP"
