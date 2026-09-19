import React, { useState } from 'react';
import { Shield, RefreshCw, Activity } from 'lucide-react';

function GithubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

export default function Navbar({ activeTab, setActiveTab, onReset, hasResult }) {
  const [logoError, setLogoError] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header
      style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)'
      }}
    >
      <div
        className="vg-container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              backgroundColor: '#EFF6FF',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {!logoError ? (
              <img
                src="/logo.png"
                alt="VoiceGuard Logo"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <Shield size={22} color="#2563EB" />
            )}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                VoiceGuard
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: '600',
                  color: 'var(--primary-blue)',
                  backgroundColor: 'var(--primary-blue-subtle)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Security Suite
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              AI Voice Clone & Deepfake Detector
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => {
              setActiveTab('upload');
              scrollToSection('analysis-workspace');
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'upload' ? '600' : '500',
              color: activeTab === 'upload' ? 'var(--primary-blue)' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 0',
              borderBottom: activeTab === 'upload' ? '2px solid var(--primary-blue)' : '2px solid transparent',
              transition: 'color 0.15s ease'
            }}
          >
            File Inspection
          </button>

          <button
            onClick={() => {
              setActiveTab('stream');
              scrollToSection('analysis-workspace');
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: activeTab === 'stream' ? '600' : '500',
              color: activeTab === 'stream' ? 'var(--primary-blue)' : 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 0',
              borderBottom: activeTab === 'stream' ? '2px solid var(--primary-blue)' : '2px solid transparent',
              transition: 'color 0.15s ease'
            }}
          >
            Live Stream
          </button>

          <button
            onClick={() => {
              setActiveTab('upload');
              scrollToSection('demo-clips-section');
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 0',
              borderBottom: '2px solid transparent',
              transition: 'color 0.15s ease'
            }}
          >
            Demo Samples
          </button>

          <button
            onClick={() => scrollToSection('how-it-works-section')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 0',
              borderBottom: '2px solid transparent',
              transition: 'color 0.15s ease'
            }}
          >
            How It Works
          </button>

          <button
            onClick={() => scrollToSection('technical-specs-section')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px 0',
              borderBottom: '2px solid transparent',
              transition: 'color 0.15s ease'
            }}
          >
            Architecture
          </button>
        </nav>

        {/* System Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              padding: '5px 10px',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)'
            }}
          >
            <span className="pulse-dot" />
            <span style={{ fontWeight: '500' }}>Pipeline ready</span>
          </div>

          {hasResult && (
            <button
              onClick={onReset}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
              title="Reset analysis"
            >
              <RefreshCw size={13} />
              Reset
            </button>
          )}

          <a
            href="https://github.com/uk0976/VoiceGuard---AI-Voice-Clone-Deepfake-Detector"
            target="_blank"
            rel="noreferrer"
            style={{
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              transition: 'all 0.15s ease'
            }}
            title="GitHub Repository"
          >
            <GithubIcon size={18} />
          </a>
        </div>
      </div>
    </header>
  );
}
