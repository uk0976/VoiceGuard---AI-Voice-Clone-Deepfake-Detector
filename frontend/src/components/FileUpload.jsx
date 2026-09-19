import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Play, X, Loader2, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function FileUpload({ onAnalyze, isLoading, externalFile, onClear }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [fileWarning, setFileWarning] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndSetFile = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    const isAudio = file.type?.startsWith('audio/') || /\.(wav|mp3|m4a|ogg|flac|aac|wma)$/i.test(file.name || '');
    if (!isAudio) {
      setFileWarning(`"${file.name}" is not a recognized audio format. Supported formats: .wav, .mp3, .m4a, .ogg.`);
      setAudioUrl(null);
    } else if (file.size === 0) {
      setFileWarning(`"${file.name}" is empty (0 bytes). Please choose a valid audio file.`);
      setAudioUrl(null);
    } else if (file.size > 25 * 1024 * 1024) {
      setFileWarning(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 25MB limit.`);
      setAudioUrl(null);
    } else {
      setFileWarning(null);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  React.useEffect(() => {
    if (externalFile) {
      validateAndSetFile(externalFile);
    }
  }, [externalFile]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setFileWarning(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onClear) {
      onClear();
    }
  };

  const handleSubmit = () => {
    if (selectedFile && !isLoading && !fileWarning) {
      onAnalyze(selectedFile);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="vg-card" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Audio File Inspection
          </h2>
          <span className="badge-neutral">Max 25MB</span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Upload recorded speech to inspect vocal tract jitter, spectral consistency, and deepfake patterns.
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".wav,.mp3,.m4a,.ogg,.flac"
        onChange={handleChange}
        style={{ display: 'none' }}
        id="audio-upload-input"
      />

      {!selectedFile ? (
        <div
          className={`dropzone-saas ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              color: 'var(--primary-blue)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '14px'
            }}
          >
            <UploadCloud size={26} />
          </div>

          <h3 style={{ fontSize: '0.9375rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
            Drop your audio file here or <span style={{ color: 'var(--primary-blue)', textDecoration: 'underline' }}>browse</span>
          </h3>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
            Supports standard PCM WAV, MP3, M4A, or OGG
          </p>

          <div style={{ display: 'inline-flex', gap: '6px' }}>
            <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
              WAV
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
              MP3
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
              M4A
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: '500', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
              OGG
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '16px'
          }}
        >
          {/* File Info Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  color: 'var(--primary-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <FileAudio size={22} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {selectedFile.name}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>

            {!isLoading && (
              <button
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Remove file"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Audio Preview Element */}
          {audioUrl ? (
            <div style={{ marginBottom: '16px' }}>
              <audio
                controls
                src={audioUrl}
                style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </div>
          ) : (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                backgroundColor: 'var(--ai-red-bg)',
                borderRadius: '8px',
                border: '1px solid var(--ai-red-border)',
                color: '#991B1B',
                fontSize: '0.8125rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{fileWarning || 'Unrecognized audio format. Supported formats: .wav, .mp3, .m4a, .ogg.'}</span>
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={handleClear}
              disabled={isLoading}
              className="btn-secondary"
            >
              Change file
            </button>

            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isLoading || !!fileWarning}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing audio...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Analyze audio
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
