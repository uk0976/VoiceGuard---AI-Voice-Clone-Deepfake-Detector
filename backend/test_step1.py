"""
Test script for Step 1: Backend scaffold and shared analyze_audio() function
Verifies model inference and exact output shape matching the README Section 5 spec.
"""

import sys
import numpy as np
from analysis import analyze_audio

def test_analyze_audio_synthetic_sample():
    print("Generating 2-second test audio sample...")
    sr = 16000
    t = np.linspace(0, 2.0, int(sr * 2.0), endpoint=False)
    # Generate simple harmonic tone with modulation (simulating audio)
    waveform = (0.5 * np.sin(2 * np.pi * 220 * t) + 0.25 * np.sin(2 * np.pi * 440 * t)).astype(np.float32)
    
    print("Calling analyze_audio(waveform, sr)...")
    result = analyze_audio(waveform, sr)
    print(f"Result: {result}")
    
    # Assertions based on Section 5 spec
    assert isinstance(result, dict), "Result must be a dict"
    assert "label" in result, "Missing 'label' in result"
    assert "confidence" in result, "Missing 'confidence' in result"
    assert "model_score" in result, "Missing 'model_score' in result"
    assert "heuristic_flags" in result, "Missing 'heuristic_flags' in result"
    
    assert result["label"] in ["likely_ai_generated", "likely_real"], f"Invalid label: {result['label']}"
    assert 0.0 <= result["confidence"] <= 1.0, f"Invalid confidence range: {result['confidence']}"
    assert 0.0 <= result["model_score"] <= 1.0, f"Invalid model_score range: {result['model_score']}"
    assert isinstance(result["heuristic_flags"], list), "heuristic_flags must be a list"
    assert len(result["heuristic_flags"]) == 0, "Step 1 should have empty heuristic_flags"
    
    print(">>> Step 1 verification passed successfully! <<<")

if __name__ == "__main__":
    try:
        test_analyze_audio_synthetic_sample()
        sys.exit(0)
    except Exception as e:
        print(f"Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
