import React, { useState } from 'react';
import { History, ShieldCheck, ShieldAlert, FileAudio, Download, Search } from 'lucide-react';

export default function HistoryView({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');

  const auditLogs = [
    { id: 'AUD-9021', file: 'meeting_01.wav', result: 'HUMAN', confidence: '94.2%', duration: '18.4s', timestamp: '2026-09-20 00:32:10', hash: 'e3b0c442...98fc' },
    { id: 'AUD-9020', file: 'fraud_call.mp3', result: 'AI GENERATED', confidence: '91.7%', duration: '24.1s', timestamp: '2026-09-20 00:22:45', hash: '8f434346...12a0' },
    { id: 'AUD-9019', file: 'customer_voicemail.m4a', result: 'HUMAN', confidence: '96.5%', duration: '8.2s', timestamp: '2026-09-20 00:01:14', hash: '356a192b...a9b3' },
    { id: 'AUD-9018', file: 'support_ticket_841.wav', result: 'AI GENERATED', confidence: '88.3%', duration: '11.6s', timestamp: '2026-09-19 23:42:08', hash: 'da4b9237...4532' },
    { id: 'AUD-9017', file: 'executive_briefing.wav', result: 'HUMAN', confidence: '98.1%', duration: '31.2s', timestamp: '2026-09-19 21:15:33', hash: '77963b7a...8e41' },
    { id: 'AUD-9016', file: 'cloned_auth_prompt.wav', result: 'AI GENERATED', confidence: '93.4%', duration: '14.5s', timestamp: '2026-09-19 19:40:19', hash: 'b6589fc6...a209' },
    { id: 'AUD-9015', file: 'field_interview_04.ogg', result: 'HUMAN', confidence: '91.0%', duration: '45.0s', timestamp: '2026-09-19 18:22:01', hash: '356a192b...c38b' }
  ];

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
      </div>

      {/* Audit Log Table */}
      <div className="vg-panel" style={{ padding: 0, overflow: 'hidden' }}>
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
                <td className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {log.hash}
                </td>
                <td className="mono" style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  {log.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
