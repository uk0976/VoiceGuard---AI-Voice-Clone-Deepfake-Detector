import { Shield, Sparkles, AudioWaveform } from 'lucide-react';
import ResultsPanel from './components/ResultsPanel';
import { analyzeAudioFile } from './api';

export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleAnalyzeFile = async (file) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await analyzeAudioFile(file);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'An error occurred while analyzing the audio file.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <header
        style={{
          borderBottom: '1px solid #1e293b',
          backgroundColor: 'rgba(11, 15, 25, 0.85)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 24px'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(6, 182, 212, 0.35)',
                color: '#ffffff'
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#f8fafc' }}>
                  VoiceGuard
                </h1>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}
                >
                  v2.0
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>AI Voice Clone & Deepfake Detector</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
              Model Online
            </div>
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
      <main style={{ flex: 1, padding: '36px 20px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ maxWidth: '1100px', width: '100%' }}>
          {/* Hero Section */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: '600',
                marginBottom: '14px'
              }}
            >
              <Sparkles size={14} />
              Dual-Layer Detection: Wav2Vec2 + Librosa Heuristics
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              Verify Human Authenticity in Seconds
            </h2>
            <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '620px', margin: '0 auto' }}>
              Protect against voice cloning scams, CEO spoofing, and automated synthetic robocalls with explainable acoustic physics and neural speech analysis.
            </p>
          </div>

          {/* Core Interactive Layout: Two Columns */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: '24px',
              alignItems: 'start'
            }}
          >
            {/* Left Column: Upload */}
            <div>
              <FileUpload onAnalyze={handleAnalyzeFile} isLoading={isLoading} />
            </div>

            {/* Right Column: Results */}
            <div>
              <ResultsPanel result={analysisResult} isLoading={isLoading} error={errorMessage} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #1e293b', padding: '18px 24px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        VoiceGuard Security Engine · Powered by Hugging Face Wav2Vec2 & Librosa Signal Processing
      </footer>
    </div>
  );
}
