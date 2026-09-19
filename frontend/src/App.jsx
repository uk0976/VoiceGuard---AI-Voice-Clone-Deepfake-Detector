import React, { useState, useRef } from 'react';
import { UploadCloud, Radio } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FileUpload from './components/FileUpload';
import ResultsPanel from './components/ResultsPanel';
import DemoClipPicker from './components/DemoClipPicker';
import LiveStream from './components/LiveStream';
import HowItWorks from './components/HowItWorks';
import TechnicalSpecs from './components/TechnicalSpecs';
import Footer from './components/Footer';
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-canvas)' }}>
      {/* Sticky Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
        hasResult={!!analysisResult}
      />

      {/* Hero Header Section */}
      <Hero
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Analysis Workspace */}
      <main id="analysis-workspace" style={{ flex: 1, padding: '40px 0' }}>
        <div className="vg-container">
          {/* Segmented Mode Selector Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '4px',
                display: 'inline-flex',
                boxShadow: 'var(--shadow-sm)',
                gap: '4px'
              }}
            >
              <button
                onClick={() => setActiveTab('upload')}
                style={{
                  backgroundColor: activeTab === 'upload' ? 'var(--primary-blue-subtle)' : 'transparent',
                  color: activeTab === 'upload' ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  border: activeTab === 'upload' ? '1px solid #BFDBFE' : '1px solid transparent',
                  padding: '8px 20px',
                  borderRadius: '7px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <UploadCloud size={16} />
                File Upload Inspection
              </button>

              <button
                onClick={() => setActiveTab('stream')}
                style={{
                  backgroundColor: activeTab === 'stream' ? 'var(--primary-blue-subtle)' : 'transparent',
                  color: activeTab === 'stream' ? 'var(--primary-blue)' : 'var(--text-secondary)',
                  border: activeTab === 'stream' ? '1px solid #BFDBFE' : '1px solid transparent',
                  padding: '8px 20px',
                  borderRadius: '7px',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Radio size={16} />
                Live Microphone Stream
              </button>
            </div>
          </div>

          {/* Mode Views */}
          {activeTab === 'upload' ? (
            <>
              {/* Two-Column Grid: Input Left, Results Right */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
                  gap: '24px',
                  alignItems: 'start'
                }}
              >
                <div>
                  <FileUpload
                    onAnalyze={handleAnalyzeFile}
                    isLoading={isLoading}
                    externalFile={activeFile}
                    onClear={handleReset}
                  />
                </div>

                <div>
                  <ResultsPanel
                    result={analysisResult}
                    isLoading={isLoading}
                    error={errorMessage}
                  />
                </div>
              </div>

              {/* Benchmark Reference Clips Section */}
              <DemoClipPicker
                onSelectClip={handleAnalyzeFile}
                isLoading={isLoading}
                selectedClipId={selectedClipId}
              />
            </>
          ) : (
            <LiveStream />
          )}
        </div>
      </main>

      {/* Detection Methodology Section */}
      <HowItWorks />

      {/* System & Architecture Specifications */}
      <TechnicalSpecs />

      {/* Enterprise Footer */}
      <Footer />
    </div>
  );
}
