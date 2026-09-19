import React from 'react';
import { ShieldCheck, ShieldAlert, FileAudio, Radio, ArrowRight, Activity, Download, Plus } from 'lucide-react';
import { downloadForensicPdf } from '../utils/pdfGenerator';

export default function OverviewView({ onNavigate, onSelectDemoClip, reports = [] }) {
  const totalSignals = reports.length;
  const humanCount = reports.filter(r => r.label === 'likely_real').length;
  const aiCount = reports.filter(r => r.label === 'likely_ai_generated').length;

  const humanPercent = totalSignals > 0 ? ((humanCount / totalSignals) * 100).toFixed(1) + '%' : '0.0%';
  const aiPercent = totalSignals > 0 ? ((aiCount / totalSignals) * 100).toFixed(1) + '%' : '0.0%';

  const recentAnalyses = reports.slice(0, 5);

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

      {/* Dynamic Metrics Row */}
      <div className="metric-row">
        <div className="metric-item">
          <div className="metric-label">Analyzed Signals</div>
          <div className="metric-value">{totalSignals}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {totalSignals === 1 ? '1 total inspection' : `${totalSignals} total inspections`}
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Human Authenticated</div>
          <div className="metric-value" style={{ color: 'var(--color-human)' }}>{humanCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {totalSignals > 0 ? `${humanPercent} verified natural` : 'No samples verified yet'}
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">AI Detected</div>
          <div className="metric-value" style={{ color: 'var(--color-ai)' }}>{aiCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {totalSignals > 0 ? `${aiPercent} synthetic clones` : 'No synthetic clones detected'}
          </div>
        </div>

        <div className="metric-item">
          <div className="metric-label">Pipeline Engine</div>
          <div className="metric-value" style={{ color: 'var(--accent-cyan)', fontSize: '1.35rem', fontWeight: '700' }}>
            Active
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Wav2Vec2 + Librosa 16kHz
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
          {reports.length > 0 && (
            <button
              onClick={() => onNavigate('reports')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '4px 10px' }}
            >
              View all reports <ArrowRight size={12} />
            </button>
          )}
        </div>

        {reports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '44px 20px', borderTop: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-btn)',
                backgroundColor: 'var(--surface-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}
            >
              <Activity size={18} />
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
              No inspections recorded yet
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '380px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
              Audio files uploaded or tested via demo clips will automatically update your forensic telemetry and recent analyses in real time.
            </div>
            <button
              onClick={() => onNavigate('analyze')}
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '6px 14px' }}
            >
              <Plus size={13} /> Analyze an audio file
            </button>
          </div>
        ) : (
          <table className="vg-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Signal Type</th>
                <th>Result</th>
                <th>Confidence</th>
                <th>Duration</th>
                <th>Analyzed (UTC)</th>
                <th style={{ textAlign: 'right' }}>Forensic Report</th>
              </tr>
            </thead>
            <tbody>
              {recentAnalyses.map((item) => {
                const isFake = item.label === 'likely_ai_generated';
                const rawConf = item.confidence || 0;
                const confPercent = Math.round((!isFake && rawConf < 0.5 ? 1 - rawConf : rawConf) * 100);
                const ext = (item.filename?.split('.').pop() || 'wav').toUpperCase();

                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileAudio size={14} color="var(--text-muted)" />
                        <span className="mono">{item.filename}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>Audio ({ext})</td>
                    <td>
                      {isFake ? (
                        <span className="badge-status badge-ai">
                          <ShieldAlert size={12} /> AI Generated
                        </span>
                      ) : (
                        <span className="badge-status badge-human">
                          <ShieldCheck size={12} /> Human
                        </span>
                      )}
                    </td>
                    <td className="mono" style={{ fontWeight: '600', color: isFake ? 'var(--color-ai)' : 'var(--color-human)' }}>
                      {confPercent}%
                    </td>
                    <td className="mono" style={{ color: 'var(--text-muted)' }}>
                      {item.duration || '--'}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      {item.timestamp}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => downloadForensicPdf(item)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.6875rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Download forensic PDF report"
                      >
                        <Download size={11} /> PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
