"""
VoiceGuard — Demo Clips Batch Verification Script
Runs all .wav and .mp3 files in backend/demo_clips/ through the /analyze endpoint.
Prints a formatted breakdown of confidence scores, model scores, and heuristic flags,
and computes score divergence between real and synthetic clips.
"""

import os
import sys
import glob
from typing import List, Dict, Any
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)
DEMO_CLIPS_DIR = os.path.join(os.path.dirname(__file__), "demo_clips")


def run_demo_clips_evaluation():
    print("=" * 70)
    print(" VoiceGuard — Demo Clips Evaluation & Score Divergence Check")
    print(f" Directory: {DEMO_CLIPS_DIR}")
    print("=" * 70)

    # Find all audio clips
    audio_patterns = ["*.wav", "*.mp3", "*.ogg", "*.flac"]
    clip_paths: List[str] = []
    for pattern in audio_patterns:
        clip_paths.extend(glob.glob(os.path.join(DEMO_CLIPS_DIR, pattern)))

    clip_paths = sorted(clip_paths)

    if not clip_paths:
        print("\n[!] No audio clips found in backend/demo_clips/ yet.")
        print("Please place your paired .wav or .mp3 files in this directory:")
        print("  e.g.  backend/demo_clips/real_1.wav")
        print("        backend/demo_clips/fake_1.wav")
        print("        backend/demo_clips/real_2.wav")
        print("        backend/demo_clips/fake_2.wav")
        print("Then run this script again to verify score divergence.\n")
        return

    print(f"\nFound {len(clip_paths)} audio clip(s) to analyze:\n")

    results: List[Dict[str, Any]] = []
    real_scores: List[float] = []
    fake_scores: List[float] = []

    for path in clip_paths:
        filename = os.path.basename(path)
        print(f"--> Analyzing: {filename} ...", end=" ", flush=True)

        try:
            with open(path, "rb") as f:
                response = client.post(
                    "/analyze",
                    files={"file": (filename, f, "audio/wav")}
                )

            if response.status_code != 200:
                print(f"FAILED (Status {response.status_code})")
                print(f"    Detail: {response.text}")
                continue

            data = response.json()
            print("DONE")

            confidence = data["confidence"]
            model_score = data["model_score"]
            label = data["label"]
            flags = data["heuristic_flags"]

            results.append({
                "filename": filename,
                "label": label,
                "confidence": confidence,
                "model_score": model_score,
                "flags": flags
            })

            # Track scores if naming indicates real vs fake
            fname_lower = filename.lower()
            if "real" in fname_lower:
                real_scores.append(confidence)
            elif "fake" in fname_lower or "ai" in fname_lower or "synth" in fname_lower:
                fake_scores.append(confidence)

        except Exception as e:
            print(f"ERROR: {e}")

    # Display Results Table
    print("\n" + "-" * 80)
    print(f"{'Filename':<24} | {'Label':<20} | {'Confidence':<10} | {'Model Score':<11} | {'Flags':<15}")
    print("-" * 80)

    for r in results:
        flags_str = ", ".join(r["flags"]) if r["flags"] else "None"
        print(f"{r['filename']:<24} | {r['label']:<20} | {r['confidence']*100:>8.1f}% | {r['model_score']*100:>9.1f}% | {flags_str}")

    print("-" * 80)

    # Score Divergence Analysis (Section 7 check)
    if real_scores and fake_scores:
        avg_real = sum(real_scores) / len(real_scores) * 100
        avg_fake = sum(fake_scores) / len(fake_scores) * 100
        gap = avg_fake - avg_real

        print("\n=== SCORE DIVERGENCE ANALYSIS ===")
        print(f"  Avg Real Voice Score  : {avg_real:5.1f}% (target: ~10% - 25%)")
        print(f"  Avg Fake Voice Score  : {avg_fake:5.1f}% (target: ~75% - 95%+)")
        print(f"  Divergence Separation : {gap:5.1f}%")

        if gap >= 50.0:
            print("  [SUCCESS] Strong divergence! Real and fake audio are cleanly separated.")
        elif gap >= 30.0:
            print("  [ACCEPTABLE] Moderate divergence. Consider testing additional voice samples.")
        else:
            print("  [WARNING] Weak divergence. Check audio quality, background noise, or TTS engine.")
    else:
        print("\n[Tip] Name your audio files with 'real_' or 'fake_' prefixes to see automatic divergence metrics.")

    print("\n" + "=" * 70 + "\n")


if __name__ == "__main__":
    run_demo_clips_evaluation()
