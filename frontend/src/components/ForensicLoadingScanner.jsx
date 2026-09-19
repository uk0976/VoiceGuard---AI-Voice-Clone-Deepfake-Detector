import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  CheckCircle2, 
  Loader2, 
  Radio, 
  Sparkles, 
  Clock, 
  ShieldAlert,
  Zap
} from 'lucide-react';

const FORENSIC_TIPS = [
  "Deepfake voice models often fail to replicate human vocal fold micro-tremors and natural pitch drift.",
  "Wav2Vec2 transformer analyzes contextual latent representations across 512-dimensional embedding frames.",
  "Neural vocoders (e.g. HiFi-GAN) frequently produce characteristic phase discontinuities above 7.5 kHz.",
  "Spectral flatness and harmonic-to-noise ratio reveal subtle synthetic reconstruction signatures.",
  "Cloud instances spin up in ~15-25 seconds on cold boot — thank you for your patience while neural weights initialize!"
];

const PIPELINE_STAGES = [
  { id: 1, label: "Audio Ingestion & 16kHz Resampling", desc: "Standardizing channel depth & sinc downsampling" },
  { id: 2, label: "Acoustic Jitter & Spectral Analysis", desc: "Extracting F0 pitch contour, centroid & energy roll-off" },
  { id: 3, label: "Wav2Vec2 Deep Neural Inference", desc: "Evaluating multi-head attention over latent audio frames" },
  { id: 4, label: "Decision Fusion & Heuristic Checks", desc: "Cross-validating artifact scores with confidence bounds" }
];

export default function ForensicLoadingScanner({ filename = "audio_clip.wav" }) {
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(8);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Timer & progress simulation
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(seconds);

      // Smooth realistic progress curve that slows down near 95%
      setProgress((prev) => {
        if (seconds < 2) return Math.min(28, prev + 3);
        if (seconds < 5) return Math.min(58, prev + 2);
        if (seconds < 10) return Math.min(82, prev + 1.2);
        if (seconds < 20) return Math.min(94, prev + 0.5);
        return Math.min(98, prev + 0.1);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Tip rotation
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % FORENSIC_TIPS.length);
    }, 4000);

    return () => clearInterval(tipInterval);
  }, []);

  // Determine current active pipeline stage based on progress
  const getStageStatus = (stageId) => {
    if (stageId === 1) return progress >= 30 ? 'completed' : 'active';
    if (stageId === 2) return progress >= 60 ? 'completed' : progress >= 30 ? 'active' : 'pending';
    if (stageId === 3) return progress >= 85 ? 'completed' : progress >= 60 ? 'active' : 'pending';
    if (stageId === 4) return progress >= 95 ? 'completed' : progress >= 85 ? 'active' : 'pending';
    return 'pending';
  };

  const formatElapsed = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="vg-panel" 
      style={{
        padding: '28px 24px',
        marginBottom: '24px',
        border: '1px solid var(--accent-cyan)',
        boxShadow: '0 0 25px rgba(34, 167, 214, 0.15)',
        background: 'linear-gradient(180deg, rgba(13, 17, 23, 0.95) 0%, rgba(8, 11, 16, 0.98) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background ambient sweep glow */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, var(--accent-cyan), #38BDF8, transparent)',
          animation: 'shimmerSweep 2s ease-in-out infinite'
        }}
      />

      {/* Header bar: Title, timer & percentage */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: 'rgba(34, 167, 214, 0.12)',
              border: '1px solid rgba(34, 167, 214, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}
          >
            <Cpu size={20} style={{ animation: 'spin 4s linear infinite' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                Forensic Neural Pipeline Running
              </span>
              <span 
                className="mono" 
                style={{
                  fontSize: '0.6875rem',
                  padding: '2px 7px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(34, 167, 214, 0.15)',
                  color: 'var(--accent-cyan)',
                  border: '1px solid rgba(34, 167, 214, 0.3)',
                  fontWeight: '600'
                }}
              >
                LIVE SCAN
              </span>
            </div>
            <div style={{ fontSize: '0.78125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Analyzing signal: <strong style={{ color: 'var(--text-primary)' }}>{filename}</strong>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Elapsed Time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <Clock size={15} color="var(--text-secondary)" />
            <span className="mono" style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
              {formatElapsed(elapsed)}
            </span>
          </div>

          {/* Numerical percentage badge */}
          <div 
            className="mono" 
            style={{
              fontSize: '1.125rem',
              fontWeight: '700',
              color: 'var(--accent-cyan)',
              minWidth: '54px',
              textAlign: 'right'
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      </div>

      {/* High-tech Animated Progress Bar */}
      <div 
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)',
          position: 'relative'
        }}
      >
        <div 
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #0284C7 0%, #22A7D6 50%, #38BDF8 100%)',
            borderRadius: '6px',
            transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            boxShadow: '0 0 12px rgba(34, 167, 214, 0.6)'
          }}
        >
          {/* Shimmer light pass */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmerSweep 1.5s infinite linear'
            }}
          />
        </div>
      </div>

      {/* Real-time Simulated Equalizer Visualizer Spectrum */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          gap: '4px',
          height: '42px',
          padding: '4px 12px',
          backgroundColor: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '20px'
        }}
      >
        {[...Array(32)].map((_, i) => {
          // Staggered equalizer bar heights with CSS keyframes
          const delay = ((i * 0.07) % 1.2).toFixed(2);
          const duration = (0.6 + ((i * 13) % 7) * 0.1).toFixed(2);
          return (
            <div
              key={i}
              style={{
                flex: 1,
                maxWidth: '6px',
                backgroundColor: i % 2 === 0 ? 'var(--accent-cyan)' : '#38BDF8',
                opacity: 0.85,
                borderRadius: '2px',
                animation: `equalizerWave ${duration}s ease-in-out ${delay}s infinite alternate`,
                minHeight: '4px'
              }}
            />
          );
        })}
      </div>

      {/* 4-Stage Pipeline Progress Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {PIPELINE_STAGES.map((stage) => {
          const status = getStageStatus(stage.id);
          const isDone = status === 'completed';
          const isActive = status === 'active';

          return (
            <div
              key={stage.id}
              style={{
                backgroundColor: isActive 
                  ? 'rgba(34, 167, 214, 0.08)' 
                  : isDone 
                  ? 'rgba(34, 197, 94, 0.05)' 
                  : 'var(--surface-secondary)',
                border: `1px solid ${
                  isActive 
                    ? 'rgba(34, 167, 214, 0.5)' 
                    : isDone 
                    ? 'rgba(34, 197, 94, 0.3)' 
                    : 'var(--border-subtle)'
                }`,
                borderRadius: '8px',
                padding: '12px',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {isDone ? (
                  <CheckCircle2 size={16} color="var(--color-human)" style={{ flexShrink: 0 }} />
                ) : isActive ? (
                  <Loader2 size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                ) : (
                  <div 
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      border: '1.5px solid var(--border-strong)',
                      flexShrink: 0
                    }} 
                  />
                )}
                <div 
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    color: isActive ? 'var(--accent-cyan)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  Stage 0{stage.id}
                </div>
              </div>
              <div 
                style={{
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: isActive || isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                  marginBottom: '2px',
                  lineHeight: '1.3'
                }}
              >
                {stage.label}
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                {stage.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Rotating Forensic Insights & Server Notice */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          padding: '12px 14px',
          backgroundColor: 'rgba(34, 167, 214, 0.05)',
          border: '1px dashed rgba(34, 167, 214, 0.3)',
          borderRadius: '6px'
        }}
      >
        <Sparkles size={16} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.6875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-cyan)', fontWeight: '700', marginBottom: '2px' }}>
            Acoustic Forensics Radar Insight
          </div>
          <div 
            style={{
              fontSize: '0.78125rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.4',
              transition: 'opacity 0.3s ease'
            }}
          >
            {FORENSIC_TIPS[currentTipIndex]}
          </div>
        </div>
      </div>
    </div>
  );
}
