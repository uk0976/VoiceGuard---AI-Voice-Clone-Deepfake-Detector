import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Play, X, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

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
      setFileWarning(`"${file.name}" is not an audio file. Supported formats: .wav, .mp3, .m4a, .ogg.`);
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
    if (selectedFile && !isLoading) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc' }}>Audio File Analysis</h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '2px' }}>
            Upload a voice recording (.wav, .mp3, .m4a) to detect synthetic cloning
          </p>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(6,182,212,0.2)' }}>
          Mode A
        </span>
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
          className={`dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.08)', marginBottom: '16px', color: '#06b6d4' }}>
            <UploadCloud size={36} />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#e2e8f0', marginBottom: '6px' }}>
            Drag and drop your audio clip here
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            or <span style={{ color: '#06b6d4', textDecoration: 'underline', fontWeight: '500' }}>browse from your computer</span>
          </p>
          <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '12px' }}>
            Supports WAV, MP3, M4A, OGG up to 25MB
          </p>
        </div>
      ) : (
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '10px', padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4' }}>
                <FileAudio size={24} />
              </div>
              <div>
                <p style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '0.95rem' }}>{selectedFile.name}</p>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            {!isLoading && (
              <button
                onClick={handleClear}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                title="Remove file"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {audioUrl ? (
            <div style={{ marginTop: '12px', marginBottom: '18px' }}>
              <audio controls src={audioUrl} style={{ width: '100%', height: '36px', borderRadius: '6px' }} />
            </div>
          ) : (
            <div style={{ marginTop: '10px', marginBottom: '16px', padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <span>{fileWarning || 'Unrecognized audio format. Supported formats: .wav, .mp3, .m4a, .ogg.'}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              onClick={handleClear}
              disabled={isLoading}
              style={{
                background: 'transparent',
                border: '1px solid #334155',
                color: '#94a3b8',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Change File
            </button>
            <button
              className="btn-primary"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  Analyzing Audio...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Run Detection
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
