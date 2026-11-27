#!/usr/bin/env python3
"""gen_cards_day04.py — Day-4 cards (AI-augmented workflows: the 3 repos).

Numbered receipt layout: big index, repo name, one-line what-it-does.
Reused: repos.png, every_video.png, outro.png, badge, end_overlay.
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1920
SLATE950, CYAN, VIOLET, WHITE, SLATE300 = "#020617", "#22d3ee", "#8b5cf6", "#f8fafc", "#cbd5e1"
OUT = "output/assembly_cards/day04"
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

print("day04 cards:")
# hook 1 — "AI won't replace developers."
img, d = base()
center(d, 700, "AI won't replace", 150, WHITE)
center(d, 920, "developers.", 150, WHITE)
save(img, "hook_1.png")

# hook 2 — "Developers using AI will."
img, d = base()
center(d, 640, "DEVELOPERS", 170, CYAN)
center(d, 880, "USING AI", 170, CYAN)
center(d, 1140, "will.", 150, WHITE)
save(img, "hook_2.png")

# hero — "I don't talk about AI workflows in theory. I ship them."
img, d = base()
center(d, 560, "Ivan Yeo", 150, WHITE)
rule(d, 780)
center(d, 880, "AI-augmented workflows", 84, CYAN)
center(d, 1020, "shipped, not theorized", 64, SLATE300)
save(img, "hero_d4.png")

# workflow receipts — numbered repo cards
def wf(idx, name, sub1, sub2=None):
    img, d = base()
    center(d, 480, idx, 300, CYAN)
    rule(d, 810)
    center(d, 900, name, 120, WHITE)
    center(d, 1080, sub1, 56, SLATE300)
    if sub2:
        center(d, 1170, sub2, 56, SLATE300)
    save(img, f"wf{int(idx)}.png")

wf("01", "WC2OpenAPI", "an AI webchat, served", "as an OpenAI-compatible API")
wf("02", "EasyAnalytics", "plain English in —", "real SQL back")
wf("03", "AEO Optim", "answer-engine optimization,", "for a changing search")

print("✅ day04 card set complete")
