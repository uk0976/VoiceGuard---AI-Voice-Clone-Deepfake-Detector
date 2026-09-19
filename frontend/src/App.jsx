import React, { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'stream'

  const handleAnalyzeFile = async (file, clipMeta = null) => {
    setIsLoading(true);
    setErrorMessage(null);
    if (clipMeta) {
      setSelectedClipId(clipMeta.id);
    }

    try {
      const result = await analyzeAudioFile(file, file.name);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'An error occurred while analyzing the audio file.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setErrorMessage(null);
    setSelectedClipId(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid #1e293b',
          backgroundColor: 'rgba(11, 15, 25, 0.92)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '14px 28px'
        }}
      >
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                color: '#ffffff'
              }}
            >
              <Shield size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#f8fafc' }}>
                  VoiceGuard
                </h1>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    color: '#06b6d4',
                    background: 'rgba(6, 182, 212, 0.12)',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}
                >
                  DEEPFAKE DETECTION SUITE
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>AI Voice Clone & Synthetic Audio Verification</p>
            </div>
          </div>

          {/* System Status Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#0f172a',
                border: '1px solid #1e293b',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                color: '#cbd5e1'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }} />
              <span>Wav2Vec2 V2 Model Online</span>
            </div>

            {analysisResult && (
              <button
                onClick={handleReset}
                style={{
                  background: 'transparent',
                  border: '1px solid #334155',
                  color: '#94a3b8',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={12} /> Reset
              </button>
            )}

            <a
              href="https://github.com/uk0976/VoiceGuard---AI-Voice-Clone-Deepfake-Detector"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
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
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: '600',
                marginBottom: '14px'
              }}
            >
              <Sparkles size={14} />
              Explainable AI Defense Engine (Audio Classification + Signal Processing)
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.025em', marginBottom: '10px' }}>
              Verify Human Authenticity in Seconds
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
              Detect realistic AI voice clones used in imposter fraud, CEO scam calls, and automated robocalls with instant confidence scores and transparent acoustic explanations.
            </p>
          </div>

          {/* Mode Selector Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', padding: '5px', borderRadius: '12px', display: 'inline-flex', gap: '6px' }}>
              <button
                onClick={() => setActiveTab('upload')}
                style={{
                  background: activeTab === 'upload' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'transparent',
                  color: activeTab === 'upload' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === 'upload' ? '0 2px 12px rgba(6, 182, 212, 0.35)' : 'none'
                }}
              >
                <AudioWaveform size={16} />
                Mode A: File Upload
              </button>
              <button
                onClick={() => setActiveTab('stream')}
                style={{
                  background: activeTab === 'stream' ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'transparent',
                  color: activeTab === 'stream' ? '#ffffff' : '#94a3b8',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: activeTab === 'stream' ? '0 2px 12px rgba(6, 182, 212, 0.35)' : 'none'
                }}
              >
                <Radio size={16} />
                Mode B: Real-Time Live Stream
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
                  <FileUpload onAnalyze={handleAnalyzeFile} isLoading={isLoading} />
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

          {/* Technical Architecture Specs for Judges */}
          <div
            style={{
              marginTop: '28px',
              padding: '16px 20px',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #1e293b',
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
              <strong style={{ color: '#94a3b8' }}>Model Backbone:</strong>
              <code style={{ background: '#1e293b', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px' }}>MelodyMachine/Deepfake-audio-detection-V2</code>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: '#94a3b8' }}>Signal Engine:</strong>
              <span>Librosa Pyin F0 Jitter + Spectral Wiener Entropy + Energy Silence Split</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ color: '#94a3b8' }}>Audio Pipeline:</strong>
              <span>16,000 Hz Mono 16-bit PCM Resampling</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '16px 24px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        VoiceGuard AI Voice Clone & Deepfake Detector · Built with FastAPI, PyTorch, Transformers, Librosa & React Vite
      </footer>
    </div>
  );
}
