# 🚀 VoiceGuard — Production Deployment Guide

This guide provides step-by-step instructions for deploying both the **FastAPI Backend** and the **Vite React Frontend** to modern cloud platforms.

---

## 📋 Architecture & Ports Overview

| Component | Technology | Default Local Port | Cloud Deployment Target |
| :--- | :--- | :--- | :--- |
| **Backend** | Python 3.11, FastAPI, PyTorch, Librosa | `8000` | **Render**, **Railway**, **Hugging Face Spaces**, **Fly.io** |
| **Frontend** | React 18, Vite | `5173` | **Vercel**, **Netlify**, **Render Static Site** |

---

## 🌟 Option 1: 1-Click Full Stack on Render (Recommended)

VoiceGuard includes a pre-configured `render.yaml` blueprint that deploys both the backend Docker container and the frontend static site with automatic environment variable wiring.

### Steps:
1. Push your repository to GitHub: `https://github.com/uk0976/VoiceGuard---AI-Voice-Clone-Deepfake-Detector`
2. Log into **[Render.com](https://render.com/)**.
3. Click **"New +"** in the top right $\rightarrow$ select **"Blueprints"**.
4. Connect your GitHub repository `VoiceGuard---AI-Voice-Clone-Deepfake-Detector`.
5. Render will detect `render.yaml` and configure:
   - `voiceguard-backend`: Docker web service with CPU PyTorch and pre-cached model weights.
   - `voiceguard-frontend`: Static site with automatic rewrite rules and `VITE_API_URL` connected to your backend.
6. Click **"Apply"**. Render will build and deploy both services simultaneously.

---

## ⚡ Option 2: Vercel (Frontend) + Render or Railway (Backend)

This is a popular combination for maximum frontend CDN speed and dedicated backend compute.

### Step 1: Deploy Backend (Render or Railway)

#### On Render:
1. Go to **[dashboard.render.com](https://dashboard.render.com/)** $\rightarrow$ **"New +"** $\rightarrow$ **"Web Service"**.
2. Connect your GitHub repo.
3. Configure settings:
   - **Name**: `voiceguard-backend`
   - **Language**: `Docker`
   - **Dockerfile Path**: `./backend/Dockerfile`
   - **Docker Context**: `./backend`
   - **Instance Type**: Free or Starter
4. Click **"Create Web Service"**.
5. Once deployed, copy your backend URL (e.g., `https://voiceguard-backend.onrender.com`).

#### Or On Railway:
1. Go to **[railway.app](https://railway.app/)** $\rightarrow$ **"New Project"** $\rightarrow$ **"Deploy from GitHub repo"**.
2. Select your repository.
3. Under **Service Settings** $\rightarrow$ **Root Directory**, enter `backend`.
4. Railway will automatically detect `backend/Dockerfile` and start the build.
5. In **Settings** $\rightarrow$ **Networking**, click **"Generate Domain"** and copy the URL.

---

### Step 2: Deploy Frontend (Vercel)

1. Go to **[vercel.com](https://vercel.com/)** $\rightarrow$ **"Add New..."** $\rightarrow$ **"Project"**.
2. Import your repository: `VoiceGuard---AI-Voice-Clone-Deepfake-Detector`.
3. Configure settings:
   - **Root Directory**: Click **Edit** and select `frontend`.
   - **Framework Preset**: `Vite` (auto-detected).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Expand **Environment Variables** and add:
   - **Name**: `VITE_API_URL`
   - **Value**: Your deployed backend URL from Step 1 (e.g. `https://voiceguard-backend.onrender.com` without trailing slash).
5. Click **"Deploy"**.
6. Vercel will build and assign you a global production URL (e.g., `https://voiceguard.vercel.app`).

> **Note**: The frontend automatically derives the WebSocket URL (`wss://.../ws/stream`) from `VITE_API_URL`, so real-time microphone streaming will work immediately without manual socket configuration.

---

## 🤖 Option 3: Free AI Deployment on Hugging Face Spaces (Backend)

Hugging Face Spaces offers **free 2 vCPU / 16 GB RAM** Docker containers ideal for PyTorch model hosting:

1. Go to **[huggingface.co/spaces](https://huggingface.co/spaces)** $\rightarrow$ **"Create new Space"**.
2. Choose **Space SDK**: **Docker** $\rightarrow$ **Blank**.
3. Push your `backend/` files to the Hugging Face Space git repository.
4. Hugging Face will build the Docker container and provide a live public HTTPS URL with WebSocket support.

---

## 🐳 Option 4: Local Docker Self-Hosting

You can spin up the entire VoiceGuard stack locally or on any VPS using Docker Compose:

```bash
# Clone the repository
git clone https://github.com/uk0976/VoiceGuard---AI-Voice-Clone-Deepfake-Detector.git
cd VoiceGuard---AI-Voice-Clone-Deepfake-Detector

# Build and start both containers
docker compose up --build -d
```

- **Frontend Workstation**: [http://localhost:5173](http://localhost:5173)
- **Backend API & WebSockets**: [http://localhost:8000](http://localhost:8000)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🔍 Verification Checklist Post-Deployment

After deploying:
1. **Health Check**: Visit `https://<YOUR-BACKEND-URL>/health` $\rightarrow$ should return `{"status": "healthy"}`.
2. **Benchmark Audio Analysis**: In the frontend, open **"Overview"** or **"Analyze"**, click **"Try a Benchmark Sample"**, and click **"Analyze Voice Sample"**. Confirm calibrated probability and telemetry card render properly.
3. **Live Streaming**: Open **"Live Detection"**, click **"Start listening"**, speak into your microphone, and verify the rolling consensus meter is receiving WebSocket chunks.
4. **PDF Generation**: Click **"Download PDF Report"** and verify that the certified PDF report downloads with the VoiceGuard shield logo embedded beside the title.
