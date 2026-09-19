import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Radio, AlertTriangle, ShieldAlert, ShieldCheck, Cpu, Activity, Volume2, CheckCircle2, Loader2, RefreshCw, Info } from 'lucide-react';

export default function LiveStream() {
  const [isListening, setIsListening] = useState(false);
  const [streamStatus, setStreamStatus] = useState('idle'); // 'idle' | 'connecting' | 'listening' | 'disconnected' | 'error'
  const [errorMessage, setErrorMessage] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'permission' | 'hardware' | 'disconnect' | 'generic'
  const [latestData, setLatestData] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const isListeningRef = useRef(false);
  const streamStatusRef = useRef('idle');

  const socketRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const processorRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sampleBufferRef = useRef([]);

  const updateStreamStatus = (status) => {
    streamStatusRef.current = status;
    setStreamStatus(status);
  };

  const updateIsListening = (val) => {
    isListeningRef.current = val;
    setIsListening(val);
  };

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
    setErrorType(null);
    setLatestData(null);
    updateStreamStatus('connecting');

    try {
      // 1. Check browser mediaDevices support
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('MEDIA_NOT_SUPPORTED');
      }

      // 2. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Establish WebSocket connection
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname || 'localhost';
      const wsUrl = `${wsProtocol}//${wsHost}:8000/ws/stream`;

      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      socketRef.current = ws;

      ws.onopen = () => {
        updateStreamStatus('listening');
        updateIsListening(true);
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
        updateStreamStatus('error');
        setErrorType('disconnect');
        setErrorMessage('WebSocket connection failed. Ensure backend server is running on port 8000.');
      };

      ws.onclose = (event) => {
        if (isListeningRef.current || streamStatusRef.current === 'connecting' || streamStatusRef.current === 'listening') {
          cleanupResources();
          if (event.code === 1000) {
            updateStreamStatus('idle');
          } else {
            updateStreamStatus('disconnected');
            setErrorType('disconnect');
            setErrorMessage('WebSocket stream disconnected from server. Check that backend is running on port 8000.');
          }
        }
      };

      // 4. Setup Web Audio API Pipeline (16kHz target)
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

        // Draw visualizer bars on clean dark slate background
        ctx.fillStyle = '#0B1220';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
          gradient.addColorStop(0, '#2563EB');
          gradient.addColorStop(1, '#06B6D4');

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
      updateStreamStatus('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorType('permission');
        setErrorMessage('Microphone access was denied. Browser permissions must be granted to stream live audio.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorType('hardware');
        setErrorMessage('No microphone device was detected on your system. Please connect an audio input device.');
      } else if (err.message === 'MEDIA_NOT_SUPPORTED') {
        setErrorType('hardware');
        setErrorMessage('Microphone access requires a secure context (HTTPS or localhost).');
      } else {
        setErrorType('generic');
        setErrorMessage(`Microphone setup error: ${err.message || 'Unable to access audio input'}`);
      }
    }
  };

  const cleanupResources = () => {
    updateIsListening(false);

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
    updateStreamStatus('idle');
    setErrorMessage(null);
    setErrorType(null);
  };

  const isFake = latestData?.label === 'likely_ai_generated';
  const rollingScorePercent = latestData ? Math.round((latestData.rolling_avg_score || 0) * 100) : 0;
  const chunkScorePercent = latestData ? Math.round((latestData.chunk_score || 0) * 100) : 0;
  const flags = latestData?.heuristic_flags || [];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', alignItems: 'start' }}>
      {/* Left Column: Live Mic Controls & Waveform Monitor */}
      <div className="vg-card">
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Live Microphone Monitor
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className={isListening ? "pulse-dot" : ""} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isListening ? 'var(--authentic-green)' : 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                {isListening ? 'Streaming (16kHz)' : 'Idle'}
              </span>
            </div>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Stream audio through your microphone to detect synthetic voice artifacts in real time.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: errorType === 'disconnect' ? 'var(--warning-amber-bg)' : 'var(--ai-red-bg)',
              border: `1px solid ${errorType === 'disconnect' ? 'var(--warning-amber-border)' : 'var(--ai-red-border)'}`,
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '18px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle
                size={20}
                color={errorType === 'disconnect' ? 'var(--warning-amber)' : 'var(--ai-red)'}
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: errorType === 'disconnect' ? '#92400E' : '#991B1B' }}>
                    {errorType === 'permission'
                      ? 'Microphone Permission Denied'
                      : errorType === 'disconnect'
                      ? 'WebSocket Disconnected'
                      : errorType === 'hardware'
                      ? 'Audio Input Device Error'
                      : 'Live Stream Error'}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      fontWeight: '700',
                      color: errorType === 'disconnect' ? '#92400E' : '#991B1B',
                      backgroundColor: errorType === 'disconnect' ? '#FEF3C7' : '#FEE2E2',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {errorType?.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: errorType === 'disconnect' ? '#78350F' : '#7F1D1D', lineHeight: 1.45 }}>
                  {errorMessage}
                </p>

                {errorType === 'permission' && (
                  <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <strong style={{ color: 'var(--text-primary)' }}>To enable microphone:</strong>
                    <ol style={{ margin: '6px 0 0 16px', padding: 0 }}>
                      <li>Click the site permissions / padlock icon next to your URL.</li>
                      <li>Toggle <strong>Microphone</strong> to <strong>Allow</strong>.</li>
                      <li>Click the retry button below.</li>
                    </ol>
                  </div>
                )}

                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={startStreaming}
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    <RefreshCw size={12} />
                    {errorType === 'permission' ? 'Retry Microphone Access' : 'Reconnect Live Stream'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Audio Visualizer Canvas */}
        <div
          style={{
            backgroundColor: '#0B1220',
            border: isListening ? '1px solid var(--primary-blue)' : '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '18px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: isListening ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: isListening ? '#38BDF8' : '#94A3B8' }}>
              <Radio size={14} className={isListening ? 'animate-pulse' : ''} />
              <span>{isListening ? 'Microphone Active' : 'Waveform Monitor'}</span>
            </div>
            {isListening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94A3B8' }}>
                <Volume2 size={13} color="#38BDF8" />
                <span>Level: {audioLevel}%</span>
              </div>
            )}
          </div>

          <canvas
            ref={canvasRef}
            width={440}
            height={84}
            style={{ width: '100%', height: '84px', borderRadius: '6px', display: 'block', backgroundColor: '#0B1220' }}
          />

          {!isListening && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(11, 18, 32, 0.75)',
                backdropFilter: 'blur(3px)',
                padding: '16px',
                textAlign: 'center'
              }}
            >
              <p style={{ fontSize: '0.8125rem', color: '#CBD5E1' }}>
                {streamStatus === 'connecting'
                  ? 'Requesting microphone permissions and connecting to server...'
                  : streamStatus === 'disconnected'
                  ? 'Stream disconnected. Click "Reconnect Live Stream" to resume.'
                  : 'Click "Start live stream" below to begin real-time speech inspection.'}
              </p>
            </div>
          )}
        </div>

        {/* Primary Toggle Action */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {streamStatus === 'connecting' ? (
            <button
              disabled
              className="btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.9375rem', opacity: 0.8 }}
            >
              <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Connecting microphone...
            </button>
          ) : !isListening ? (
            <button
              onClick={startStreaming}
              className="btn-primary"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.9375rem' }}
            >
              <Mic size={18} />
              {streamStatus === 'disconnected' ? 'Reconnect live stream' : 'Start live stream'}
            </button>
          ) : (
            <button
              onClick={stopStreaming}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontSize: '0.9375rem',
                backgroundColor: 'var(--ai-red)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'background-color 0.15s ease'
              }}
            >
              <MicOff size={18} />
              Stop streaming
            </button>
          )}
        </div>

        <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          Audio is downsampled to 16 kHz mono and streamed in rolling ~1.5s frames; zero audio is recorded to disk.
        </p>
      </div>

      {/* Right Column: Live Smoothed Verdict & Findings */}
      <div className="vg-card">
        {/* Verdict Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '18px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
              Live Verdict
            </span>
            <div style={{ marginTop: '4px' }}>
              {streamStatus === 'connecting' ? (
                <span className="badge-neutral" style={{ fontSize: '0.8125rem', padding: '4px 10px' }}>
                  <Loader2 size={14} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Connecting...
                </span>
              ) : streamStatus === 'disconnected' ? (
                <span className="badge-neutral" style={{ color: 'var(--warning-amber)', borderColor: 'var(--warning-amber-border)', backgroundColor: 'var(--warning-amber-bg)', fontSize: '0.8125rem', padding: '4px 10px' }}>
                  <AlertTriangle size={14} />
                  Disconnected
                </span>
              ) : isListening && !latestData ? (
                <span className="badge-neutral" style={{ color: 'var(--primary-blue)', borderColor: 'var(--primary-blue-subtle)', backgroundColor: 'var(--primary-blue-subtle)', fontSize: '0.8125rem', padding: '4px 10px' }}>
                  <Activity size={14} className="animate-pulse" />
                  Buffering audio (1.5s)...
                </span>
              ) : !latestData ? (
                <span className="badge-neutral" style={{ fontSize: '0.8125rem', padding: '4px 10px' }}>
                  Awaiting audio
                </span>
              ) : isFake ? (
                <span className="badge-synthetic" style={{ fontSize: '0.875rem', padding: '5px 12px' }}>
                  <ShieldAlert size={18} />
                  AI-Generated Voice
                </span>
              ) : (
                <span className="badge-authentic" style={{ fontSize: '0.875rem', padding: '5px 12px' }}>
                  <ShieldCheck size={18} />
                  Natural Human Voice
                </span>
              )}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '800', color: latestData ? (isFake ? 'var(--ai-red)' : 'var(--authentic-green)') : 'var(--text-muted)', lineHeight: 1.1 }}>
              {latestData ? `${rollingScorePercent}%` : '--'}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              Rolling Confidence
            </div>
          </div>
        </div>

        {/* Horizontal Confidence Spectrum */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--ai-red)', fontWeight: '600' }}>AI-Generated</span>
            <span style={{ color: 'var(--text-muted)' }}>Threshold: 50%</span>
            <span style={{ color: 'var(--authentic-green)', fontWeight: '600' }}>Human Voice</span>
          </div>

          <div className="confidence-spectrum">
            <div
              className="confidence-indicator"
              style={{
                left: latestData ? `${Math.max(4, Math.min(96, 100 - rollingScorePercent))}%` : '50%'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            <span>100% Synthetic</span>
            <span>Smoothed Window (5 Chunks)</span>
            <span>100% Genuine</span>
          </div>
        </div>

        {/* 2-Column Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
              <Activity size={15} color="var(--primary-blue)" />
              Latest 1.5s Chunk
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {latestData ? `${chunkScorePercent}%` : '--'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Raw neural chunk score
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '600', marginBottom: '4px' }}>
              <Cpu size={15} color="var(--accent-cyan)" />
              Rolling 5-Frame Average
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: latestData ? (isFake ? 'var(--ai-red)' : 'var(--authentic-green)') : 'var(--text-primary)' }}>
              {latestData ? `${rollingScorePercent}%` : '--'}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Calibrated stability score
            </div>
          </div>
        </div>

        {/* Live Acoustic Checks */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <h4 style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Live Acoustic Checks ({flags.length})
            </h4>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Real-time anomaly detection
            </span>
          </div>

          {flags.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {flags.map((flag, idx) => (
                <div key={idx} className="flag-card">
                  <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          ) : latestData && isFake ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: 'var(--info-blue-bg)',
                border: '1px solid var(--info-blue-border)',
                color: '#075985',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem'
              }}
            >
              <Info size={18} color="var(--info-blue)" style={{ flexShrink: 0 }} />
              <span>No acoustic anomalies independently flagged — detection is based primarily on neural model analysis.</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: isListening ? 'var(--primary-blue-subtle)' : 'var(--authentic-green-bg)',
                border: `1px solid ${isListening ? '#BFDBFE' : 'var(--authentic-green-border)'}`,
                color: isListening ? '#1E40AF' : '#166534',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.8125rem'
              }}
            >
              <CheckCircle2 size={18} color={isListening ? 'var(--primary-blue)' : 'var(--authentic-green)'} style={{ flexShrink: 0 }} />
              <span>
                {latestData
                  ? 'Pitch jitter, harmonic decay, and breathing pauses fall within natural human ranges. No anomalies detected.'
                  : isListening
                  ? 'Streaming active: evaluating speech acoustics in 1.5s sliding frames.'
                  : 'Start live stream to monitor vocal tract physics in real time.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
