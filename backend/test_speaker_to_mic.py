"""
VoiceGuard — Automated Speaker-to-Mic Acoustic Round-Trip Test
Plays a demo clip through default system speakers, simultaneously captures
the room audio via default microphone, saves the re-recording, and runs it
through the /analyze endpoint to verify acoustic robustness.
"""

import os
import sys
import time
import soundfile as sf
import sounddevice as sd
import numpy as np
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)
DEMO_DIR = os.path.join(os.path.dirname(__file__), "demo_clips")


def round_trip_test(filename: str, padding_sec: float = 0.5):
    filepath = os.path.join(DEMO_DIR, filename)
    if not os.path.exists(filepath):
        print(f"[!] File not found: {filepath}")
        return None

    print("-" * 65)
    print(f"[*] Testing Acoustic Round-Trip: {filename}")
    
    # 1. Load source audio
    source_audio, sr = sf.read(filepath)
    if source_audio.ndim > 1:
        source_audio = np.mean(source_audio, axis=1)
    source_audio = source_audio.astype(np.float32)

    duration = len(source_audio) / sr
    total_record_sec = duration + padding_sec
    total_record_samples = int(total_record_sec * sr)

    print(f"    Source Duration: {duration:.2f}s | Sample Rate: {sr} Hz")
    print(f"    Playing via default speakers & recording from default mic...")

    # Pad playback audio with silence to match recording buffer
    playback_buffer = np.zeros(total_record_samples, dtype=np.float32)
    playback_buffer[:len(source_audio)] = source_audio

    try:
        # 2. Simultaneous Playback & Microphone Recording
        captured = sd.playrec(
            playback_buffer,
            samplerate=sr,
            channels=1,
            dtype="float32"
        )
        sd.wait() # Wait until playback and capture complete
        captured = captured.flatten()
        peak = float(np.max(np.abs(captured)))
        if peak > 1e-4:
            captured = (captured / peak) * 0.85
        print(f"    Capture complete ({len(captured)} samples captured, peak={peak:.4f}).")

    except Exception as e:
        print(f"[!] Audio hardware error during playrec: {e}")
        print("    Falling back to acoustic simulation with room impulse & noise model...")
        # Simulate acoustic round-trip with room reverberation and ambient noise
        noise = np.random.normal(0, 0.005, len(source_audio)).astype(np.float32)
        # Low-pass acoustic absorption filter
        absorbed = np.convolve(source_audio, [0.1, 0.2, 0.4, 0.2, 0.1], mode='same').astype(np.float32)
        captured = absorbed + noise

    # 3. Save temporary captured WAV file
    temp_wav_name = f"captured_{filename}"
    temp_wav_path = os.path.join(os.path.dirname(__file__), temp_wav_name)
    sf.write(temp_wav_path, captured, sr, subtype="PCM_16")
    print(f"    Saved captured audio to: {temp_wav_path}")

    # 4. Dispatch captured audio to /analyze
    print(f"    Evaluating captured audio through /analyze ...")
    with open(temp_wav_path, "rb") as f:
        response = client.post(
            "/analyze",
            files={"file": (temp_wav_name, f, "audio/wav")}
        )

    if response.status_code != 200:
        print(f"[ERROR] /analyze failed with code {response.status_code}: {response.text}")
        return None

    data = response.json()

    # 5. Clean up temporary captured file
    if os.path.exists(temp_wav_path):
        try:
            os.remove(temp_wav_path)
        except Exception:
            pass

    return data


def run_benchmark():
    print("=" * 70)
    print(" VoiceGuard — Speaker-to-Mic Round-Trip Robustness Evaluation")
    print(" Verifying that acoustic room degradation preserves score divergence")
    print("=" * 70)

    test_files = sys.argv[1:] if len(sys.argv) > 1 else ["fake_1.wav", "real_1.wav"]
    results = {}

    for fname in test_files:
        res = round_trip_test(fname)
        if res:
            results[fname] = res
            time.sleep(1.0)

    print("\n" + "=" * 70)
    print(" SUMMARY: ACOUSTIC ROUND-TRIP /ANALYZE RESULTS")
    print("=" * 70)
    print(f"{'Filename':<16} | {'Verdict':<20} | {'Confidence':<10} | {'Model Score':<11} | {'Flags'}")
    print("-" * 70)

    for fname, data in results.items():
        flags_str = ", ".join(data.get("heuristic_flags", [])) or "None"
        conf = data.get("confidence", 0) * 100
        mod = data.get("model_score", 0) * 100
        lbl = data.get("label", "")
        print(f"{fname:<16} | {lbl:<20} | {conf:>8.1f}% | {mod:>9.1f}% | {flags_str}")
        print(f"  -> Raw /analyze JSON: {data}")

    print("-" * 70)

    if "fake_1.wav" in results and "real_1.wav" in results:
        fake_score = results["fake_1.wav"]["confidence"] * 100
        real_score = results["real_1.wav"]["confidence"] * 100
        gap = fake_score - real_score
        print(f"\nRound-Trip Divergence Gap: {gap:.1f}%")
        if gap >= 40.0:
            print("[SUCCESS] Acoustic round-trip preserved strong real vs fake divergence!")
        else:
            print("[NOTE] Divergence narrowed under room acoustics; inspect speaker/mic levels.")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_benchmark()
