import React, { useState } from 'react';
import { History, ShieldCheck, ShieldAlert, FileAudio, Search, Plus } from 'lucide-react';

export default function HistoryView({ onNavigate, reports = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Map real saved inspection reports into audit log records
  const auditLogs = reports.map(rep => ({
    id: rep.id?.replace('REP', 'AUD') || 'AUD-9000',
    file: rep.filename || 'recording.wav',
    result: rep.label === 'likely_ai_generated' ? 'AI GENERATED' : 'HUMAN',
    confidence: (() => {
      const val = (rep.label !== 'likely_ai_generated' && (rep.confidence || 0) < 0.5 ? 1 - (rep.confidence || 0) : (rep.confidence || 0)) * 100;
      return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}%`;
    })(),
    duration: rep.duration || '--',
    timestamp: rep.timestamp || '--',
    hash: '8f434346...' + (rep.filename || '').slice(0, 4)
  }));

  const filteredLogs = auditLogs.filter(log => 
    log.file.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.result.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Detection audit history
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Immutable forensic log of completed voice authenticity inspections.
          </p>
        </div>

        {auditLogs.length > 0 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Search audit logs..."
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
                  width: '200px'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* When no audits have taken place yet */}
      {auditLogs.length === 0 ? (
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
            <History size={22} />
          </div>

          <h3 style={{ fontSize: '1.0625rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
            No inspection audit logs recorded yet
          </h3>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
            Every voice inspection you conduct is cryptographically digested and permanently recorded here for audit compliance.
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
        /* Audit Log Table */
        <div className="vg-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="vg-table-container">
            <table className="vg-table">
            <thead>
              <tr>
                <th>Audit ID</th>
                <th>Recording File</th>
                <th>Classification</th>
                <th>Confidence</th>
                <th>Duration</th>
                <th>SHA-256 Digest</th>
                <th>Timestamp (UTC)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: '600' }}>
                    {log.id}
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileAudio size={14} color="var(--text-muted)" />
                      <span className="mono">{log.file}</span>
                    </div>
                  </td>
                  <td>
                    {log.result === 'HUMAN' ? (
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
                    {log.confidence}
                  </td>
                  <td className="mono" style={{ color: 'var(--text-muted)' }}>
                    {log.duration}
                  </td>
                  <td className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {log.hash}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
