import React from 'react';
import { FileAudio, Activity, Cpu, Radio, ShieldCheck } from 'lucide-react';

export default function HowItWorksView() {
  const steps = [
    {
      num: '01',
      title: 'Audio ingestion and signal preprocessing',
      icon: FileAudio,
      summary: 'Input audio stream or file is decoded and standardized to 16,000 Hz single-channel (mono) PCM.',
      details: [
        'Resampling: Utilizes polyphase sinc interpolation to convert varying source sample rates (44.1kHz, 48kHz, etc.) down to standard 16kHz.',
        'Peak normalization: Audio waveform amplitude is scaled so the maximum absolute peak reaches 1.0, preventing clipping and low-gain attenuation.',
        'Format support: Decodes linear PCM WAV, lossy MP3, AAC/M4A, and OGG containers in-memory.'
      ]
    },
    {
      num: '02',
      title: 'Vocal tract acoustic feature extraction',
      icon: Activity,
      summary: 'Extracts fundamental physical properties of human phonation that neural vocoders struggle to replicate.',
      details: [
        'Pitch micro-jitter: Uses autocorrelation on 25ms voiced frames with 10ms hops to compute period-to-period perturbation (jitter < 0.015 indicates artificial steadiness).',
        'Spectral flatness: Computes the ratio of geometric mean to arithmetic mean of power spectrum coefficients across unvoiced segments.',
        'Silence cadence: Tracks inter-word pauses and respiratory intervals (< 0.15s silences without breath intake trigger cadence flags).'
      ]
    },
    {
      num: '03',
      title: 'Neural sequence manifold classification',
      icon: Cpu,
      summary: 'Wav2Vec2 sequence transformer evaluates latent temporal representations against deepfake distributions.',
      details: [
        'Architecture: Pretrained multi-layer convolutional feature encoder followed by transformer contextual blocks.',
        'Model checkpoint: MelodyMachine/Deepfake-audio-detection-V2 fine-tuned on diverse multilingual cloned speech datasets.',
        'Output: Softmax probability distribution producing a raw deepfake model probability score [0.0, 1.0].'
      ]
    },
    {
      num: '04',
      title: 'Acoustic heuristic verification layer',
      icon: Radio,
      summary: 'Physical signal heuristics validate the neural model output to provide explainability and acoustic defense.',
      details: [
        'Acoustic compensation: Counteracts room transmission acoustics and speaker-to-mic degradation where neural weights may attenuate.',
        'Explainability flags: Identifies specific physical anomalies such as "Unnatural pitch steadiness", "Elevated spectral flatness", or "Missing breath pauses".'
      ]
    },
    {
      num: '05',
      title: 'Calibrated confidence calculation',
      icon: ShieldCheck,
      summary: 'Synthesizes neural representations and acoustic physics into a single calibrated verdict.',
      details: [
        'Fusion weighting: Blends neural sequence classification (75%) with heuristic acoustic scores (25%) under nominal digital conditions.',
        'Decision boundary: Fixed 50% threshold separating "Likely Real" from "Likely AI-Generated".',
        'Report generation: Yields transparent forensic metrics and confidence percentages for audit compliance.'
      ]
    }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Detection methodology
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Technical specification of the dual-engine acoustic and neural classification pipeline.
        </p>
      </div>

      {/* Numbered Vertical Timeline */}
      <div style={{ maxWidth: '800px', position: 'relative', paddingLeft: '32px' }}>
        {/* Thin Vertical Connecting Line */}
        <div
          style={{
            position: 'absolute',
            left: '11px',
            top: '20px',
            bottom: '20px',
            width: '2px',
            backgroundColor: 'var(--border-subtle)'
          }}
        />

        {steps.map((step, idx) => {
          const Icon = step.icon;

          return (
            <div
              key={idx}
              style={{
                position: 'relative',
                marginBottom: '32px'
              }}
            >
              {/* Step Circle Node */}
              <div
                style={{
                  position: 'absolute',
                  left: '-32px',
                  top: '0',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface-primary)',
                  border: '2px solid var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.625rem',
                  fontWeight: '700',
                  color: 'var(--accent-cyan)',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {step.num}
              </div>

              {/* Step Content */}
              <div className="vg-panel" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Icon size={16} color="var(--accent-cyan)" />
                  <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.45 }}>
                  {step.summary}
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {step.details.map((detail, dIdx) => (
                    <li
                      key={dIdx}
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        paddingLeft: '12px',
                        position: 'relative',
                        lineHeight: 1.4
                      }}
                    >
                      <span style={{ position: 'absolute', left: 0, top: '4px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--border-strong)' }} />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
