#!/usr/bin/env python3
"""render_living_portrait_comfy.py — living-portrait clips via ComfyUI + Wan 2.2-TI2V-5B Q4 GGUF.

Quantized pipeline (maximum value per compute — ~8 GB on disk, low RAM during
renders, laptop stays usable). Renders the 2-4s subtle-motion living-portrait
beats for the Montage Presenter format (docs/03 §Format spec): mouth always
neutral, never speaking.

Usage:
    python3 scripts/render_living_portrait_comfy.py \
        --name 01_hook_sway \
        --prompt "subtle natural head movement, gentle occasional blink, calm
                  confident expression, neutral resting mouth, slow cinematic
                  camera drift, cinematic" \
        [--seed 20260101] [--frames 81] [--width 480] [--height 832] [--steps 30]

Requires (one-time): ~/tools/ComfyUI with ComfyUI-GGUF and the Q4 models in
models/{diffusion_models,text_encoders,vae} — see docs/03 for the full setup.
The input portrait is ~/tools/ComfyUI/input/face_crop.jpg (face ≈45% of frame —
keep that ratio, it's the difference between a good and a degenerate render).
"""
import argparse
import json
import subprocess
import sys
import time
import urllib.error
import urllib.request

COMFYUI_DIR = f"{__import__('os').environ.get('HOME')}/tools/ComfyUI"
PORT = 8188
DEFAULT_NEGATIVE = (
    "talking mouth movement, moving lips, exaggerated expression, distorted "
    "face, hands, extra people, text, watermark, fast motion"
)

# Official ComfyUI recipe for Wan2.2-TI2V-5B (templates/video_wan2_2_5B_ti2v.json):
# Wan22ImageToVideoLatent (NOT WanImageToVideo — the 5B is a flow-mask model;
# the 2.1-style node's conditioning is silently ignored → wrong face),
# ModelSamplingSD3 shift=8, cfg 5, uni_pc/simple, Wan 2.2 VAE.
def build_workflow(prompt, negative, seed, frames, width, height, steps, turbo=False):
    model_src = ["1", 0]
    if turbo:
        model_src = ["12", 0]  # base unet → turbo LoRA
        steps = min(steps, 4)   # turbo: 4 steps, cfg 1.0
    return {
        "1": {"class_type": "UnetLoaderGGUF", "inputs": {"unet_name": "Wan2.2-TI2V-5B-Q4_K_M.gguf"}},
        "12": {"class_type": "LoraLoaderModelOnly", "inputs": {
            "lora_name": "Wan22_TI2V_5B_Turbo_lora_rank_64_fp16.safetensors",
            "strength_model": 1.0, "model": ["1", 0]}},
        "2": {"class_type": "ModelSamplingSD3", "inputs": {"model": model_src, "shift": 8.0}},
        "3": {"class_type": "CLIPLoaderGGUF", "inputs": {"clip_name": "umt5-xxl-encoder-Q4_K_M.gguf", "type": "wan"}},
        "4": {"class_type": "VAELoader", "inputs": {"vae_name": "Wan2.2_VAE.safetensors"}},
        "5": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["3", 0], "text": prompt}},
        "6": {"class_type": "CLIPTextEncode", "inputs": {"clip": ["3", 0], "text": negative}},
        "7": {"class_type": "LoadImage", "inputs": {"image": "face_crop.jpg"}},
        "55": {"class_type": "Wan22ImageToVideoLatent", "inputs": {
            "vae": ["4", 0], "width": width, "height": height,
            "length": frames, "batch_size": 1, "start_image": ["7", 0]}},
        "9": {"class_type": "KSampler", "inputs": {
            "model": ["2", 0], "positive": ["5", 0], "negative": ["6", 0],
            "latent_image": ["55", 0], "seed": seed, "steps": steps, "cfg": 1.0 if turbo else 5.0,
            "sampler_name": "uni_pc", "scheduler": "simple", "denoise": 1.0}},
        "10": {"class_type": "VAEDecode", "inputs": {"samples": ["9", 0], "vae": ["4", 0]}},
        "11": {"class_type": "SaveWEBM", "inputs": {
            "images": ["10", 0], "filename_prefix": "living_portraits/",
            "codec": "vp9", "fps": 24.0, "crf": 24}},
    }


def api(method, path, payload=None, timeout=300):
    data = json.dumps(payload).encode() if payload is not None else None
    req = urllib.request.Request(f"http://127.0.0.1:{PORT}{path}", data=data,
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"ComfyUI API {path} → {e.code}: {e.read().decode()[:400]}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--name", required=True, help="clip name (output file stem)")
    p.add_argument("--prompt", required=True)
    p.add_argument("--negative", default=DEFAULT_NEGATIVE)
    p.add_argument("--seed", type=int, default=20260101)
    p.add_argument("--frames", type=int, default=81)  # 81 @ 24fps ≈ 3.4 s
    p.add_argument("--width", type=int, default=480)
    p.add_argument("--height", type=int, default=832)
    p.add_argument("--steps", type=int, default=30)
    p.add_argument("--turbo", action="store_true", help="Turbo LoRA: 4 steps, cfg 1.0 — ~10 min/clip instead of ~60")
    args = p.parse_args()

    venv_python = f"{COMFYUI_DIR}/.venv/bin/python"
    workflow = build_workflow(args.prompt, args.negative, args.seed,
                              args.frames, args.width, args.height, args.steps, args.turbo)

    print(f"[comfy] starting server on :{PORT} …")
    server = subprocess.Popen(
        [venv_python, "main.py", "--port", str(PORT), "--dont-print-server"],
        cwd=COMFYUI_DIR, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(120):
            try:
                api("GET", "/system_stats", timeout=3)
                break
            except Exception:
                if server.poll() is not None:
                    raise RuntimeError("ComfyUI server died at boot — run it manually to see the error")
                time.sleep(1)
        else:
            raise RuntimeError("server didn't come up in 120 s")
        print("[comfy] server up — queueing render…")
        resp = api("POST", "/prompt", {"prompt": workflow, "client_id": "persona1"})
        prompt_id = resp["prompt_id"]

        while True:
            h = api("GET", f"/history/{prompt_id}", timeout=30)
            if prompt_id in h:
                status = h[prompt_id].get("status", {})
                if status.get("completed"):
                    outputs = h[prompt_id]["outputs"]
                    vids = [v["images"][0]["filename"]
                            for o in outputs.values() for v in o.values()
                            if isinstance(v, dict) and "images" in v]
                    print(f"[comfy] DONE → ComfyUI/output/{vids[0] if vids else '?'}")
                    return
                if status.get("status_str") == "error":
                    raise RuntimeError(f"render failed: {json.dumps(status)[:500]}")
            time.sleep(5)
    finally:
        server.terminate()
        try:
            server.wait(timeout=10)
        except subprocess.TimeoutExpired:
            server.kill()


if __name__ == "__main__":
    sys.exit(main())
