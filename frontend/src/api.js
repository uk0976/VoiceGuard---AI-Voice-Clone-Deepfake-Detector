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

  const endpoint = API_BASE ? `${API_BASE}/analyze` : '/analyze';
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    throw new Error(
      'Could not connect to the VoiceGuard backend service. If the cloud instance was idling, please wait 15–25 seconds for it to spin up and try again.'
    );
  }

  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    let errorDetail = `Server returned status ${response.status} ${response.statusText}`;
    if (contentType.includes('application/json')) {
      try {
        const errJson = await response.json();
        if (errJson && errJson.detail) {
          errorDetail = errJson.detail;
        }
      } catch {}
    } else if (response.status === 502 || response.status === 503 || response.status === 504) {
      errorDetail = 'Backend server is currently spinning up or under memory pressure. Please wait 15–20 seconds and click "Try again".';
    }
    throw new Error(errorDetail);
  }

  if (!contentType.includes('application/json')) {
    throw new Error(
      'Received unexpected non-JSON response from server. The backend may still be booting. Please try again in a moment.'
    );
  }

  return await response.json();
}
