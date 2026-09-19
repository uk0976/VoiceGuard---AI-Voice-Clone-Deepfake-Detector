import React from 'react';
import { FileText, Download, CheckCircle, Shield } from 'lucide-react';

export default function ReportsView() {
  const reports = [
    { id: 'REP-2026-09', title: 'Executive Forensic Voice Analysis Summary', date: 'September 2026', totalSignals: 128, syntheticRate: '34.4%', status: 'Generated' },
    { id: 'REP-2026-08', title: 'Monthly Deepfake Threat Audit Report', date: 'August 2026', totalSignals: 94, syntheticRate: '28.7%', status: 'Archived' },
    { id: 'REP-2026-07', title: 'Biometric Phishing & Voice Clone Assessment', date: 'July 2026', totalSignals: 112, syntheticRate: '31.2%', status: 'Archived' }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Forensic compliance reports
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Standardized documentation packages for compliance audits and forensic verification.
        </p>
      </div>

      {/* Reports Table */}
      <div className="vg-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="vg-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Document Title</th>
              <th>Period</th>
              <th>Signals Evaluated</th>
              <th>Synthetic Detection Rate</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Download</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((rep) => (
              <tr key={rep.id}>
                <td className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
                  {rep.id}
                </td>
                <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={14} color="var(--text-muted)" />
                    <span>{rep.title}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--text-secondary)' }}>{rep.date}</td>
                <td className="mono">{rep.totalSignals}</td>
                <td className="mono" style={{ color: 'var(--color-ai)' }}>{rep.syntheticRate}</td>
                <td>
                  <span className="badge-status badge-human">
                    <CheckCircle size={11} /> {rep.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    onClick={() => alert(`Report ${rep.id} download initiated.`)}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.6875rem' }}
                  >
                    <Download size={12} /> PDF
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
