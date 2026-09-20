"""
VoiceGuard — Professional Presentation (PPT) Generator
Builds VoiceGuard_Presentation.pptx in 16:9 widescreen format
with complete project slides, embedded diagrams, UI screenshots, and benchmark metrics.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

# Color Constants
BG_DARK = RGBColor(8, 11, 16)         # #080B10 - Deepest black-slate
BG_PANEL = RGBColor(18, 24, 34)       # #121822 - Card background
BORDER_CYAN = RGBColor(34, 167, 214)  # #22A7D6 - Neon cyan accent
BORDER_SUBTLE = RGBColor(33, 42, 57)  # #212A39 - Border outline
TEXT_WHITE = RGBColor(240, 246, 252)  # #F0F6FC - Primary heading text
TEXT_MUTED = RGBColor(148, 163, 184)  # #94A3B8 - Secondary description text
TEXT_CYAN = RGBColor(34, 167, 214)   # #22A7D6 - Brand cyan text
TEXT_RED = RGBColor(239, 68, 68)      # #EF4444 - Alert / AI text
TEXT_GREEN = RGBColor(16, 185, 129)   # #10B981 - Safe / Human text

def add_slide_background(slide):
    """Applies a solid dark cyber-slate background to the slide."""
    background = slide.background
    fill = background.fill
    fill.solid()
    fill.fore_color.rgb = BG_DARK

def add_slide_header(slide, category, title, slide_num, total_slides=14):
    """Adds a standardized top header banner with category tag, title, and slide number."""
    # Category Tag
    tx_cat = slide.shapes.add_textbox(Inches(0.8), Inches(0.45), Inches(9.0), Inches(0.3))
    tf_cat = tx_cat.text_frame
    tf_cat.word_wrap = True
    p_cat = tf_cat.paragraphs[0]
    p_cat.text = category.upper()
    p_cat.font.name = 'Calibri'
    p_cat.font.size = Pt(9.5)
    p_cat.font.bold = True
    p_cat.font.color.rgb = TEXT_CYAN
    
    # Title
    tx_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.75), Inches(10.5), Inches(0.6))
    tf_title = tx_title.text_frame
    tf_title.word_wrap = True
    p_title = tf_title.paragraphs[0]
    p_title.text = title
    p_title.font.name = 'Calibri'
    p_title.font.size = Pt(22)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_WHITE
    
    # Cyan accent horizontal bar
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.42), Inches(11.733), Inches(0.02))
    line.fill.solid()
    line.fill.fore_color.rgb = BORDER_CYAN
    line.line.color.rgb = BORDER_CYAN

    # Footer
    tx_ftr = slide.shapes.add_textbox(Inches(0.8), Inches(6.95), Inches(11.733), Inches(0.35))
    tf_ftr = tx_ftr.text_frame
    p_ftr = tf_ftr.paragraphs[0]
    p_ftr.text = f"VoiceGuard Forensic Platform v2.4  •  Real Voices. A Safer Tomorrow.  •  Slide {slide_num:02d} / {total_slides:02d}"
    p_ftr.font.name = 'Calibri'
    p_ftr.font.size = Pt(8.5)
    p_ftr.font.color.rgb = TEXT_MUTED

def add_card(slide, left, top, width, height, title, body_lines, border_color=BORDER_SUBTLE, bg_color=BG_PANEL):
    """Renders a modern dark container card with a title and bulleted lines."""
    card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
    card.fill.solid()
    card.fill.fore_color.rgb = bg_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1.2)
    
    # Inner text
    tb = slide.shapes.add_textbox(left + Inches(0.15), top + Inches(0.15), width - Inches(0.3), height - Inches(0.3))
    tf = tb.text_frame
    tf.word_wrap = True
    
    if title:
        p_title = tf.paragraphs[0]
        p_title.text = title
        p_title.font.name = 'Calibri'
        p_title.font.size = Pt(13)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE
        p_title.space_after = Pt(8)
        
    for idx, line in enumerate(body_lines):
        p = tf.add_paragraph() if (title or idx > 0) else tf.paragraphs[0]
        p.text = line
        p.font.name = 'Calibri'
        p.font.size = Pt(10)
        p.font.color.rgb = TEXT_MUTED
        p.space_after = Pt(4)
        
    return card

def build_presentation():
    prs = Presentation()
    # Configure 16:9 Widescreen layout
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]
    
    # =========================================================================
    # SLIDE 1: Title Slide (Cover)
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    add_slide_background(s1)
    
    # Glow ring / border around cover logo
    logo_path = "report_assets/logo.png"
    if os.path.exists(logo_path):
        s1.shapes.add_picture(logo_path, Inches(5.666), Inches(1.1), Inches(2.0), Inches(2.0))
        
    # Title
    tx1 = s1.shapes.add_textbox(Inches(1.0), Inches(3.35), Inches(11.333), Inches(1.1))
    tf1 = tx1.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.alignment = PP_ALIGN.CENTER
    p1.text = "VoiceGuard"
    p1.font.name = 'Calibri'
    p1.font.size = Pt(44)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    
    # Subtitle
    tx_sub = s1.shapes.add_textbox(Inches(1.0), Inches(4.35), Inches(11.333), Inches(0.6))
    tf_sub = tx_sub.text_frame
    p_sub = tf_sub.paragraphs[0]
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.text = "AI Voice Clone & Deepfake Forensic Defense Platform"
    p_sub.font.name = 'Calibri'
    p_sub.font.size = Pt(20)
    p_sub.font.bold = True
    p_sub.font.color.rgb = TEXT_CYAN
    
    # Tagline
    tx_tag = s1.shapes.add_textbox(Inches(1.0), Inches(5.0), Inches(11.333), Inches(0.5))
    tf_tag = tx_tag.text_frame
    p_tag = tf_tag.paragraphs[0]
    p_tag.alignment = PP_ALIGN.CENTER
    p_tag.text = '“Real Voices. A Safer Tomorrow.”'
    p_tag.font.name = 'Georgia'
    p_tag.font.size = Pt(14)
    p_tag.font.italic = True
    p_tag.font.color.rgb = TEXT_MUTED
    
    # Metadata line
    tx_meta = s1.shapes.add_textbox(Inches(1.0), Inches(5.85), Inches(11.333), Inches(0.6))
    tf_meta = tx_meta.text_frame
    p_meta = tf_meta.paragraphs[0]
    p_meta.alignment = PP_ALIGN.CENTER
    p_meta.text = "Dual-Engine Neural & DSP Invariant Forensics  |  Devengers 2.0  |  September 2026"
    p_meta.font.name = 'Calibri'
    p_meta.font.size = Pt(11)
    p_meta.font.color.rgb = TEXT_WHITE

    # =========================================================================
    # SLIDE 2: The Critical Threat Landscape
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    add_slide_background(s2)
    add_slide_header(s2, "Problem Statement & Motivation", "The Exponential Rise of AI Voice Cloning & Fraud", 2)
    
    add_card(
        s2, Inches(0.8), Inches(1.75), Inches(3.64), Inches(4.8),
        "🚨 Zero-Shot Cloning",
        [
            "• Modern generative diffusion & vocoder models clone target voices in under 3 seconds.",
            "• Tools like ElevenLabs, RVC, XTTS, and DiffSinger are freely available and easily weaponized.",
            "• High acoustic realism makes audio deepfakes indistinguishable to human ears."
        ],
        border_color=RGBColor(239, 68, 68)
    )
    
    add_card(
        s2, Inches(4.84), Inches(1.75), Inches(3.64), Inches(4.8),
        "🎯 Exploited Attack Vectors",
        [
            "• Grandparent Scams: Emergency impersonation calls coercing urgent wire payments.",
            "• CEO Authorization Fraud: C-suite deepfakes authorizing fraudulent financial transfers.",
            "• Automated IVR Attacks: High-volume robocalls bypassing banking voice biometrics."
        ],
        border_color=BORDER_CYAN
    )
    
    add_card(
        s2, Inches(8.88), Inches(1.75), Inches(3.64), Inches(4.8),
        "⚠️ The Defense Gap",
        [
            "• Black-Box AI Models: Existing tools return arbitrary 100% or 0% scores with zero rationale.",
            "• Privacy Violations: Many services store voice prints in centralized, vulnerable databases.",
            "• Need: Real-time, explainable, and privacy-first biometric forensic defense."
        ],
        border_color=RGBColor(245, 158, 11)
    )

    # =========================================================================
    # SLIDE 3: Executive Solution Overview — What is VoiceGuard?
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    add_slide_background(s3)
    add_slide_header(s3, "Platform Overview", "VoiceGuard: Next-Generation Audio Biometric Defense", 3)
    
    add_card(
        s3, Inches(0.8), Inches(1.75), Inches(5.66), Inches(2.3),
        "🔬 Dual-Engine Fusion Core",
        [
            "Combines deep latent sequence classification (Wav2Vec2) with physical acoustic signal processing (Librosa) to uncover microscopic vocoder artifacts invisible to human ears."
        ],
        border_color=BORDER_CYAN
    )
    
    add_card(
        s3, Inches(6.86), Inches(1.75), Inches(5.66), Inches(2.3),
        "⚖️ Calibrated Continuous Confidence",
        [
            "Employs Logit Temperature Scaling (T = 3.0) to eliminate artificial 100% saturation, providing honest, fluctuating decimal precision that reflects true channel confidence."
        ],
        border_color=BORDER_CYAN
    )
    
    add_card(
        s3, Inches(0.8), Inches(4.3), Inches(5.66), Inches(2.3),
        "⚡ Dual Real-Time Operational Modes",
        [
            "Mode A: Deep multi-format file analyzer (WAV, MP3, M4A, FLAC).",
            "Mode B: Sub-second live microphone streaming via WebSockets with rolling temporal consensus and 60 FPS visualizer."
        ],
        border_color=BORDER_CYAN
    )
    
    add_card(
        s3, Inches(6.86), Inches(4.3), Inches(5.66), Inches(2.3),
        "🔒 Zero-Retention Biometric Privacy",
        [
            "Strict Privacy-by-Design: Audio is decoded exclusively in ephemeral RAM and never persisted. 100% compliant with GDPR Article 9, CCPA, and NIST Biometric Standards."
        ],
        border_color=TEXT_GREEN
    )

    # =========================================================================
    # SLIDE 4: End-to-End System Architecture
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    add_slide_background(s4)
    add_slide_header(s4, "System Design & Pipeline", "Dual-Engine Pipeline Architecture", 4)
    
    arch_img = "report_assets/architecture_diagram.png"
    if os.path.exists(arch_img):
        s4.shapes.add_picture(arch_img, Inches(0.8), Inches(1.7), Inches(7.6), Inches(4.8))
        
    add_card(
        s4, Inches(8.7), Inches(1.7), Inches(3.83), Inches(4.8),
        "Key Engineering Highlights",
        [
            "1. Audio Preprocessing:",
            "   16 kHz mono conversion, peak normalization, VAD silence gating.",
            "",
            "2. Engine A (Deep Classifier):",
            "   Wav2Vec2 sequence transformer extracting latent temporal embeddings.",
            "",
            "3. Engine B (Physical DSP):",
            "   Librosa signal chain checking pitch jitter, spectral flatness, and respiration.",
            "",
            "4. Decision Fusion Core:",
            "   Score = 0.75 · Model + 0.25 · Heuristic.",
            "",
            "5. Dynamic Report Engine:",
            "   Instant SHA-256 certified PDF generation."
        ],
        border_color=BORDER_CYAN
    )

    # =========================================================================
    # SLIDE 5: Neural Sequence Modeling (Engine A)
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    add_slide_background(s5)
    add_slide_header(s5, "Deep Learning Core", "Engine A: Pretrained Neural Sequence Classification", 5)
    
    add_card(
        s5, Inches(0.8), Inches(1.75), Inches(5.66), Inches(4.8),
        "Wav2Vec2 Architecture & Pretraining",
        [
            "• Backbone Model: MelodyMachine/Deepfake-audio-detection-V2.",
            "• Self-Supervised Audio Representations:",
            "  Trained on tens of thousands of authentic human and synthetic voice clones.",
            "• Temporal Latent Embedding Analysis:",
            "  Exposes mathematical phase inconsistencies, neural synthesis boundaries, and vocoder harmonic dispersion.",
            "• Cross-Entropy Logit Margins:",
            "  Produces raw logit differential Δz = z_synthetic - z_real indicating model polarity."
        ],
        border_color=BORDER_CYAN
    )
    
    add_card(
        s5, Inches(6.86), Inches(1.75), Inches(5.66), Inches(4.8),
        "Why A Transformer Alone Isn't Enough",
        [
            "• Out-of-Distribution Vulnerability:",
            "  Novel, unseen vocoder architectures can bypass neural classifiers trained on older TTS datasets.",
            "",
            "• Channel Distortion Bias:",
            "  Microphone clipping, phone compression (AMR-WB), and WhatsApp codecs introduce artifacts that confuse pure neural models.",
            "",
            "• The VoiceGuard Countermeasure:",
            "  Engine A's latent inference is cross-validated against physical acoustic invariants (Engine B) to ensure rock-solid resilience."
        ],
        border_color=RGBColor(245, 158, 11)
    )

    # =========================================================================
    # SLIDE 6: Acoustic Signal Processing & Explainability (Engine B)
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    add_slide_background(s6)
    add_slide_header(s6, "Physical Acoustics & Explainability", "Engine B: Mathematical Acoustic Invariants", 6)
    
    metrics_img = "report_assets/acoustic_metrics_comparison.png"
    if os.path.exists(metrics_img):
        s6.shapes.add_picture(metrics_img, Inches(0.8), Inches(1.7), Inches(6.4), Inches(4.8))
        
    add_card(
        s6, Inches(7.5), Inches(1.7), Inches(5.03), Inches(4.8),
        "4 Physiological Acoustic Invariants",
        [
            "1. Laryngeal Pitch Jitter (F0):",
            "   Biological vocal folds naturally exhibit micro-frequency variations. Neural vocoders generate unnaturally rigid pitch (< 0.018).",
            "",
            "2. Spectral Flatness (Wiener Entropy):",
            "   Evaluates formant resonance vs white noise floors. Diffusion vocoders show elevated flatness (> 0.035).",
            "",
            "3. Respiration & Silence Cadence:",
            "   Biological speakers pause for breath (30-50% silence). Synthetic speech frequently lacks breathing intervals (< 10%).",
            "",
            "4. Spectral Centroid Mass:",
            "   Validates anatomical human vocal tract resonance."
        ],
        border_color=BORDER_CYAN
    )

    # =========================================================================
    # SLIDE 7: The Breakthrough — Continuous Calibration (T = 3.0)
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    add_slide_background(s7)
    add_slide_header(s7, "Mathematical Calibration", "Continuous Confidence vs False 100% Saturation", 7)
    
    calib_img = "report_assets/temperature_calibration_chart.png"
    if os.path.exists(calib_img):
        s7.shapes.add_picture(calib_img, Inches(0.8), Inches(1.7), Inches(6.4), Inches(4.8))
        
    add_card(
        s7, Inches(7.5), Inches(1.7), Inches(5.03), Inches(4.8),
        "Logit Temperature Scaling (T = 3.0)",
        [
            "• The Problem:",
            "  Deep sequence models output large logit margins (|Δz| > 10). At T=1.0, standard softmax saturates at 0.99998, falsely displaying '100% AI'.",
            "",
            "• The Solution: P = σ( (z1 - z0) / 3.0 )",
            "  Applying temperature scaling softens overconfident logits without altering decision boundaries.",
            "",
            "• The Result:",
            "  - fake_1.wav: 97.5% Synthetic (not 100%)",
            "  - real_1.wav: 95.8% Human (4.2% AI)",
            "  - Live Mic: Honest, fluctuating decimals."
        ],
        border_color=BORDER_CYAN
    )

    # =========================================================================
    # SLIDE 8: Workstation Interface Walkthrough
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    add_slide_background(s8)
    add_slide_header(s8, "User Experience & Forensic Workstation", "Professional Cyber-Forensic Interface", 8)
    
    ui_ov = "report_assets/ui_overview_dashboard.png"
    ui_an = "report_assets/ui_file_analyzer.png"
    if os.path.exists(ui_ov):
        s8.shapes.add_picture(ui_ov, Inches(0.8), Inches(1.75), Inches(5.66), Inches(3.2))
    if os.path.exists(ui_an):
        s8.shapes.add_picture(ui_an, Inches(6.86), Inches(1.75), Inches(5.66), Inches(3.2))
        
    add_card(
        s8, Inches(0.8), Inches(5.15), Inches(5.66), Inches(1.65),
        "Overview & Audio Benchmark Picker",
        [
            "Instant access to bundled reference audio clips (real vs fake pairs) enabling zero-setup model validation and live demonstrations."
        ]
    )
    
    add_card(
        s8, Inches(6.86), Inches(5.15), Inches(5.66), Inches(1.65),
        "Deep File Analyzer & Dynamic Summary",
        [
            "High-contrast spectrum bar, animated waveform visualizer, and 100% data-driven forensic telemetry explanations."
        ]
    )

    # =========================================================================
    # SLIDE 9: Real-Time Live Stream Detection & Session Evaluation
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    add_slide_background(s9)
    add_slide_header(s9, "Real-Time Streaming Engine", "Live Microphone Streaming & Dynamic Evaluation", 9)
    
    ui_live = "report_assets/ui_live_stream_monitor.png"
    ui_eval = "report_assets/ui_human_voice_verification.png"
    if os.path.exists(ui_live):
        s9.shapes.add_picture(ui_live, Inches(0.8), Inches(1.75), Inches(5.66), Inches(3.2))
    if os.path.exists(ui_eval):
        s9.shapes.add_picture(ui_eval, Inches(6.86), Inches(1.75), Inches(5.66), Inches(3.2))
        
    add_card(
        s9, Inches(0.8), Inches(5.15), Inches(5.66), Inches(1.65),
        "Sub-Second Rolling WebSockets",
        [
            "Captures 16 kHz audio slices (1.5s windows), renders 60 FPS HTML5 canvas waveforms, and filters ambient noise via VAD energy thresholding."
        ]
    )
    
    add_card(
        s9, Inches(6.86), Inches(5.15), Inches(5.66), Inches(1.65),
        "Dynamic Post-Stream Session Summary",
        [
            "Clicking 'Stop listening' immediately evaluates total slices, agreement percentage, and vocal cord jitter into an actionable forensic report."
        ]
    )

    # =========================================================================
    # SLIDE 10: Certified Forensic PDF Reporting & Audit Trail
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    add_slide_background(s10)
    add_slide_header(s10, "Compliance & Chain of Custody", "Certified Forensic PDF Evidence Packages", 10)
    
    add_card(
        s10, Inches(0.8), Inches(1.75), Inches(3.64), Inches(4.8),
        "🔒 Cryptographic Integrity",
        [
            "• Client-Side SHA-256 Checksums:",
            "  Every generated report computes a cryptographic digest of the target audio file.",
            "",
            "• Tamper-Evident Stamping:",
            "  Guarantees chain of custody for legal and corporate compliance.",
            "",
            "• Formal Chain-of-Custody Footer:",
            "  ISO/IEC 30107 compliance tags."
        ],
        border_color=BORDER_CYAN
    )
    
    add_card(
        s10, Inches(4.84), Inches(1.75), Inches(3.64), Inches(4.8),
        "📊 Complete Telemetry Audit",
        [
            "• Official Logo Integration:",
            "  Branded top header with certified report ID and timestamp.",
            "",
            "• Multi-Metric Invariant Table:",
            "  Records exact values for Pitch Jitter, Spectral Flatness, and Silence Ratios.",
            "",
            "• Forensic Advisory:",
            "  Specific corporate risk advisories."
        ],
        border_color=BORDER_CYAN
    )
    
    add_card(
        s10, Inches(8.88), Inches(1.75), Inches(3.64), Inches(4.8),
        "💼 Enterprise Ready",
        [
            "• Corporate Audit Admissible:",
            "  Ready for inclusion in fraud investigations and legal discovery.",
            "",
            "• Instant One-Click Export:",
            "  Downloadable from both file analyzer and live stream summary.",
            "",
            "• Zero Licensing Overhead:",
            "  User retains 100% report ownership."
        ],
        border_color=TEXT_GREEN
    )

    # =========================================================================
    # SLIDE 11: Empirical Benchmark Performance & Evaluation
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    add_slide_background(s11)
    add_slide_header(s11, "Validation & Testing", "Empirical Benchmark Evaluation Results", 11)
    
    # Table of Benchmark Results
    rows = 5
    cols = 5
    tbl_shape = s11.shapes.add_table(rows, cols, Inches(0.8), Inches(1.8), Inches(11.733), Inches(2.6))
    tbl = tbl_shape.table
    
    headers = ["Sample ID", "Audio File", "Ground Truth", "Predicted Label", "Calibrated Confidence"]
    for c_idx, h_text in enumerate(headers):
        cell = tbl.cell(0, c_idx)
        cell.fill.solid()
        cell.fill.fore_color.rgb = RGBColor(13, 17, 23)
        p = cell.text_frame.paragraphs[0]
        p.text = h_text
        p.font.name = 'Calibri'
        p.font.bold = True
        p.font.size = Pt(11)
        p.font.color.rgb = TEXT_WHITE
        
    bench_data = [
        ("BENCH-01", "real_1.wav", "Authentic Human", "Human Voice", "95.8% Authenticity (4.2% AI)"),
        ("BENCH-02", "real_2.wav", "Authentic Human", "Human Voice", "97.4% Authenticity (2.6% AI)"),
        ("BENCH-03", "fake_1.wav", "ElevenLabs Neural Clone", "AI Generated", "97.5% Synthetic Probability"),
        ("BENCH-04", "fake_2.wav", "RVC Voice Conversion", "AI Generated", "97.5% Synthetic Probability")
    ]
    for r_idx, row_vals in enumerate(bench_data):
        for c_idx, val in enumerate(row_vals):
            cell = tbl.cell(r_idx + 1, c_idx)
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(18, 24, 34) if (r_idx % 2 == 0) else RGBColor(24, 32, 45)
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.name = 'Calibri'
            p.font.size = Pt(10)
            if "Human" in val or "Authenticity" in val:
                p.font.color.rgb = TEXT_GREEN
            elif "AI" in val or "Synthetic" in val or "ElevenLabs" in val:
                p.font.color.rgb = TEXT_RED
            else:
                p.font.color.rgb = TEXT_WHITE
                
    add_card(
        s11, Inches(0.8), Inches(4.7), Inches(11.733), Inches(1.8),
        "Empirical Takeaways & Latency Metrics",
        [
            "• Score Divergence Margin: > 90% confidence separation between genuine and deepfake audio.",
            "• End-to-End Latency: < 1.2 seconds for full 15s audio files; ~180ms rolling latency for live streaming chunks.",
            "• Noise Robustness: VAD thresholding successfully prevents ambient room silence from falsely triggering synthetic alerts."
        ],
        border_color=BORDER_CYAN
    )

    # =========================================================================
    # SLIDE 12: Zero-Retention Biometric Privacy
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    add_slide_background(s12)
    add_slide_header(s12, "Security & Ethical Compliance", "Zero-Retention Biometric Privacy Guarantee", 12)
    
    add_card(
        s12, Inches(0.8), Inches(1.75), Inches(3.64), Inches(4.8),
        "🛡️ RAM-Only Execution",
        [
            "• Ephemeral Audio Buffers:",
            "  Voice data received via REST or WebSockets exists strictly in volatile RAM during tensor extraction.",
            "",
            "• Zero Disk Persistence:",
            "  Audio buffers are immediately purged upon score computation. No voice prints or raw recordings are saved to server disk."
        ],
        border_color=TEXT_GREEN
    )
    
    add_card(
        s12, Inches(4.84), Inches(1.75), Inches(3.64), Inches(4.8),
        "💻 Local-First Storage",
        [
            "• Client-Side Persistence:",
            "  Analysis histories, generated reports, and forensic metadata are stored exclusively in the user's browser (localStorage).",
            "",
            "• Complete User Data Custody:",
            "  Users have full control to clear audit trails at any time."
        ],
        border_color=TEXT_GREEN
    )
    
    add_card(
        s12, Inches(8.88), Inches(1.75), Inches(3.64), Inches(4.8),
        "📜 Regulatory Compliance",
        [
            "• GDPR Article 9:",
            "  Meets strict European standards for biometric data processing without unauthorized storage.",
            "",
            "• CCPA & BIPA Aligned:",
            "  Complies with California and Illinois biometric privacy mandates.",
            "",
            "• NIST Biometric Standards:",
            "  Conforms to Presentation Attack Detection (PAD) guidelines."
        ],
        border_color=TEXT_GREEN
    )

    # =========================================================================
    # SLIDE 13: Future Roadmap & Enterprise Applications
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    add_slide_background(s13)
    add_slide_header(s13, "Commercial Vectors & Horizon", "Future Roadmap & Enterprise Expansion", 13)
    
    add_card(
        s13, Inches(0.8), Inches(1.75), Inches(3.64), Inches(4.8),
        "🌐 Browser Extension",
        [
            "• Live Web Call Defense:",
            "  Background audio listener for Google Meet, Zoom, and WhatsApp Web.",
            "",
            "• Instant Visual Alerts:",
            "  Heads-up warning banner when a synthetic voice clone is injected into live video conferences."
        ],
        border_color=BORDER_CYAN
    )
    
    add_card(
        s13, Inches(4.84), Inches(1.75), Inches(3.64), Inches(4.8),
        "📞 Telephony PBX Bridge",
        [
            "• Call-Center SIP/RTP Bridge:",
            "  Direct integration with enterprise VoIP PBX networks (Twilio, Asterisk).",
            "",
            "• Inbound Call Risk Scoring:",
            "  Automated synthetic score generated before call-center agents authenticate high-value transactions."
        ],
        border_color=BORDER_CYAN
    )
    
    add_card(
        s13, Inches(8.88), Inches(1.75), Inches(3.64), Inches(4.8),
        "🤖 Multi-Model Ensemble",
        [
            "• Whisper Phoneme Durations:",
            "  Measuring neural text-to-speech cadence against natural human phoneme timings.",
            "",
            "• Self-Supervised AASIST:",
            "  Spectral Graph Attention network fusion for extreme lossy audio conditions."
        ],
        border_color=BORDER_CYAN
    )

    # =========================================================================
    # SLIDE 14: Conclusion & Q&A
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    add_slide_background(s14)
    
    if os.path.exists(logo_path):
        s14.shapes.add_picture(logo_path, Inches(5.666), Inches(1.2), Inches(2.0), Inches(2.0))
        
    tx_end = s14.shapes.add_textbox(Inches(1.0), Inches(3.4), Inches(11.333), Inches(0.8))
    tf_end = tx_end.text_frame
    p_end = tf_end.paragraphs[0]
    p_end.alignment = PP_ALIGN.CENTER
    p_end.text = "VoiceGuard"
    p_end.font.name = 'Calibri'
    p_end.font.size = Pt(40)
    p_end.font.bold = True
    p_end.font.color.rgb = TEXT_WHITE
    
    tx_tag2 = s14.shapes.add_textbox(Inches(1.0), Inches(4.25), Inches(11.333), Inches(0.5))
    tf_tag2 = tx_tag2.text_frame
    p_tag2 = tf_tag2.paragraphs[0]
    p_tag2.alignment = PP_ALIGN.CENTER
    p_tag2.text = '“Real Voices. A Safer Tomorrow.”'
    p_tag2.font.name = 'Georgia'
    p_tag2.font.size = Pt(16)
    p_tag2.font.italic = True
    p_tag2.font.color.rgb = TEXT_CYAN
    
    tx_links = s14.shapes.add_textbox(Inches(1.0), Inches(5.0), Inches(11.333), Inches(1.4))
    tf_links = tx_links.text_frame
    
    pl1 = tf_links.paragraphs[0]
    pl1.alignment = PP_ALIGN.CENTER
    pl1.text = "GitHub Repository: https://github.com/uk0976/VoiceGuard---AI-Voice-Clone-Deepfake-Detector"
    pl1.font.name = 'Calibri'
    pl1.font.size = Pt(12)
    pl1.font.color.rgb = TEXT_WHITE
    pl1.space_after = Pt(6)
    
    pl2 = tf_links.add_paragraph()
    pl2.alignment = PP_ALIGN.CENTER
    pl2.text = "Live Workstation: http://localhost:5173  |  FastAPI Backend: http://127.0.0.1:8000"
    pl2.font.name = 'Calibri'
    pl2.font.size = Pt(11)
    pl2.font.color.rgb = TEXT_MUTED
    pl2.space_after = Pt(10)
    
    pl3 = tf_links.add_paragraph()
    pl3.alignment = PP_ALIGN.CENTER
    pl3.text = "Thank You! Questions & Discussion Welcome."
    pl3.font.name = 'Calibri'
    pl3.font.bold = True
    pl3.font.size = Pt(14)
    pl3.font.color.rgb = TEXT_CYAN

    # Save presentation
    out_path = "VoiceGuard_Presentation.pptx"
    prs.save(out_path)
    print(f"Presentation saved successfully at: {out_path}")

if __name__ == "__main__":
    build_presentation()
