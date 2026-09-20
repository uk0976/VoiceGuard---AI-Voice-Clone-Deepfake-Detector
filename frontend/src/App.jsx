import React, { useState, useRef } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import OverviewView from './views/OverviewView';
import AnalyzeView from './views/AnalyzeView';
import LiveView from './views/LiveView';
import SamplesView from './views/SamplesView';
import HistoryView from './views/HistoryView';
import ReportsView from './views/ReportsView';
import HowItWorksView from './views/HowItWorksView';
import DocumentationView from './views/DocumentationView';
import FaqView from './views/FaqView';
import TermsView from './views/TermsView';
import SplashScreen from './components/SplashScreen';
import { analyzeAudioFile, API_BASE } from './api';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState('overview');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [reports, setReports] = useState(() => {
    try {
      const stored = localStorage.getItem('voiceguard_reports');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const requestIdRef = useRef(0);

  const saveReport = (newReport) => {
    setReports((prev) => {
      // De-duplicate if same file analyzed within 10 seconds
      const existsIdx = prev.findIndex(
        r => r.filename === newReport.filename && Math.abs(new Date(r.timestamp) - new Date(newReport.timestamp)) < 10000
      );
      let updated;
      if (existsIdx >= 0) {
        updated = [...prev];
        updated[existsIdx] = newReport;
      } else {
        updated = [newReport, ...prev];
      }
      try {
        localStorage.setItem('voiceguard_reports', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return updated;
    });
  };

  const deleteReport = (id) => {
    setReports((prev) => {
      const updated = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem('voiceguard_reports', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return updated;
    });
  };

  const clearAllReports = () => {
    setReports([]);
    try {
      localStorage.removeItem('voiceguard_reports');
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleAnalyzeFile = async (fileOrClip, maybeClipMeta = null) => {
    const thisRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    // 1. Instantly navigate to the Analyze Audio workstation
    setCurrentView('analyze');

    let fileToAnalyze = null;
    let clipMeta = null;

    if (fileOrClip instanceof Blob) {
      fileToAnalyze = fileOrClip;
      clipMeta = maybeClipMeta;
      setActiveFile(fileOrClip);
      setSelectedClipId(clipMeta?.id || null);
    } else if (fileOrClip && fileOrClip.filename) {
      // Direct sample clicked from Demo Samples
      clipMeta = fileOrClip;
      setSelectedClipId(clipMeta.id);

      // Instantly set placeholder activeFile so AnalyzeView immediately renders the file card and audio details
      const demoAudioUrl = `/demo_clips/${clipMeta.filename}`;
      const placeholder = {
        name: clipMeta.filename,
        size: clipMeta.size ? (parseInt(clipMeta.size) * 1024 || 250000) : 250000,
        type: 'audio/wav',
        duration: clipMeta.duration,
        url: demoAudioUrl
      };
      setActiveFile(placeholder);
    }

    // Guarantee minimum inspection visualization time (2.6s) so user experiences the live real-time analysis
    const delayPromise = new Promise((resolve) => setTimeout(resolve, 2600));

    try {
      // If we don't have the File blob yet (from Demo Samples click), fetch it now
      if (!fileToAnalyze && clipMeta) {
        let res;
        try {
          res = await fetch(`/demo_clips/${clipMeta.filename}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
        } catch {
          const fallbackUrl = API_BASE ? `${API_BASE}/demo_clips/${clipMeta.filename}` : `/demo_clips/${clipMeta.filename}`;
          res = await fetch(fallbackUrl);
        }
        const blob = await res.blob();
        fileToAnalyze = new File([blob], clipMeta.filename, { type: 'audio/wav' });
        if (thisRequestId === requestIdRef.current) {
          setActiveFile(fileToAnalyze);
        }
      }

      if (!fileToAnalyze) {
        throw new Error('No audio file provided for analysis.');
      }

      const analyzePromise = analyzeAudioFile(fileToAnalyze, fileToAnalyze.name);
      const [result] = await Promise.all([analyzePromise, delayPromise]);

      if (thisRequestId === requestIdRef.current) {
        setAnalysisResult(result);

        // Auto-register and persist genuine forensic report
        const repId = `REP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        const reportEntry = {
          id: repId,
          filename: fileToAnalyze.name || 'voice_recording.wav',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          duration: clipMeta?.duration || (fileToAnalyze.duration ? `${fileToAnalyze.duration}s` : '--'),
          label: result.label,
          confidence: result.confidence,
          model_score: result.model_score,
          heuristic_flags: result.heuristic_flags || [],
          metrics: result.metrics || {},
          status: 'Generated'
        };
        saveReport(reportEntry);
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Brand Opening Transition Splash Screen */}
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}

      {/* Fixed Left Sidebar Shell */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Main Application Workstation Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Bar Header */}
        <TopBar
          currentView={currentView}
          onReset={handleReset}
          hasResult={!!analysisResult}
        />

        {/* Dynamic Viewport Container */}
        <main style={{ flex: 1, padding: '28px 32px', maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
          {currentView === 'overview' && (
            <OverviewView
              onNavigate={setCurrentView}
              onSelectDemoClip={handleAnalyzeFile}
              reports={reports}
            />
          )}

          {currentView === 'analyze' && (
            <AnalyzeView
              onAnalyze={handleAnalyzeFile}
              isLoading={isLoading}
              error={errorMessage}
              result={analysisResult}
              activeFile={activeFile}
              onReset={handleReset}
              onSaveReport={saveReport}
            />
          )}

          {currentView === 'live' && (
            <LiveView
              onSaveReport={saveReport}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'samples' && (
            <SamplesView
              onSelectClip={handleAnalyzeFile}
              isLoading={isLoading}
              selectedClipId={selectedClipId}
            />
          )}

          {currentView === 'history' && (
            <HistoryView
              onNavigate={setCurrentView}
              reports={reports}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              reports={reports}
              onDeleteReport={deleteReport}
              onClearReports={clearAllReports}
              onNavigate={setCurrentView}
            />
          )}

          {currentView === 'how_it_works' && (
            <HowItWorksView />
          )}

          {currentView === 'docs' && (
            <DocumentationView />
          )}

          {currentView === 'faq' && (
            <FaqView onNavigate={setCurrentView} />
          )}

          {currentView === 'terms' && (
            <TermsView onNavigate={setCurrentView} />
          )}
        </main>
      </div>
    </div>
  );
}
