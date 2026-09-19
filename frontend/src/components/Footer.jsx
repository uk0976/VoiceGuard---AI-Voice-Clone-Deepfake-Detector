import React from 'react';
import { Shield, FileText, CheckCircle } from 'lucide-react';

function GithubIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
        padding: '40px 0 24px',
        marginTop: 'auto'
      }}
    >
      <div className="vg-container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '32px',
            marginBottom: '32px'
          }}
        >
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <img
                  src="/logo.png"
                  alt="VoiceGuard Logo"
                  style={{ width: '22px', height: '22px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
              <span style={{ fontSize: '1.0625rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                VoiceGuard
              </span>
            </div>

            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '300px' }}>
              High-confidence AI voice clone & deepfake speech detection suite combining sequence neural models with acoustic vocal tract physics.
            </p>
          </div>

          {/* Col 2: Architecture & Capabilities */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Detection Engine
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>Mode A: Batch File Inspection (/analyze)</li>
              <li>Mode B: Real-Time Stream (/ws/stream)</li>
              <li>Pitch Jitter & F0 Tracking</li>
              <li>Harmonic Decay & Spectral Flatness</li>
            </ul>
          </div>

          {/* Col 3: Resources & Links */}
          <div>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '12px' }}>
              Documentation & Source
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <a
                  href="https://github.com/uk0976/VoiceGuard---AI-Voice-Clone-Deepfake-Detector"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--primary-blue)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <GithubIcon size={14} /> GitHub Repository
                </a>
              </li>
              <li>
                <a
                  href="https://huggingface.co/MelodyMachine/Deepfake-audio-detection-V2"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--primary-blue)', textDecoration: 'none' }}
                >
                  Wav2Vec2 Foundation Model
                </a>
              </li>
              <li>FastAPI Local Backend (Port 8000)</li>
              <li>React 18 + Vite Frontend (Port 5173)</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>
            VoiceGuard — AI Voice Clone & Deepfake Detector
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Standardized 16kHz Audio Pipeline</span>
            <span>·</span>
            <span>Zero Persistent Voice Storage</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
