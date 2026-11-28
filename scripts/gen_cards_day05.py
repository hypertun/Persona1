#!/usr/bin/env python3
"""gen_cards_day05.py — Day-5 cards (Terraform / infrastructure as code).

Reused: every_video.png, outro.png, badge, end_overlay.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1920
SLATE950, CYAN, VIOLET, WHITE, SLATE300 = "#020617", "#22d3ee", "#8b5cf6", "#f8fafc", "#cbd5e1"
OUT = "output/assembly_cards/day05"
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

print("day05 cards:")
# hook 1 — "I stopped clicking through AWS consoles in 2021."
img, d = base()
center(d, 560, "2021.", 290, CYAN)
rule(d, 900)
center(d, 990, "the last time I clicked", 84, WHITE)
center(d, 1110, "through an AWS console", 84, WHITE)
save(img, "hook_1.png")

# hook 2 — "Terraform. Every time."
img, d = base()
center(d, 640, "TERRAFORM.", 200, WHITE)
center(d, 980, "every time.", 130, CYAN)
save(img, "hook_2.png")

# hero — "every database, bucket, and service I've provisioned since is code"
img, d = base()
center(d, 560, "Ivan Yeo", 150, WHITE)
rule(d, 780)
center(d, 880, "infrastructure as code", 84, CYAN)
center(d, 1020, "databases · buckets · services", 60, SLATE300)
save(img, "hero_d5.png")

# drift — "three environments drift apart and nobody knows which one is real"
img, d = base()
center(d, 640, "environments drift.", 120, WHITE)
center(d, 830, "apart.", 120, WHITE)
rule(d, 1050)
center(d, 1140, "nobody knows which one is real", 60, SLATE300)
save(img, "drift.png")

# definition — "one definition, version-controlled, reviewed like any other pull request"
img, d = base()
center(d, 620, "one definition.", 130, CYAN)
rule(d, 840)
center(d, 940, "version-controlled", 84, WHITE)
center(d, 1080, "reviewed like any pull request", 64, SLATE300)
save(img, "definition.png")

# apply — "reproducible, auditable, and deletable with the same command"
img, d = base()
center(d, 640, "apply.", 290, CYAN)
rule(d, 970)
center(d, 1060, "reproducible · auditable · deletable", 60, WHITE)
center(d, 1160, "— the same command", 60, SLATE300)
save(img, "apply.png")

# claim — "not overhead / no click-paths in one person's head"
img, d = base()
center(d, 620, "not overhead.", 130, WHITE)
rule(d, 840)
center(d, 940, "reproducible environments", 72, CYAN)
center(d, 1060, "auditable changes", 72, CYAN)
center(d, 1220, "no click-paths in one person's head", 56, SLATE300)
save(img, "claim.png")

print("✅ day05 card set complete")
