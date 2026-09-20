import React, { useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  Video, 
  Radio, 
  FileAudio, 
  Maximize2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles,
  Volume2
} from 'lucide-react';

export default function DemoVideoView({ onNavigate }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    } else if (videoRef.current.webkitRequestFullscreen) {
      videoRef.current.webkitRequestFullscreen();
    }
  };

  return (
    <div>
      {/* View Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            VoiceGuard Demo Video
          </h1>
          <span className="badge-status badge-human" style={{ fontSize: '0.6875rem' }}>
            <Sparkles size={11} /> 1080p Full HD
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Watch the official demonstration of VoiceGuard's real-time AI voice clone and deepfake detection engine.
        </p>
      </div>

      {/* Main Video Presentation Card */}
      <div
        className="vg-panel"
        style={{
          padding: '16px',
          marginBottom: '24px',
          backgroundColor: 'var(--surface-primary)',
          border: '1px solid rgba(34, 167, 214, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px rgba(34, 167, 214, 0.08)',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden'
        }}
      >
        {/* Video Player Container */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            backgroundColor: '#05070A',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            aspectRatio: '16 / 9',
            maxHeight: '72vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <video
            ref={videoRef}
            src="/demo_video.mp4"
            controls
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              display: 'block'
            }}
          >
            Your browser does not support HTML5 video streaming. Please update your browser to view the VoiceGuard demo clip.
          </video>
        </div>

        {/* Video Player Info Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 167, 214, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)'
              }}
            >
              <Video size={16} />
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                VoiceGuard Walkthrough & Feature Demo
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Duration: 3m 20s · High Definition H.264 · Audio & Live Mic Demonstration
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleFullscreen}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
              title="Expand to Fullscreen"
            >
              <Maximize2 size={13} /> Fullscreen
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('live')}
                className="btn-primary"
                style={{ fontSize: '0.75rem', padding: '6px 14px' }}
              >
                <Radio size={13} /> Try Live Mic Detection
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Key Demonstrations Overview Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '28px'
        }}
      >
        <div className="vg-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <ShieldCheck size={16} color="var(--color-human)" />
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Real-Time Streaming Analysis
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Demonstrates real-time microphone capture, 16 kHz downsampling via Web Audio API, and sliding 1.0s window evaluations over WebSocket.
          </p>
        </div>

        <div className="vg-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Dual-Layer Detection Engine
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Visualizes pitch micro-jitter tracking, Wiener spectral entropy, and neural sequence classification detecting vocoder dispersion.
          </p>
        </div>

        <div className="vg-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FileAudio size={16} color="var(--color-ai)" />
            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              Certified Forensic Export
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            Shows file inspection and client-side compilation of certified forensic PDF reports with cryptographic SHA-256 seals.
          </p>
        </div>
      </div>
    </div>
  );
}
