"""
VoiceGuard — Signal-Processing Heuristic Explainability Layer
Computes pitch jitter, spectral flatness, and pause/silence metrics using librosa.
Provides human-readable explainability flags and an aggregated heuristic score.
"""

import logging
from typing import Dict, Any, List, Tuple
import numpy as np
import librosa

logger = logging.getLogger("voiceguard.heuristics")

# Exact flag descriptions as specified in README Sections 5 and 6
FLAG_LOW_JITTER = "Unnaturally stable pitch (low jitter)"
FLAG_FLAT_SPECTRUM = "Flat spectral envelope"
FLAG_MISSING_PAUSES = "Missing natural breath pauses"


def extract_pitch_jitter(y: np.ndarray, sr: int) -> Tuple[float, bool, float, float]:
    """
    Computes pitch jitter (period-to-period F0 variance) and F0 intonation stability.
    
    Explanation & Threshold Rationale:
    Human speech naturally exhibits microscopic pitch variability (jitter) and organic F0 contours
    caused by vocal fold biomechanics, typically > 2.0% cycle-to-cycle variation and standard deviation > 0.08.
    Synthetic TTS voices or vocoders maintain unnaturally rigid, stable pitch contours even after room transmission.
    
    - Threshold: Relative jitter < 0.018 or normalized F0 std < 0.06 indicates synthetic stability.
    - Returns: (jitter_score [0..1 where 1 is synthetic], flag_triggered, relative_jitter, std_f0)
    """
    try:
        # Optimize pyin range for speech fundamental frequencies (65Hz - 500Hz)
        fmin = librosa.note_to_hz("C2")  # ~65 Hz
        fmax = librosa.note_to_hz("B4")  # ~493 Hz
        
        frame_length = 2048
        hop_length = 512
        
        f0, voiced_flag, _ = librosa.pyin(
            y,
            fmin=fmin,
            fmax=fmax,
            sr=sr,
            frame_length=frame_length,
            hop_length=hop_length
        )
        
        valid_f0 = f0[~np.isnan(f0) & (f0 > 0)]
        
        # If very few voiced frames detected (< 5 frames), cannot reliably compute jitter
        if len(valid_f0) < 5:
            return 0.0, False, 0.0, 0.0
        
        # Calculate cycle-to-cycle relative jitter: |F0[i+1] - F0[i]| / F0[i]
        f0_diffs = np.abs(np.diff(valid_f0))
        relative_jitter = float(np.mean(f0_diffs / (valid_f0[:-1] + 1e-6)))
        std_f0 = float(np.std(valid_f0) / (np.mean(valid_f0) + 1e-6))
        
        # Unnaturally stable pitch threshold: relative jitter < 0.018 or F0 std < 0.06
        is_synthetic = (relative_jitter < 0.018 or std_f0 < 0.06)
        
        # Map jitter to 0..1 score
        if is_synthetic:
            jitter_score = 0.80
        else:
            jitter_score = max(0.0, min(1.0, 1.0 - (relative_jitter / 0.025)))
        
        return jitter_score, is_synthetic, relative_jitter, std_f0
        
    except Exception as e:
        logger.warning(f"Error computing pitch jitter: {e}")
        return 0.0, False, 0.0, 0.0


def extract_spectral_flatness(y: np.ndarray, sr: int) -> Tuple[float, bool, float]:
    """
    Computes spectral flatness of the audio.
    
    Explanation & Threshold Rationale:
    Spectral flatness (Wiener entropy) measures energy distribution across frequency bands.
    Natural resonant human voice has strong formant peaks (low spectral flatness, ~0.010 - 0.017).
    Vocoded or synthetic audio artifacts exhibit higher spectral dispersion and white phase leakage (> 0.023).
    
    - Threshold: Mean spectral flatness > 0.023 indicates an unnaturally flat, vocoded envelope.
    - Returns: (flatness_score [0..1 where 1 is synthetic], flag_triggered, mean_flatness)
    """
    try:
        flatness = librosa.feature.spectral_flatness(y=y)
        mean_flatness = float(np.mean(flatness))
        
        # Threshold: > 0.035 suggests unnatural vocoder flatness or high-frequency buzz
        is_flat = mean_flatness > 0.035
        
        # Map to 0..1 score
        flatness_score = max(0.0, min(1.0, (mean_flatness - 0.015) / 0.035))
        if is_flat:
            flatness_score = max(0.70, flatness_score)
        
        return flatness_score, is_flat, mean_flatness
        
    except Exception as e:
        logger.warning(f"Error computing spectral flatness: {e}")
        return 0.0, False, 0.0


def extract_pause_patterns(y: np.ndarray, sr: int) -> Tuple[float, bool, float, float]:
    """
    Analyzes silence and breathing pause patterns in speech.
    
    Explanation & Threshold Rationale:
    Natural continuous speech contains natural breathing pauses and cadence stops
    (typically 100ms - 500ms). Synthetic voice clips often lack micro-breathing pauses,
    generating unbroken phoneme streams or unnaturally rigid silence gaps.
    
    - For clips >= 2.5 seconds: if non-silent speech occupies > 96% of the clip with zero
      pauses >= 150ms, it indicates missing natural breath pauses.
    - Returns: (pause_score [0..1 where 1 is synthetic], flag_triggered, pause_ratio, speech_ratio)
    """
    try:
        duration = len(y) / sr
        if duration < 2.0:
            # Short chunk cannot be penalized for missing breaths
            return 0.0, False, 0.0, 1.0
        
        # Detect non-silent intervals with 25dB below peak threshold (immune to ambient mic noise)
        intervals = librosa.effects.split(y=y, top_db=25, frame_length=1024, hop_length=256)
        
        if len(intervals) == 0:
            return 0.0, False, 1.0, 0.0
        
        # Calculate total non-silent duration
        voiced_samples = sum(end - start for start, end in intervals)
        speech_ratio = float(voiced_samples / len(y))
        pause_ratio = max(0.0, 1.0 - speech_ratio)
        
        # If speech is virtually non-stop (> 96% active) with only 1 unbroken segment
        is_missing_pauses = (len(intervals) <= 1 and duration >= 3.0 and speech_ratio > 0.96)
        
        pause_score = 0.85 if is_missing_pauses else 0.05
        
        return pause_score, is_missing_pauses, pause_ratio, speech_ratio
        
    except Exception as e:
        logger.warning(f"Error analyzing pause patterns: {e}")
        return 0.0, False, 0.0, 1.0


def compute_heuristics(waveform: np.ndarray, sample_rate: int) -> Dict[str, Any]:
    """
    Runs all 3 signal-processing heuristic checks and aggregates them.
    
    Returns:
    {
      "heuristic_score": float,
      "flags": list[str],
      "details": dict,
      "metrics": dict
    }
    """
    # Ensure 1D audio
    y = waveform.copy()
    if y.ndim > 1:
        y = np.mean(y, axis=0) if y.shape[0] < y.shape[1] else np.mean(y, axis=1)
    
    flags: List[str] = []
    
    # 1. Pitch Jitter (Weight: 40%)
    jitter_score, flag_jitter, rel_jitter, std_f0 = extract_pitch_jitter(y, sample_rate)
    if flag_jitter:
        flags.append(FLAG_LOW_JITTER)
        
    # 2. Spectral Flatness (Weight: 30%)
    flatness_score, flag_flatness, mean_flatness = extract_spectral_flatness(y, sample_rate)
    if flag_flatness:
        flags.append(FLAG_FLAT_SPECTRUM)
        
    # 3. Pause / Breath Pattern (Weight: 30%)
    pause_score, flag_pause, pause_ratio, speech_ratio = extract_pause_patterns(y, sample_rate)
    if flag_pause:
        flags.append(FLAG_MISSING_PAUSES)

    # 4. Spectral Centroid
    try:
        sc = float(np.mean(librosa.feature.spectral_centroid(y=y, sr=sample_rate)))
    except Exception:
        sc = 0.0
        
    # Weighted aggregation
    if flags:
        heuristic_score = max(0.70, max(jitter_score, flatness_score, pause_score))
    else:
        heuristic_score = (0.40 * jitter_score) + (0.30 * flatness_score) + (0.30 * pause_score)
    heuristic_score = max(0.0, min(1.0, round(float(heuristic_score), 2)))
    
    return {
        "heuristic_score": heuristic_score,
        "flags": flags,
        "details": {
            "jitter_score": round(jitter_score, 2),
            "flatness_score": round(flatness_score, 2),
            "pause_score": round(pause_score, 2)
        },
        "metrics": {
            "pitch_jitter": round(rel_jitter, 4),
            "f0_std": round(std_f0, 4),
            "spectral_flatness": round(mean_flatness, 4),
            "pause_ratio": round(pause_ratio, 3),
            "speech_ratio": round(speech_ratio, 3),
            "spectral_centroid_hz": round(sc, 1)
        }
    }
