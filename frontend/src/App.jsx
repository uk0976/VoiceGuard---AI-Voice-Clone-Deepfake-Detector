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
import { analyzeAudioFile } from './api';

export default function App() {
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

  const handleAnalyzeFile = async (file, clipMeta = null) => {
    const thisRequestId = ++requestIdRef.current;
    setActiveFile(file);
    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    // If analyzed from another view (e.g. samples), switch to the analyze view
    setCurrentView('analyze');

    if (clipMeta) {
      setSelectedClipId(clipMeta.id);
    } else {
      setSelectedClipId(null);
    }

    try {
      const result = await analyzeAudioFile(file, file.name);
      if (thisRequestId === requestIdRef.current) {
        setAnalysisResult(result);

        // Auto-register and persist genuine forensic report
        const repId = `REP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
        const reportEntry = {
          id: repId,
          filename: file.name || 'voice_recording.wav',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          duration: clipMeta?.duration || (file.duration ? `${file.duration}s` : '--'),
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
            <LiveView />
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
        </main>
      </div>
    </div>
  );
}
