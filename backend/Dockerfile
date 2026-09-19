# VoiceGuard — Production Backend Dockerfile
# Optimized for CPU inference, fast cold starts, and minimal image size

FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HF_HOME=/app/.cache/huggingface

# Install system audio dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install lightweight CPU-only PyTorch first (drastically reduces image size and build time)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch==2.2.2 torchaudio==2.2.2 --extra-index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . .

# Pre-cache model weights during build to guarantee fast cold start in production
RUN python -c "from analysis import get_model_and_extractor; print('Pre-caching model...'); get_model_and_extractor(); print('Model cached successfully!')" || echo "Note: Model will download on first container boot"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

EXPOSE 8000

# Start Uvicorn bound to dynamic PORT
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
