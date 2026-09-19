# VoiceGuard — AI Voice Clone / Deepfake Detector
### Build Spec for AI Coding Agent (Claude Code / Antigravity)

> **Read this entire file before writing any code.** This is the authoritative spec. Build in the exact order given in Section 7. Do not add features not listed in Section 1. No live pitch/presentation is required for this project — final deliverables are the working app + bundled demo clips + a report + a PPT, submitted as files (no live judge demo). This changes nothing about code quality expectations, but means recorded/bundled demo reliability matters more than live-improvisation resilience.

---

## 1. Scope (in / out)

**In scope — build exactly this:**
1. File-upload analysis: upload an audio clip → get a real/AI-generated score + explanation
2. Real-time streaming analysis: stream live mic audio → get a continuously updating score + explanation, via WebSocket
3. A small set of bundled, pre-tested demo audio clips (real + AI-generated pairs) shipped with the project, so the app is demo-ready without the user needing to supply their own files
4. One pretrained HuggingFace classifier model + one heuristic (signal-processing) explainability layer, combined into the final score

**Out of scope — do not build:**
- Model training or fine-tuning
- User accounts / auth / database
- Multi-language support beyond what the model already handles
- Any UI beyond a single clean page (upload + live-stream toggle + results panel)
- Cloud deployment (local run is sufficient; only deploy if everything else is done with real time to spare)

---

## 2. Problem Statement (for context / report use)

AI voice cloning is now realistic enough to fool people in real time, and is being actively used in scam calls ("grandparent scam"), CEO/business fraud, and automated robocalls. There is no accessible, explainable tool for a normal person or call-center operator to check "is this voice real or AI-generated?" in the moment. VoiceGuard analyzes an audio clip or live stream and returns a confidence score plus specific, human-readable reasons — not just a black-box number.

---

## 3. Tech Stack (exact — do not substitute without a strong reason)

**Backend**
- Python 3.10 or 3.11
- FastAPI + Uvicorn (`uvicorn[standard]` — needed for WebSocket support)
- `transformers` — HuggingFace pipeline, model: `MelodyMachine/Deepfake-audio-detection-V2`
- `torch` + `torchaudio`
- `librosa` + `soundfile` — heuristic feature extraction
- `python-multipart` — file upload support
- `websockets` (comes with `uvicorn[standard]`)
- `numpy`, `scipy`

**Frontend**
- React (Vite)
- Native browser `WebSocket` API for streaming mode
- Native `MediaRecorder` / `AudioContext` (Web Audio API) for mic capture
- `axios` or `fetch` for the file-upload REST call
- Simple charting for the live score meter — a basic canvas/SVG bar or `recharts` is fine, do not over-engineer

**No database. No auth. No cloud deployment required.**

---

## 4. Architecture

### Mode A — File Upload (primary, must be rock-solid)
```
Browser (upload button) --POST /analyze (multipart file)--> FastAPI
FastAPI: load audio -> run HF pipeline -> run heuristics -> merge -> return JSON
Browser: render score + explanation panel
```

### Mode B — Real-Time Streaming (secondary, build after Mode A works)
```
Browser (mic) --WebSocket /ws/stream--> FastAPI
  Browser captures ~1.5-2 sec rolling audio chunks via Web Audio API,
  sends each chunk as the stream continues (PCM or WAV-encoded blob)
FastAPI: on each chunk -> run same pipeline (HF pipeline + heuristics)
  -> send back {chunk_score, rolling_avg_score, label, reasons} over the same socket
Browser: update a live meter + rolling waveform/score graph as messages arrive
  Smooth the displayed score with a rolling average (e.g. last 5 chunks)
  to avoid flicker from single noisy chunks
```

**Both modes call the same core analysis function** (`analyze_audio(waveform, sample_rate)` in the backend) — do not duplicate the model/heuristic logic between the REST and WebSocket handlers. Build this shared function first, then wire both endpoints to it.

---

## 5. API Contract

### `POST /analyze`
- Input: multipart form file upload (`.wav` or `.mp3`)
- Output:
```json
{
  "label": "likely_ai_generated",
  "confidence": 0.87,
  "model_score": 0.91,
  "heuristic_flags": [
    "Unnaturally stable pitch (low jitter)",
    "Missing natural breath pauses",
    "Flat spectral envelope"
  ]
}
```

### `WS /ws/stream`
- Client sends: binary audio chunk (PCM16 or WAV blob) every ~1.5-2 seconds
- Server sends back, per chunk:
```json
{
  "chunk_score": 0.85,
  "rolling_avg_score": 0.79,
  "label": "likely_ai_generated",
  "heuristic_flags": ["Unnaturally stable pitch (low jitter)"]
}
```
- Server should keep a short rolling buffer (last ~5 chunks) per connection to compute `rolling_avg_score` and smooth out single-chunk noise
- Handle client disconnect cleanly (no crash, release resources)

---

## 6. Heuristic Layer (explainability — build this as real signal processing, not fake output)

Using `librosa`, compute per audio segment:
1. **Pitch jitter** — F0 tracking via `librosa.pyin`; unnaturally low jitter variance across the clip is a synthetic-voice signal → flag `"Unnaturally stable pitch (low jitter)"`
2. **Spectral flatness** — `librosa.feature.spectral_flatness`; unusually flat/smooth spectrum can indicate synthesis → flag `"Flat spectral envelope"`
3. **Pause/silence pattern** — detect silence segments via energy thresholding; real speech has irregular micro-pauses, synthetic speech is often too regular or missing natural breath pauses → flag `"Missing natural breath pauses"`

Combine into a `heuristic_score` (0-1) using simple weighted thresholds (document the thresholds you pick in the code comments — they don't need to be perfectly tuned, they need to be honest and explainable). Merge `model_score` and `heuristic_score` into the final `confidence` (e.g. weighted average, model weighted higher since it's the trained classifier) and return whichever heuristic checks crossed their flag threshold as `heuristic_flags`.

---

## 7. Demo Clips (build/gather this in parallel with backend work, not last)

Create a `/demo_clips` folder in the project with:
- 2-3 real human voice clips (record your own voice reading short sentences — 5-10 seconds each)
- 2-3 AI-generated clips of the **same sentences** (via ElevenLabs free tier or Coqui TTS), so the real/fake comparison is clean and directly comparable
- Run every clip through `/analyze` and confirm scores clearly diverge (real ~10-25%, fake ~75-95%+) before finalizing which clips ship as the official demo set
- Add a "Try a demo clip" section in the frontend UI that loads these bundled clips with one click/tap — this is what judges will actually click when reviewing the submission, so it must work with zero setup on their end

Also record a short screen-capture video (2-3 min) showing:
1. File-upload mode with the demo clip pair (real → low score, fake → high score)
2. Real-time streaming mode with live mic input
This video should be included in your final submission alongside the report/PPT, since there's no live demo — this is the closest thing judges get to watching it work.

---

## 8. Build Order (follow this sequence — do not build out of order)

1. Backend project scaffold, shared `analyze_audio()` function with just the HF model (no heuristics yet)
2. `/analyze` REST endpoint using that function — test via curl/Postman with a real audio file
3. Add the heuristic layer, merge into `analyze_audio()` output, re-test `/analyze`
4. Gather demo clips (can happen in parallel with step 5-6 by the user, while the agent continues building)
5. Frontend: file upload UI wired to `/analyze`, results panel
6. `/ws/stream` WebSocket endpoint using the same `analyze_audio()` function on rolling chunks
7. Frontend: mic capture + WebSocket client + live score meter
8. Wire demo clips into the frontend as one-click buttons
9. End-to-end test: fresh browser session, both modes, with final demo clips
10. Record the screen-capture demo video
11. Polish: error handling (bad file type, mic permission denied, connection drop), loading states

**If time runs short, Mode B (real-time streaming) is the first thing to cut or simplify** — Mode A (file upload) must work perfectly; Mode A is the non-negotiable core.

---

## 9. Project File Structure (suggested)

```
voiceguard/
├── backend/
│   ├── main.py              # FastAPI app, /analyze and /ws/stream routes
│   ├── analysis.py          # shared analyze_audio() function, model + heuristics
│   ├── heuristics.py        # pitch jitter, spectral flatness, pause detection
│   ├── requirements.txt
│   └── demo_clips/
│       ├── real_1.wav
│       ├── fake_1.wav
│       └── ...
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── FileUpload.jsx
│   │   │   ├── LiveStream.jsx
│   │   │   ├── ResultsPanel.jsx
│   │   │   └── DemoClipPicker.jsx
│   │   └── api.js           # REST + WebSocket client logic
│   ├── package.json
│   └── vite.config.js
└── README.md                # this file
```

---

## 10. Report Content Checklist (since this is submitted, not presented live, it needs to stand alone)

- Problem statement with real-world grounding (voice cloning scam prevalence)
- Why this isn't a simple LLM/API wrapper — explain the two-layer detection approach (trained classifier + explainable heuristics) explicitly
- Architecture diagram (use Section 4 above)
- Tech stack and model choice justification
- Screenshots of both modes working, plus a link/reference to the demo video
- Honest limitations section: detection accuracy varies with voice-cloning quality and audio conditions; this is a "second opinion" tool, not a guaranteed verdict — state this explicitly, judges respect honesty about limitations more than overclaiming
- Future scope: multi-model ensemble, call-center integration, browser extension for live calls

---

## 11. Non-Negotiable Reminders
- Do not skip testing demo clips for score divergence before finalizing them — an unclear real-vs-fake score gap undermines the entire submission
- Keep the shared `analyze_audio()` function as the single source of truth for both endpoints — do not fork the logic
- Mode A (file upload) is the safety net; it must be flawless even if Mode B has rough edges
- No feature beyond Section 1's scope, even if there's spare time — use spare time to polish and re-test what's already built
