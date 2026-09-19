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
  const requestIdRef = useRef(0);

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
            />
          )}

          {currentView === 'reports' && (
            <ReportsView />
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
