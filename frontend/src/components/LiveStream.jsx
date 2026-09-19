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

  const verdictColor = isFake ? '#ef4444' : '#10b981';
  const strokeDashoffset = 283 - (283 * rollingScorePercent) / 100;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '24px', alignItems: 'start' }}>
      {/* Left Column: Live Mic Controls & Waveform */}
      <div className="vg-card">
        <div style={{ marginBottom: '18px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>
            Live microphone
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
            Stream audio through your microphone to detect synthetic voices in real time
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            style={{
              background: errorType === 'disconnect' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)',
              border: `1px solid ${errorType === 'disconnect' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              borderRadius: '10px',
              padding: '16px',
              marginBottom: '18px'
            }}
          >
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle
                size={22}
                color={errorType === 'disconnect' ? '#f59e0b' : '#ef4444'}
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '700', color: errorType === 'disconnect' ? '#fbbf24' : '#f87171' }}>
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
                      fontSize: '0.68rem',
                      fontWeight: '700',
                      color: errorType === 'disconnect' ? '#fbbf24' : '#f87171',
                      background: errorType === 'disconnect' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {errorType?.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {errorMessage}
                </p>

                {errorType === 'permission' && (
                  <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#94a3b8', background: '#090d16', padding: '10px 12px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                    <strong style={{ color: '#f1f5f9' }}>To grant permission:</strong>
                    <ol style={{ margin: '6px 0 0 18px', padding: 0 }}>
                      <li>Click the tune/padlock icon next to the URL in your browser address bar.</li>
                      <li>Toggle <strong>Microphone</strong> to <strong>Allow</strong>.</li>
                      <li>Click <strong>Retry Microphone Access</strong> below.</li>
                    </ol>
                  </div>
                )}

                <div style={{ marginTop: '12px' }}>
                  <button
                    onClick={startStreaming}
                    style={{
                      background: errorType === 'disconnect' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                      border: `1px solid ${errorType === 'disconnect' ? '#f59e0b' : '#ef4444'}`,
                      color: '#f8fafc',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <RefreshCw size={14} />
                    {errorType === 'permission' ? 'Retry Microphone Access' : 'Reconnect Live Stream'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Audio Visualizer Canvas */}
        <div
          className={isListening ? 'live-listening-pulse' : ''}
          style={{
            background: 'rgba(9, 14, 26, 0.65)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: isListening ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
            borderTop: isListening ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'center',
            marginBottom: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: isListening ? '#38bdf8' : '#64748b' }}>
              <Radio size={14} className={isListening ? 'animate-pulse' : ''} />
              <span>{isListening ? 'Microphone active' : 'Microphone idle'}</span>
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
                background: 'rgba(8, 12, 23, 0.75)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                padding: '16px'
              }}
            >
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {streamStatus === 'connecting'
                  ? 'Requesting microphone permissions and connecting to server...'
                  : streamStatus === 'disconnected'
                  ? 'Stream disconnected. Click "Reconnect Live Stream" to resume.'
                  : 'Click "Start listening" below to begin live analysis'}
              </p>
            </div>
          )}
        </div>

        {/* Primary Toggle Action */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {streamStatus === 'connecting' ? (
            <button
              disabled
              className="btn-primary"
              style={{ width: '100%', padding: '14px 24px', fontSize: '1rem', opacity: 0.8, cursor: 'wait' }}
            >
              <Loader2 size={20} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
              Connecting microphone...
            </button>
          ) : !isListening ? (
            <button
              onClick={startStreaming}
              className="btn-primary"
              style={{ width: '100%', padding: '14px 24px', fontSize: '1rem' }}
            >
              <Mic size={20} />
              {streamStatus === 'disconnected' ? 'Reconnect stream' : 'Start listening'}
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
              Stop listening
            </button>
          )}
        </div>

        <div style={{ marginTop: '16px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
          Audio is processed locally in rolling ~1.5-second windows; nothing is stored or uploaded.
        </div>
      </div>

      {/* Right Column: Live Smoothed Score & Acoustic Findings */}
      <div className="vg-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '18px', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>
              Live verdict
            </span>
            <div style={{ marginTop: '6px' }}>
              {streamStatus === 'connecting' ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.1)', color: '#38bdf8', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '600', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>CONNECTING...</span>
                </div>
              ) : streamStatus === 'disconnected' ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '600', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                  <AlertTriangle size={16} />
                  <span>DISCONNECTED</span>
                </div>
              ) : isListening && !latestData ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(6, 182, 212, 0.12)', color: '#38bdf8', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '600', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <Activity size={16} className="animate-pulse" />
                  <span>BUFFERING AUDIO...</span>
                </div>
              ) : !latestData ? (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#1e293b', color: '#94a3b8', padding: '6px 14px', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: '600' }}>
                  AWAITING AUDIO
                </div>
              ) : isFake ? (
                <div className="badge-danger">
                  <ShieldAlert size={17} />
                  <span>AI-Generated Voice</span>
                </div>
              ) : (
                <div className="badge-safe">
                  <ShieldCheck size={17} />
                  <span>Natural Human Voice</span>
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
                  stroke={latestData ? verdictColor : isListening ? '#06b6d4' : '#334155'}
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
                  fontSize: latestData ? '1rem' : '0.85rem',
                  fontWeight: '800',
                  color: latestData ? verdictColor : isListening ? '#38bdf8' : '#64748b',
                  fontFamily: "'JetBrains Mono', monospace"
                }}
              >
                {latestData ? `${rollingScorePercent}%` : isListening ? '...' : '--'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
                Rolling Confidence
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#f1f5f9' }}>
                {latestData
                  ? (isFake ? 'Synthetic voice detected' : 'Natural speech detected')
                  : isListening
                  ? 'Analyzing stream...'
                  : '5-chunk window'}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar Meter */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', fontWeight: '500' }}>
            <span>0% Human</span>
            <span style={{ color: '#06b6d4', fontWeight: '600' }}>50% Threshold</span>
            <span>100% AI</span>
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
          <div style={{ background: 'rgba(11, 18, 34, 0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.07)', borderTop: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '14px', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
              <Activity size={14} color="#06b6d4" />
              Latest Chunk
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', fontFamily: "'JetBrains Mono', monospace" }}>
              {latestData ? `${chunkScorePercent}%` : '--'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
              Recent 1.5s slice
            </div>
          </div>

          <div style={{ background: 'rgba(11, 18, 34, 0.55)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255, 255, 255, 0.07)', borderTop: '1px solid rgba(255, 255, 255, 0.14)', borderRadius: '12px', padding: '14px', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px' }}>
              <Cpu size={14} color="#06b6d4" />
              Rolling Average
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
            Live Acoustic Checks ({flags.length})
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
          ) : latestData && isFake ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(56, 189, 248, 0.08)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(56, 189, 248, 0.28)', borderTop: '1px solid rgba(255, 255, 255, 0.15)', color: '#cbd5e1', padding: '12px 14px', borderRadius: '9px', fontSize: '0.85rem' }}>
              <Info size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
              <span>No acoustic anomalies independently flagged — detection is based primarily on neural model analysis.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isListening ? 'rgba(6, 182, 212, 0.08)' : 'rgba(16, 185, 129, 0.1)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: isListening ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid rgba(16, 185, 129, 0.35)', borderTop: '1px solid rgba(255, 255, 255, 0.15)', color: isListening ? '#38bdf8' : '#6ee7b7', padding: '12px 14px', borderRadius: '9px', fontSize: '0.85rem' }}>
              <CheckCircle2 size={18} color={isListening ? '#06b6d4' : '#10b981'} style={{ flexShrink: 0 }} />
              <span>
                {latestData
                  ? 'Pitch jitter, harmonic decay, and breathing pauses fall within natural human ranges. No anomalies detected.'
                  : isListening
                  ? 'Listening... Evaluating speech acoustics in 1.5s windows.'
                  : 'Start listening to monitor voice physics in real time.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
