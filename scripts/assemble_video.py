#!/usr/bin/env python3
"""assemble_video.py — Day-1 assembly (ffmpeg + PIL, minutes, zero AI here).

v4 — Space-generated portrait assets (mp4 672x832 @16fps, cover-cropped to
1080x1920), Higgs VO, char-weighted word timings (sentence-exact), pure type
open, end-on-face smile close. Beat map anchored to word timings; cards land
on their exact voice beats. Badge + word-synced captions throughout.
"""
import json
import os
import subprocess

VO = "output/voiceovers/day01_higgs.wav"
TIMINGS = "output/work/word_timings.json"
FONT = "/System/Library/Fonts/Helvetica.ttc"
BADGE = "output/assembly_cards/badge_ai_presenter.png"
PORTRAIT_LEN = 3.5625  # Space clips: 3.5 s @16 fps

BEATS = [
    # pure typographic open — the face appears only at the end
    (None,           "card",     "output/assembly_cards/hook_1.png"),          # "Five years."
    ("industries",   "card",     "output/assembly_cards/hook_2.png"),         # "Three industries."
    ("obsession",    "card",     "output/assembly_cards/hook_text.png"),     # "One obsession — systems that don't fall over."
    ("ivan",         "card",     "output/assembly_cards/hero_intro.png"),
    ("measure",      "card",     "output/assembly_cards/money.png"),
    ("receipts",     "card",     "output/assembly_cards/metric_80.png"),
    ("QA",           "card",     "output/assembly_cards/metric_60.png"),
    ("migrations",   "card",     "output/assembly_cards/metric_100.png"),
    ("channel",      "card",     "output/assembly_cards/channel.png"),
    ("Golang",       "card",     "output/assembly_cards/topic_golang.png"),
    ("AWS",          "card",     "output/assembly_cards/topic_aws.png"),
    ("GCP",          "card",     "output/assembly_cards/topic_gcp.png"),
    ("AI-augmented", "card",     "output/assembly_cards/topic_ai.png"),
    ("video",        "card",     "output/assembly_cards/every_video.png"),   # conviction beat as type
    ("hypotheticals","card",     "output/assembly_cards/repos.png"),
    ("Follow",       "card",     "output/assembly_cards/outro.png"),          # voice ends over outro card
]
END_FACE = "output/living_portraits/03_cta_smile.mp4"  # face lingers, smile forms, end


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"FFMPEG FAILED:\n{' '.join(cmd)[:200]}\n{r.stderr[-500:]}")


def main():
    words = json.load(open(TIMINGS))
    vo_end = words[-1]["end"] + 0.05
    total = vo_end + PORTRAIT_LEN

    def t(word):
        return next(w["start"] for w in words
                    if w["word"].strip(".,—:").lower() == word.lower())

    # ── plan segments ─────────────────────────────────────────────
    segs = []
    for i, (anchor, kind, src) in enumerate(BEATS):
        start = 0.0 if anchor is None else t(anchor) - 0.15
        end = (t(BEATS[i + 1][0]) - 0.15 if i + 1 < len(BEATS)
               else vo_end)
        segs.append([start, end, kind, src])
    segs.append([vo_end, total, "portrait", END_FACE])  # end-on-face close
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
            # 672x832 → cover-crop 1080x1920, 16fps source → 24fps timeline
            vf = ("scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,"
                  "crop=1080:1920,setsar=1,fps=24")
            run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-vf", vf,
                 "-t", f"{dur:.2f}", "-an",
                 "-c:v", "libx264", "-preset", "fast", "-crf", "20",
                 "-pix_fmt", "yuv420p", out])
        else:
            frames = max(1, round(dur * 24))
            vf = (f"scale=2160:3840:flags=lanczos,"
                  f"zoompan=z='1+0.06*on/{frames}':d={frames}:"
                  f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=24,setsar=1")
            run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", src,
                 "-vf", vf, "-t", f"{dur:.2f}",
                 "-c:v", "libx264", "-preset", "fast", "-crf", "20",
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
            cues.append((cue_start, group[-1]["end"],
                         " ".join(w["word"] for w in group)))

    for w in words:
        if cue_start is None:
            cue_start = w["start"]
        group.append(w)
        if len(group) >= 2 or w["word"].rstrip("…").endswith((".", "!", "?", ",", "—", ":")):
            flush()
            group, cue_start = [], None
    flush()

    from PIL import Image, ImageDraw, ImageFont
    os.makedirs("output/work/cues", exist_ok=True)
    for f in os.listdir("output/work/cues"):
        os.remove(f"output/work/cues/{f}")
    MAXW = 840

    def render(lines, size):
        font = ImageFont.truetype(FONT, size, index=1)
        tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
        boxes = [tmp.textbbox((0, 0), ln, font=font, stroke_width=8) for ln in lines]
        w = max(b[2] - b[0] for b in boxes)
        lh = max(b[3] - b[1] for b in boxes) + 18
        img = Image.new("RGBA", (w + 60, lh * len(lines) + 60), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        for k, (ln, b) in enumerate(zip(lines, boxes)):
            lw = b[2] - b[0]
            d.text(((img.width - lw) / 2 - b[0], 30 + k * lh - b[1]), ln, font=font,
                   fill=(248, 250, 252, 255),
                   stroke_width=8, stroke_fill=(2, 6, 23, 216))
        return img

    meta = []
    for i, (a, b, text) in enumerate(cues):
        img = None
        for size in (64, 58, 52, 46, 42):     # single line, shrink to fit
            f = ImageFont.truetype(FONT, size, index=1)
            tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
            if tmp.textlength(text, font=f) <= MAXW:
                img = render([text], size)
                break
        if img is None:                        # two-line wrap at middle space
            toks = text.split()
            half = len(toks) // 2
            l1, l2 = " ".join(toks[:half]), " ".join(toks[half:])
            for size in (56, 50, 44):
                f = ImageFont.truetype(FONT, size, index=1)
                tmp = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
                if max(tmp.textlength(l1, font=f), tmp.textlength(l2, font=f)) <= MAXW:
                    img = render([l1, l2], size)
                    break
        path = f"output/work/cues/cue{i:03d}.png"
        img.save(path)
        meta.append((a, b, path, img.width, img.height))

    # ── compose: badge + caption overlays + VO ──────────────────
    inputs = ["-i", "output/work/timeline.mp4", "-i", VO, "-i", BADGE,
              "-loop", "1", "-t", f"{total:.2f}",
              "-i", "output/assembly_cards/end_overlay.png"]
    for a, b, p, w, h in meta:
        inputs += ["-loop", "1", "-t", f"{total:.2f}", "-i", p]

    parts = ["[0:v][2:v]overlay=48:1692:enable='gte(t,0)'[vb0]",
             f"[vb0][3:v]overlay=0:0:enable='gte(t,{vo_end:.2f})'[vb]"]
    prev, n_in = "vb", 4 + len(meta)
    for i, (a, b, p, w, h) in enumerate(meta):
        idx = n_in - len(meta) + i
        label = "[vout]" if i == len(meta) - 1 else f"[c{i}]"
        parts.append(f"[{prev}][{idx}:v]overlay=(1080-{w})/2:1490-{h}:"
                     f"enable='between(t,{a:.2f},{b:.2f})'{label}")
        prev = f"c{i}"
    fc = ";".join(parts)

    os.makedirs("output/final", exist_ok=True)
    out = "output/final/day01_v2.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error"] + inputs +
         ["-filter_complex", fc, "-map", "[vout]", "-map", "1:a",
          "-t", f"{total:.2f}",
          "-c:v", "libx264", "-preset", "medium", "-crf", "21",
          "-pix_fmt", "yuv420p",
          "-af", "apad", "-c:a", "aac", "-b:a", "192k", out])
    print(f"✅ {out} — {total:.1f}s, {len(segs)} beats, {len(cues)} caption cues")


if __name__ == "__main__":
    main()
