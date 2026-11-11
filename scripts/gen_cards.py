#!/usr/bin/env python3
"""gen_cards.py — all Day-1 typographic cards (1080x1920) + overlays.

v2: EVERY text line fit-checked to <=1000px (auto-shrink) — no card can
overflow the frame. Arrows are drawn vectors, not font glyphs (Helvetica
lacks →/↓; they render as tofu boxes []).
Design system: SLATE950 bg, cyan/violet accents, brand palette (docs/01).
"""
from PIL import Image, ImageDraw, ImageFont
import os

W, H = 1080, 1920
SLATE950, CYAN, VIOLET, WHITE, SLATE300 = "#020617", "#22d3ee", "#8b5cf6", "#f8fafc", "#cbd5e1"
OUT = "output/assembly_cards"
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
    """largest font size <= size whose width fits maxw"""
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

def arrow_down(d, x, y_top, h, w, color=CYAN):
    """drawn ↓ arrow: stem + head"""
    d.rectangle([x - w//10, y_top, x + w//10, y_top + int(h*0.55)], fill=color)
    d.polygon([(x - w//2, y_top + int(h*0.5)),
               (x + w//2, y_top + int(h*0.5)),
               (x, y_top + h)], fill=color)

def save(img, name):
    img.save(f"{OUT}/{name}")
    print(f"  ✓ {name}")

print("cards:")
# ── hook stamps ──
for fname, big, sub in [("hook_1.png", "5 YEARS", "of building systems"),
                        ("hook_2.png", "3 INDUSTRIES", "one standard")]:
    img, d = base()
    f = center(d, 700, big, 290, CYAN)
    rule(d, 1120)
    center(d, 1220, sub, 88, WHITE)
    save(img, fname)

img, d = base()
center(d, 560, "ONE OBSESSION", 120, CYAN)
rule(d, 760)
center(d, 860, "systems", 160, WHITE)
center(d, 1080, "that don't", 160, WHITE)
center(d, 1300, "fall over.", 160, CYAN)
save(img, "hook_text.png")

# ── identity / money ──
img, d = base()
center(d, 620, "Ivan Yeo", 150, WHITE)
rule(d, 840)
center(d, 940, "Senior Consultant Developer", 72, CYAN)
center(d, 1080, "Singapore · 5+ years · 3 industries", 56, SLATE300)
save(img, "hero_intro.png")

img, d = base()
center(d, 720, "cloud-native systems.", 96, WHITE)
center(d, 900, "measured like money.", 96, CYAN)
save(img, "money.png")

# ── metric receipts (resume-verified: NTUC 80%, Shopee 60%, EP One 100%) ──
def metric_card(fname, big, arrow, label):
    img, d = base()
    f = font(fit(big, 300, 880))
    bw = d.textlength(big, font=f)
    ah = int(f.size * 0.72) if arrow else 0          # arrow height
    total = bw + (f.size*0.42 + ah if arrow else 0)
    x0 = (W - total) / 2
    d.text((x0, 660), big, font=f, fill=CYAN)
    if arrow:
        arrow_down(d, x0 + bw + f.size*0.42 + ah//2, 780, ah, int(f.size*0.5))
    rule(d, 1090)
    center(d, 1180, label, 64, WHITE)
    save(img, fname)

metric_card("metric_80.png", "80%", True, "manual SAP order posting")
metric_card("metric_60.png", "60%", True, "manual test cycles")
metric_card("metric_100.png", "100%", False, "data integrity — every migration")

# ── channel + topics ──
img, d = base()
center(d, 640, "on this channel:", 84, WHITE)
center(d, 820, "the architecture", 120, CYAN)
center(d, 1010, "behind the numbers", 120, CYAN)
save(img, "channel.png")

for fname, top, sub in [("topic_golang.png", "Golang", "concurrency in production"),
                        ("topic_aws.png", "AWS", "architecture that scales"),
                        ("topic_gcp.png", "GCP", "cloud-native delivery"),
                        ("topic_ai.png", "AI-augmented", "workflows that keep you fast")]:
    img, d = base()
    center(d, 740, top, 150, WHITE)
    rule(d, 980)
    center(d, 1070, sub, 60, CYAN)
    save(img, fname)

# ── conviction beat ──
img, d = base()
center(d, 640, "EVERY VIDEO", 120, WHITE)
center(d, 830, "a real system I've built", 80, CYAN)
rule(d, 1010)
center(d, 1100, "no hypotheticals · no recycled slide decks", 52, SLATE300)
save(img, "every_video.png")

# ── receipts card (real repos) ──
img, d = base()
center(d, 620, "real systems.", 110, WHITE)
center(d, 800, "real numbers.", 110, CYAN)
rule(d, 1010)
center(d, 1100, "github.com/hypertun", 76, WHITE)
center(d, 1260, "WC2OpenAPI · EasyAnalytics · AEO Optim", 52, SLATE300)
save(img, "repos.png")

# ── outro ──
img, d = base()
center(d, 700, "Follow", 160, CYAN)
center(d, 950, "@IvanBuilds", 120, WHITE)
rule(d, 1160)
center(d, 1250, "check my bio for the consult link", 64, SLATE300)
save(img, "outro.png")

# ── AI-presenter badge (transparent overlay, bottom-left) ──
badge = Image.new("RGBA", (420, 96), (0, 0, 0, 0))
d = ImageDraw.Draw(badge)
d.rounded_rectangle([0, 0, 419, 95], radius=18, fill=(2, 6, 23, 216), outline=(34, 211, 238, 255), width=2)
d.ellipse([24, 32, 56, 64], fill=(139, 92, 246, 255))
d.text((76, 26), "AI presenter", font=font(34), fill=(248, 250, 252, 255))
d.text((76, 58), "ivanbuilds", font=font(26), fill=(203, 213, 225, 255))
save(badge, "badge_ai_presenter.png")

# ── end-face overlay: follow text over the closing smile (transparent) ──
ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(ov)
f1 = font(fit("Follow @IvanBuilds", 84, 620))
f2 = font(fit("check my bio", 64, 620))
f3 = font(fit("for the consult link", 64, 620))
w1, w2, w3 = (d.textlength(t, font=f) for t, f in
              [("Follow @IvanBuilds", f1), ("check my bio", f2), ("for the consult link", f3)])
panel_w = max(w1, w2, w3) + 140
px0 = (W - panel_w) / 2
d.rounded_rectangle([px0, 380, px0 + panel_w, 800], radius=32,
                    fill=(2, 6, 23, 178), outline=(34, 211, 238, 220), width=3)
d.text(((W - w1)/2, 440), "Follow @IvanBuilds", font=f1, fill=(34, 211, 238, 255))
d.text(((W - w2)/2, 575), "check my bio", font=f2, fill=(248, 250, 252, 255))
d.text(((W - w3)/2, 670), "for the consult link", font=f3, fill=(248, 250, 252, 255))
save(ov, "end_overlay.png")

print("✅ card set complete (all lines fit-checked)")
