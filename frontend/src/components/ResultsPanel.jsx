import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, Activity, Cpu, Radio, Sparkles, UserCheck, Bot, Info, ChevronRight, HelpCircle } from 'lucide-react';

function useCountUp(targetVal, duration = 650) {
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
  // 1. Loading State
  if (isLoading) {
    return (
      <div className="vg-card" style={{ width: '100%', padding: '40px 24px', textAlign: 'center' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-blue-subtle)',
            color: 'var(--primary-blue)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '18px'
          }}
        >
          <Activity size={28} className="animate-pulse" />
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px' }}>
          Running Voice Authenticity Analysis
        </h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 20px', lineHeight: 1.5 }}>
          Evaluating acoustic physics, pitch micro-jitter, and Wav2Vec2 deepfake feature representations.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: 'var(--primary-blue)', backgroundColor: 'var(--primary-blue-subtle)', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '20px' }}>
            16 kHz Resampling
          </span>
          <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: 'var(--primary-blue)', backgroundColor: 'var(--primary-blue-subtle)', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '20px' }}>
            F0 Pitch Jitter
          </span>
          <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: 'var(--primary-blue)', backgroundColor: 'var(--primary-blue-subtle)', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '20px' }}>
            Spectral Distribution
          </span>
          <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: 'var(--primary-blue)', backgroundColor: 'var(--primary-blue-subtle)', border: '1px solid #BFDBFE', padding: '3px 10px', borderRadius: '20px' }}>
            Deepfake Classifier
          </span>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error) {
    const isFormatError = /invalid|unsupported|format|decode|empty/i.test(error);
    const errorTitle = isFormatError ? 'Invalid Audio File' : 'Inspection Error';

    return (
      <div className="vg-card" style={{ width: '100%', borderColor: 'var(--ai-red-border)', backgroundColor: 'var(--ai-red-bg)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: 'var(--ai-red)', flexShrink: 0 }}>
            <AlertTriangle size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#991B1B' }}>{errorTitle}</h3>
              <span style={{ fontSize: '0.6875rem', color: '#991B1B', backgroundColor: '#FEE2E2', border: '1px solid var(--ai-red-border)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                {isFormatError ? 'FORMAT ERROR' : 'SYSTEM ERROR'}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#7F1D1D', marginTop: '6px', lineHeight: '1.5' }}>{error}</p>
            {isFormatError && (
              <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid var(--ai-red-border)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Accepted Formats:</strong> WAV, MP3, M4A, OGG up to 25MB. You can also test with the preloaded demo samples below.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. Waiting / Empty State
  if (!result) {
    return (
      <div className="vg-card" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Analysis Pipeline
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              How VoiceGuard inspects audio for synthetic generation
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span className="pulse-dot" />
            <span>Ready</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.75rem' }}>
              01
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                Neural Pattern Recognition
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.45 }}>
                Evaluates latent audio representations against trained deepfake and natural voice manifolds.
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.75rem' }}>
              02
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                Vocal Tract Micro-Jitter
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.45 }}>
                Measures fundamental frequency (F0) stability. Neural vocoders often produce unnaturally flat pitch contours.
              </p>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#EFF6FF', color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: '700', fontSize: '0.75rem' }}>
              03
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                Acoustic Physics & Pause Cadence
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.45 }}>
                Checks spectral flatness, harmonic-to-noise ratios, and natural respiratory pauses.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px dashed var(--border-medium)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Upload an audio file on the left or select a <strong style={{ color: 'var(--primary-blue)' }}>demo sample below</strong> to view inspection findings.
          </p>
        </div>
      </div>
    );
  }

  // 4. Result Active State
  const isFake = result.label === 'likely_ai_generated';
  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const modelPercent = Math.round((result.model_score || 0) * 100);
  const flags = result.heuristic_flags || [];

  const displayedConfidence = useCountUp(confidencePercent, 650);
  const displayedModel = useCountUp(modelPercent, 650);

  // Human confidence vs AI confidence
  const authenticScore = 100 - displayedConfidence;

  return (
    <div className="vg-card result-fade-in" style={{ width: '100%', borderColor: isFake ? 'var(--ai-red-border)' : 'var(--authentic-green-border)' }}>
      {/* Top Banner Verdict */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
            Analysis Verdict
          </span>
          <div style={{ marginTop: '4px' }}>
            {isFake ? (
              <span className="badge-synthetic" style={{ fontSize: '0.875rem', padding: '5px 12px' }}>
                <ShieldAlert size={18} />
                AI-Generated Voice
              </span>
            ) : (
              <span className="badge-authentic" style={{ fontSize: '0.875rem', padding: '5px 12px' }}>
                <ShieldCheck size={18} />
                Natural Human Voice
              </span>
            )}
          </div>
        </div>

        {/* Confidence Percentage Display */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: '800', color: isFake ? 'var(--ai-red)' : 'var(--authentic-green)', lineHeight: 1.1 }}>
            {isFake ? `${displayedConfidence}%` : `${authenticScore}%`}
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            {isFake ? 'Synthetic Confidence' : 'Authentic Human'}
          </div>
        </div>
      </div>

      {/* Horizontal Spectrum Confidence Bar */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--ai-red)', fontWeight: '600' }}>AI-Generated</span>
          <span style={{ color: 'var(--text-muted)' }}>Threshold: 50%</span>
          <span style={{ color: 'var(--authentic-green)', fontWeight: '600' }}>Human Voice</span>
        </div>

        {/* Gradient bar with indicator */}
        <div className="confidence-spectrum">
          {/* Note: In spectrum, left is AI (0%), right is Human (100%) */}
          <div
            className="confidence-indicator"
            style={{
              left: `${Math.max(4, Math.min(96, 100 - displayedConfidence))}%`
            }}
            title={`Score: ${displayedConfidence}% AI, ${authenticScore}% Human`}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          <span>100% Synthetic</span>
          <span>50/50 Ambiguous</span>
          <span>100% Genuine</span>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
            <Cpu size={15} color="var(--primary-blue)" />
            Neural Model Probability
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            {displayedModel}%
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Wav2Vec2 Sequence Classifier
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '14px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
            <Activity size={15} color="var(--accent-cyan)" />
            Acoustic Signal Checks
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: flags.length > 0 ? 'var(--ai-red)' : 'var(--authentic-green)' }}>
            {flags.length > 0 ? `${flags.length} Flagged` : '0 Flags'}
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Pitch & Spectral Physics
          </div>
        </div>
      </div>

      {/* Explainable Acoustic Findings Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4 style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Acoustic Findings & Explainability
          </h4>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {flags.length} {flags.length === 1 ? 'anomaly' : 'anomalies'} detected
          </span>
        </div>

        {flags.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {flags.map((flag, idx) => (
              <div key={idx} className="flag-card">
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{flag}</span>
              </div>
            ))}
          </div>
        ) : isFake ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--info-blue-bg)',
              border: '1px solid var(--info-blue-border)',
              color: '#075985',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.8125rem'
            }}
          >
            <Info size={18} color="var(--info-blue)" style={{ flexShrink: 0 }} />
            <span>No acoustic anomalies independently flagged — detection is based primarily on neural model analysis.</span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: 'var(--authentic-green-bg)',
              border: '1px solid var(--authentic-green-border)',
              color: '#166534',
              padding: '12px 14px',
              borderRadius: '8px',
              fontSize: '0.8125rem'
            }}
          >
            <CheckCircle2 size={18} color="var(--authentic-green)" style={{ flexShrink: 0 }} />
            <span>Pitch jitter, harmonic decay, and breathing pauses fall within natural human ranges. No anomalies detected.</span>
          </div>
        )}
      </div>
    </div>
  );
}
