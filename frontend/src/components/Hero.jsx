import React from 'react';
import { ShieldCheck, UploadCloud, Radio, Cpu, Activity, CheckCircle2 } from 'lucide-react';

export default function Hero({ activeTab, setActiveTab }) {
  const scrollToWorkspace = (tab) => {
    setActiveTab(tab);
    const el = document.getElementById('analysis-workspace');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      style={{
        padding: '52px 0 36px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: '#FFFFFF'
      }}
    >
      <div className="vg-container">
        {/* Trust Badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '999px', backgroundColor: 'var(--primary-blue-subtle)', border: '1px solid #BFDBFE', marginBottom: '20px' }}>
          <ShieldCheck size={16} color="#2563EB" />
          <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1D4ED8' }}>
            Dual-engine acoustic & neural deepfake verification
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: '2.75rem',
            fontWeight: '800',
            color: 'var(--text-primary)',
            letterSpacing: '-0.035em',
            lineHeight: 1.15,
            maxWidth: '780px',
            margin: '0 auto 16px'
          }}
        >
          Detect AI voices. Verify what's real.
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '1.0625rem',
            color: 'var(--text-secondary)',
            maxWidth: '660px',
            margin: '0 auto 28px',
            lineHeight: 1.6
          }}
        >
          Inspect recorded speech or live microphone audio to identify synthetic voice clones, neural vocoder artifacts, and acoustic anomalies in milliseconds.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '36px', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={() => scrollToWorkspace('upload')}
            style={{ padding: '12px 24px', fontSize: '0.9375rem' }}
          >
            <UploadCloud size={18} />
            Analyze Audio File
          </button>

          <button
            className="btn-secondary"
            onClick={() => scrollToWorkspace('stream')}
            style={{ padding: '12px 24px', fontSize: '0.9375rem' }}
          >
            <Radio size={18} color="#2563EB" />
            Live Microphone Stream
          </button>
        </div>

        {/* Trust & Capability Metrics */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            flexWrap: 'wrap',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#16A34A" />
            <span><strong>Wav2Vec2</strong> Deepfake Transformer</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#16A34A" />
            <span><strong>F0 Micro-Jitter</strong> & Harmonic Tracking</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#16A34A" />
            <span><strong>16 kHz Mono</strong> Standardized Preprocessing</span>
          </div>
        </div>
      </div>
    </section>
  );
}
