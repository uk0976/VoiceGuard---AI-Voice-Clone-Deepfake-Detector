import React, { useState } from 'react';
import { Play, Pause, CheckCircle2, AlertOctagon, Sparkles, AudioWaveform, Loader2 } from 'lucide-react';

export default function DemoClipPicker({ onSelectClip, isLoading, selectedClipId }) {
  const [playingId, setPlayingId] = useState(null);
  const [audioElements, setAudioElements] = useState({});
  const [loadingClipId, setLoadingClipId] = useState(null);

  const realClips = [
    {
      id: 'real_1',
      filename: 'real_1.wav',
      type: 'real',
      label: 'Real Voice 1',
      duration: '13.8s',
      description: 'Conversational speech with biological pitch fluctuation and natural breath pauses.'
    },
    {
      id: 'real_2',
      filename: 'real_2.wav',
      type: 'real',
      label: 'Real Voice 2',
      duration: '12.0s',
      description: 'Authentic expressive cadence with variable harmonic formant decay.'
    },
    {
      id: 'real_3',
      filename: 'real_3.wav',
      type: 'real',
      label: 'Real Voice 3',
      duration: '6.6s',
      description: 'Short natural human utterance recorded under standard acoustic conditions.'
    }
  ];

  const aiClips = [
    {
      id: 'fake_1',
      filename: 'fake_1.wav',
      type: 'fake',
      label: 'AI Voice 1',
      duration: '7.4s',
      description: 'High-fidelity AI voice clone generated from paired human voice script.'
    },
    {
      id: 'fake_2',
      filename: 'fake_2.wav',
      type: 'fake',
      label: 'AI Voice 2',
      duration: '8.7s',
      description: 'Synthesized voice displaying unnaturally uniform pitch trajectories.'
    },
    {
      id: 'fake_3',
      filename: 'fake_3.wav',
      type: 'fake',
      label: 'AI Voice 3',
      duration: '2.4s',
      description: 'Short synthetic sample generated with high vocoder phase stability.'
    }
  ];

  const getAudioUrl = (filename) => {
    // Relative URL works through Vite dev proxy (/demo_clips -> http://localhost:8000/demo_clips)
    return `/demo_clips/${filename}`;
  };

  const togglePlay = (clip, e) => {
    e.stopPropagation();

    // Pause current if another is playing
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
    if (isLoading) return;
    setLoadingClipId(clip.id);

    try {
      // 1. Fetch audio blob from server
      let res;
      try {
        res = await fetch(getAudioUrl(clip.filename));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        res = await fetch(`http://localhost:8000/demo_clips/${clip.filename}`);
      }

      const blob = await res.blob();
      const file = new File([blob], clip.filename, { type: 'audio/wav' });

      // 2. Dispatch through exact same /analyze flow as manual upload
      await onSelectClip(file, clip);
    } catch (err) {
      console.error('Failed to load demo clip for analysis:', err);
    } finally {
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
        onClick={() => handleTest(clip)}
        style={{
          backgroundColor: isSelected
            ? (isReal ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)')
            : '#131d33',
          border: isSelected
            ? (isReal ? '1px solid #10b981' : '1px solid #ef4444')
            : '1px solid #1e293b',
          borderRadius: '10px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: isSelected
            ? (isReal ? '0 0 16px rgba(16, 185, 129, 0.2)' : '0 0 16px rgba(239, 68, 68, 0.2)')
            : 'none',
          position: 'relative'
        }}
      >
        <div>
          {/* Header Row: Title + Duration + Play/Pause Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#f8fafc' }}>
                {clip.label}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>
                {clip.duration}
              </span>
            </div>

            <button
              onClick={(e) => togglePlay(clip, e)}
              style={{
                background: isAudioPlaying ? (isReal ? '#10b981' : '#ef4444') : '#1e293b',
                color: isAudioPlaying ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              title={isAudioPlaying ? 'Pause preview' : 'Listen to audio preview'}
            >
              {isAudioPlaying ? <Pause size={13} /> : <Play size={13} style={{ marginLeft: '1px' }} />}
            </button>
          </div>

          <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.45', marginBottom: '12px' }}>
            {clip.description}
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTest(clip);
          }}
          disabled={isLoading}
          style={{
            background: isSelected
              ? (isReal ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)')
              : 'rgba(255, 255, 255, 0.04)',
            color: isSelected
              ? (isReal ? '#34d399' : '#f87171')
              : '#cbd5e1',
            border: isSelected
              ? (isReal ? '1px solid #10b981' : '1px solid #ef4444')
              : '1px solid #334155',
            padding: '7px 12px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            width: '100%'
          }}
        >
          {isAnalyzingThis ? (
            <>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Analyzing Clip...
            </>
          ) : isSelected ? (
            <>
              <AudioWaveform size={14} />
              Loaded in Analyzer
            </>
          ) : (
            <>
              <AudioWaveform size={14} />
              Analyze This Clip
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div
      className="vg-card"
      style={{
        width: '100%',
        marginTop: '28px',
        backgroundColor: '#0c1322',
        border: '1px solid #1e293b'
      }}
    >
      {/* Header with Visual Secondary Cue */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.02rem', fontWeight: '700', color: '#f8fafc' }}>
                Or try a demo clip (Pre-Loaded Evaluation Benchmark)
              </h3>
              <span style={{ fontSize: '0.68rem', color: '#06b6d4', background: 'rgba(6, 182, 212, 0.12)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.25)', fontWeight: '600' }}>
                1-CLICK EVALUATION
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Select any sample to load it directly into the analysis engine with live explanations.
            </p>
          </div>
        </div>

        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Standardized 16kHz PCM WAV
        </div>
      </div>

      {/* Two Visually Grouped Sections: Authentic Human vs AI-Generated */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Section 1: Authentic Human Voices */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '700', color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                <CheckCircle2 size={13} /> AUTHENTIC HUMAN VOICES
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Expected: likely_real</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {realClips.map(renderClipCard)}
          </div>
        </div>

        {/* Section 2: AI-Generated Clones */}
        <div
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '12px',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: '700', color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertOctagon size={13} /> AI-GENERATED CLONES
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Expected: likely_ai_generated</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {aiClips.map(renderClipCard)}
          </div>
        </div>
      </div>
    </div>
  );
}
