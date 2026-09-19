import React from 'react';
import { Radio, Cpu, Activity, ShieldCheck, FileAudio, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: FileAudio,
      title: 'Audio Ingestion & Normalization',
      desc: 'Audio files or live microphone streams are resampled to 16 kHz mono PCM to eliminate recording hardware bias.'
    },
    {
      num: '02',
      icon: Activity,
      title: 'Vocal Tract Signal Profiling',
      desc: 'Computes fundamental frequency (F0), pitch micro-jitter, and harmonic-to-noise ratios across unvoiced segments.'
    },
    {
      num: '03',
      icon: Cpu,
      title: 'Neural Manifold Classification',
      desc: 'Wav2Vec2 deep neural model examines latent speech representations against trained synthetic voice distributions.'
    },
    {
      num: '04',
      icon: Radio,
      title: 'Explainability & Anomaly Scoring',
      desc: 'Independent acoustic heuristics scan for phase continuity, unnatural spectral flatness, and missing respiratory pauses.'
    },
    {
      num: '05',
      icon: ShieldCheck,
      title: 'Calibrated Confidence Verdict',
      desc: 'Scores from both layers are synthesized into a final verdict with transparent explainability findings.'
    }
  ];

  return (
    <section id="how-it-works-section" style={{ padding: '48px 0', borderTop: '1px solid var(--border-subtle)', backgroundColor: '#FFFFFF' }}>
      <div className="vg-container">
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-blue)', backgroundColor: 'var(--primary-blue-subtle)', padding: '3px 10px', borderRadius: '6px', marginBottom: '10px' }}>
            METHODOLOGY
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            How VoiceGuard detects synthetic speech
          </h2>
          <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '8px auto 0', lineHeight: 1.5 }}>
            A dual-layer verification architecture combining deep learning representations with acoustic signal physics.
          </p>
        </div>

        {/* 5-Step Process Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#EFF6FF',
                      color: 'var(--primary-blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>
                    {step.num}
                  </span>
                </div>

                <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.3 }}>
                  {step.title}
                </h3>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
