import React, { useState, useRef } from 'react';
import { Play, Pause, CheckCircle2, AlertOctagon, Sparkles, AudioWaveform, Loader2 } from 'lucide-react';

export default function DemoClipPicker({ onSelectClip, isLoading, selectedClipId }) {
  const [playingId, setPlayingId] = useState(null);
  const [audioElements, setAudioElements] = useState({});
  const [loadingClipId, setLoadingClipId] = useState(null);
  const inFlightRef = useRef(false);

  const realClips = [
    {
      id: 'real_1',
      filename: 'real_1.wav',
      type: 'real',
      label: 'Real Voice 1',
      duration: '13.8s',
      description: 'Natural human speech with healthy pitch variation and respiratory pauses.'
    },
    {
      id: 'real_2',
      filename: 'real_2.wav',
      type: 'real',
      label: 'Real Voice 2',
      duration: '12.0s',
      description: 'Dynamic conversational cadence with natural acoustic harmonic decay.'
    },
    {
      id: 'real_3',
      filename: 'real_3.wav',
      type: 'real',
      label: 'Real Voice 3',
      duration: '6.6s',
      description: 'Standard spoken phrase recorded in an uncompressed room environment.'
    }
  ];

  const aiClips = [
    {
      id: 'fake_1',
      filename: 'fake_1.wav',
      type: 'fake',
      label: 'AI Voice 1',
      duration: '7.4s',
      description: 'Neural voice clone generated from a cloned speaker foundation model.'
    },
    {
      id: 'fake_2',
      filename: 'fake_2.wav',
      type: 'fake',
      label: 'AI Voice 2',
      duration: '8.7s',
      description: 'Synthesized voice displaying unnaturally uniform pitch & phase continuity.'
    },
    {
      id: 'fake_3',
      filename: 'fake_3.wav',
      type: 'fake',
      label: 'AI Voice 3',
      duration: '2.4s',
      description: 'Short synthetic phrase exhibiting typical vocoder spectral flatness.'
    }
  ];

  const getAudioUrl = (filename) => {
    return `/demo_clips/${filename}`;
  };

  const togglePlay = (clip, e) => {
    e.stopPropagation();

    if (playingId && playingId !== clip.id && audioElements[playingId]) {
      audioElements[playingId].pause();
      audioElements[playingId].currentTime = 0;
    }

    let audio = audioElements[clip.id];
    if (!audio) {
      audio = new Audio(getAudioUrl(clip.filename));
      audio.onended = () => setPlayingId(null);
      setAudioElements((prev) => ({ ...prev, [clip.id]: audio }));
    }

    if (playingId === clip.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.play().catch((err) => {
        console.warn('Audio playback error (trying fallback):', err);
        const fallbackAudio = new Audio(`http://localhost:8000/demo_clips/${clip.filename}`);
        fallbackAudio.onended = () => setPlayingId(null);
        fallbackAudio.play().catch(console.error);
        setAudioElements((prev) => ({ ...prev, [clip.id]: fallbackAudio }));
      });
      setPlayingId(clip.id);
    }
  };

  const handleTest = async (clip) => {
    if (isLoading || inFlightRef.current) return;
    inFlightRef.current = true;
    setLoadingClipId(clip.id);

    try {
      let res;
      try {
        res = await fetch(getAudioUrl(clip.filename));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        res = await fetch(`http://localhost:8000/demo_clips/${clip.filename}`);
      }

      const blob = await res.blob();
      const file = new File([blob], clip.filename, { type: 'audio/wav' });

      await onSelectClip(file, clip);
    } catch (err) {
      console.error('Failed to load demo clip for analysis:', err);
    } finally {
      inFlightRef.current = false;
      setLoadingClipId(null);
    }
  };

  const renderClipCard = (clip) => {
    const isReal = clip.type === 'real';
    const isSelected = selectedClipId === clip.id;
    const isAnalyzingThis = isLoading && loadingClipId === clip.id;
    const isAudioPlaying = playingId === clip.id;

    return (
      <div
        key={clip.id}
        className="vg-card-interactive"
        onClick={() => handleTest(clip)}
        style={{
          backgroundColor: isSelected
            ? (isReal ? 'var(--authentic-green-bg)' : 'var(--ai-red-bg)')
            : '#FFFFFF',
          borderColor: isSelected
            ? (isReal ? 'var(--authentic-green)' : 'var(--ai-red)')
            : 'var(--border-subtle)',
          boxShadow: isSelected
            ? (isReal ? '0 0 0 1px var(--authentic-green)' : '0 0 0 1px var(--ai-red)')
            : 'var(--shadow-sm)'
        }}
      >
        {/* Card Header: Title + Duration + Preview Play Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: '700', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {clip.label}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-subtle)', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              {clip.duration}
            </span>
          </div>

          <button
            onClick={(e) => togglePlay(clip, e)}
            style={{
              backgroundColor: isAudioPlaying
                ? (isReal ? 'var(--authentic-green)' : 'var(--ai-red)')
                : 'var(--bg-surface-subtle)',
              color: isAudioPlaying ? '#FFFFFF' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            title={isAudioPlaying ? 'Pause preview' : 'Play audio preview'}
          >
            {isAudioPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: '1px' }} />}
          </button>
        </div>

        {/* Description */}
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '12px' }}>
          {clip.description}
        </p>

        {/* Analyze Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTest(clip);
          }}
          disabled={isLoading}
          style={{
            backgroundColor: isSelected
              ? (isReal ? 'var(--authentic-green)' : 'var(--ai-red)')
              : 'var(--bg-surface-subtle)',
            color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
            border: isSelected
              ? '1px solid transparent'
              : '1px solid var(--border-subtle)',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            transition: 'all 0.15s ease'
          }}
        >
          {isAnalyzingThis ? (
            <>
              <Loader2 size={13} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing audio...
            </>
          ) : isSelected ? (
            <>
              <CheckCircle2 size={13} />
              Active in Inspector
            </>
          ) : (
            <>
              <AudioWaveform size={13} />
              Inspect Clip
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div id="demo-clips-section" className="vg-card" style={{ width: '100%', marginTop: '32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Reference Benchmark Clips
            </h3>
            <span className="badge-neutral">6 Audio Samples</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Click any reference clip below to inspect with the dual-engine pipeline, or preview audio playback.
          </p>
        </div>
      </div>

      {/* Two Column Layout: Real vs AI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Column 1: Authentic Human Voices */}
        <div
          style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderTop: '3px solid var(--authentic-green)',
            borderRadius: '12px',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="badge-authentic">
              <CheckCircle2 size={13} />
              AUTHENTIC HUMAN SAMPLES
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Ground truth: Real</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {realClips.map(renderClipCard)}
          </div>
        </div>

        {/* Column 2: AI Voice Clones */}
        <div
          style={{
            backgroundColor: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderTop: '3px solid var(--ai-red)',
            borderRadius: '12px',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="badge-synthetic">
              <AlertOctagon size={13} />
              AI-GENERATED VOICE SAMPLES
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Ground truth: Synthetic</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {aiClips.map(renderClipCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
