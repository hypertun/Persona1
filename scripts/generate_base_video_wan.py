#!/usr/bin/env python3
"""generate_base_video_wan.py — ONE-TIME base talking-head video (Wan 2.1 I2V 1.3B).

Turns the master portrait into a short vertical clip with SUBTLE motion and a
NEUTRAL resting mouth. LatentSync then repaints the mouth per voiceover — so
this clip is generated once, vetted by eye, and reused for every video.

    master portrait (public/images/avatar.png)
        → Wan 2.1-I2V (this script)
    → ONE base clip (subtle head sway, neutral mouth)
        → LatentSync per voiceover (scripts/lipsync_latentsync.sh)
    → final talking-head videos (same face every time)

Usage:
    python3 scripts/generate_base_video_wan.py \\
        --portrait output/imagen/avatar.png \\
        --output output/wan/base.mp4

Hardware reality (docs/04 §5):
    CUDA (incl. rented 4090 / Kaggle T4): ~2-5 min for 81 frames (5s @ 16fps)
    Apple Silicon (MPS): works in fp16 but slow — default 33 frames (~2s).
    Loop/boomerang to full VO length happens in lipsync_latentsync.sh, so a
    short base is fine; generate the LONGEST clean clip your hardware allows.

Install once (venv):
    pip install torch diffusers transformers accelerate safetensors
"""
import argparse

import torch
from diffusers import AutoencoderKLWan, WanImageToVideoPipeline
from diffusers.utils import export_to_video, load_image

MODEL_ID = "Wan-AI/Wan2.1-I2V-1.3B"

# The base must NOT talk — LatentSync replaces the mouth region from a clean slate.
DEFAULT_PROMPT = (
    "photorealistic man in his early 30s facing the camera, subtle natural head "
    "movement, calm confident expression, gentle occasional blink, neutral "
    "resting mouth, slow cinematic camera drift, modern dark office background "
    "with cool teal rim light, high detail"
)
NEGATIVE_PROMPT = (
    "talking mouth movement, moving lips, exaggerated expression, distorted "
    "face, hands, extra people, text, watermark, fast motion"
)


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--portrait", required=True, help="master portrait image (png)")
    p.add_argument("--output", required=True, help="output video path (mp4)")
    p.add_argument("--prompt", default=DEFAULT_PROMPT)
    p.add_argument("--num-frames", type=int, default=None,
                   help="default: 81 on CUDA (5s @ 16fps), 33 on MPS")
    p.add_argument("--width", type=int, default=480)
    p.add_argument("--height", type=int, default=832)  # 9:16 vertical
    p.add_argument("--seed", type=int, default=20260101)
    args = p.parse_args()

    if torch.cuda.is_available():
        device, dtype = "cuda", torch.bfloat16
    elif getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
        device, dtype = "mps", torch.float16
    else:
        raise SystemExit("No CUDA/MPS device found. Rent a GPU (docs/04 §5) or run on Kaggle.")

    num_frames = args.num_frames or (81 if device == "cuda" else 33)
    print(f"[wan-i2v] device={device} dtype={dtype} frames={num_frames} ({num_frames/16:.1f}s @ 16fps)")

    # VAE must stay float32 to avoid NaNs (diffusers requirement for Wan).
    vae = AutoencoderKLWan.from_pretrained(MODEL_ID, subfolder="vae", torch_dtype=torch.float32)
    pipe = WanImageToVideoPipeline.from_pretrained(MODEL_ID, vae=vae, torch_dtype=dtype)
    pipe.to(device)

    image = load_image(args.portrait)
    generator = torch.Generator(device=device).manual_seed(args.seed)

    print("[wan-i2v] generating… (MPS: expect tens of minutes — grab coffee)")
    result = pipe(
        image=image,
        prompt=args.prompt,
        negative_prompt=NEGATIVE_PROMPT,
        height=args.height,
        width=args.width,
        num_frames=num_frames,
        guidance_scale=5.0,
        num_inference_steps=30,
        generator=generator,
    ).frames[0]

    export_to_video(result, args.output, fps=16)
    print(f"✅ base video → {args.output}")
    print("   NEXT: eyeball it. Face consistent with the portrait? Mouth neutral? Motion subtle?")
    print("   Then: ./scripts/lipsync_latentsync.sh to sync it with a voiceover.")


if __name__ == "__main__":
    main()
