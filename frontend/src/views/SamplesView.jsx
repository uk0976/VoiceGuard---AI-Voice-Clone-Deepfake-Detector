import React, { useState, useRef } from 'react';
import { Play, Pause, ShieldCheck, ShieldAlert, Loader2, FileAudio, ArrowRight } from 'lucide-react';
import { API_BASE } from '../api';

export default function SamplesView({ onSelectClip, isLoading, selectedClipId }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'real' | 'fake'
  const [playingId, setPlayingId] = useState(null);
  const [audioElements, setAudioElements] = useState({});
  const [loadingClipId, setLoadingClipId] = useState(null);

  const clips = [
    {
      id: 'real_1',
      filename: 'real_1.wav',
      type: 'real',
      label: 'Real Voice 01',
      duration: '13.8s',
      description: 'Conversational speech with natural pitch micro-jitter and breathing pauses.',
      size: '442 KB'
    },
    {
      id: 'real_2',
      filename: 'real_2.wav',
      type: 'real',
      label: 'Real Voice 02',
      duration: '12.0s',
      description: 'Expressive cadence recorded under uncompressed acoustic conditions.',
      size: '384 KB'
    },
    {
      id: 'real_3',
      filename: 'real_3.wav',
      type: 'real',
      label: 'Real Voice 03',
      duration: '6.6s',
      description: 'Standard spoken phrase exhibiting normal harmonic formant decay.',
      size: '212 KB'
    },
    {
      id: 'fake_1',
      filename: 'fake_1.wav',
      type: 'fake',
      label: 'AI Voice 01',
      duration: '7.4s',
      description: 'Synthetic voice clone synthesized from a neural vocoder foundation model.',
      size: '238 KB'
    },
    {
      id: 'fake_2',
      filename: 'fake_2.wav',
      type: 'fake',
      label: 'AI Voice 02',
      duration: '8.7s',
      description: 'Cloned speech displaying unnaturally uniform fundamental frequency.',
      size: '278 KB'
    },
    {
      id: 'fake_3',
      filename: 'fake_3.wav',
      type: 'fake',
      label: 'AI Voice 03',
      duration: '2.4s',
      description: 'Short synthesized utterance exhibiting vocoder phase continuity.',
      size: '78 KB'
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
        console.warn('Playback fallback:', err);
        const fallbackUrl = API_BASE ? `${API_BASE}/demo_clips/${clip.filename}` : `/demo_clips/${clip.filename}`;
        const fallbackAudio = new Audio(fallbackUrl);
        fallbackAudio.onended = () => setPlayingId(null);
        fallbackAudio.play().catch(console.error);
        setAudioElements((prev) => ({ ...prev, [clip.id]: fallbackAudio }));
      });
      setPlayingId(clip.id);
    }
  };

  const handleAnalyze = async (clip) => {
    if (isLoading) return;
    setLoadingClipId(clip.id);

    try {
      let res;
      try {
        res = await fetch(getAudioUrl(clip.filename));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        const fallbackUrl = API_BASE ? `${API_BASE}/demo_clips/${clip.filename}` : `/demo_clips/${clip.filename}`;
        res = await fetch(fallbackUrl);
      }

      const blob = await res.blob();
      const file = new File([blob], clip.filename, { type: 'audio/wav' });

      await onSelectClip(file, clip);
    } catch (err) {
      console.error('Failed to load sample clip:', err);
    } finally {
      setLoadingClipId(null);
    }
  };

  const filteredClips = clips.filter((clip) => {
    if (activeFilter === 'real') return clip.type === 'real';
    if (activeFilter === 'fake') return clip.type === 'fake';
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
          Benchmark reference samples
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Curated reference corpus for validating model accuracy and testing acoustic feature sensitivity.
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
        <button
          onClick={() => setActiveFilter('all')}
          className={`btn-secondary ${activeFilter === 'all' ? 'active' : ''}`}
          style={{
            backgroundColor: activeFilter === 'all' ? 'var(--surface-elevated)' : 'var(--surface-primary)',
            borderColor: activeFilter === 'all' ? 'var(--accent-cyan)' : 'var(--border-subtle)',
            fontSize: '0.75rem',
            padding: '5px 12px'
          }}
        >
          All Samples ({clips.length})
        </button>
        <button
          onClick={() => setActiveFilter('real')}
          className={`btn-secondary ${activeFilter === 'real' ? 'active' : ''}`}
          style={{
            backgroundColor: activeFilter === 'real' ? 'var(--surface-elevated)' : 'var(--surface-primary)',
            borderColor: activeFilter === 'real' ? 'var(--color-human)' : 'var(--border-subtle)',
            fontSize: '0.75rem',
            padding: '5px 12px'
          }}
        >
          Real Voices (3)
        </button>
        <button
          onClick={() => setActiveFilter('fake')}
          className={`btn-secondary ${activeFilter === 'fake' ? 'active' : ''}`}
          style={{
            backgroundColor: activeFilter === 'fake' ? 'var(--surface-elevated)' : 'var(--surface-primary)',
            borderColor: activeFilter === 'fake' ? 'var(--color-ai)' : 'var(--border-subtle)',
            fontSize: '0.75rem',
            padding: '5px 12px'
          }}
        >
          AI Voices (3)
        </button>
      </div>

      {/* Data Table */}
      <div className="vg-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="vg-table">
          <thead>
            <tr>
              <th>Sample</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Expected Ground Truth</th>
              <th>File Size</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClips.map((clip) => {
              const isReal = clip.type === 'real';
              const isPlayingThis = playingId === clip.id;
              const isAnalyzingThis = isLoading && loadingClipId === clip.id;
              const isSelected = selectedClipId === clip.id;

              return (
                <tr key={clip.id} style={{ backgroundColor: isSelected ? 'rgba(34, 167, 214, 0.05)' : 'transparent' }}>
                  <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileAudio size={14} color="var(--text-muted)" />
                      <span className="mono">{clip.label}</span>
                    </div>
                  </td>

                  <td style={{ color: 'var(--text-secondary)', maxWidth: '300px' }}>
                    {clip.description}
                  </td>

                  <td className="mono" style={{ color: 'var(--text-muted)' }}>
                    {clip.duration}
                  </td>

                  <td>
                    {isReal ? (
                      <span className="badge-status badge-human">
                        <ShieldCheck size={12} /> Human
                      </span>
                    ) : (
                      <span className="badge-status badge-ai">
                        <ShieldAlert size={12} /> AI Generated
                      </span>
                    )}
                  </td>

                  <td className="mono" style={{ color: 'var(--text-muted)' }}>
                    {clip.size}
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={(e) => togglePlay(clip, e)}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '0.6875rem' }}
                        title={isPlayingThis ? 'Pause audio' : 'Play audio'}
                      >
                        {isPlayingThis ? <Pause size={12} /> : <Play size={12} />}
                        {isPlayingThis ? 'Pause' : 'Play'}
                      </button>

                      <button
                        onClick={() => handleAnalyze(clip)}
                        disabled={isLoading}
                        className="btn-primary"
                        style={{ padding: '4px 10px', fontSize: '0.6875rem' }}
                      >
                        {isAnalyzingThis ? (
                          <>
                            <Loader2 size={11} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                            Analyzing...
                          </>
                        ) : isSelected ? (
                          'Active'
                        ) : (
                          'Analyze'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
