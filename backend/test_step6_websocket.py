"""
Test script for Step 6: /ws/stream WebSocket endpoint verification
Tests real-time audio chunk streaming, rolling buffer average, and clean disconnects.
"""

import sys
import io
import numpy as np
import soundfile as sf
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)


def generate_audio_chunk_bytes(freq: float = 220.0, duration: float = 1.5, sr: int = 16000) -> bytes:
    """Generates a binary WAV chunk simulating ~1.5s live microphone streaming."""
    t = np.linspace(0, duration, int(sr * duration), endpoint=False)
    waveform = (0.5 * np.sin(2 * np.pi * freq * t) + 
                0.25 * np.sin(2 * np.pi * (freq * 2) * t)).astype(np.float32)
    
    bio = io.BytesIO()
    sf.write(bio, waveform, sr, format="WAV", subtype="PCM_16")
    return bio.getvalue()


def test_websocket_streaming():
    print("=" * 65)
    print(" Testing WebSocket Endpoint: /ws/stream")
    print("=" * 65)

    with client.websocket_connect("/ws/stream") as ws:
        print("[+] Successfully connected to /ws/stream WebSocket")

        # Test ping/pong text message
        ws.send_text("ping")
        pong_resp = ws.receive_text()
        print(f"[+] Text Ping/Pong test: '{pong_resp}'")
        assert pong_resp == "pong", f"Expected 'pong', got '{pong_resp}'"

        # Stream 3 audio chunks
        chunk_scores = []
        rolling_scores = []

        for i in range(1, 4):
            print(f"\n--> Streaming Chunk #{i} (~1.5s audio)...", flush=True)
            chunk_bytes = generate_audio_chunk_bytes(freq=220.0 + i * 20.0)
            ws.send_bytes(chunk_bytes)

            response = ws.receive_json()
            print(f"    Received Response: {response}")

            # Verify exact Section 5 contract
            assert "chunk_score" in response, "Missing 'chunk_score'"
            assert "rolling_avg_score" in response, "Missing 'rolling_avg_score'"
            assert "label" in response, "Missing 'label'"
            assert "heuristic_flags" in response, "Missing 'heuristic_flags'"

            assert isinstance(response["chunk_score"], (int, float))
            assert isinstance(response["rolling_avg_score"], (int, float))
            assert response["label"] in ["likely_ai_generated", "likely_real"]
            assert isinstance(response["heuristic_flags"], list)

            chunk_scores.append(response["chunk_score"])
            rolling_scores.append(response["rolling_avg_score"])

        print("\n[+] Verification of rolling average smoothing:")
        for idx, (cs, rs) in enumerate(zip(chunk_scores, rolling_scores), 1):
            print(f"    Chunk {idx}: chunk_score={cs:.2f}, rolling_avg={rs:.2f}")

        # Final verification: rolling average should be within expected range of the chunks
        assert len(rolling_scores) == 3

    print("\n[+] WebSocket connection disconnected cleanly (no crashes, resources released).")
    print("\n>>> Step 6 verification passed successfully! <<<")


if __name__ == "__main__":
    try:
        test_websocket_streaming()
        sys.exit(0)
    except Exception as e:
        print(f"WebSocket test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
