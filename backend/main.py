"""
VoiceGuard — FastAPI Application
Provides /analyze REST endpoint and /ws/stream WebSocket endpoint.
"""

import io
import os
import logging
from typing import Dict, Any, List
import soundfile as sf
import librosa
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
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


class AnalysisResponse(BaseModel):
    label: str
    confidence: float
    model_score: float
    heuristic_flags: List[str]


@app.get("/")
def read_root():
    return {"status": "ok", "app": "VoiceGuard", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


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
                detail=f"Invalid file type '{extension}'. Please upload a valid audio file (.wav or .mp3)."
            )

    try:
        content = await file.read()
        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        # Load audio into numpy array and sample rate
        try:
            # First try soundfile for speed
            audio_io = io.BytesIO(content)
            waveform, sample_rate = sf.read(audio_io)
        except Exception:
            # Fallback to librosa which handles mp3, ogg, etc. via audioread/ffmpeg
            audio_io = io.BytesIO(content)
            waveform, sample_rate = librosa.load(audio_io, sr=None, mono=False)

        waveform = np.asarray(waveform, dtype=np.float32)

        # Run shared analysis engine
        result = analyze_audio(waveform, sample_rate)

        return AnalysisResponse(
            label=result["label"],
            confidence=result["confidence"],
            model_score=result["model_score"],
            heuristic_flags=result["heuristic_flags"]
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing audio file '{filename}': {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the audio file: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
