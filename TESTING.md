# VoiceGuard — Testing & Evaluation Guide

This document outlines the testing protocols for both **Mode A (File Upload)** and **Mode B (Real-Time Live Streaming)**, with a specific focus on the **Speaker-to-Mic Acoustic Round-Trip Verification**.

---

## 1. Automated Benchmark Testing (Mode A)

To run all bundled demo clips through the `/analyze` pipeline and verify score divergence:

```powershell
.\backend\.venv\Scripts\python.exe backend\test_demo_clips.py
```

### Benchmark Separation Criteria:
* **Authentic Human Voices (`real_*.wav`)**: Expected score between **1% – 25%** (`likely_real`).
* **AI Cloned Voices (`fake_*.wav`)**: Expected score between **75% – 95%+** (`likely_ai_generated`).
* **Separation Gap ($\Delta$)**: Minimum **50%+** divergence between averages.

---

## 2. Speaker-to-Mic Demo Protocol (Mode B Real-Time)

In a live demonstration or presentation, AI voice detection can be demonstrated in real time through acoustic space (e.g. playing cloned voice audio through a phone/speaker while VoiceGuard listens on a laptop microphone).

### Step-by-Step Procedure:

1. **Start the Servers**:
   ```powershell
   # Terminal 1: Backend
   .\backend\.venv\Scripts\uvicorn.exe main:app --port 8000 --app-dir backend --reload

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```
2. **Open the Dashboard**:
   * Navigate to `http://localhost:5173` in Google Chrome or Microsoft Edge.
   * Click on the **"Mode B: Real-Time Live Stream"** tab.
3. **Initiate Microphone Capture**:
   * Click **"Start Live Listening"** and approve browser microphone access.
   * Observe the live waveform canvas bouncing to confirm the microphone is picking up ambient sound.
4. **Test AI Clone Acoustic Round-Trip (`fake_1.wav` or `fake_2.wav`)**:
   * Play `fake_1.wav` through your computer speakers or phone speaker held near the microphone at normal conversational volume (60–70 dB).
   * **Verification**: Watch the circular gauge update every ~1.5 seconds.
   * **Expected Outcome**: Despite room reverberation, speaker distortion, and ambient noise, the `rolling_avg_score` rapidly climbs above 50% and trends toward **70%–85%**, triggering the **`SUSPECTED AI VOICE CLONE`** red verdict badge and acoustic flag chips (e.g., *Unnaturally stable pitch*).
5. **Test Human Voice Acoustic Round-Trip (`real_1.wav` or `real_2.wav`)**:
   * Play `real_1.wav` through the speaker, or speak natural sentences into the microphone.
   * **Verification**: Watch the circular gauge update.
   * **Expected Outcome**: The `rolling_avg_score` drops and stabilizes between **2%–15%**, triggering the **`AUTHENTIC HUMAN VOICE`** green verdict badge.

---

## 3. Automated Speaker-to-Mic Script (`test_speaker_to_mic.py`)

A standalone script is provided to simulate the acoustic round trip programmatically without requiring manual browser interaction:

```powershell
.\backend\.venv\Scripts\python.exe backend\test_speaker_to_mic.py
```

### What it does:
1. Loads the reference `.wav` clip from `backend/demo_clips/`.
2. Simultaneously plays the audio through your default system speakers while recording from your default microphone using `sounddevice`.
3. Saves the captured acoustic audio as a temporary `.wav` file (`speaker_to_mic_captured.wav`).
4. Dispatches the captured recording to the `POST /analyze` endpoint.
5. Evaluates and logs the resulting score, label, and acoustic flags to verify acoustic robustness.

---

## 4. Tips for Best Results in Live Demos

To maximize detection clarity during acoustic speaker-to-mic demonstrations:
1. **Speaker Volume**: Set system or phone output volume to at least **70%+** so speech harmonics rise clearly above ambient noise.
2. **Microphone Distance**: Position the playback device roughly **1 to 2 feet (30–60 cm)** from the microphone.
3. **Room Acoustics**: Conduct demonstrations in a quiet room to minimize background chatter, fan noise, or intense room echo.
4. **Hardware AEC / Noise Suppression**: Some laptop microphones (e.g. Intel Smart Sound or Realtek Audio Console) have aggressive acoustic echo cancellation (AEC) that intentionally suppresses audio originating from internal laptop speakers. For best acoustic fidelity, use an external speaker or smartphone held near the laptop microphone.

