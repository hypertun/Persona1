#!/usr/bin/env python3
"""assemble_video.py — Day-N video assembly (ffmpeg + PIL, zero AI, zero cloud).

Produces the Montage Presenter video from the batch assets: voiceover
(edge-tts Andrew, natural pace), living-portrait webms, assembly cards
(1080x1920 PNGs), word-synced captions (rendered as PIL strips), and the
AI-presenter badge overlay. Everything runs locally; ~1 min per video.

The beat map below is Day 1's worked example. For future videos:
  1. regenerate the VO + word timings (edge-tts, boundary="WordBoundary")
  2. swap the beat map anchors to the new script's key words
  3. reuse the same portrait webms / metric cards; add new topic cards as needed

Inputs (all under output/): voiceovers/day01_tts.mp3, work/word_timings.json,
living_portraits/*.webm, assembly_cards/*.png
Output: output/final/<name>.mp4 — 1080x1920, VO + captions + badge.
No music/whooshes (add in CapCut if desired) — cuts are hard, captions pop in.
"""
import json
import os
import subprocess

# ── Config ────────────────────────────────────────────────────────────────
VO_MP3 = "output/voiceovers/day01_tts.mp3"
TIMINGS = "output/work/word_timings.json"
OUTRO_HOLD = 2.0
FONT = "/System/Library/Fonts/Helvetica.ttc"
BADGE = "output/assembly_cards/badge_ai_presenter.png"

# beat map: (anchor_word, visual_kind, asset_path) — each visual starts when
# the voice says the anchor word. "portrait" clips freeze their last frame if
# the beat is longer than the clip.
BEATS = [
    (None,          "portrait", "output/living_portraits/01_hook_sway.webm"),   # from 0:00
    ("ivan",        "card",     "output/assembly_cards/hero_intro.png"),
    ("measure",     "card",     "output/assembly_cards/money.png"),
    ("receipts",    "card",     "output/assembly_cards/metric_80.png"),
    ("QA",          "card",     "output/assembly_cards/metric_60.png"),
    ("migrations",  "card",     "output/assembly_cards/metric_100.png"),
    ("channel",     "card",     "output/assembly_cards/channel.png"),
    ("Golang",      "card",     "output/assembly_cards/topic_golang.png"),
    ("AWS",         "card",     "output/assembly_cards/topic_aws.png"),
    ("GCP",         "card",     "output/assembly_cards/topic_gcp.png"),
    ("AI-augmented","card",     "output/assembly_cards/topic_ai.png"),
    ("video",       "portrait", "output/living_portraits/02_conviction_nod.webm"),  # "Every video…"
    ("hypotheticals","card",    "output/assembly_cards/repos.png"),
    ("Follow",      "portrait", "output/living_portraits/03_cta_smile.webm"),
]
OUTRO_CARD = "output/assembly_cards/outro.png"   # holds after the last portrait
PORTRAIT_LEN = 3.375  # seconds per living-portrait clip


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"FFMPEG FAILED:\n{' '.join(cmd)[:200]}\n{r.stderr[-500:]}")


def main():
    words = json.load(open(TIMINGS))
    vo_end = words[-1]["end"] + 0.33
    total = vo_end + OUTRO_HOLD

    def t(word):
        return next(w["start"] for w in words if w["word"].strip(".,—").lower() == word.lower())

    # ── plan segments ─────────────────────────────────────────────
    segs = []
    for i, (anchor, kind, src) in enumerate(BEATS):
        start = 0.0 if anchor is None else t(anchor) - 0.15
        end = t(BEATS[i + 1][0]) - 0.15 if i + 1 < len(BEATS) and BEATS[i + 1][0] else total
        segs.append([start, end, kind, src])
    last_start = segs[-1][0]
    if total - last_start > PORTRAIT_LEN:                       # outro card after smile
        segs.append([last_start + PORTRAIT_LEN, total, "card", OUTRO_CARD])
    segs = [(max(0.0, a), b, k, s) for a, b, k, s in segs if b > a]

    # ── render segments ─────────────────────────────────────────
    os.makedirs("output/work/segs", exist_ok=True)
    for f in os.listdir("output/work/segs"):
        os.remove(f"output/work/segs/{f}")
    seg_files = []
    for i, (start, end, kind, src) in enumerate(segs):
        dur = end - start
        out = f"output/work/segs/seg{i:02d}.mp4"
        if kind == "portrait":
            pad = max(0.0, dur - PORTRAIT_LEN)
            vf = f"scale=1080:1920:flags=lanczos,setsar=1,fps=24,tpad=stop_mode=clone:stop_duration={pad:.2f}"
            run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-vf", vf, "-t", f"{dur:.2f}",
                 "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-pix_fmt", "yuv420p", out])
        else:
            frames = max(1, round(dur * 24))
            vf = (f"scale=2160:3840:flags=lanczos,"
                  f"zoompan=z='1+0.06*on/{frames}':d={frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
                  f"s=1080x1920:fps=24,setsar=1")
            run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", src, "-vf", vf,
                 "-t", f"{dur:.2f}", "-c:v", "libx264", "-preset", "fast", "-crf", "20",
                 "-pix_fmt", "yuv420p", out])
        seg_files.append(out)

    with open("output/work/concat.txt", "w") as f:
        for s in seg_files:
            f.write(f"file '{os.path.abspath(s)}'\n")
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
         "-i", "output/work/concat.txt", "-c", "copy", "output/work/timeline.mp4"])

    # ── caption cues: group words (≤3 or on punctuation) ─────────
    group, cues, cue_start = [], [], None

    def flush():
        if group:
            cues.append((cue_start, group[-1]["end"], " ".join(w["word"] for w in group)))

    for w in words:
        if cue_start is None:
            cue_start = w["start"]
        group.append(w)
        if len(group) >= 3 or (w["word"].rstrip("…").endswith((".", "!", "?", ",", "—")) and len(group) >= 2):
            flush()
            group, cue_start = [], None
    flush()

    from PIL import Image, ImageDraw, ImageFont
    font = ImageFont.truetype(FONT, 76, index=1)
    os.makedirs("output/work/cues", exist_ok=True)
    for f in os.listdir("output/work/cues"):
        os.remove(f"output/work/cues/{f}")
    meta = []
    for i, (a, b, text) in enumerate(cues):
        tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
        box = tmp.textbbox((0, 0), text, font=font, stroke_width=8)
        w, h = box[2] - box[0], box[3] - box[1]
        img = Image.new("RGBA", (w + 60, h + 60), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        d.text((30 - box[0], 30 - box[1]), text, font=font, fill=(248, 250, 252, 255),
               stroke_width=8, stroke_fill=(2, 6, 23, 216))
        path = f"output/work/cues/cue{i:03d}.png"
        img.save(path)
        meta.append((a, b, path, img.width, img.height))

    # ── compose: badge + caption overlays + VO ──────────────────
    inputs = ["-i", "output/work/timeline.mp4", "-i", VO_MP3, "-i", BADGE]
    for a, b, p, w, h in meta:
        inputs += ["-loop", "1", "-t", f"{total:.2f}", "-i", p]

    parts = ["[0:v][2:v]overlay=48:1692:enable='gte(t,0)'[vb]"]
    prev, n_in = "vb", 3 + len(meta)
    for i, (a, b, p, w, h) in enumerate(meta):
        idx = n_in - len(meta) + i
        label = "[vout]" if i == len(meta) - 1 else f"[c{i}]"
        parts.append(f"[{prev}][{idx}:v]overlay=(1080-{w})/2:1490-{h}:"
                     f"enable='between(t,{a:.2f},{b:.2f})'{label}")
        prev = f"c{i}"
    fc = ";".join(parts)

    out = f"output/final/day01_v1.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error"] + inputs +
         ["-filter_complex", fc, "-map", "[vout]", "-map", "1:a", "-t", f"{total:.2f}",
          "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p",
          "-af", "apad", "-c:a", "aac", "-b:a", "192k", out])
    print(f"✅ {out} — {total:.1f}s, {len(segs)} beats, {len(cues)} caption cues")


if __name__ == "__main__":
    main()
