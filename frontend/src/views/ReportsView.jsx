import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Trash2, 
  Plus, 
  ShieldCheck, 
  ShieldAlert, 
  FileAudio,
  Search,
  ExternalLink
} from 'lucide-react';
import { downloadForensicPdf } from '../utils/pdfGenerator';

export default function ReportsView({ reports = [], onDeleteReport, onClearReports, onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter((rep) => {
    const q = searchQuery.toLowerCase();
    return (
      rep.id?.toLowerCase().includes(q) ||
      rep.filename?.toLowerCase().includes(q) ||
      rep.label?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Forensic compliance reports
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Standardized forensic PDF documentation packages generated from audio authenticity inspections.
          </p>
        </div>

        {reports.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  backgroundColor: 'var(--surface-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-btn)',
                  padding: '6px 12px 6px 30px',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  width: '180px'
                }}
              />
            </div>

            {onClearReports && (
              <button
                onClick={onClearReports}
                className="btn-secondary"
                style={{ fontSize: '0.75rem', padding: '6px 12px', color: 'var(--text-muted)' }}
                title="Clear report history"
              >
                Clear all
              </button>
            )}

            {onNavigate && (
              <button
                onClick={() => onNavigate('analyze')}
                className="btn-primary"
                style={{ fontSize: '0.75rem', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Plus size={13} /> New analysis
              </button>
            )}
          </div>
        )}
      </div>

      {/* When no reports exist (EMPTY STATE) */}
      {reports.length === 0 ? (
        <div className="vg-panel" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-btn)',
              backgroundColor: 'var(--surface-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <FileText size={22} />
          </div>

          <h3 style={{ fontSize: '1.0625rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
            No forensic PDF reports generated yet
          </h3>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
            Every voice inspection you conduct produces a cryptographically signed, compliant forensic PDF report. Analyze an audio file or select a demo sample to generate your first certified report.
          </p>

          {onNavigate && (
            <button
              onClick={() => onNavigate('analyze')}
              className="btn-primary"
              style={{ fontSize: '0.8125rem', padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={14} /> Analyze an audio recording
            </button>
          )}
        </div>
      ) : (
        /* Genuine Forensic Reports Table */
        <div className="vg-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Generated Report Archive ({filteredReports.length} {filteredReports.length === 1 ? 'Record' : 'Records'})
            </span>
          </div>

          <table className="vg-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Voice Recording</th>
                <th>Classification</th>
                <th>Confidence</th>
                <th>Period / Timestamp</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Download PDF</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((rep) => {
                const isFake = rep.label === 'likely_ai_generated';
                const confPercent = Math.round((rep.confidence || 0) * 100);

                return (
                  <tr key={rep.id}>
                    <td className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
                      {rep.id}
                    </td>

                    <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileAudio size={15} color="var(--text-muted)" />
                        <span className="mono">{rep.filename || 'voice_recording.wav'}</span>
                      </div>
                    </td>

                    <td>
                      <span className={`badge-status ${isFake ? 'badge-ai' : 'badge-human'}`}>
                        {isFake ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                        {isFake ? 'AI Generated' : 'Human Voice'}
                      </span>
                    </td>

                    <td className="mono" style={{ fontWeight: '600', color: isFake ? 'var(--color-ai)' : 'var(--color-human)' }}>
                      {confPercent}%
                    </td>

                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                      {rep.timestamp}
                    </td>

                    <td>
                      <span className="badge-status badge-human">
                        <CheckCircle size={11} /> {rep.status || 'Generated'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => downloadForensicPdf(rep)}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                          title="Download forensic PDF"
                        >
                          <Download size={12} /> Download PDF
                        </button>

                        {onDeleteReport && (
                          <button
                            onClick={() => onDeleteReport(rep.id)}
                            className="btn-secondary"
                            style={{ padding: '4px 6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                            title="Delete report"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
