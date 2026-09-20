import React from 'react';
import { RefreshCw, Menu } from 'lucide-react';

function GithubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

export default function TopBar({ currentView, onReset, hasResult, onToggleSidebar }) {
  const titles = {
    overview: 'Voice Authenticity Overview',
    analyze: 'Audio File Inspection',
    live: 'Live Stream Detection',
    samples: 'Benchmark Reference Samples',
    history: 'Detection Audit History',
    reports: 'Forensic Compliance Reports',
    how_it_works: 'Signal Detection Methodology',
    docs: 'System Specifications & API',
    faq: 'Frequently Asked Questions & Support',
    terms: 'Terms & Conditions of Service',
  };

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--surface-primary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}
    >
      {/* Left: Mobile Drawer Button & Current View Title */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, gap: '6px' }}>
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="mobile-menu-btn"
            title="Open navigation menu"
          >
            <Menu size={18} />
          </button>
        )}
        <span className="topbar-desktop-only" style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          Workstation /
        </span>
        <h2 
          style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600', 
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {titles[currentView] || 'VoiceGuard'}
        </h2>
      </div>

      {/* Right Metadata & Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-human)', flexShrink: 0 }} />
          <span className="topbar-desktop-only">Model ready</span>
        </div>

        <span className="topbar-desktop-only" style={{ color: 'var(--border-strong)' }}>|</span>

        <span className="mono topbar-desktop-only" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          v2.4.1
        </span>

        {hasResult && (
          <button
            onClick={onReset}
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
            title="Clear current analysis"
          >
            <RefreshCw size={12} />
            <span className="topbar-desktop-only">Reset</span>
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
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--surface-secondary)',
            transition: 'color 0.15s ease'
          }}
          title="GitHub Repository"
        >
          <GithubIcon size={15} />
        </a>
      </div>
    </header>
  );
}
