import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, AlertTriangle, ShieldAlert, ShieldCheck, Cpu, Activity, Volume2, CheckCircle2 } from 'lucide-react';

export default function LiveStream() {
  const [isListening, setIsListening] = useState(false);
  const [streamStatus, setStreamStatus] = useState('idle'); // 'idle' | 'connecting' | 'listening' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sampleBufferRef = useRef([]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  const encodeWavChunk = (samples, sampleRate = 16000) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    writeString(36, 'data');
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return buffer;
  };

  const startStreaming = async () => {
    setErrorMessage(null);
    setStreamStatus('connecting');

    try {
      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Establish WebSocket connection
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname || 'localhost';
      const wsUrl = `${wsProtocol}//${wsHost}:8000/ws/stream`;

      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      socketRef.current = ws;

      ws.onopen = () => {
        setStreamStatus('listening');
        setIsListening(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLatestData(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        cleanupResources();
        setStreamStatus('error');
        setErrorMessage('WebSocket connection failed. Ensure backend is running on port 8000.');
      };

      ws.onclose = () => {
        if (isListening) {
          stopStreaming();
        }
      };

      // 3. Setup Web Audio API Pipeline (16kHz target)
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;
      source.connect(analyser);

      // Visualizer loop
      const drawWaveform = () => {
        if (!canvasRef.current || !analyserRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Compute volume level
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));

        // Draw visualizer bars
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(1, '#38bdf8');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
          x += barWidth;
        }

        animationFrameRef.current = requestAnimationFrame(drawWaveform);
      };

      drawWaveform();

      // Audio processor node for chunk aggregation
      const bufferSize = 4096;
      const processor = audioCtx.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;
      source.connect(processor);
      processor.connect(audioCtx.destination);

      sampleBufferRef.current = [];
      const nativeSr = audioCtx.sampleRate;
      const targetSr = 16000;
      const targetChunkDuration = 1.5; // seconds
      const targetSampleCount = targetSr * targetChunkDuration; // 24000 samples

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Simple linear interpolation downsampling to 16kHz
        const ratio = nativeSr / targetSr;
        const newLength = Math.round(inputData.length / ratio);

        for (let i = 0; i < newLength; i++) {
          const origIdx = Math.floor(i * ratio);
          sampleBufferRef.current.push(inputData[origIdx]);
        }

        // When we have accumulated ~1.5s of audio, encode to WAV and transmit
        if (sampleBufferRef.current.length >= targetSampleCount) {
          const chunkSamples = sampleBufferRef.current.slice(0, targetSampleCount);
          sampleBufferRef.current = sampleBufferRef.current.slice(targetSampleCount);

          const wavBuffer = encodeWavChunk(chunkSamples, targetSr);
          try {
            ws.send(wavBuffer);
          } catch (sendErr) {
            console.error('Failed to send audio chunk:', sendErr);
          }
        }
      };

    } catch (err) {
      console.error('Microphone initialization error:', err);
      cleanupResources();
      setStreamStatus('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access denied. Please allow microphone permissions in your browser settings to use live streaming mode.');
      } else {
        setErrorMessage(`Microphone error: ${err.message || 'Unable to access audio input'}`);
      }
    }
  };

  const cleanupResources = () => {
    setIsListening(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(console.error);
      audioContextRef.current = null;
    }

    if (socketRef.current) {
      try {
        socketRef.current.close();
      } catch {}
      socketRef.current = null;
    }

    sampleBufferRef.current = [];
    setAudioLevel(0);
  };

  const stopStreaming = () => {
    cleanupResources();
    setStreamStatus('idle');
  };

  const isFake = latestData?.label === 'likely_ai_generated';
  const rollingScorePercent = latestData ? Math.round((latestData.rolling_avg_score || 0) * 100) : 0;
  const chunkScorePercent = latestData ? Math.round((latestData.chunk_score || 0) * 100) : 0;
  const flags = latestData?.heuristic_flags || [];

  const verdictColor = isFake ? '#ef4444' : '#10b981';
  const strokeDashoffset = 283 - (283 * rollingScorePercent) / 100;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', alignItems: 'start' }}>
      {/* Left Column: Live Mic Controls & Waveform */}
      <div className="vg-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>
              Real-Time Streaming Analysis
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              Stream live microphone audio via WebSocket to monitor deepfake confidence in real time
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.2)' }}>
            Mode B
          </span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f87171' }}>Microphone Error</p>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '2px' }}>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Live Audio Visualizer Canvas */}
        <div
          style={{
            background: '#090d16',
            border: isListening ? '1px solid #06b6d4' : '1px solid #1e293b',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isListening ? '0 0 20px rgba(6, 182, 212, 0.15)' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isListening ? '#38bdf8' : '#64748b' }}>
              <Radio size={14} className={isListening ? 'animate-pulse' : ''} />
              <span>{isListening ? 'Microphone Active (Streaming ~1.5s Chunks)' : 'Microphone Inactive'}</span>
            </div>
            {isListening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
                <Volume2 size={14} color="#06b6d4" />
                <span>Level: {audioLevel}%</span>
              </div>
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={420}
            height={90}
            style={{ width: '100%', height: '90px', borderRadius: '6px', display: 'block' }}
          />

          {!isListening && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(9, 13, 22, 0.85)',
                backdropFilter: 'blur(2px)'
              }}
            >
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Click "Start Listening" below to initiate real-time mic inspection
              </p>
            </div>
          )}
        </div>

        {/* Primary Toggle Action */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {!isListening ? (
            <button
              onClick={startStreaming}
              className="btn-primary"
              style={{ width: '100%', padding: '14px 24px', fontSize: '1rem' }}
            >
              <Mic size={20} />
              Start Live Listening
            </button>
          ) : (
            <button
              onClick={stopStreaming}
              style={{
                width: '100%',
                padding: '14px 24px',
                fontSize: '1rem',
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
              }}
            >
              <MicOff size={20} />
              Stop Listening
            </button>
          )}
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
          Audio is processed locally in rolling ~1.5-second windows; nothing is stored or uploaded to external servers.
        </div>
      </div>

      {/* Right Column: Live Smoothed Score & Acoustic Findings */}
      <div className="vg-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '18px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
              Real-Time Verdict
            </span>
            <div style={{ marginTop: '6px' }}>
              {!latestData ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1e293b', color: '#94a3b8', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '600' }}>
                  AWAITING LIVE STREAM
                </div>
              ) : isFake ? (
                <div className="badge-danger">
                  <ShieldAlert size={18} />
                  <span>SUSPECTED AI VOICE CLONE</span>
                </div>
              ) : (
                <div className="badge-safe">
                  <ShieldCheck size={18} />
                  <span>AUTHENTIC HUMAN VOICE</span>
                </div>
              )}
            </div>
          </div>

          {/* Circular Gauge Meter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ position: 'relative', width: '70px', height: '70px' }}>
              <svg width="70" height="70" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1e293b" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={latestData ? verdictColor : '#334155'}
                  strokeWidth="10"
                  strokeDasharray="283"
                  strokeDashoffset={latestData ? strokeDashoffset : 283}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  fontWeight: '800',
                  color: latestData ? verdictColor : '#64748b',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                {latestData ? `${rollingScorePercent}%` : '--'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                Rolling Avg Score
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f1f5f9' }}>
                {latestData ? (isFake ? 'AI Generated Stream' : 'Live Natural Speech') : '5-Chunk Window'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Meter */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
            <span>0% Human</span>
            <span style={{ color: '#06b6d4', fontWeight: '600' }}>50% Decision Line</span>
            <span>100% Synthetic</span>
          </div>
          <div className="meter-container">
            <div
              className="meter-fill"
              style={{
                width: `${rollingScorePercent}%`,
                backgroundColor: latestData ? verdictColor : '#334155',
                boxShadow: latestData
                  ? (isFake ? '0 0 14px rgba(239, 68, 68, 0.5)' : '0 0 14px rgba(16, 185, 129, 0.5)')
                  : 'none'
              }}
            />
          </div>
        </div>

        {/* Breakdown Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
              <Activity size={14} color="#06b6d4" />
              Latest Chunk Score
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
              {latestData ? `${chunkScorePercent}%` : '--'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              Instant ~1.5s slice score
            </div>
          </div>

          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
              <Cpu size={14} color="#06b6d4" />
              Rolling Smoother
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
              {latestData ? `${rollingScorePercent}%` : '--'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              Smoothed last 5 chunks
            </div>
          </div>
        </div>

        {/* Live Heuristic Flags */}
        <div>
          <h4 style={{ fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
            Rolling Window Acoustic Flags ({flags.length})
          </h4>

          {flags.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {flags.map((flag, idx) => (
                <div key={idx} className="flag-chip" style={{ width: '100%' }}>
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: '500' }}>{flag}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#6ee7b7', padding: '12px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
              <span>
                {latestData
                  ? 'No unnatural synthetic anomalies detected in live microphone speech.'
                  : 'Start live listening to monitor incoming vocal tract physics in real time.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
