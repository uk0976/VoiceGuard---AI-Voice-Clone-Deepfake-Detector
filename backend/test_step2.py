"""
Test script for Step 2: /analyze REST endpoint verification
Tests file upload handling, response structure, and error cases using FastAPI TestClient.
"""

import os
import sys
import io
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def create_sample_wav(filename: str = "test_audio.wav", duration: float = 2.0, sr: int = 16000):
    """Generates a synthetic speech-like WAV file for testing."""
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    # 220Hz fundamental with harmonics
    waveform = (0.5 * np.sin(2 * np.pi * 220 * t) + 
                0.25 * np.sin(2 * np.pi * 440 * t) + 
                0.1 * np.sin(2 * np.pi * 880 * t)).astype(np.float32)
    
    filepath = os.path.join(os.path.dirname(__file__), filename)
    sf.write(filepath, waveform, sr)
    print(f"Created sample WAV: {filepath}")
    return filepath


def test_analyze_endpoint():
    wav_path = create_sample_wav()

    print("\n--- Testing POST /analyze with valid WAV file ---")
    with open(wav_path, "rb") as f:
        response = client.post(
            "/analyze",
            files={"file": ("test_audio.wav", f, "audio/wav")}
        )

    print(f"Status Code: {response.status_code}")
    print(f"Response JSON: {response.json()}")

    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    data = response.json()

    # Verify JSON shape exactly matches Section 5
    assert "label" in data, "Missing 'label'"
    assert "confidence" in data, "Missing 'confidence'"
    assert "model_score" in data, "Missing 'model_score'"
    assert "heuristic_flags" in data, "Missing 'heuristic_flags'"

    assert data["label"] in ["likely_ai_generated", "likely_real"]
    assert isinstance(data["confidence"], (int, float))
    assert isinstance(data["model_score"], (int, float))
    assert isinstance(data["heuristic_flags"], list)

    print("Valid file test passed!\n")

    print("--- Testing POST /analyze with invalid file type ---")
    fake_txt = io.BytesIO(b"this is not audio")
    bad_response = client.post(
        "/analyze",
        files={"file": ("notes.txt", fake_txt, "text/plain")}
    )
    print(f"Bad file Status Code: {bad_response.status_code}")
    print(f"Bad file Detail: {bad_response.json()}")
    assert bad_response.status_code == 400, f"Expected 400 for bad file, got {bad_response.status_code}"
    print("Invalid file test passed!\n")

    # Clean up test file
    if os.path.exists(wav_path):
        os.remove(wav_path)
        print(f"Removed temporary sample: {wav_path}")

    print(">>> Step 2 verification passed successfully! <<<")


if __name__ == "__main__":
    try:
        test_analyze_endpoint()
        sys.exit(0)
    except Exception as e:
        print(f"Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
