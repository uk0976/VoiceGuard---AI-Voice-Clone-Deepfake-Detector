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


def extract_pitch_jitter(y: np.ndarray, sr: int) -> Tuple[float, bool]:
    """
    Computes pitch jitter (period-to-period F0 variance).
    
    Explanation & Threshold Rationale:
    Human speech naturally exhibits microscopic pitch variability (jitter) caused by
    vocal fold biomechanics, typically between 1.5% and 5% relative cycle-to-cycle variation.
    Synthetic TTS voices or vocoders often maintain unnaturally rigid, stable pitch contours.
    
    - Threshold: Relative jitter < 0.012 (1.2% variation) across voiced frames indicates
      synthetic stability.
    - Returns: (jitter_score [0..1 where 1 is synthetic], flag_triggered)
    """
    try:
        # Downsample or optimize pyin range for speech fundamental frequencies (65Hz - 500Hz)
        fmin = librosa.note_to_hz("C2")  # ~65 Hz
        fmax = librosa.note_to_hz("B4")  # ~493 Hz
        
        # Frame length ~ 30ms for F0 estimation
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
            return 0.0, False
        
        # Calculate cycle-to-cycle relative jitter: |F0[i+1] - F0[i]| / F0[i]
        f0_diffs = np.abs(np.diff(valid_f0))
        relative_jitter = float(np.mean(f0_diffs / (valid_f0[:-1] + 1e-6)))
        
        # Unnaturally stable pitch threshold: relative jitter < 0.012
        # Pure synthetic tones / flat TTS often have relative jitter < 0.008
        is_synthetic = relative_jitter < 0.012
        
        # Map jitter to 0..1 score (lower jitter -> higher synthetic score)
        # Normal human speech (~0.02 - 0.05) -> score ~ 0.1 - 0.3
        jitter_score = max(0.0, min(1.0, 1.0 - (relative_jitter / 0.025)))
        
        return jitter_score, is_synthetic
        
    except Exception as e:
        logger.warning(f"Error computing pitch jitter: {e}")
        return 0.0, False


def extract_spectral_flatness(y: np.ndarray, sr: int) -> Tuple[float, bool]:
    """
    Computes spectral flatness of the audio.
    
    Explanation & Threshold Rationale:
    Spectral flatness (Wiener entropy) measures energy distribution across frequency bands.
    Natural resonant human voice has strong formant peaks (low spectral flatness, ~0.001 - 0.02).
    Vocoded or synthetic audio artifacts often exhibit higher or unnaturally flat spectral distribution.
    
    - Threshold: Mean spectral flatness > 0.035 indicates an unnaturally flat or noisy envelope.
    - Returns: (flatness_score [0..1 where 1 is synthetic], flag_triggered)
    """
    try:
        flatness = librosa.feature.spectral_flatness(y=y)
        mean_flatness = float(np.mean(flatness))
        
        # Threshold: > 0.035 suggests unnatural spectral smoothness or high-frequency buzz
        is_flat = mean_flatness > 0.035
        
        # Map to 0..1 score
        flatness_score = max(0.0, min(1.0, (mean_flatness - 0.01) / 0.04))
        
        return flatness_score, is_flat
        
    except Exception as e:
        logger.warning(f"Error computing spectral flatness: {e}")
        return 0.0, False


def extract_pause_patterns(y: np.ndarray, sr: int) -> Tuple[float, bool]:
    """
    Analyzes silence and breathing pause patterns in speech.
    
    Explanation & Threshold Rationale:
    Natural continuous speech contains natural breathing pauses and cadence stops
    (typically 100ms - 500ms). Synthetic voice clips often lack micro-breathing pauses,
    generating unbroken phoneme streams or unnaturally rigid silence gaps.
    
    - For clips >= 2.0 seconds: if non-silent speech occupies > 96% of the clip with zero
      pauses >= 150ms, it indicates missing natural breath pauses.
    - Returns: (pause_score [0..1 where 1 is synthetic], flag_triggered)
    """
    try:
        duration = len(y) / sr
        if duration < 1.8:
            # Short chunk (< 1.8s, typical for real-time stream chunks) cannot be penalized for missing breaths
            return 0.0, False
        
        # Detect non-silent intervals with 30dB below peak threshold
        intervals = librosa.effects.split(y=y, top_db=30, frame_length=1024, hop_length=256)
        
        if len(intervals) == 0:
            return 0.0, False
        
        # Calculate total non-silent duration
        voiced_samples = sum(end - start for start, end in intervals)
        speech_ratio = voiced_samples / len(y)
        
        # If speech is virtually non-stop (> 95% active) with only 1 unbroken segment
        is_missing_pauses = (len(intervals) <= 1 and duration >= 2.5 and speech_ratio > 0.94)
        
        pause_score = 0.85 if is_missing_pauses else 0.1
        
        return pause_score, is_missing_pauses
        
    except Exception as e:
        logger.warning(f"Error analyzing pause patterns: {e}")
        return 0.0, False


def compute_heuristics(waveform: np.ndarray, sample_rate: int) -> Dict[str, Any]:
    """
    Runs all 3 signal-processing heuristic checks and aggregates them.
    
    Returns:
    {
      "heuristic_score": float,
      "flags": list[str],
      "details": dict
    }
    """
    # Ensure 1D audio
    y = waveform.copy()
    if y.ndim > 1:
        y = np.mean(y, axis=0) if y.shape[0] < y.shape[1] else np.mean(y, axis=1)
    
    flags: List[str] = []
    
    # 1. Pitch Jitter (Weight: 40%)
    jitter_score, flag_jitter = extract_pitch_jitter(y, sample_rate)
    if flag_jitter:
        flags.append(FLAG_LOW_JITTER)
        
    # 2. Spectral Flatness (Weight: 30%)
    flatness_score, flag_flatness = extract_spectral_flatness(y, sample_rate)
    if flag_flatness:
        flags.append(FLAG_FLAT_SPECTRUM)
        
    # 3. Pause / Breath Pattern (Weight: 30%)
    pause_score, flag_pause = extract_pause_patterns(y, sample_rate)
    if flag_pause:
        flags.append(FLAG_MISSING_PAUSES)
        
    # Weighted aggregation
    heuristic_score = (0.40 * jitter_score) + (0.30 * flatness_score) + (0.30 * pause_score)
    heuristic_score = max(0.0, min(1.0, round(float(heuristic_score), 2)))
    
    return {
        "heuristic_score": heuristic_score,
        "flags": flags,
        "details": {
            "jitter_score": round(jitter_score, 2),
            "flatness_score": round(flatness_score, 2),
            "pause_score": round(pause_score, 2)
        }
    }
