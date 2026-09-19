import React from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck, Activity, Cpu, HelpCircle } from 'lucide-react';

export default function ResultsPanel({ result, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="vg-card" style={{ width: '100%', textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ position: 'relative', width: '72px', height: '72px', margin: '0 auto 20px' }}>
          <div
            className="pulse-loader"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              border: '2px solid #06b6d4'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '16px',
              borderRadius: '50%',
              backgroundColor: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0b0f19'
            }}
          >
            <Activity size={24} />
          </div>
        </div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
          Analyzing Voice Architecture
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '380px', margin: '0 auto' }}>
          Running Hugging Face Wav2Vec2 neural classifier and extracting pitch jitter, spectral flatness & breath patterns...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vg-card" style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f87171' }}>Analysis Failed</h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="vg-card" style={{ width: '100%', textAlign: 'center', padding: '40px 20px', borderStyle: 'dashed' }}>
        <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'rgba(100, 116, 139, 0.1)', color: '#64748b', marginBottom: '14px' }}>
          <HelpCircle size={28} />
        </div>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#94a3b8', marginBottom: '4px' }}>
          No Analysis Results Yet
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
          Upload an audio recording on the left to inspect deepfake confidence and acoustic findings.
        </p>
      </div>
    );
  }

  const isFake = result.label === 'likely_ai_generated';
  const confidencePercent = Math.round((result.confidence || 0) * 100);
  const modelPercent = Math.round((result.model_score || 0) * 100);
  const flags = result.heuristic_flags || [];

  const verdictColor = isFake ? 'var(--danger-red)' : 'var(--safe-green)';

  return (
    <div className="vg-card" style={{ width: '100%', transition: 'all 0.4s ease' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '20px' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
            Verdict Assessment
          </span>
          <div style={{ marginTop: '6px' }}>
            {isFake ? (
              <span className="badge-danger">
                <ShieldAlert size={16} />
                SUSPECTED AI VOICE CLONE
              </span>
            ) : (
              <span className="badge-safe">
                <ShieldCheck size={16} />
                AUTHENTIC HUMAN VOICE
              </span>
            )}
          </div>
        </div>

        {/* Large Confidence Gauge Display */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1, color: verdictColor, fontFamily: "'JetBrains Mono', monospace" }}>
            {confidencePercent}%
          </div>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
            {isFake ? 'Deepfake Confidence' : 'Authenticity Confidence'}
          </span>
        </div>
      </div>

      {/* Progress Bar Meter */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
          <span>0% (Human)</span>
          <span>50% Threshold</span>
          <span>100% (Synthetic)</span>
        </div>
        <div className="meter-container">
          <div
            className="meter-fill"
            style={{
              width: `${confidencePercent}%`,
              backgroundColor: verdictColor,
              boxShadow: isFake
                ? '0 0 12px rgba(239, 68, 68, 0.4)'
                : '0 0 12px rgba(16, 185, 129, 0.4)'
            }}
          />
        </div>
      </div>

      {/* Breakdown Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
            <Cpu size={14} color="#06b6d4" />
            Neural Model Score
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
            {modelPercent}%
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
            Wav2Vec2 classifier weight (75%)
          </div>
        </div>

        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
            <Activity size={14} color="#06b6d4" />
            Signal Heuristics
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
            {flags.length > 0 ? `${flags.length} Flagged` : 'Clean'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
            Acoustic physics checks (25%)
          </div>
        </div>
      </div>

      {/* Heuristic Explainability Flags */}
      <div>
        <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
          Acoustic Anomaly Analysis ({flags.length})
        </h4>

        {flags.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {flags.map((flag, idx) => (
              <div key={idx} className="flag-chip">
                <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span>{flag}</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#6ee7b7', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span>No unnatural pitch, spectral, or breath anomalies detected in audio sample.</span>
          </div>
        )}
      </div>
    </div>
  );
}
