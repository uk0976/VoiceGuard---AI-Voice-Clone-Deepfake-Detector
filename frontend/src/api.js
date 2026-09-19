/**
 * VoiceGuard — Frontend API Client
 * Interfaces with FastAPI /analyze endpoint and future /ws/stream WebSocket.
 */

const API_BASE = 'http://localhost:8000';

/**
 * Uploads an audio file (.wav or .mp3) to POST /analyze
 * @param {File | Blob} file
 * @param {string} [filename]
 * @returns {Promise<{label: string, confidence: number, model_score: number, heuristic_flags: string[]}>}
 */
export async function analyzeAudioFile(file, filename) {
  const formData = new FormData();
  formData.append('file', file, filename || file.name || 'recording.wav');

  let response;
  try {
    // Attempt relative path first (leveraging Vite proxy), fallback to absolute API_BASE
    response = await fetch('/analyze', {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    // If Vite proxy isn't routing, try direct backend URL
    response = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      body: formData,
    });
  }

  if (!response.ok) {
    let errorDetail = 'Analysis request failed';
    try {
      const errJson = await response.json();
      if (errJson && errJson.detail) {
        errorDetail = errJson.detail;
      }
    } catch {
      errorDetail = `Server returned status ${response.status} ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return await response.json();
}
