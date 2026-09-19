"""
VoiceGuard — FastAPI Application
Provides /analyze REST endpoint and /ws/stream WebSocket endpoint.
"""

import io
import os
import logging
from typing import Dict, Any, List, Optional
import soundfile as sf
import librosa
import numpy as np
from collections import deque
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from analysis import analyze_audio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voiceguard.main")

app = FastAPI(
    title="VoiceGuard API",
    description="AI Voice Clone and Deepfake Detection Backend",
    version="1.0.0"
)

# Enable CORS for frontend interactions
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount demo_clips if available
demo_clips_dir = os.path.join(os.path.dirname(__file__), "demo_clips")
if os.path.exists(demo_clips_dir):
    app.mount("/demo_clips", StaticFiles(directory=demo_clips_dir), name="demo_clips")


@app.on_event("startup")
async def startup_event():
    import asyncio
    async def _warm():
        try:
            from analysis import get_model_and_extractor
            logger.info("Pre-warming VoiceGuard neural model in background...")
            await asyncio.to_thread(get_model_and_extractor)
            logger.info("VoiceGuard neural model pre-warmed successfully.")
        except Exception as e:
            logger.warning(f"Model pre-warm note: {e}")
    asyncio.create_task(_warm())


class AnalysisResponse(BaseModel):
    label: str
    confidence: float
    model_score: float
    heuristic_flags: List[str]
    metrics: Optional[Dict[str, Any]] = None


@app.get("/")
def read_root():
    return {"status": "ok", "app": "VoiceGuard", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/demo_clips")
def list_demo_clips():
    """Returns curated demo clips with descriptions for judges and evaluation."""
    clips = [
        {
            "id": "real_1",
            "filename": "real_1.wav",
            "type": "real",
            "title": "Human Voice (Sample 1)",
            "duration": "13.8s",
            "description": "Authentic human speech with natural pitch variance and micro-pauses"
        },
        {
            "id": "fake_1",
            "filename": "fake_1.wav",
            "type": "fake",
            "title": "AI Voice Clone (Sample 1)",
            "duration": "7.4s",
            "description": "High-fidelity neural voice synthesis reading corresponding text"
        },
        {
            "id": "real_2",
            "filename": "real_2.wav",
            "type": "real",
            "title": "Human Voice (Sample 2)",
            "duration": "12.0s",
            "description": "Natural cadence voice with organic formant distribution"
        },
        {
            "id": "fake_2",
            "filename": "fake_2.wav",
            "type": "fake",
            "title": "AI Voice Clone (Sample 2)",
            "duration": "8.7s",
            "description": "Synthesized voice with flattened pitch contour"
        },
        {
            "id": "real_3",
            "filename": "real_3.wav",
            "type": "real",
            "title": "Human Voice (Sample 3)",
            "duration": "6.6s",
            "description": "Short conversational human voice recording"
        },
        {
            "id": "fake_3",
            "filename": "fake_3.wav",
            "type": "fake",
            "title": "AI Voice Clone (Sample 3)",
            "duration": "2.4s",
            "description": "Short synthetic deepfake audio fragment"
        }
    ]
    return {"clips": clips}


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_file(file: UploadFile = File(...)):
    """
    POST /analyze
    Accepts multipart form file upload (.wav or .mp3)
    Returns:
    {
      "label": "likely_ai_generated" | "likely_real",
      "confidence": float,
      "model_score": float,
      "heuristic_flags": list[str]
    }
    """
    filename = file.filename or ""
    extension = os.path.splitext(filename)[1].lower()

    if extension not in [".wav", ".mp3", ".ogg", ".flac", ".m4a"]:
        # Also check content-type if extension not directly obvious
        content_type = file.content_type or ""
        if not content_type.startswith("audio/"):
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format '{extension or 'unknown'}'. Please upload an audio file (.wav, .mp3, .m4a, .ogg)."
            )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded audio file is empty (0 bytes).")

        # Load audio into numpy array and sample rate
        try:
            # First try soundfile for speed
            audio_io = io.BytesIO(content)
            waveform, sample_rate = sf.read(audio_io)
        except Exception:
            # Fallback to librosa which handles mp3, ogg, etc. via audioread/ffmpeg
            try:
                audio_io = io.BytesIO(content)
                waveform, sample_rate = librosa.load(audio_io, sr=None, mono=False)
            except Exception as decode_err:
                logger.warning(f"Failed to decode audio file '{filename}': {decode_err}")
                raise HTTPException(
                    status_code=400,
                    detail="Could not decode audio file. The file may be corrupt or not a recognized audio format."
                )

        waveform = np.asarray(waveform, dtype=np.float32)

        # Run shared analysis engine
        result = analyze_audio(waveform, sample_rate)

        return AnalysisResponse(
            label=result["label"],
            confidence=result["confidence"],
            model_score=result["model_score"],
            heuristic_flags=result["heuristic_flags"],
            metrics=result.get("metrics")
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing audio file '{filename}': {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the audio file: {str(e)}"
        )


def decode_audio_chunk(data: bytes, default_sr: int = 16000) -> tuple[np.ndarray, int]:
    """
    Decodes raw binary audio chunks (WAV, PCM16, or container formats) sent over WebSocket.
    """
    # 1. Check if standard WAV / container header
    if data.startswith(b"RIFF") or len(data) > 44:
        try:
            with io.BytesIO(data) as bio:
                waveform, sr = sf.read(bio)
                arr = np.asarray(waveform, dtype=np.float32)
                if arr.ndim > 1:
                    arr = np.mean(arr, axis=0) if arr.shape[0] < arr.shape[1] else np.mean(arr, axis=1)
                return arr, sr
        except Exception:
            pass

    # 2. Check if raw PCM16 little-endian stream
    try:
        int16_arr = np.frombuffer(data, dtype=np.int16)
        if len(int16_arr) > 100:
            float32_arr = int16_arr.astype(np.float32) / 32768.0
            return float32_arr, default_sr
    except Exception:
        pass

    # 3. Fallback to librosa
    try:
        with io.BytesIO(data) as bio:
            waveform, sr = librosa.load(bio, sr=default_sr, mono=True)
            arr = np.asarray(waveform, dtype=np.float32)
            if arr.ndim > 1:
                arr = np.mean(arr, axis=0) if arr.shape[0] < arr.shape[1] else np.mean(arr, axis=1)
            return arr, sr
    except Exception as e:
        raise ValueError(f"Could not decode audio chunk: {e}")


@app.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket):
    """
    WS /ws/stream
    Accepts binary audio chunks (PCM16 or WAV blob) every ~1.5-2 seconds.
    Computes chunk score and smoothed rolling average score across last ~5 chunks.
    Contract:
    {
      "chunk_score": float,
      "rolling_avg_score": float,
      "label": "likely_ai_generated" | "likely_real",
      "heuristic_flags": list[str]
    }
    """
    await websocket.accept()
    client_id = f"{websocket.client.host}:{websocket.client.port}" if websocket.client else "unknown"
    logger.info(f"WebSocket client connected to /ws/stream: {client_id}")

    # Rolling buffer of last ~5 chunks per connection to smooth out noise
    rolling_buffer: deque = deque(maxlen=5)

    try:
        while True:
            message = await websocket.receive()
            msg_type = message.get("type")

            if msg_type == "websocket.disconnect":
                break

            data = message.get("bytes")

            # Handle text messages (ping/keepalive/base64)
            if not data and "text" in message:
                text_content = message["text"]
                if text_content.strip() == "ping":
                    await websocket.send_text("pong")
                    continue
                try:
                    import base64
                    data = base64.b64decode(text_content)
                except Exception:
                    continue

            if not data or len(data) < 200:
                continue

            try:
                waveform, sr = decode_audio_chunk(data)

                # Skip empty or negligible audio (< 0.25s)
                if len(waveform) < sr * 0.25:
                    continue

                # Run shared analyze_audio() engine
                result = analyze_audio(waveform, sr)

                chunk_score = result["confidence"]
                rolling_buffer.append(chunk_score)
                rolling_avg_score = round(sum(rolling_buffer) / len(rolling_buffer), 2)

                # Smoothed verdict label
                label = "likely_ai_generated" if rolling_avg_score >= 0.50 else "likely_real"

                response_payload = {
                    "chunk_score": chunk_score,
                    "rolling_avg_score": rolling_avg_score,
                    "label": label,
                    "heuristic_flags": result["heuristic_flags"],
                    "metrics": result.get("metrics")
                }
                await websocket.send_json(response_payload)

            except Exception as chunk_err:
                logger.warning(f"Error processing stream chunk from {client_id}: {chunk_err}", exc_info=True)
                continue

    except WebSocketDisconnect:
        logger.info(f"WebSocket client {client_id} disconnected cleanly.")
    except Exception as e:
        logger.error(f"WebSocket session error for {client_id}: {e}", exc_info=True)
    finally:
        rolling_buffer.clear()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
