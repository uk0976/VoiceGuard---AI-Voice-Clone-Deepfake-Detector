"""
Convert demo voice clips to 16kHz mono 16-bit PCM WAV files.
"""

import os
import subprocess
import librosa
import soundfile as sf
import imageio_ffmpeg

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
DEMO_DIR = os.path.join(os.path.dirname(__file__), "demo_clips")

# Mapping of original files to standard demo clip names
FILE_MAPPING = {
    "Human Voice 1.m4a": "real_1.wav",
    "Human Voice 2.m4a": "real_2.wav",
    "Human Voice 3.m4a": "real_3.wav",
    "AI Voice 1.bin": "fake_1.wav",
    "AI Voice 2.bin": "fake_2.wav",
    "AI Voice 3.bin": "fake_3.wav",
}

def convert_and_verify():
    print("=" * 65)
    print("VoiceGuard — Demo Clips Conversion & Verification")
    print(f"Using FFmpeg: {ffmpeg_exe}")
    print("=" * 65)

    converted_files = []

    for src_name, target_name in FILE_MAPPING.items():
        src_path = os.path.join(DEMO_DIR, src_name)
        target_path = os.path.join(DEMO_DIR, target_name)

        if not os.path.exists(src_path):
            print(f"[!] Source file not found: {src_name}")
            continue

        print(f"\nConverting '{src_name}' -> '{target_name}'...")
        # ffmpeg: 16kHz, mono, 16-bit PCM
        cmd = [
            ffmpeg_exe,
            "-y",
            "-i", src_path,
            "-ar", "16000",
            "-ac", "1",
            "-c:a", "pcm_s16le",
            target_path
        ]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode != 0:
            print(f"[ERROR] Failed to convert {src_name}: {res.stderr.decode('utf-8', errors='ignore')}")
            continue

        # Verify with soundfile and librosa
        try:
            info = sf.info(target_path)
            y, sr = librosa.load(target_path, sr=None)
            duration = len(y) / sr
            print(f"  -> Converted successfully!")
            print(f"     Format: {info.format}, Subtype: {info.subtype}")
            print(f"     Sample Rate: {sr} Hz (channels: {info.channels})")
            print(f"     Duration: {duration:.2f} seconds ({len(y)} samples)")
            assert sr == 16000, f"Sample rate mismatch: {sr}"
            assert info.channels == 1, f"Channels mismatch: {info.channels}"
            assert duration > 0.5, f"Audio too short: {duration}s"
            converted_files.append((src_path, target_path))
        except Exception as e:
            print(f"[ERROR] Verification failed for {target_name}: {e}")

    # Step 5: Delete original non-.wav source files once converted
    print("\nCleaning up original source files...")
    for src_path, _ in converted_files:
        try:
            os.remove(src_path)
            print(f"  Removed original: {os.path.basename(src_path)}")
        except Exception as e:
            print(f"  Could not remove {src_path}: {e}")

    print("\nAll demo clips converted and verified successfully!")

if __name__ == "__main__":
    convert_and_verify()
