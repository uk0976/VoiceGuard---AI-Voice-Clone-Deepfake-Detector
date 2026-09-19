import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show splash for 1.8 seconds, then trigger fade-out transition
    const fadeTimer = setTimeout(() => {
      setFading(true);
    }, 1800);

    // Complete transition and unmount after fade-out finishes (500ms)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setFading(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#080B10',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fading ? 'none' : 'auto',
        userSelect: 'none',
        cursor: 'pointer'
      }}
    >
      {/* Background Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 167, 214, 0.12) 0%, rgba(8, 11, 16, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Brand Card Content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 1,
          animation: 'splashFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          padding: '0 20px'
        }}
      >
        {/* Logo Container with Subtle Glow */}
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            backgroundColor: 'rgba(13, 17, 23, 0.8)',
            border: '1px solid rgba(34, 167, 214, 0.3)',
            boxShadow: '0 0 35px rgba(34, 167, 214, 0.2), inset 0 0 15px rgba(34, 167, 214, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '22px',
            overflow: 'hidden',
            padding: '8px'
          }}
        >
          <img
            src="/logo.png"
            alt="VoiceGuard Logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Brand Name */}
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            letterSpacing: '-0.03em',
            color: '#F0F6FC',
            margin: '0 0 8px 0',
            lineHeight: 1.1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>Voice</span>
          <span style={{ color: '#22A7D6' }}>Guard</span>
        </h1>

        {/* Primary Tagline */}
        <div
          style={{
            fontSize: '0.9375rem',
            fontWeight: '600',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#22A7D6',
            marginBottom: '8px'
          }}
        >
          Real Voices. A Safer Tomorrow.
        </div>

        {/* Secondary Technical Tagline */}
        <div
          style={{
            fontSize: '0.8125rem',
            color: '#8B949E',
            maxWidth: '380px',
            lineHeight: 1.5,
            marginBottom: '28px'
          }}
        >
          AI Voice Clone & Deepfake Forensic Defense Platform
        </div>

        {/* Initializing Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#22A7D6',
              boxShadow: '0 0 8px #22A7D6',
              animation: 'splashPulse 1.2s ease-in-out infinite'
            }}
          />
          <span
            className="mono"
            style={{
              fontSize: '0.75rem',
              color: '#8B949E',
              letterSpacing: '0.02em'
            }}
          >
            Initializing Acoustic Forensic Pipeline...
          </span>
        </div>
      </div>

      <style>{`
        @keyframes splashFadeIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes splashPulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
