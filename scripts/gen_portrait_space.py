#!/usr/bin/env python3
"""gen_portrait_space.py — batch-once living portraits via a free HF Space.

Calls a clean Wan 2.2 I2V ZeroGPU Space (Saravutw/WAN2.2_I2V_LIGHTNING,
gradio_client) with the persona face crop. ~30 s per clip, anonymous, free.
Fallback Spaces (clean, RUNNING as of this build): alexnasa/Wan2.2-Animate-ZEROGPU,
amisima/Wan_2.2_I2V_Studio.

Usage: python3 scripts/gen_portrait_space.py <output.mp4> <prompt> [seed]
"""
import sys
from gradio_client import Client, handle_file

SPACE = "Saravutw/WAN2.2_I2V_LIGHTNING_4-8step_custom"
FACE = "output/imagen/master-face-crop.jpg"

out, prompt = sys.argv[1], sys.argv[2]
seed = int(sys.argv[3]) if len(sys.argv) > 3 else 42

c = Client(SPACE)
video, _download, used_seed = c.predict(
    input_image=handle_file(FACE),
    last_image=None,
    prompt=prompt,
    steps=4,
    duration_seconds=3.5,
    safe_mode=True,
    randomize_seed=False,
    seed=seed,
    api_name="/generate_video",
)
import shutil
shutil.copy(video, out)
print(f"✅ {out} (seed={used_seed})")
