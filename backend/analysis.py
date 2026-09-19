"""
VoiceGuard — Shared Audio Analysis Engine
Integrates:
1. Hugging Face Deepfake Classifier (MelodyMachine/Deepfake-audio-detection-V2)
2. Librosa Signal-Processing Heuristic Explainability Layer (heuristics.py)
"""

import os
import sys
import logging
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
MODEL_NAME = "MelodyMachine/Deepfake-audio-detection-V2"
TARGET_SAMPLE_RATE = 16000


def get_model_and_extractor():
    """
    Lazy load the Hugging Face feature extractor and model.
    Caches loaded instances in memory for fast subsequent inferences.
    """
    global _FEATURE_EXTRACTOR, _MODEL, _DEVICE

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
    
    Returns JSON dictionary adhering strictly to the Section 5 API contract:
    {
      "label": "likely_ai_generated" | "likely_real",
      "confidence": float,
      "model_score": float,
      "heuristic_flags": list[str]
    }
    """
    import torch

    # If audio is empty or entirely silent, return safe default
    if len(waveform) == 0 or np.all(waveform == 0):
        return {
            "label": "likely_real",
            "confidence": 0.0,
            "model_score": 0.0,
            "heuristic_flags": []
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
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        logits = model(**inputs).logits
        probabilities = torch.softmax(logits, dim=-1)[0]

    # In MelodyMachine/Deepfake-audio-detection-V2:
    # Index 1 corresponds to AI-generated / deepfake speech
    # Index 0 corresponds to genuine human speech
    fake_prob = float(probabilities[1].item())
    model_score = round(fake_prob, 2)

    # 3. Run Heuristic Explainability Layer (pitch jitter, spectral flatness, pause patterns)
    heuristics_result = compute_heuristics(waveform, sample_rate)
    heuristic_score = heuristics_result["heuristic_score"]
    heuristic_flags: List[str] = heuristics_result["flags"]

    # 4. Merge model_score and heuristic_score into final confidence
    # Model is primary for direct digital files (75% model + 25% heuristics).
    # When acoustic room transmission suppresses raw neural features (model_score < 0.50),
    # but the physical heuristics detect synthetic artifacts (heuristic_score >= 0.50),
    # the explainable acoustic heuristics provide defense (75% heuristics + 25% model).
    if model_score >= 0.50:
        confidence = round(0.75 * model_score + 0.25 * heuristic_score, 2)
    elif heuristic_score >= 0.50:
        confidence = round(0.75 * heuristic_score + 0.25 * model_score, 2)
    else:
        confidence = round(0.75 * model_score + 0.25 * heuristic_score, 2)

    confidence = max(0.0, min(1.0, confidence))
    label = "likely_ai_generated" if confidence >= 0.50 else "likely_real"

    return {
        "label": label,
        "confidence": confidence,
        "model_score": model_score,
        "heuristic_flags": heuristic_flags
    }
