import React, { useState } from 'react';
import { Play, Pause, CheckCircle2, AlertOctagon, Sparkles, AudioWaveform } from 'lucide-react';

export default function DemoClipPicker({ onSelectClip, isLoading, selectedClipId }) {
  const [playingId, setPlayingId] = useState(null);
  const [audioElements, setAudioElements] = useState({});

  const demoClips = [
    {
      id: 'real_1',
      filename: 'real_1.wav',
      type: 'real',
      title: 'Human Voice 1',
      speaker: 'Natural Speaker',
      duration: '13.8s',
      url: 'http://localhost:8000/demo_clips/real_1.wav',
      description: 'Conversational speech with biological pitch fluctuation and breath pauses'
    },
    {
      id: 'fake_1',
      filename: 'fake_1.wav',
      type: 'fake',
      title: 'AI Voice Clone 1',
      speaker: 'Neural TTS Clone',
      duration: '7.4s',
      url: 'http://localhost:8000/demo_clips/fake_1.wav',
      description: 'High-fidelity AI voice clone generated from paired voice script'
    },
    {
      id: 'real_2',
      filename: 'real_2.wav',
      type: 'real',
      title: 'Human Voice 2',
      speaker: 'Natural Speaker',
      duration: '12.0s',
      url: 'http://localhost:8000/demo_clips/real_2.wav',
      description: 'Authentic expressive cadence with variable harmonic formant decay'
    },
    {
      id: 'fake_2',
      filename: 'fake_2.wav',
      type: 'fake',
      title: 'AI Voice Clone 2',
      speaker: 'Neural TTS Clone',
      duration: '8.7s',
      url: 'http://localhost:8000/demo_clips/fake_2.wav',
      description: 'Synthesized voice displaying unnaturally uniform pitch trajectories'
    },
    {
      id: 'real_3',
      filename: 'real_3.wav',
      type: 'real',
      title: 'Human Voice 3',
      speaker: 'Natural Speaker',
      duration: '6.6s',
      url: 'http://localhost:8000/demo_clips/real_3.wav',
      description: 'Short natural human utterance recorded under standard acoustic conditions'
    },
    {
      id: 'fake_3',
      filename: 'fake_3.wav',
      type: 'fake',
      title: 'AI Voice Clone 3',
      speaker: 'Neural TTS Clone',
      duration: '2.4s',
      url: 'http://localhost:8000/demo_clips/fake_3.wav',
      description: 'Short synthetic sample generated with high vocoder stability'
    },
  ];

  const togglePlay = (clip, e) => {
    e.stopPropagation();

    // Pause current if another is playing
    if (playingId && playingId !== clip.id && audioElements[playingId]) {
      audioElements[playingId].pause();
      audioElements[playingId].currentTime = 0;
    }

    let audio = audioElements[clip.id];
    if (!audio) {
      audio = new Audio(clip.url);
      audio.onended = () => setPlayingId(null);
      setAudioElements((prev) => ({ ...prev, [clip.id]: audio }));
    }

    if (playingId === clip.id) {
      audio.pause();
      setPlayingId(null);
    } else {
      audio.play().catch(console.error);
      setPlayingId(clip.id);
    }
  };

  const handleTest = async (clip) => {
    try {
      // Fetch the audio file as a Blob and pass to analysis
      const res = await fetch(clip.url);
      const blob = await res.blob();
      const file = new File([blob], clip.filename, { type: 'audio/wav' });
      onSelectClip(file, clip);
    } catch (err) {
      console.error('Failed to load demo clip:', err);
    }
  };

  return (
    <div className="vg-card" style={{ width: '100%', marginTop: '24px', backgroundColor: '#0f172a' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc' }}>
              Try Bundled Demo Clips (Evaluation Benchmark)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Pre-tested pairs of authentic human and AI cloned voices. Click to listen and run instant detection.
            </p>
          </div>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#1e293b', padding: '4px 10px', borderRadius: '6px' }}>
          6 Benchmark Clips
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        {demoClips.map((clip) => {
          const isReal = clip.type === 'real';
          const isSelected = selectedClipId === clip.id;
          const isAudioPlaying = playingId === clip.id;

          return (
            <div
              key={clip.id}
              style={{
                backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.08)' : '#131d33',
                border: isSelected
                  ? '1px solid #06b6d4'
                  : '1px solid #1e293b',
                borderRadius: '10px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isReal ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        <CheckCircle2 size={12} /> HUMAN
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: '700', color: '#f87171', background: 'rgba(239, 68, 68, 0.12)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                        <AlertOctagon size={12} /> AI CLONE
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{clip.duration}</span>
                  </div>

                  <button
                    onClick={(e) => togglePlay(clip, e)}
                    style={{
                      background: isAudioPlaying ? '#06b6d4' : '#1e293b',
                      color: isAudioPlaying ? '#0b0f19' : '#e2e8f0',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    title={isAudioPlaying ? 'Pause' : 'Play audio preview'}
                  >
                    {isAudioPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '1px' }} />}
                  </button>
                </div>

                <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: '#f1f5f9', marginBottom: '4px' }}>
                  {clip.title}
                </h4>
                <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4', marginBottom: '12px' }}>
                  {clip.description}
                </p>
              </div>

              <button
                onClick={() => handleTest(clip)}
                disabled={isLoading}
                style={{
                  background: isSelected ? 'linear-gradient(135deg, #06b6d4, #0284c7)' : 'rgba(255, 255, 255, 0.04)',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: isSelected ? 'none' : '1px solid #334155',
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
                <AudioWaveform size={14} />
                {isSelected ? 'Loaded in Analyzer' : 'Test This Sample'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
