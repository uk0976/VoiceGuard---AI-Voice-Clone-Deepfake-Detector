"""
Test script for Step 3: Re-testing /analyze with the Heuristic Layer integrated
Verifies that /analyze returns model_score, confidence, label, and heuristic_flags.
"""

import os
import sys
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def test_analyze_with_heuristics():
    sr = 16000
    duration = 3.0
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    
    # Synthetic tone with harmonics (stable pitch, low jitter)
    waveform = (
        0.5 * np.sin(2 * np.pi * 220 * t) +
        0.25 * np.sin(2 * np.pi * 440 * t) +
        0.1 * np.sin(2 * np.pi * 880 * t)
    ).astype(np.float32)

    sample_path = os.path.join(os.path.dirname(__file__), "step3_test_audio.wav")
    sf.write(sample_path, waveform, sr)
    print(f"Generated sample audio: {sample_path}")

    print("\n--- Sending POST /analyze with Heuristic Layer enabled ---")
    with open(sample_path, "rb") as f:
        response = client.post(
            "/analyze",
            files={"file": ("step3_test_audio.wav", f, "audio/wav")}
        )

    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Updated /analyze Response JSON:\n{data}")

    # Clean up test file
    if os.path.exists(sample_path):
        os.remove(sample_path)

    # Validations
    assert response.status_code == 200, f"Expected 200, got {response.status_code}"
    assert "label" in data
    assert "confidence" in data
    assert "model_score" in data
    assert "heuristic_flags" in data
    assert isinstance(data["heuristic_flags"], list)
    
    print(f"\nModel Score: {data['model_score']}")
    print(f"Final Confidence: {data['confidence']}")
    print(f"Verdict Label: {data['label']}")
    print(f"Triggered Heuristic Flags: {data['heuristic_flags']}")
    print("\n>>> Step 3 verification passed successfully! <<<")


if __name__ == "__main__":
    try:
        test_analyze_with_heuristics()
        sys.exit(0)
    except Exception as e:
        print(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
