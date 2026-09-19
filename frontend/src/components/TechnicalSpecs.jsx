import React from 'react';
import { Cpu, Activity, Shield, Terminal, HardDrive, Zap } from 'lucide-react';

export default function TechnicalSpecs() {
  const specs = [
    {
      icon: Cpu,
      label: 'Primary Neural Model',
      value: 'Wav2Vec2 Deepfake-V2',
      detail: 'Fine-tuned speech sequence transformer with softmax binary classification logits.'
    },
    {
      icon: Activity,
      label: 'Acoustic Signal Physics',
      value: 'F0 Jitter, Flatness & Pauses',
      detail: 'Fundamental frequency autocorrelation, spectral flatness ratio, and breathing cadence analysis.'
    },
    {
      icon: Zap,
      label: 'Sampling & Normalization',
      value: '16 kHz Mono PCM',
      detail: 'Linear interpolation downsampling and amplitude peak normalization.'
    },
    {
      icon: HardDrive,
      label: 'Streaming Latency',
      value: '~1.5s Sliding Window',
      detail: 'Real-time WebSocket binary streaming with 5-frame rolling average smoothing.'
    },
    {
      icon: Terminal,
      label: 'Runtime & Inference',
      value: 'FastAPI + PyTorch',
      detail: 'Local Python 3.11 backend service with HuggingFace Hub offline model caching.'
    },
    {
      icon: Shield,
      label: 'Privacy Guarantee',
      value: 'Zero Persistent Storage',
      detail: 'Audio signals are analyzed in-memory; no voice clips are saved or uploaded to external clouds.'
    }
  ];

  return (
    <section id="technical-specs-section" style={{ padding: '48px 0', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-canvas)' }}>
      <div className="vg-container">
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--accent-cyan)', backgroundColor: 'var(--accent-cyan-subtle)', padding: '3px 10px', borderRadius: '6px', marginBottom: '10px' }}>
            ARCHITECTURE & SYSTEM SPECS
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Production Specifications
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0', lineHeight: 1.5 }}>
            Engineered for high throughput, minimal latency, and transparent explainability.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          {specs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={18} color="var(--primary-blue)" />
                </div>

                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {item.value}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.45 }}>
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
