#!/usr/bin/env python3
"""assemble_video.py — day-agnostic Montage Presenter assembly (ffmpeg + PIL).

Usage: python3 scripts/assemble_video.py [days/dayNN.json]   (default: days/day01.json)

Spec fields: vo, timings, output, badge, end_overlay, face_clip, portrait_len,
beats[{anchor (word or null), kind (card|portrait), src}].
Beat anchor = first occurrence of that word in the timings; card lands on its
voice beat. Cards get a slow zoompan push; portraits cover-crop to 1080x1920.
Badge bottom-left throughout; word-synced captions (fit-checked, ≤840px);
end_overlay over the closing face from VO end. Face never speaks.
"""
import json
import os
import subprocess
import sys

FONT = "/System/Library/Fonts/Helvetica.ttc"


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"FFMPEG FAILED:\n{' '.join(cmd)[:200]}\n{r.stderr[-500:]}")


def main():
    spec_path = sys.argv[1] if len(sys.argv) > 1 else "days/day01.json"
    spec = json.load(open(spec_path))
    words = json.load(open(spec["timings"]))
    vo_end = words[-1]["end"] + 0.05
    total = vo_end + spec.get("portrait_len", 3.5625)

    def t(word):
        return next(w["start"] for w in words
                    if w["word"].strip(".,—:").lower() == word.lower())

    # ── plan segments ─────────────────────────────────────────────
    segs = []
    beats = spec["beats"]
    for i, beat in enumerate(beats):
        anchor = beat["anchor"]
        start = 0.0 if anchor is None else t(anchor) - 0.15
        end = (t(beats[i + 1]["anchor"]) - 0.15 if i + 1 < len(beats)
               else vo_end)
        segs.append([start, end, beat["kind"], beat["src"]])
    segs.append([vo_end, total, "portrait", spec["face_clip"]])  # end-on-face close
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

    # ── caption cues: group words (≤2 or on punctuation) ──────────
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

    # ── compose: badge + end overlay + captions + VO ─────────────
    inputs = ["-i", "output/work/timeline.mp4", "-i", spec["vo"], "-i", spec["badge"],
              "-loop", "1", "-t", f"{total:.2f}",
              "-i", spec["end_overlay"]]
    for a, b, p, w, h in meta:
        inputs += ["-loop", "1", "-t", f"{total:.2f}", "-i", p]

    parts = [f"[0:v][2:v]overlay=48:1692:enable='gte(t,0)'[vb0]",
             f"[vb0][3:v]overlay=0:0:enable='gte(t,{vo_end:.2f})'[vb]"]
    prev, n_in = "vb", 4 + len(meta)
    for i, (a, b, p, w, h) in enumerate(meta):
        idx = n_in - len(meta) + i
        label = "[vout]" if i == len(meta) - 1 else f"[c{i}]"
        parts.append(
            f"[{prev}][{idx}:v]overlay=(1080-{w})/2:1560-{h}:"
            f"enable='between(t,{a:.2f},{b:.2f})'{label}")
        prev = f"c{i}"
    fc = ";".join(parts)

    os.makedirs("output/final", exist_ok=True)
    out = spec["output"]
    run(["ffmpeg", "-y", "-loglevel", "error"] + inputs +
        ["-filter_complex", fc, "-map", "[vout]", "-map", "1:a",
         "-t", f"{total:.2f}",
         "-c:v", "libx264", "-preset", "medium", "-crf", "21",
         "-pix_fmt", "yuv420p",
         "-af", "apad", "-c:a", "aac", "-b:a", "192k", out])
    print(f"✅ {out} — {total:.1f}s, {len(segs)} beats, {len(cues)} caption cues  [{spec_path}]")


if __name__ == "__main__":
    main()
