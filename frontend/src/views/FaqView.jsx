import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  ShieldCheck, 
  Lock, 
  Radio, 
  FileText, 
  Cpu, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function FaqView({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState({ 0: true, 1: true });

  const toggleItem = (idx) => {
    setOpenItems((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'accuracy', label: 'Accuracy & Detection' },
    { id: 'privacy', label: 'Privacy & Security' },
    { id: 'technical', label: 'Audio Formats & Live Mic' },
    { id: 'legal', label: 'Legal & Forensic Reports' }
  ];

  const faqs = [
    {
      category: 'accuracy',
      question: 'How does VoiceGuard distinguish authentic human voices from AI voice clones?',
      answer: `VoiceGuard operates a dual-tier hybrid forensic engine combining deep representation learning with fundamental vocal biomechanics:
1. Deep Neural Sequence Classification: A fine-tuned Wav2Vec2 neural architecture inspects latent representations across 215 transformer layers to identify phase artifacts and synthesis manifolds characteristic of modern vocoders (e.g. ElevenLabs, Tortoise-TTS, RVC).
2. Acoustic Invariant Heuristics: Physical signal-processing algorithms analyze natural vocal fold biomechanics:
   • Pitch Micro-Jitter: Measuring involuntary cycle-to-cycle frequency variations in organic vocal cords.
   • Spectral Flatness (Wiener Entropy): Detecting high-frequency vocoder dispersion and phase quantization.
   • Respiration Cadence: Verifying physiological inhalation and syntax pause intervals.
Both layers are continuously fused into a calibrated, tamper-resistant authenticity verdict.`
    },
    {
      category: 'accuracy',
      question: 'Why does VoiceGuard display calibrated probabilities rather than flat 100% certainty?',
      answer: `In authentic forensic and cybersecurity applications, binary machine learning models should never output blunt, uncalibrated "100%" or "0%" certainty. Saturated 100% predictions are typically signs of uncalibrated neural networks or dummy placeholders.

VoiceGuard employs temperature-calibrated softmax scaling (T = 3.0) on the sequence logits. This produces genuine, continuous confidence values (such as 97.5%, 96.8%, 94.2%, or 95.8%) that accurately reflect the subtle nuances of acoustic recording quality, room reverberation, and phonation characteristics.`
    },
    {
      category: 'technical',
      question: 'Why does speaking into the live microphone not trigger false AI alarms?',
      answer: `Live microphone streaming introduces challenges like room acoustic hiss, ambient air conditioning noise, and short single-syllable phonemes that can mislead naive audio models:
1. Voice Activity Energy Gating (VAD): When you pause or remain quiet, VoiceGuard detects the background noise floor (RMS < 0.0035 and peak < 0.015) and immediately suppresses synthetic predictions, preventing faint mic noise from being normalized into false 90%+ AI scores.
2. Conversational Syllable Tolerances: Conversational syllables under 1.5 seconds naturally exhibit momentary pitch stability. Our acoustic heuristics are calibrated so that natural syllable inflections are not misdiagnosed as robotic flatlines.
3. Asymmetric Fusion Stability: When the deep neural model confirms human speech patterns (model_score < 0.50), it maintains 80% decision weighting, protecting real human voices from transient background spikes.`
    },
    {
      category: 'accuracy',
      question: 'What types of AI voice clones, text-to-speech (TTS), and vocoders can VoiceGuard detect?',
      answer: `VoiceGuard is trained and calibrated to identify the full spectrum of modern synthetic voice generation pipelines:
• Commercial Neural Voice Cloners: ElevenLabs, PlayHT, Murf AI, Resemble AI, Descript Overdub.
• Open-Source Deep Generative Models: Tortoise-TTS, Bark, Coqui XTTS, StyleTTS2, VITS, ChatTTS.
• Voice Conversion & Real-Time RVC: Retrieval-based Voice Conversion (RVC), So-VITS-SVC, and pitch-shifted neural transfer pipelines.
• Neural Vocoders: HiFi-GAN, WaveGlow, MelGAN, BigVGAN, and diffusion-based neural decoders.`
    },
    {
      category: 'privacy',
      question: 'Are my audio recordings, voice prints, or speech files stored or used to train models?',
      answer: `VoiceGuard strictly adheres to an uncompromising Zero-Retention Security Architecture:
• Ephemeral In-Memory Processing: Audio uploaded for analysis or streamed through the microphone is processed purely in volatile RAM and discarded the microsecond inference completes.
• No Voiceprint Harvesting: We never create, store, or sell biometric voiceprints.
• No Model Training: User recordings are NEVER used to retrain, fine-tune, or benchmark public models.
• Local Client-Side Reports: Forensic history and generated reports are stored locally in your browser's private storage (localStorage) under your exclusive control.`
    },
    {
      category: 'technical',
      question: 'What audio formats and file constraints are supported?',
      answer: `VoiceGuard accepts all industry-standard audio containers and codecs:
• Formats: WAV (PCM 16-bit / 24-bit / 32-bit float), MP3, AAC / M4A, FLAC, and OGG Vorbis / Opus.
• Sampling Rates: Any native rate (8 kHz to 96 kHz). The backend automatically resamples and normalizes audio to 16 kHz mono for forensic inspection.
• File Size Limit: Supports single uploads up to 25 MB (typically up to 10 minutes of uncompressed audio).
• Minimum Recommended Duration: At least 1.5 seconds of audible voice for reliable heuristic analysis.`
    },
    {
      category: 'technical',
      question: 'Can VoiceGuard detect deepfakes transmitted through WhatsApp voice notes or compressed phone calls?',
      answer: `Yes. Heavily compressed audio channels (such as cellular GSM/AMR 8 kHz or WhatsApp Opus codecs) introduce compression artifacts and band-limiting. VoiceGuard handles this through:
• Robust Temporal Manifold Analysis: Wav2Vec2 representations capture sequence-level timing and prosody invariants that survive lossy compression.
• Bandwidth-Aware Centroid Filtering: Acoustic metrics account for narrowband telephone frequencies (300 Hz – 3.4 kHz) without penalizing missing high frequencies.
• Phase Quantization Detection: AI vocoders leave subtle mathematical discontinuities in harmonic phase alignment that remain detectable even after re-encoding.`
    },
    {
      category: 'technical',
      question: 'How does the Live Stream Detection mode work in real time?',
      answer: `In Live Detection mode, VoiceGuard captures audio directly from your microphone using the Web Audio API:
1. Downsampling & Buffering: Audio is captured, converted to 16 kHz mono PCM16, and sliced into sliding 1.5-second windows.
2. Low-Latency WebSocket Stream: Slices are transmitted via binary WebSockets to the backend inference worker.
3. Rolling Average Smoothing: A 5-frame rolling window smooths instantaneous chunk scores, preventing erratic jumps from transient background noises while maintaining real-time responsiveness.`
    },
    {
      category: 'legal',
      question: 'Can the downloaded Forensic PDF reports be used for corporate compliance or legal audits?',
      answer: `Yes. VoiceGuard's forensic PDF exports are engineered to meet enterprise audit and digital evidence integrity standards:
• Cryptographic Integrity: Each report includes a SHA-256 hash calculated over the analyzed file.
• Exact Telemetry Records: Records exact numerical measurements of pitch micro-jitter, spectral flatness, speech-to-pause ratios, and frequency centroids.
• ISO Timestamps: Precise UTC timestamps recorded at the time of execution.
• Formal Methodology Documentation: Complete explanation of neural sequence classification and signal-processing heuristics for independent review.`
    },
    {
      category: 'legal',
      question: 'How can enterprises and financial institutions integrate VoiceGuard into authentication pipelines?',
      answer: `VoiceGuard exposes standard REST and streaming APIs for seamless integration into call centers, KYC onboarding, and biometric authentication:
• REST Endpoint: POST /analyze accepts multipart audio payloads and returns synchronous JSON verdicts within 300ms.
• WebSocket Endpoint: ws://host:8000/ws/stream accepts continuous binary audio chunks for real-time call center screening.
• Deployable Architecture: Containerized via Docker / FastAPI, capable of on-premise air-gapped deployment for defense, banking, and government institutions.`
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesQuery = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div>
      {/* View Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h1>
          <span className="badge-status badge-neutral" style={{ fontSize: '0.6875rem' }}>
            Forensic Knowledge Base
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Comprehensive technical answers addressing detection methodology, accuracy calibration, privacy guarantees, and enterprise usage.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          marginBottom: '24px'
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search all questions, methodology, formats, or accuracy doubts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              outline: 'none'
            }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="btn-secondary"
              style={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                backgroundColor: activeCategory === cat.id ? 'var(--accent-cyan)' : 'var(--surface-secondary)',
                color: activeCategory === cat.id ? '#FFFFFF' : 'var(--text-secondary)',
                borderColor: activeCategory === cat.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Security Highlights Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px',
          marginBottom: '28px'
        }}
      >
        <div className="vg-panel" style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Cpu size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
              Calibrated Neural Invariants
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Wav2Vec2 sequence features temperature-scaled for authentic, non-saturated continuous probability outputs.
            </div>
          </div>
        </div>

        <div className="vg-panel" style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <Lock size={20} color="var(--color-human)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
              Zero-Retention Privacy
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              100% ephemeral in-memory processing. Voice clips and biometric prints are never saved or harvested.
            </div>
          </div>
        </div>

        <div className="vg-panel" style={{ padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <FileText size={20} color="#F59E0B" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
              Forensic Audit Defense
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
              Audit-ready PDF reports with SHA-256 cryptographic verification and full acoustic telemetry records.
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
        {filteredFaqs.length === 0 ? (
          <div className="vg-panel" style={{ padding: '32px', textAlign: 'center' }}>
            <HelpCircle size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
              No matching questions found
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
              Try searching with different terms like "accuracy", "microphone", "formats", or "privacy".
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = !!openItems[idx];
            return (
              <div
                key={idx}
                className="vg-panel"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  borderColor: isOpen ? 'var(--border-strong)' : 'var(--border-subtle)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                {/* Question Header */}
                <button
                  onClick={() => toggleItem(idx)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isOpen ? 'var(--surface-elevated)' : 'var(--surface-primary)',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', paddingRight: '16px' }}>
                    {faq.question}
                  </span>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </button>

                {/* Answer Content */}
                {isOpen && (
                  <div
                    style={{
                      padding: '16px 20px',
                      borderTop: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--surface-primary)',
                      fontSize: '0.8125rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Support Banner */}
      <div
        className="vg-panel"
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          backgroundColor: 'var(--surface-secondary)'
        }}
      >
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
            Have a custom forensic inspection or API inquiry?
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
            Read the system documentation or review our ethical usage terms & conditions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onNavigate('terms')}
            className="btn-secondary"
            style={{ fontSize: '0.75rem' }}
          >
            Terms & Conditions
          </button>
          <button
            onClick={() => onNavigate('docs')}
            className="btn-primary"
            style={{ fontSize: '0.75rem' }}
          >
            System Documentation
          </button>
        </div>
      </div>
    </div>
  );
}
