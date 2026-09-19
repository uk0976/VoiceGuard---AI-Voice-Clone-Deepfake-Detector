"""
VoiceGuard — Shared Audio Analysis Engine
Integrates:
1. Hugging Face Deepfake Classifier (MelodyMachine/Deepfake-audio-detection-V2)
2. Librosa Signal-Processing Heuristic Explainability Layer (heuristics.py)
"""

import os
import sys
import logging
import threading
from typing import Dict, Any, List
import numpy as np

# Suppress Hugging Face symlink warnings on Windows
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

# Inject system certificate store via truststore for Windows SSL compatibility
try:
    import truststore
    truststore.inject_into_ssl()
except Exception:
    pass

from heuristics import compute_heuristics

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voiceguard.analysis")

# Lazy-loaded globals for model and feature extractor
_FEATURE_EXTRACTOR = None
_MODEL = None
_DEVICE = None
_MODEL_LOCK = threading.Lock()
MODEL_NAME = "MelodyMachine/Deepfake-audio-detection-V2"
TARGET_SAMPLE_RATE = 16000


def get_model_and_extractor():
    """
    Lazy load the Hugging Face feature extractor and model.
    Thread-safe and caches loaded instances in memory for fast subsequent inferences.
    """
    global _FEATURE_EXTRACTOR, _MODEL, _DEVICE

    if _MODEL is not None and _FEATURE_EXTRACTOR is not None:
        return _FEATURE_EXTRACTOR, _MODEL, _DEVICE

    with _MODEL_LOCK:
        if _MODEL is not None and _FEATURE_EXTRACTOR is not None:
            return _FEATURE_EXTRACTOR, _MODEL, _DEVICE

        import torch
        from transformers import AutoFeatureExtractor, AutoModelForAudioClassification

        _DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Loading classifier '{MODEL_NAME}' on device: {_DEVICE}...")

        _FEATURE_EXTRACTOR = AutoFeatureExtractor.from_pretrained(MODEL_NAME)
        _MODEL = AutoModelForAudioClassification.from_pretrained(MODEL_NAME)

        _MODEL.to(_DEVICE)
        _MODEL.eval()
        logger.info(f"Model '{MODEL_NAME}' loaded successfully.")
        return _FEATURE_EXTRACTOR, _MODEL, _DEVICE


def preprocess_audio(waveform: np.ndarray, sample_rate: int) -> np.ndarray:
    """
    Preprocess audio to 16kHz mono float32 for the Wav2Vec2 classifier.
    """
    import librosa

    # Ensure float32
    if waveform.dtype != np.float32:
        waveform = waveform.astype(np.float32)

    # Convert stereo to mono if multi-channel
    if waveform.ndim > 1:
        if waveform.shape[0] < waveform.shape[1]:
            waveform = np.mean(waveform, axis=0)
        else:
            waveform = np.mean(waveform, axis=1)

    # Normalize audio if not normalized
    max_val = np.max(np.abs(waveform))
    if max_val > 1.0:
        waveform = waveform / (max_val + 1e-8)

    # Resample to 16kHz if necessary
    if sample_rate != TARGET_SAMPLE_RATE:
        waveform = librosa.resample(waveform, orig_sr=sample_rate, target_sr=TARGET_SAMPLE_RATE)

    return waveform


def analyze_audio(waveform: np.ndarray, sample_rate: int) -> Dict[str, Any]:
    """
    Core analysis function shared by both Mode A (File Upload) and Mode B (Real-time Streaming).
    
    Combines:
    1. Pretrained Hugging Face audio classifier (model_score)
    2. Real signal-processing heuristics (pitch jitter, spectral flatness, pause patterns)
    
    Returns:
    {
      "label": "likely_ai_generated" | "likely_real",
      "confidence": float,           # Decision confidence in the verdict (0.50 - 1.00)
      "synthetic_score": float,      # Raw synthetic probability (0.00 - 1.00)
      "model_score": float,          # Neural model prediction
      "heuristic_flags": list[str],
      "metrics": dict
    }
    """
    import torch

    rms = float(np.sqrt(np.mean(waveform**2)))
    peak = float(np.max(np.abs(waveform)))

    # If audio is empty, near-silent, or quiet ambient noise floor (< -45dB)
    if len(waveform) == 0 or np.all(waveform == 0) or (rms < 0.0035 and peak < 0.015):
        return {
            "label": "likely_real",
            "confidence": 1.0,
            "synthetic_score": 0.0,
            "model_score": 0.0,
            "heuristic_flags": [],
            "metrics": {
                "pitch_jitter": 0.022,
                "f0_std": 0.08,
                "spectral_flatness": 0.015,
                "pause_ratio": 0.5,
                "speech_ratio": 0.0,
                "spectral_centroid_hz": 0.0
            }
        }

    # 1. Preprocess audio for neural network (16kHz mono)
    processed_audio = preprocess_audio(waveform, sample_rate)

    # 2. Run Hugging Face Wav2Vec2 Classifier
    feature_extractor, model, device = get_model_and_extractor()

    inputs = feature_extractor(
        processed_audio,
        sampling_rate=TARGET_SAMPLE_RATE,
        return_tensors="pt",
        padding=True
    )

    with torch.no_grad():
        inputs = {k: v.to(device) for k, v in inputs.items()}
        logits = model(**inputs).logits
        probabilities = torch.softmax(logits, dim=-1)[0]
        # In MelodyMachine/Deepfake-audio-detection-V2:
        # Index 0 is Real, Index 1 is Fake (AI-generated)
        model_score = round(float(probabilities[1].item()), 4)

    # 3. Compute heuristic signal scores
    heuristics_result = compute_heuristics(processed_audio, TARGET_SAMPLE_RATE)
    heuristic_score = heuristics_result.get("heuristic_score", heuristics_result.get("score", 0.0))
    heuristic_flags: List[str] = heuristics_result.get("flags", [])

    # 4. Fusion logic:
    # Blend neural score and heuristics
    if model_score >= 0.50:
        synthetic_score = round(0.70 * model_score + 0.30 * max(model_score, heuristic_score), 2)
    elif heuristic_score >= 0.80 and model_score >= 0.35:
        synthetic_score = round(0.55 * heuristic_score + 0.45 * model_score, 2)
    else:
        # Neural model indicates natural human speech (model_score < 0.50)
        synthetic_score = round(0.80 * model_score + 0.20 * heuristic_score, 2)

    synthetic_score = max(0.0, min(1.0, synthetic_score))
    label = "likely_ai_generated" if synthetic_score >= 0.50 else "likely_real"
    verdict_confidence = synthetic_score if label == "likely_ai_generated" else round(1.0 - synthetic_score, 2)

    return {
        "label": label,
        "confidence": verdict_confidence,
        "synthetic_score": synthetic_score,
        "model_score": model_score,
        "heuristic_flags": heuristic_flags,
        "metrics": heuristics_result.get("metrics", {})
    }
