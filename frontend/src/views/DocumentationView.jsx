import React from 'react';
import { Cpu, Terminal, HardDrive, Shield, Code, Server } from 'lucide-react';

export default function DocumentationView() {
  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Documentation & API Reference
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Technical specifications, model metadata, and backend endpoint contracts.
        </p>
      </div>

      {/* Model & System Specifications */}
      <div className="vg-panel" style={{ marginBottom: '24px' }}>
        <div className="vg-panel-header">
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            Model Specifications
          </div>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Hugging Face Transformers
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Model Identifier</div>
            <div className="mono" style={{ fontSize: '0.8125rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>MelodyMachine/Deepfake-audio-detection-V2</div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Input Audio Spec</div>
            <div className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: '600' }}>16,000 Hz, 1-Channel (Mono) PCM</div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Core Framework</div>
            <div className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: '600' }}>PyTorch 2.2+ / Transformers 4.40+</div>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Heuristic Layer</div>
            <div className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: '600' }}>Pitch Jitter, Flatness, Cadence</div>
          </div>
        </div>
      </div>

      {/* API Contracts */}
      <div className="vg-panel" style={{ marginBottom: '24px' }}>
        <div className="vg-panel-header">
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            Backend API Contracts
          </div>
          <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            FastAPI Server (Port 8000)
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Endpoint 1: POST /analyze */}
          <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: '700', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#1E3A8A', color: '#93C5FD' }}>POST</span>
              <span className="mono" style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>/analyze</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Direct Audio File Inspection</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Accepts multipart/form-data with an audio file (WAV, MP3, M4A, OGG) up to 25MB.
            </p>
            <div className="mono" style={{ fontSize: '0.6875rem', backgroundColor: '#080B10', padding: '8px 12px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
              {`{ "label": "likely_ai_generated" | "likely_real", "confidence": 0.92, "model_score": 0.94, "heuristic_flags": [...] }`}
            </div>
          </div>

          {/* Endpoint 2: WS /ws/stream */}
          <div style={{ padding: '14px', backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: '700', padding: '2px 6px', borderRadius: '3px', backgroundColor: '#065F46', color: '#6EE7B7' }}>WS</span>
              <span className="mono" style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)' }}>/ws/stream</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>— Real-Time WebSocket Audio Stream</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Receives binary 16 kHz 16-bit PCM WAV chunks (~1.5s window) and yields real-time rolling verdicts.
            </p>
            <div className="mono" style={{ fontSize: '0.6875rem', backgroundColor: '#080B10', padding: '8px 12px', borderRadius: '4px', color: 'var(--text-secondary)' }}>
              {`{ "label": "likely_real", "chunk_score": 0.04, "rolling_avg_score": 0.06, "heuristic_flags": [] }`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
