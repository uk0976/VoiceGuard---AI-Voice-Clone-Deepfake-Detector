import React from 'react';
import { 
  Shield, 
  AudioWaveform, 
  FileAudio, 
  Radio, 
  History, 
  FileText, 
  BookOpen, 
  Workflow, 
  SlidersHorizontal,
  ExternalLink,
  HelpCircle,
  Scale
} from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Overview', icon: AudioWaveform },
        { id: 'analyze', label: 'Analyze Audio', icon: FileAudio },
        { id: 'live', label: 'Live Detection', icon: Radio },
        { id: 'samples', label: 'Demo Samples', icon: SlidersHorizontal },
      ]
    },
    {
      title: 'INSIGHTS',
      items: [
        { id: 'history', label: 'Detection History', icon: History },
        { id: 'reports', label: 'Forensic Reports', icon: FileText },
      ]
    },
    {
      title: 'RESOURCES',
      items: [
        { id: 'how_it_works', label: 'How It Works', icon: Workflow },
        { id: 'docs', label: 'Documentation', icon: BookOpen },
        { id: 'faq', label: 'FAQ & Knowledge Base', icon: HelpCircle },
      ]
    },
    {
      title: 'LEGAL',
      items: [
        { id: 'terms', label: 'Terms & Conditions', icon: Scale },
      ]
    }
  ];

  return (
    <aside
      style={{
        width: '236px',
        backgroundColor: 'var(--surface-sidebar)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {/* Brand Header */}
      <div
        onClick={() => setCurrentView('overview')}
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease'
        }}
        title="VoiceGuard — Audio Authenticity Platform"
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            backgroundColor: '#000000',
            border: '1px solid rgba(34, 167, 214, 0.4)',
            boxShadow: '0 0 10px rgba(34, 167, 214, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: 0,
            flexShrink: 0
          }}
        >
          <img
            src="/logo.png"
            alt="VoiceGuard Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        </div>
        <div>
          <div style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            VoiceGuard
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Real Voices. A Safer Tomorrow.
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }}>
        {navSections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '20px' }}>
            <div
              style={{
                fontSize: '0.625rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                padding: '0 10px 8px',
                textTransform: 'uppercase'
              }}
            >
              {section.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={15} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Footer */}
      <div
        style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--surface-primary)',
          fontSize: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-human)' }} />
            <span style={{ fontWeight: '500', color: 'var(--text-secondary)' }}>Model ready</span>
          </div>
          <span className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>v2.4.1</span>
        </div>

        <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          Wav2Vec2 Deepfake-V2
        </div>
      </div>
    </aside>
  );
}
