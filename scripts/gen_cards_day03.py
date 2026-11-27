#!/usr/bin/env python3
"""gen_cards_day03.py — Day-3 cards (QA framework: Builder + mock servers).

Same design system: fit-checked (no overflow), drawn vector arrows.
Reused from the shared set: metric_60.png (receipt beat), every_video.png,
outro.png, badge, end_overlay.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1920
SLATE950, CYAN, VIOLET, WHITE, SLATE300 = "#020617", "#22d3ee", "#8b5cf6", "#f8fafc", "#cbd5e1"
OUT = "output/assembly_cards/day03"
os.makedirs(OUT, exist_ok=True)
MAXW = 1000

def font(size, bold=True):
    for c, idx in [("/System/Library/Fonts/Helvetica.ttc", 1 if bold else 0),
                   ("/System/Library/Fonts/HelveticaNeue.ttc", 1 if bold else 0)]:
        try: return ImageFont.truetype(c, size, index=idx)
        except Exception: continue
    raise RuntimeError("no system font")

_tmp = ImageDraw.Draw(Image.new("RGB", (10, 10)))

def fit(text, size, maxw=MAXW):
    s = size
    while s > 24 and _tmp.textlength(text, font=font(s)) > maxw:
        s -= 4
    return s

def base():
    img = Image.new("RGB", (W, H), SLATE950)
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, W, 8], fill=CYAN)
    d.rectangle([0, 8, W, 12], fill=VIOLET)
    return img, d

def center(d, y, text, size, fill, maxw=MAXW):
    f = font(fit(text, size, maxw))
    d.text(((W - d.textlength(text, font=f)) / 2, y), text, font=f, fill=fill)
    return f

def rule(d, y):
    d.rectangle([W/2-160, y, W/2+160, y+8], fill=VIOLET)

def save(img, name):
    img.save(f"{OUT}/{name}")
    print(f"  ✓ {name}")

print("day03 cards:")
# hook — "We deleted sixty percent of our manual test cycles."
img, d = base()
center(d, 640, "WE DELETED", 130, WHITE)
center(d, 830, "60%", 290, CYAN)
rule(d, 1160)
center(d, 1260, "of our manual test cycles", 72, WHITE)
save(img, "hook_1.png")

# hook 2 — "Not by hiring. By design."
img, d = base()
center(d, 720, "Not by hiring.", 130, WHITE)
center(d, 940, "By design.", 130, CYAN)
save(img, "hook_2.png")

# hero — "I'm Ivan — and at Shopee, I built the QA framework that did it."
img, d = base()
center(d, 560, "Ivan Yeo", 150, WHITE)
rule(d, 780)
center(d, 880, "QA framework at Shopee", 84, CYAN)
center(d, 1020, "Builder pattern · mock servers", 60, SLATE300)
save(img, "hero_d3.png")

# builder A — "The pattern? Builder."
img, d = base()
center(d, 700, "The pattern?", 110, WHITE)
center(d, 890, "Builder.", 290, CYAN)
save(img, "builder_a.png")

# builder B — "Every test request assembled step by step — readable, reusable, hard to set up wrong."
img, d = base()
center(d, 660, "assemble.", 130, WHITE)
center(d, 860, "step by step.", 130, WHITE)
rule(d, 1090)
center(d, 1180, "readable · reusable", 72, CYAN)
center(d, 1290, "hard to set up wrong", 72, CYAN)
save(img, "builder_b.png")

# mocks — "mock servers answered instead — no flaky dependencies, no waiting for staging."
img, d = base()
center(d, 560, "mock servers", 170, CYAN)
center(d, 790, "answered instead", 100, WHITE)
rule(d, 990)
center(d, 1080, "no flaky dependencies", 64, WHITE)
center(d, 1190, "no waiting for staging", 64, WHITE)
save(img, "mocks.png")

print("✅ day03 card set complete")
