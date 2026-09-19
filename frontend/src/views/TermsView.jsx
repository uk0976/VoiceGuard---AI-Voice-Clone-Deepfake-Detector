import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  AlertTriangle, 
  Scale, 
  HelpCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function TermsView({ onNavigate }) {
  return (
    <div>
      {/* View Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Terms & Conditions
          </h1>
          <span className="badge-status badge-neutral" style={{ fontSize: '0.6875rem' }}>
            Legal & Compliance
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Standard conditions of service, ethical forensic usage policies, biometric data processing, and liability boundaries.
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span>Effective Date: September 20, 2026</span>
          <span>•</span>
          <span>Version: 2.4.1</span>
          <span>•</span>
          <span>Jurisdiction: Global / ISO 27001 Aligned</span>
        </div>
      </div>

      {/* Key Guarantees Summary Card */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '28px'
        }}
      >
        <div className="vg-panel" style={{ padding: '16px', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Lock size={16} color="var(--color-human)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--color-human)' }}>
              Strict Zero Retention
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            Voice recordings are analyzed ephemerally in RAM and immediately erased. Voiceprints are never harvested, saved, or sold.
          </p>
        </div>

        <div className="vg-panel" style={{ padding: '16px', backgroundColor: 'rgba(34, 167, 214, 0.05)', borderColor: 'rgba(34, 167, 214, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <FileText size={16} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--accent-cyan)' }}>
              100% User Report Ownership
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            You retain exclusive intellectual property and legal ownership of all generated forensic analysis outputs and PDF records.
          </p>
        </div>

        <div className="vg-panel" style={{ padding: '16px', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Scale size={16} color="#F59E0B" />
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#F59E0B' }}>
              Probabilistic Assessment
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            Analysis constitutes scientific forensic evidence with calibrated confidence metrics, intended to support expert human judgment.
          </p>
        </div>
      </div>

      {/* Main Terms Document Body */}
      <div className="vg-panel" style={{ padding: '28px 32px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Section 1 */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              1. Acceptance of Terms & Forensic Purpose
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              By accessing or using the VoiceGuard platform, APIs, WebSocket streams, or generated forensic reports, you agree to be bound by these Terms & Conditions. VoiceGuard is designed as a specialized cybersecurity, fraud prevention, and digital media forensic analysis platform to determine the authenticity of recorded speech and detect artificial voice synthesis. If you do not agree with these terms, do not access or use the platform.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Section 2 */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              2. Permitted Use & Ethical Voice Analysis
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              VoiceGuard is authorized for use in the following legitimate operational scenarios:
            </p>
            <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
              <li><strong>Fraud Prevention & KYC Verification:</strong> Verifying caller identity and detecting synthesized deepfake impersonation in banking, customer service, or executive communications.</li>
              <li><strong>Forensic Audio Analysis:</strong> Examining contested audio evidence for signs of artificial neural generation in legal, security, or journalistic investigations.</li>
              <li><strong>Personal Defense:</strong> Testing suspicious phone calls, voicemails, or voice messages suspected of being voice clone extortion or impersonation scams.</li>
              <li><strong>Security Research:</strong> Evaluating acoustic defensive boundaries and benchmarking deepfake detection robustness.</li>
            </ul>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Section 3 */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              3. Processing of Audio & Zero-Retention Biometric Privacy Policy
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '10px' }}>
              VoiceGuard operates under an uncompromising privacy-by-design architecture:
            </p>
            <div style={{ backgroundColor: 'var(--surface-secondary)', borderRadius: 'var(--radius-sm)', padding: '14px 16px', fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>Zero Audio Retention:</strong> Audio submitted through file uploads or streamed live via WebSockets is decoded into temporary memory buffers solely for the duration of inference. The raw audio is instantly overwritten in RAM once extraction finishes.
              </p>
              <p style={{ margin: '0 0 8px 0' }}>
                <strong>No Biometric Voiceprints:</strong> VoiceGuard does not construct speaker identification profiles, voice biometrics, or pitch fingerprints intended to identify specific individuals. The system inspects solely for mathematical markers of machine synthesis.
              </p>
              <p style={{ margin: 0 }}>
                <strong>Local Persistence:</strong> Analysis history and PDF reports are stored purely in your local browser's storage (<code className="mono">localStorage</code>). No historical logs are collected on our central servers.
              </p>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Section 4 */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              4. Probabilistic Inference & Model Disclaimers
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 10px 0' }}>
              VoiceGuard leverages state-of-the-art deep sequence classifiers (fine-tuned Wav2Vec2 architectures) fused with digital signal-processing heuristics (pitch jitter, spectral flatness, respiration cadence). However:
            </p>
            <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
              <li><strong>Probabilistic Nature:</strong> Classification outputs (e.g. 96.8% confidence) are statistical likelihood assessments calibrated to acoustic signal properties. They do not constitute an absolute ontological proof of origin.</li>
              <li><strong>Acoustic Degradation:</strong> Extreme background noise, heavy lossy compression, acoustic clipping, or severe telephone band-limiting may affect confidence metrics.</li>
              <li><strong>Decision Support:</strong> VoiceGuard outputs are intended as decision-support telemetry. Users should combine VoiceGuard findings with multi-factor authentication and human contextual review for high-stakes decisions.</li>
            </ul>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Section 5 */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              5. Ownership of Analysis Artifacts & Reports
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              You own all rights, title, and interest in and to the forensic PDF reports, analytical logs, and export artifacts generated through your use of VoiceGuard. You are entitled to publish, present, or submit these reports for judicial, regulatory, corporate, or private compliance purposes without licensing fees to VoiceGuard.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Section 6 */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              6. Prohibited Activities
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '8px' }}>
              Users are strictly prohibited from:
            </p>
            <ul style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '20px', margin: 0 }}>
              <li>Using the service to train adversarial generative algorithms aimed at evading synthetic voice detection.</li>
              <li>Attempting to decompile, reverse-engineer, or extract proprietary neural network model weights from the server infrastructure.</li>
              <li>Conducting automated denial-of-service or high-volume load spikes against public API instances without prior authorization.</li>
            </ul>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Section 7 */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              7. Limitation of Liability
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              To the maximum extent permitted by applicable law, VoiceGuard and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from unauthorized fraud, financial loss, or social engineering attacks executed against users, nor for operational reliance placed on probabilistic classification verdicts.
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Section 8 */}
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              8. Contact & Security Inquiries
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              For enterprise security reviews, on-premise air-gapped deployments, or regulatory compliance disclosures, contact the VoiceGuard Security Governance Team at <code className="mono" style={{ color: 'var(--accent-cyan)' }}>security@voiceguard.internal</code> or consult our official documentation.
            </p>
          </div>

        </div>
      </div>

      {/* Navigation Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <button
          onClick={() => onNavigate('faq')}
          className="btn-secondary"
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <HelpCircle size={13} />
          View FAQ & Knowledge Base
        </button>

        <button
          onClick={() => onNavigate('overview')}
          className="btn-primary"
          style={{ fontSize: '0.75rem' }}
        >
          Return to Workstation Dashboard
        </button>
      </div>
    </div>
  );
}
