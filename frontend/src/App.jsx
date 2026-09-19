import React, { useState, useRef } from 'react';
import { Shield, Sparkles, AudioWaveform, Cpu, Activity, Radio, CheckCircle, RefreshCw } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ResultsPanel from './components/ResultsPanel';
import DemoClipPicker from './components/DemoClipPicker';
import LiveStream from './components/LiveStream';
import { analyzeAudioFile } from './api';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'stream'
  const requestIdRef = useRef(0);

  const handleAnalyzeFile = async (file, clipMeta = null) => {
    const thisRequestId = ++requestIdRef.current;
    setActiveFile(file);
    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    if (clipMeta) {
      setSelectedClipId(clipMeta.id);
    } else {
      setSelectedClipId(null);
    }

    try {
      const result = await analyzeAudioFile(file, file.name);
      if (thisRequestId === requestIdRef.current) {
        setAnalysisResult(result);
      }
    } catch (err) {
      if (thisRequestId === requestIdRef.current) {
        console.error('Analysis error:', err);
        setErrorMessage(err.message || 'An error occurred while analyzing the audio file.');
      }
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
    setSelectedClipId(null);
    setActiveFile(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: 'rgba(10, 14, 23, 0.92)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '14px 28px'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(6, 182, 212, 0.35)',
                color: '#ffffff'
              }}
            >
              <AudioWaveform size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em', color: '#f8fafc', lineHeight: 1.2 }}>
                VoiceGuard
              </h1>
              <p style={{ fontSize: '0.74rem', color: '#64748b' }}>Audio authenticity detector</p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0d1322',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#cbd5e1'
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <span>Model ready</span>
            </div>

            {analysisResult && (
              <button
                onClick={handleReset}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'border-color 150ms ease, color 150ms ease'
                }}
              >
                <RefreshCw size={12} /> Reset
              </button>
            )}

            <a
              href="https://github.com/uk0976/VoiceGuard---AI-Voice-Clone-Deepfake-Detector"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', transition: 'color 150ms ease' }}
              title="GitHub Repository"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 24px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1240px', width: '100%' }}>
          {/* Header Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2.1rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.025em', marginBottom: '8px' }}>
              Detect synthetic voices and AI clones
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '620px', margin: '0 auto', lineHeight: '1.5' }}>
              Analyze recorded audio or stream live speech to check whether a voice is human or AI-generated.
            </p>
          </div>

          {/* Mode Selector Tabs with Smooth Sliding Indicator */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div
              style={{
                position: 'relative',
                background: '#0c1220',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '4px',
                borderRadius: '12px',
                display: 'inline-flex',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Sliding Indicator */}
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  bottom: '4px',
                  left: activeTab === 'upload' ? '4px' : 'calc(50% + 2px)',
                  width: 'calc(50% - 6px)',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(6, 182, 212, 0.35)',
                  transition: 'left 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                  zIndex: 1,
                  pointerEvents: 'none'
                }}
              />

              <button
                onClick={() => setActiveTab('upload')}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  background: 'transparent',
                  color: activeTab === 'upload' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '9px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 180ms ease'
                }}
              >
                <AudioWaveform size={16} />
                File Upload
              </button>
              <button
                onClick={() => setActiveTab('stream')}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  background: 'transparent',
                  color: activeTab === 'stream' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '9px 24px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 180ms ease'
                }}
              >
                <Radio size={16} />
                Live Stream
              </button>
            </div>
          </div>

          {activeTab === 'upload' ? (
            <>
              {/* Two-Column Grid Layout: Input on Left, Verdict on Right */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
                  gap: '24px',
                  alignItems: 'start'
                }}
              >
                {/* Left: Upload & Audio Inspector */}
                <div>
                  <FileUpload
                    onAnalyze={handleAnalyzeFile}
                    isLoading={isLoading}
                    externalFile={activeFile}
                    onClear={handleReset}
                  />
                </div>

                {/* Right: Results & Acoustic Metrics */}
                <div>
                  <ResultsPanel result={analysisResult} isLoading={isLoading} error={errorMessage} />
                </div>
              </div>

              {/* Section 7 Demo Clips for Judges */}
              <DemoClipPicker
                onSelectClip={handleAnalyzeFile}
                isLoading={isLoading}
                selectedClipId={selectedClipId}
              />
            </>
          ) : (
            <LiveStream />
          )}

          {/* Technical Specifications */}
          <div
            style={{
              marginTop: '28px',
              padding: '14px 20px',
              background: 'rgba(13, 20, 36, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '0.78rem',
              color: '#64748b'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: '#94a3b8' }}>Model:</strong>
              <code style={{ background: '#0b1120', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>Wav2Vec2 Deepfake-V2</code>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: '#94a3b8' }}>Heuristics:</strong>
              <span>Pitch jitter · Spectral flatness · Pause cadence</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: '#94a3b8' }}>Input:</strong>
              <span>16 kHz Mono PCM</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '16px 24px', textAlign: 'center', fontSize: '0.78rem', color: '#475569' }}>
        VoiceGuard AI Voice Clone & Deepfake Detector · FastAPI + PyTorch + Transformers + React
      </footer>
    </div>
  );
}
