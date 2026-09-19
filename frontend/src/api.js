let rawApi = import.meta.env.VITE_API_URL;
if (rawApi) {
  if (!rawApi.startsWith('http://') && !rawApi.startsWith('https://')) {
    rawApi = `https://${rawApi}`;
  }
  rawApi = rawApi.replace(/\/+$/, '');
}

export const API_BASE = rawApi || 
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
    ? 'http://127.0.0.1:8000' 
    : '');

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
  const endpoint = API_BASE ? `${API_BASE}/analyze` : '/analyze';
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    // If targetUrl failed, attempt fallback to relative route
    if (API_BASE) {
      response = await fetch('/analyze', {
        method: 'POST',
        body: formData,
      });
    } else {
      throw err;
    }
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
