#!/usr/bin/env python3
"""gen_cards_day02.py — Day-2 typographic cards (Golang concurrency).

Same design system as gen_cards.py (fit-checked, no overflow, drawn arrows).
Layouts specific to Day-2 beats; shared cards (metric_80, every_video, outro,
badge, end_overlay) are reused from output/assembly_cards/.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1920
SLATE950, CYAN, VIOLET, WHITE, SLATE300 = "#020617", "#22d3ee", "#8b5cf6", "#f8fafc", "#cbd5e1"
OUT = "output/assembly_cards/day02"
os.makedirs(OUT, exist_ok=True)
MAXW = 1000

def font(size, bold=True):
    for c, idx in [("/System/Library/Fonts/Helvetica.ttc", 1 if bold else 0),
                   ("/System/Library/Fonts/HelveticaNeue.ttc", 1 if bold else 0)]:
        try: return ImageFont.truetype(c, size, index=idx)
        except Exception: continue
    raise RuntimeError("no system font")

def mono(size):
    return ImageFont.truetype("/System/Library/Fonts/Menlo.ttc", size, index=0)

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

print("day02 cards:")
# hook 1 — "Your backend doesn't need more servers."
img, d = base()
center(d, 700, "MORE SERVERS?", 200, CYAN)
rule(d, 980)
center(d, 1070, "your backend doesn't need them", 72, WHITE)
save(img, "hook_1.png")

# hook 2 — "It needs goroutines and channels."
img, d = base()
center(d, 640, "It needs", 84, WHITE)
center(d, 800, "goroutines", 160, CYAN)
center(d, 1030, "+ channels", 160, CYAN)
save(img, "hook_2.png")

# hero — "I'm Ivan — five years shipping order systems in Golang, retail/logistics/gaming"
img, d = base()
center(d, 560, "Ivan Yeo", 150, WHITE)
rule(d, 780)
center(d, 880, "order systems in Golang", 84, CYAN)
center(d, 1020, "retail · logistics · gaming", 64, SLATE300)
save(img, "hero_d2.png")

# pattern A — "you don't poll it in a loop"
img, d = base()
f = center(d, 700, "don't poll it", 120, WHITE)
center(d, 890, "in a loop.", 120, WHITE)
rule(d, 1110)
center(d, 1200, "polling wastes the thread you needed", 56, SLATE300)
save(img, "pattern_a.png")

# pattern B — code card: go process(order) — fire, hand off, move on
img, d = base()
code = "go process(order)"
size = 96
f = mono(size)
while d.textlength(code, font=f) > 940 and size > 48:
    size -= 4; f = mono(size)
x0 = (W - d.textlength(code, font=f)) / 2
d.text((x0, 660), code, font=f, fill=WHITE)
d.text((x0, 660), "go", font=f, fill=CYAN)   # keyword overdraw — same origin, no math
rw = min(d.textlength(code, font=f) + 120, 940)
d.rectangle([(W - rw)/2, 830, (W + rw)/2, 838], fill=VIOLET)
center(d, 900, "fire · hand off · move on", 72, CYAN)
save(img, "pattern_b.png")

# case — Happy Hour Games: React portal on Golang backend
img, d = base()
center(d, 640, "React + Golang", 150, WHITE)
rule(d, 880)
center(d, 980, "a real portal, real traffic", 72, CYAN)
center(d, 1110, "no server fleet", 72, CYAN)
save(img, "hhg.png")

print("✅ day02 card set complete")
