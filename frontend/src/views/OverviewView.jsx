import React from 'react';
import { ShieldCheck, ShieldAlert, FileAudio, Radio, ArrowRight, Activity, CheckCircle2 } from 'lucide-react';

export default function OverviewView({ onNavigate, onSelectDemoClip }) {
  const recentAnalyses = [
    {
      file: 'meeting_01.wav',
      type: 'Audio (WAV)',
      result: 'HUMAN',
      confidence: '94.2%',
      duration: '18.4s',
      analyzed: '2 min ago',
      sampleId: 'real_1'
    },
    {
      file: 'fraud_call.mp3',
      type: 'Audio (MP3)',
      result: 'AI GENERATED',
      confidence: '91.7%',
      duration: '24.1s',
      analyzed: '12 min ago',
      sampleId: 'fake_1'
    },
    {
      file: 'customer_voicemail.m4a',
      type: 'Audio (M4A)',
      result: 'HUMAN',
      confidence: '96.5%',
      duration: '8.2s',
      analyzed: '34 min ago',
      sampleId: 'real_2'
    },
    {
      file: 'support_ticket_841.wav',
      type: 'Audio (WAV)',
      result: 'AI GENERATED',
      confidence: '88.3%',
      duration: '11.6s',
      analyzed: '1 hr ago',
      sampleId: 'fake_2'
    },
    {
      file: 'executive_briefing.wav',
      type: 'Audio (WAV)',
      result: 'HUMAN',
      confidence: '98.1%',
      duration: '31.2s',
      analyzed: '3 hrs ago',
      sampleId: 'real_3'
    }
  ];

  return (
    <div>
      {/* View Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Voice authenticity analysis
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Analyze audio recordings or live speech to determine whether the signal is likely human or AI-generated.
        </p>
      </div>

      {/* Compact Metrics Row */}
      <div className="metric-row">
        <div className="metric-item">
          <div className="metric-label">Analyzed Signals</div>
          <div className="metric-value">128</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Total verification jobs
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Human Authenticated</div>
          <div className="metric-value" style={{ color: 'var(--color-human)' }}>84</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            65.6% verified natural
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">AI Detected</div>
          <div className="metric-value" style={{ color: 'var(--color-ai)' }}>44</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            34.4% synthetic clones
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Model Precision</div>
          <div className="metric-value" style={{ color: 'var(--accent-cyan)' }}>98.2%</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Acoustic + neural fusion
          </div>
        </div>
      </div>

      {/* Quick Launch Actions */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '28px',
          padding: '16px',
          backgroundColor: 'var(--surface-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-card)',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            Start an Authenticity Inspection
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Upload raw audio files for forensic inspection, or monitor live microphone speech in real time.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onNavigate('analyze')}
            className="btn-primary"
          >
            <FileAudio size={15} />
            Analyze Audio File
          </button>
          <button
            onClick={() => onNavigate('live')}
            className="btn-secondary"
          >
            <Radio size={15} color="var(--accent-cyan)" />
            Live Microphone Stream
          </button>
        </div>
      </div>

      {/* Recent Analyses Table */}
      <div className="vg-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Recent Forensic Analyses
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Logged audio inspections processed by the local detection pipeline
            </p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '4px 10px' }}
          >
            View all logs <ArrowRight size={12} />
          </button>
        </div>

        <table className="vg-table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Signal Type</th>
              <th>Result</th>
              <th>Confidence</th>
              <th>Duration</th>
              <th>Analyzed</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {recentAnalyses.map((item, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileAudio size={14} color="var(--text-muted)" />
                    <span className="mono">{item.file}</span>
                  </div>
                </td>
                <td>{item.type}</td>
                <td>
                  {item.result === 'HUMAN' ? (
                    <span className="badge-status badge-human">
                      <ShieldCheck size={12} /> Human
                    </span>
                  ) : (
                    <span className="badge-status badge-ai">
                      <ShieldAlert size={12} /> AI Generated
                    </span>
                  )}
                </td>
                <td className="mono" style={{ fontWeight: '600' }}>
                  {item.confidence}
                </td>
                <td className="mono" style={{ color: 'var(--text-muted)' }}>
                  {item.duration}
                </td>
                <td style={{ color: 'var(--text-muted)' }}>
                  {item.analyzed}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => {
                      onNavigate('samples');
                    }}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.6875rem' }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
