import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, Activity, Cpu, Radio, Sparkles, UserCheck, Bot } from 'lucide-react';

function useCountUp(targetVal, duration = 750) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef(null);
  const startValRef = useRef(0);

  useEffect(() => {
    const start = startValRef.current;
    const target = typeof targetVal === 'number' && !isNaN(targetVal) ? targetVal : 0;
    let animId;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic: 1 - (1 - t)^3
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (target - start) * easeOut);
      setCount(current);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        startValRef.current = target;
      }
    };

    startTimeRef.current = null;
    animId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animId);
  }, [targetVal, duration]);

  return count;
}

export default function ResultsPanel({ result, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="vg-card" style={{ width: '100%', textAlign: 'center', padding: '56px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '84px', height: '84px', margin: '0 auto 24px' }}>
          <div
            className="pulse-loader"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(6, 182, 212, 0.15)',
              border: '2px solid #06b6d4'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '18px',
              borderRadius: '50%',
              backgroundColor: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0b0f19',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)'
            }}
          >
            <Activity size={28} />
          </div>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
          Analyzing audio...
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '420px', margin: '0 auto 20px', lineHeight: '1.5' }}>
          Checking pitch variation, spectral consistency, and deepfake voice patterns.
        </p>

        {/* Feature Steps */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            Resampling 16kHz
          </span>
          <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            Pitch jitter analysis
          </span>
          <span style={{ fontSize: '0.72rem', color: '#38bdf8', background: 'rgba(6, 182, 212, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            Spectral check
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    const isFormatError = /invalid|unsupported|format|decode|empty/i.test(error);
    const errorTitle = isFormatError ? 'Invalid Audio File' : 'Analysis Error';

    return (
      <div className="vg-card" style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.04)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', flexShrink: 0 }}>
            <AlertTriangle size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f87171' }}>{errorTitle}</h3>
              <span style={{ fontSize: '0.7rem', color: '#f87171', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                {isFormatError ? 'HTTP 400' : 'ERROR'}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>{error}</p>
            {isFormatError && (
              <div style={{ marginTop: '12px', padding: '10px 12px', background: '#0f172a', borderRadius: '6px', border: '1px solid #1e293b', fontSize: '0.78rem', color: '#94a3b8' }}>
                <strong style={{ color: '#38bdf8' }}>Supported Formats:</strong> WAV, MP3, M4A, OGG up to 25MB. Try choosing one of the demo clips below to test the detector.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Architectural Pipeline Preview when waiting for input
  if (!result) {
    return (
      <div className="vg-card" style={{ width: '100%', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>
              How analysis works
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              VoiceGuard pairs a neural model with acoustic physics to detect cloned voices.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' }} />
            <span>Ready</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px', display: 'flex', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', height: 'fit-content' }}>
              <Cpu size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f1f5f9' }}>
                1. Neural pattern recognition
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', lineHeight: '1.4' }}>
                Evaluates deep audio representations against thousands of real and synthesized voice samples.
              </p>
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px', display: 'flex', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', height: 'fit-content' }}>
              <Activity size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f1f5f9' }}>
                2. Pitch variation & micro-jitter
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', lineHeight: '1.4' }}>
                Measures natural pitch fluctuations in the human vocal tract. Synthetic voices often sound unnaturally steady.
              </p>
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px', display: 'flex', gap: '12px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(147, 51, 234, 0.1)', color: '#a855f7', height: 'fit-content' }}>
              <Radio size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: '600', color: '#f1f5f9' }}>
                3. Tone & breath spacing
              </h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px', lineHeight: '1.4' }}>
                Detects vocoder artifacts and the natural pauses and breaths characteristic of human speech.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed #334155', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Select a <strong style={{ color: '#06b6d4' }}>demo clip below</strong> or upload an audio file to see analysis results.
          </p>
        </div>
      </div>
    );
  }

  const isFake = result.label === 'likely_ai_generated';
  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const modelPercent = Math.round((result.model_score || 0) * 100);
  const flags = result.heuristic_flags || [];

  const displayedConfidence = useCountUp(confidencePercent, 750);
  const displayedModel = useCountUp(modelPercent, 750);

  const verdictColor = isFake ? '#ef4444' : '#10b981';
  const strokeDashoffset = 283 - (283 * displayedConfidence) / 100;

  return (
    <div className="vg-card result-appear" style={{ width: '100%', transition: 'all 0.3s ease' }}>
      {/* Top Banner Verdict */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '18px', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
            Verdict
          </span>
          <div style={{ marginTop: '6px' }}>
            {isFake ? (
              <div className="badge-danger">
                <ShieldAlert size={17} />
                <span>AI-Generated Voice</span>
              </div>
            ) : (
              <div className="badge-safe">
                <ShieldCheck size={17} />
                <span>Natural Human Voice</span>
              </div>
            )}
          </div>
        </div>

        {/* Circular Gauge Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative', width: '70px', height: '70px' }}>
            <svg width="70" height="70" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke={verdictColor}
                strokeWidth="10"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.1s linear' }}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: '800',
                color: verdictColor,
                fontFamily: "'JetBrains Mono', monospace"
              }}
            >
              {displayedConfidence}%
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
              Confidence
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f1f5f9' }}>
              {isFake ? 'Synthetic voice detected' : 'Natural speech detected'}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Meter */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
          <span>0% Human</span>
          <span style={{ color: '#06b6d4', fontWeight: '600' }}>50% Threshold</span>
          <span>100% AI</span>
        </div>
        <div className="meter-container">
          <div
            className="meter-fill"
            style={{
              width: `${displayedConfidence}%`,
              backgroundColor: verdictColor,
              boxShadow: isFake
                ? '0 0 14px rgba(239, 68, 68, 0.5)'
                : '0 0 14px rgba(16, 185, 129, 0.5)'
            }}
          />
        </div>
      </div>

      {/* Breakdown Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
            <Cpu size={14} color="#06b6d4" />
            Neural Model Score
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
            {displayedModel}%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
            Sequence classifier
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
            <Activity size={14} color="#06b6d4" />
            Acoustic Checks
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
            {flags.length > 0 ? `${flags.length} Flagged` : '0 Flags'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
            Acoustic physics
          </div>
        </div>
      </div>

      {/* Heuristic Explainability Flags */}
      <div>
        <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
          Acoustic Findings
        </h4>

        {flags.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {flags.map((flag, idx) => (
              <div key={idx} className="flag-chip" style={{ width: '100%' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: '500' }}>{flag}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#6ee7b7', padding: '12px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
            <span>Pitch jitter, harmonic decay, and breathing pauses fall within natural human ranges. No anomalies detected.</span>
          </div>
        )}
      </div>
    </div>
  );
}
