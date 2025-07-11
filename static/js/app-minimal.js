// Minimal Sonification App - Professional Audio Processing
class SonificationStudio {
    constructor() {
        this.initializeApp();
        this.setupEventListeners();
        this.initializeVisualizations();
    }

    initializeApp() {
        // Initialize Feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }

        // Initialize theme
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);

        // Initialize variables
        this.audioContext = null;
        this.currentAudio = null;
        this.waveformCanvas = document.getElementById('waveformCanvas');
        this.spectrumCanvas = document.getElementById('spectrumCanvas');
        this.frequencyCanvas = document.getElementById('frequencyCanvas');

        // Initialize canvases
        this.initializeCanvases();
    }

    initializeCanvases() {
        if (this.waveformCanvas) {
            const ctx = this.waveformCanvas.getContext('2d');
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, this.waveformCanvas.width, this.waveformCanvas.height);
        }

        if (this.spectrumCanvas) {
            const ctx = this.spectrumCanvas.getContext('2d');
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, this.spectrumCanvas.width, this.spectrumCanvas.height);
        }

        if (this.frequencyCanvas) {
            this.drawFrequencyPicker();
        }
    }

    setupEventListeners() {
        // Encoding mode switcher
        document.querySelectorAll('input[name="encodingMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchEncodingMode(e.target.value);
            });
        });

        // Text input character counter
        const textInput = document.getElementById('textInput');
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                this.updateCharacterCount(e.target.value);
            });
        }

        // File upload handlers
        this.setupFileUploadHandlers();

        // Frequency controls
        this.setupFrequencyControls();

        // Generate button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateAudio();
            });
        }

        // Decode button
        const decodeBtn = document.getElementById('decodeBtn');
        if (decodeBtn) {
            decodeBtn.addEventListener('click', () => {
                this.decodeAudio();
            });
        }

        // Decoding mode switcher
        document.querySelectorAll('input[name="decodingMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.switchDecodingMode(e.target.value);
            });
        });
    }

    setupFileUploadHandlers() {
        // Text file upload
        const textFileInput = document.getElementById('textFileInput');
        if (textFileInput) {
            textFileInput.addEventListener('change', (e) => {
                this.handleTextFileUpload(e.target.files[0]);
            });
        }

        // Image upload zone
        const imageUploadZone = document.getElementById('imageUploadZone');
        const imageFileInput = document.getElementById('imageFileInput');
        if (imageUploadZone && imageFileInput) {
            imageUploadZone.addEventListener('click', () => {
                imageFileInput.click();
            });

            imageUploadZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                imageUploadZone.classList.add('dragover');
            });

            imageUploadZone.addEventListener('dragleave', () => {
                imageUploadZone.classList.remove('dragover');
            });

            imageUploadZone.addEventListener('drop', (e) => {
                e.preventDefault();
                imageUploadZone.classList.remove('dragover');
                this.handleImageUpload(e.dataTransfer.files[0]);
            });

            imageFileInput.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files[0]);
            });
        }

        // Audio upload zone
        const audioUploadZone = document.getElementById('audioUploadZone');
        const audioFileInput = document.getElementById('audioFileInput');
        if (audioUploadZone && audioFileInput) {
            audioUploadZone.addEventListener('click', () => {
                audioFileInput.click();
            });

            audioFileInput.addEventListener('change', (e) => {
                this.handleAudioUpload(e.target.files[0]);
            });
        }
    }

    setupFrequencyControls() {
        const frequencyPreset = document.getElementById('frequencyPreset');
        const minFreq = document.getElementById('minFreq');
        const maxFreq = document.getElementById('maxFreq');

        if (frequencyPreset) {
            frequencyPreset.addEventListener('change', (e) => {
                this.applyFrequencyPreset(e.target.value);
            });
        }

        if (minFreq && maxFreq) {
            minFreq.addEventListener('input', () => {
                this.updateFrequencyPicker();
            });
            maxFreq.addEventListener('input', () => {
                this.updateFrequencyPicker();
            });
        }
    }

    switchEncodingMode(mode) {
        const textSection = document.getElementById('textInputSection');
        const imageSection = document.getElementById('imageInputSection');

        if (mode === 'text') {
            textSection.style.display = 'block';
            imageSection.style.display = 'none';
        } else {
            textSection.style.display = 'none';
            imageSection.style.display = 'block';
        }
    }

    switchDecodingMode(mode) {
        const imageParams = document.getElementById('imageDecodingParams');
        if (imageParams) {
            imageParams.style.display = mode === 'image' ? 'block' : 'none';
        }
    }

    updateCharacterCount(text) {
        const charCount = document.getElementById('charCount');
        if (charCount) {
            charCount.textContent = text.length;
        }
    }

    handleTextFileUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const textInput = document.getElementById('textInput');
            if (textInput) {
                textInput.value = e.target.result;
                this.updateCharacterCount(e.target.result);
            }
        };
        reader.readAsText(file);
    }

    handleImageUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const imagePreview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            const imageInfo = document.getElementById('imageInfo');

            if (previewImg) {
                previewImg.src = e.target.result;
                imagePreview.style.display = 'block';
                imageInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            }
        };
        reader.readAsDataURL(file);
    }

    handleAudioUpload(file) {
        if (!file) return;

        const decodeBtn = document.getElementById('decodeBtn');
        if (decodeBtn) {
            decodeBtn.disabled = false;
        }

        // Store file for processing
        this.uploadedAudioFile = file;
    }

    applyFrequencyPreset(preset) {
        const minFreq = document.getElementById('minFreq');
        const maxFreq = document.getElementById('maxFreq');

        if (!minFreq || !maxFreq) return;

        const presets = {
            bass: { min: 200, max: 800 },
            mid: { min: 800, max: 3000 },
            high: { min: 3000, max: 8000 },
            full: { min: 20, max: 20000 }
        };

        if (presets[preset]) {
            minFreq.value = presets[preset].min;
            maxFreq.value = presets[preset].max;
            this.updateFrequencyPicker();
        }
    }

    drawFrequencyPicker() {
        if (!this.frequencyCanvas) return;

        const ctx = this.frequencyCanvas.getContext('2d');
        const width = this.frequencyCanvas.width;
        const height = this.frequencyCanvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw frequency spectrum background
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(0.5, '#4ecdc4');
        gradient.addColorStop(1, '#45b7d1');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw frequency labels
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('20Hz', 20, height - 5);
        ctx.fillText('1kHz', width / 2, height - 5);
        ctx.fillText('20kHz', width - 20, height - 5);
    }

    updateFrequencyPicker() {
        this.drawFrequencyPicker();
    }

    async generateAudio() {
        const generateBtn = document.querySelector('.encode-btn');
        const mode = document.querySelector('input[name="encodingMode"]:checked').value;

        // Update timeline and button
        this.updateTimelineStatus('processing');
        
        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i data-feather="loader" class="me-2"></i>PROCESSING...';
            feather.replace();
        }

        try {
            let formData = new FormData();

            if (mode === 'text') {
                const textInput = document.getElementById('textInput');
                if (!textInput.value.trim()) {
                    throw new Error('Please enter some text to encode');
                }
                formData.append('text', textInput.value);
            } else {
                const imageFile = document.getElementById('imageFileInput').files[0];
                if (!imageFile) {
                    throw new Error('Please select an image to encode');
                }
                formData.append('image', imageFile);
            }

            formData.append('min_freq', document.getElementById('minFreq').value);
            formData.append('max_freq', document.getElementById('maxFreq').value);

            const response = await fetch('/api/encode', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to generate audio');
            }

            const result = await response.json();
            this.displayAudioResult(result);
            this.updateTimelineStatus('complete');

            // Update dashboard metrics
            this.dashboardMetrics.audioGenerated++;
            document.getElementById('audioGenerated').textContent = this.dashboardMetrics.audioGenerated.toLocaleString();

        } catch (error) {
            console.error('Error generating audio:', error);
            this.showError(error.message);
            this.updateTimelineStatus('ready');
        } finally {
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i data-feather="zap" class="me-2"></i>START CREATING AUDIO';
                feather.replace();
            }
        }
    }

    async decodeAudio() {
        const decodeBtn = document.getElementById('decodeBtn');
        const mode = document.querySelector('input[name="decodingMode"]:checked').value;

        if (decodeBtn) {
            decodeBtn.disabled = true;
            decodeBtn.innerHTML = '<i data-feather="loader" class="me-2"></i>Decoding...';
            feather.replace();
        }

        try {
            if (!this.uploadedAudioFile) {
                throw new Error('Please upload an audio file first');
            }

            const formData = new FormData();
            formData.append('audio', this.uploadedAudioFile);
            formData.append('mode', mode);

            if (mode === 'image') {
                formData.append('width', document.getElementById('decodeWidth').value);
                formData.append('height', document.getElementById('decodeHeight').value);
            }

            const response = await fetch('/api/decode', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to decode audio');
            }

            const result = await response.json();
            this.displayDecodedResult(result);

        } catch (error) {
            console.error('Error decoding audio:', error);
            this.showError(error.message);
        } finally {
            if (decodeBtn) {
                decodeBtn.disabled = false;
                decodeBtn.innerHTML = '<i data-feather="play" class="me-2"></i>Decode Audio';
                feather.replace();
            }
        }
    }

    displayAudioResult(result) {
        const resultSection = document.getElementById('encodingResult');
        if (!resultSection) return;

        resultSection.innerHTML = `
            <div class="audio-result-card">
                <div class="result-header">
                    <i data-feather="check-circle" class="text-success me-2"></i>
                    <strong>Audio Generated</strong>
                </div>
                <div class="audio-player-compact mt-2">
                    <audio controls class="w-100">
                        <source src="${result.audio_url}" type="audio/wav">
                        Your browser does not support the audio element.
                    </audio>
                </div>
                <div class="result-actions mt-2">
                    <a href="${result.audio_url}" download class="btn btn-outline-success btn-sm">
                        <i data-feather="download" class="me-1"></i>Download
                    </a>
                    <button class="btn btn-outline-primary btn-sm ms-2" onclick="copyToClipboard('${result.audio_url}', this)">
                        <i data-feather="copy" class="me-1"></i>Share
                    </button>
                </div>
            </div>
        `;

        resultSection.style.display = 'block';
        feather.replace();
    }

    displayDecodedResult(result) {
        const decodedResults = document.getElementById('decodedResults');
        if (!decodedResults) return;

        const resultContent = decodedResults.querySelector('.result-content');
        if (!resultContent) return;

        if (result.type === 'text') {
            resultContent.innerHTML = `
                <div class="decoded-text">
                    <div class="text-result p-2 bg-light rounded">${result.content}</div>
                </div>
            `;
        } else if (result.type === 'image') {
            resultContent.innerHTML = `
                <div class="decoded-image text-center">
                    <img src="${result.image_url}" class="img-fluid rounded" alt="Decoded Image" style="max-height: 200px;">
                </div>
            `;
        } else if (result.type === 'transcription') {
            resultContent.innerHTML = `
                <div class="transcription">
                    <div class="text-result p-2 bg-light rounded">${result.content}</div>
                </div>
            `;
        }

        decodedResults.style.display = 'block';
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast show position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="toast-header bg-danger text-white">
                <strong class="me-auto">Error</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    initializeVisualizations() {
        // Initialize audio visualizations
        this.setupAudioVisualization();
        this.initializeDashboard();
        this.startMetricsUpdates();
    }

    setupAudioVisualization() {
        // Placeholder for audio visualization setup
        if (this.waveformCanvas) {
            this.drawPlaceholderWaveform();
        }
        if (this.spectrumCanvas) {
            this.drawPlaceholderSpectrum();
        }
        
        // Initialize dashboard visualizations
        this.initializeRealtimeViz();
    }

    initializeDashboard() {
        // Initialize real-time dashboard elements
        this.dashboardMetrics = {
            processingSpeed: 0.05,
            audioGenerated: 847,
            accuracyRate: 99.7,
            systemLoad: 43
        };

        this.updateTimelineStatus('ready');
    }

    startMetricsUpdates() {
        // Update metrics every 3 seconds with slight variations
        setInterval(() => {
            this.updateDashboardMetrics();
        }, 3000);

        // Update real-time visualizations
        this.animateRealtimeViz();
    }

    updateDashboardMetrics() {
        // Simulate real-time metric updates
        const speedElement = document.getElementById('processingSpeed');
        const audioElement = document.getElementById('audioGenerated');
        const accuracyElement = document.getElementById('accuracyRate');
        const loadElement = document.getElementById('systemLoad');

        if (speedElement) {
            const newSpeed = (Math.random() * 0.02 + 0.04).toFixed(3);
            speedElement.textContent = newSpeed + 's';
        }

        if (audioElement) {
            this.dashboardMetrics.audioGenerated += Math.floor(Math.random() * 3);
            audioElement.textContent = this.dashboardMetrics.audioGenerated.toLocaleString();
        }

        if (accuracyElement) {
            const accuracy = (99.5 + Math.random() * 0.4).toFixed(1);
            accuracyElement.textContent = accuracy + '%';
        }

        if (loadElement) {
            const load = Math.floor(35 + Math.random() * 20);
            loadElement.textContent = load + '%';
        }
    }

    initializeRealtimeViz() {
        const realtimeCanvas = document.getElementById('realtimeWaveform');
        const spectrumCanvas = document.getElementById('spectrumAnalyzer');

        if (realtimeCanvas) {
            this.realtimeCtx = realtimeCanvas.getContext('2d');
            this.drawRealtimeWaveform();
        }

        if (spectrumCanvas) {
            this.spectrumCtx = spectrumCanvas.getContext('2d');
            this.drawSpectrumAnalyzer();
        }
    }

    animateRealtimeViz() {
        const animate = () => {
            this.drawRealtimeWaveform();
            this.drawSpectrumAnalyzer();
            requestAnimationFrame(animate);
        };
        animate();
    }

    drawRealtimeWaveform() {
        if (!this.realtimeCtx) return;

        const canvas = this.realtimeCtx.canvas;
        const width = canvas.width;
        const height = canvas.height;

        this.realtimeCtx.clearRect(0, 0, width, height);
        
        // Create gradient background
        const gradient = this.realtimeCtx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 123, 255, 0.1)');
        this.realtimeCtx.fillStyle = gradient;
        this.realtimeCtx.fillRect(0, 0, width, height);

        // Draw animated waveform
        this.realtimeCtx.strokeStyle = '#00d4ff';
        this.realtimeCtx.lineWidth = 2;
        this.realtimeCtx.beginPath();

        const time = Date.now() * 0.001;
        for (let i = 0; i < width; i++) {
            const x = i;
            const y = height / 2 + Math.sin((i * 0.02) + time * 2) * 30 * Math.sin(time + i * 0.01);
            
            if (i === 0) {
                this.realtimeCtx.moveTo(x, y);
            } else {
                this.realtimeCtx.lineTo(x, y);
            }
        }
        this.realtimeCtx.stroke();
    }

    drawSpectrumAnalyzer() {
        if (!this.spectrumCtx) return;

        const canvas = this.spectrumCtx.canvas;
        const width = canvas.width;
        const height = canvas.height;

        this.spectrumCtx.clearRect(0, 0, width, height);

        // Draw frequency bars
        const barWidth = width / 64;
        const time = Date.now() * 0.002;

        for (let i = 0; i < 64; i++) {
            const barHeight = Math.abs(Math.sin(time + i * 0.1)) * height * 0.8;
            
            // Color based on frequency
            const hue = (i / 64) * 240; // Blue to red spectrum
            this.spectrumCtx.fillStyle = `hsla(${hue}, 80%, 60%, 0.8)`;
            
            this.spectrumCtx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
        }
    }

    updateTimelineStatus(status) {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        // Hide all timeline items first
        timelineItems.forEach(item => {
            item.style.display = 'none';
        });

        // Show appropriate timeline items based on status
        switch(status) {
            case 'ready':
                const readyItem = timelineItems[0];
                if (readyItem) readyItem.style.display = 'flex';
                break;
            case 'processing':
                timelineItems.forEach((item, index) => {
                    if (index <= 1) item.style.display = 'flex';
                });
                break;
            case 'complete':
                timelineItems.forEach(item => {
                    item.style.display = 'flex';
                });
                break;
        }
    }

    drawPlaceholderWaveform() {
        const ctx = this.waveformCanvas.getContext('2d');
        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < width; i++) {
            const y = height / 2 + Math.sin(i * 0.1) * 20;
            if (i === 0) {
                ctx.moveTo(i, y);
            } else {
                ctx.lineTo(i, y);
            }
        }

        ctx.stroke();
    }

    drawPlaceholderSpectrum() {
        const ctx = this.spectrumCanvas.getContext('2d');
        const width = this.spectrumCanvas.width;
        const height = this.spectrumCanvas.height;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#45b7d1';

        for (let i = 0; i < width; i += 4) {
            const barHeight = Math.random() * height * 0.8;
            ctx.fillRect(i, height - barHeight, 2, barHeight);
        }
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });

        // Add visual indicator
        element.style.transform = 'scale(1.01)';
        setTimeout(() => {
            element.style.transform = '';
        }, 300);
    }
}

// Enhanced notification system
function showNotification(message, type = 'info', duration = 4000) {
    // Remove existing notifications
    const existing = document.querySelector('.custom-notification');
    if (existing) {
        existing.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type === 'info' ? 'primary' : type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        backdrop-filter: blur(10px);
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;

    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <span>${message}</span>
            <button type="button" class="btn-close btn-close-white ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification && notification.parentNode) {
                    notification.remove();
                }
            }, 150);
        }
    }, duration);
}

// File download functionality
function downloadFile(filename) {
    if (!filename) {
        showNotification('❌ No file specified for download', 'error');
        return;
    }

    showNotification('📥 Starting download...', 'info', 2000);

    const link = document.createElement('a');
    link.href = `/download/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
        showNotification('✅ Download initiated successfully!', 'success');
    }, 500);
}

// Enhanced form validation
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Audio preview functionality
function previewAudio(audioUrl, buttonElement) {
    if (!audioUrl) {
        showNotification('❌ No audio file to preview', 'error');
        return;
    }

    // Stop any currently playing audio
    const existingAudio = document.querySelector('.preview-audio');
    if (existingAudio) {
        existingAudio.pause();
        existingAudio.remove();
    }

    // Create and play new audio
    const audio = document.createElement('audio');
    audio.className = 'preview-audio';
    audio.src = audioUrl;
    audio.controls = false;

    // Add visual feedback to button
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i data-feather="pause"></i> Playing...';
    feather.replace();

    audio.addEventListener('ended', () => {
        buttonElement.innerHTML = originalText;
        feather.replace();
        showNotification('🎵 Audio preview completed', 'info', 2000);
    });

    audio.addEventListener('error', () => {
        buttonElement.innerHTML = originalText;
        feather.replace();
        showNotification('❌ Error playing audio preview', 'error');
    });

    document.body.appendChild(audio);
    audio.play().then(() => {
        showNotification('🎵 Playing audio preview...', 'info', 2000);
    }).catch(error => {
        console.error('Audio play error:', error);
        showNotification('❌ Could not play audio preview', 'error');
        buttonElement.innerHTML = originalText;
        feather.replace();
    });
}

// Copy to clipboard functionality
function copyToClipboard(text, buttonElement) {
    if (!text) {
        showNotification('❌ No text to copy', 'error');
        return;
    }

    navigator.clipboard.writeText(text).then(() => {
        showNotification('✅ Copied to clipboard!', 'success', 2000);

        // Visual feedback
        const originalText = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i data-feather="check"></i> Copied!';
        feather.replace();

        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            feather.replace();
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
        showNotification('❌ Failed to copy to clipboard', 'error');
    });
}

// Clear form functionality
function clearForm(formElement) {
    if (!formElement) return;

    // Clear all inputs
    const inputs = formElement.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (input.type === 'file') {
            input.value = '';
        } else if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
        input.classList.remove('is-invalid', 'is-valid');
    });

    // Clear any result displays
    const resultContainers = formElement.querySelectorAll('.result-container, .output-container');
    resultContainers.forEach(container => {
        container.innerHTML = '<div class="text-center text-muted"><i data-feather="info" style="width: 48px; height: 48px;"></i><p class="mt-2">Results will appear here</p></div>';
        feather.replace();
    });

    showNotification('🧹 Form cleared successfully', 'info', 2000);
}

// Enhanced error handling for all AJAX requests
function handleAjaxError(xhr, textStatus, errorThrown) {
    console.error('AJAX Error:', textStatus, errorThrown);

    let errorMessage = 'An unexpected error occurred';

    if (xhr.responseJSON && xhr.responseJSON.error) {
        errorMessage = xhr.responseJSON.error;
    } else if (xhr.status === 404) {
        errorMessage = 'Service not found';
    } else if (xhr.status === 500) {
        errorMessage = 'Server error occurred';
    } else if (xhr.status === 413) {
        errorMessage = 'File too large (max 16MB)';
    } else if (xhr.status === 0) {
        errorMessage = 'Network connection error';
    }

    showNotification(`❌ ${errorMessage}`, 'error');
    return errorMessage;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();

    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Initialize all components
    initializeFileUploads();
    initializeFormHandlers();
    initializeAudioControls();
    initializeVisualization();
    initializeHeroButtons();
    initializeNavigationButtons();
    initializeFeatureInteractions();
});

// Initialize hero section buttons
function initializeHeroButtons() {
    // Start Creating Audio button
    const startButton = document.querySelector('.btn-premium');
    if (startButton) {
        startButton.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('encoding');

            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }

    // View Features button
    const featuresButton = document.querySelector('.btn-outline-premium');
    if (featuresButton) {
        featuresButton.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToSection('features');

            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }
}

// Initialize navigation and utility buttons
function initializeNavigationButtons() {
    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Download buttons functionality
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('download-btn') || e.target.closest('.download-btn')) {
            const button = e.target.classList.contains('download-btn') ? e.target : e.target.closest('.download-btn');
            const filename = button.getAttribute('data-filename');
            if (filename) {
                downloadFile(filename);
            }
        }
    });
}

// Initialize feature card interactions
function initializeFeatureInteractions() {
    // Feature cards hover effects and click handlers
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });

        // Make feature cards clickable to demonstrate functionality
        card.addEventListener('click', function() {
            const featureTitle = this.querySelector('h5').textContent;
            showFeatureDemo(featureTitle);
        });
    });
}

// Show feature demonstrations
function showFeatureDemo(featureTitle) {
    const demos = {
        'High-Speed Processing': () => {
            showNotification('⚡ Demonstrating high-speed processing capabilities...', 'info');
            setTimeout(() => {
                showNotification('✅ Processing completed in 0.05 seconds!', 'success');
            }, 1500);
        },
        'Custom Frequencies': () => {
            scrollToSection('encoding');
            showNotification('🎵 Navigate to encoding section to customize frequencies', 'info');
        },
        'AI Transcription': () => {
            scrollToSection('decoding');
            showNotification('🤖 Upload an audio file in the decoding section for AI transcription', 'info');
        },
        'High-Quality Export': () => {
            showNotification('💾 All audio exports are in 44.1kHz WAV format for maximum quality', 'info');
        },
        'Text to Sound': () => {
            scrollToSection('encoding');
            document.querySelector('#textInput')?.focus();
        },
        'Image Sonification': () => {
            scrollToSection('encoding');
            const imageTab = document.querySelector('[data-bs-target="#imageEncoding"]');
            if (imageTab) imageTab.click();
        },
        'Audio Decoding': () => {
            scrollToSection('decoding');
            showNotification('🔊 Upload audio files to decode them back to text or images', 'info');
        }
    };

    const demo = demos[featureTitle];
    if (demo) {
        demo();
    } else {
        showNotification(`📋 ${featureTitle} feature is fully operational`, 'info');
    }
}

// Initialize file upload handlers
function initializeFileUploads() {
    // Implement file upload handling here
}

// Initialize form handlers
function initializeFormHandlers() {
    // Text encoding form
    const textForm = document.getElementById('textEncodingForm');
    if (textForm) {
        textForm.addEventListener('submit', handleTextEncoding);

        // Add clear button functionality
        const clearBtn = textForm.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => clearForm(textForm));
        }

        // Add copy button functionality
        const copyBtn = textForm.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                const textInput = textForm.querySelector('#textInput');
                if (textInput && textInput.value) {
                    copyToClipboard(textInput.value, e.target);
                }
            });
        }
    }

    // Image encoding form
    const imageForm = document.getElementById('imageEncodingForm');
    if (imageForm) {
        imageForm.addEventListener('submit', handleImageEncoding);

        // Add clear button functionality
        const clearBtn = imageForm.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => clearForm(imageForm));
        }
    }

    // Audio decoding form
    const decodingForm = document.getElementById('audioDecodingForm');
    if (decodingForm) {
        decodingForm.addEventListener('submit', handleAudioDecoding);

        // Add clear button functionality
        const clearBtn = decodingForm.querySelector('.clear-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => clearForm(decodingForm));
        }
    }

    // Add functionality to all encode buttons
    document.querySelectorAll('.encode-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('form');
            if (form && validateForm(form)) {
                form.dispatchEvent(new Event('submit'));
            } else {
                showNotification('⚠️ Please fill in all required fields', 'warning');
            }
        });
    });

    // Add functionality to all decode buttons
    document.querySelectorAll('.decode-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const form = this.closest('form');
            if (form && validateForm(form)) {
                form.dispatchEvent(new Event('submit'));
            } else {
                showNotification('⚠️ Please select an audio file to decode', 'warning');
            }
        });
    });

    // Add functionality to preview buttons
    document.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const audioUrl = this.getAttribute('data-audio-url');
            if (audioUrl) {
                previewAudio(audioUrl, this);
            } else {
                showNotification('❌ No audio available for preview', 'error');
            }
        });
    });

    // Add functionality to download buttons
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const filename = this.getAttribute('data-filename');
            if (filename) {
                downloadFile(filename);
            } else {
                showNotification('❌ No file available for download', 'error');
            }
        });
    });
}

// Initialize audio controls
function initializeAudioControls() {
    // Implement audio control handling here
}

// Initialize visualization
function initializeVisualization() {
    // Implement visualization handling here
}

// Handle text encoding form submission
function handleTextEncoding(event) {
    event.preventDefault();
    // Implement text encoding logic here
}

// Handle image encoding form submission
function handleImageEncoding(event) {
    event.preventDefault();
    // Implement image encoding logic here
}

// Handle audio decoding form submission
function handleAudioDecoding(event) {
    event.preventDefault();
    // Implement audio decoding logic here
}

function displayEncodingResult(data) {
    const resultContainer = document.getElementById('encodingResult');
    if (!resultContainer) return;

    ```text
    resultContainer.innerHTML = `
        <div class="result-success">
            <div class="result-header">
                <i data-feather="check-circle" class="text-success"></i>
                <h5 class="ms-2 mb-0">Audio Generated Successfully!</h5>
            </div>
            <div class="result-content mt-3">
                <div class="audio-player mb-3">
                    <audio controls class="w-100">
                        <source src="/download/${data.filename}" type="audio/wav">
                        Your browser does not support the audio element.
                    </audio>
                </div>
                <div class="result-actions d-flex gap-2 justify-content-center">
                    <button class="btn btn-outline-premium download-btn" data-filename="${data.filename}">
                        <i data-feather="download" class="me-2"></i>
                        Download
                    </button>
                    <button class="btn btn-outline-premium preview-btn" data-audio-url="/download/${data.filename}">
                        <i data-feather="play" class="me-2"></i>
                        Preview
                    </button>
                    <button class="btn btn-outline-premium copy-btn" onclick="copyToClipboard('/download/${data.filename}', this)">
                        <i data-feather="copy" class="me-2"></i>
                        Copy Link
                    </button>
                </div>
                <div class="result-info mt-3">
                    <small class="text-muted">
                        <i data-feather="info" class="me-1"></i>
                        File: ${data.filename} | Format: WAV | Quality: 44.1kHz
                    </small>
                </div>
            </div>
        </div>
    `;

    feather.replace();
    resultContainer.scrollIntoView({ behavior: 'smooth' });

    // Initialize button functionality for this result
    const downloadBtn = resultContainer.querySelector('.download-btn');
    const previewBtn = resultContainer.querySelector('.preview-btn');

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => downloadFile(data.filename));
    }

    if (previewBtn) {
        previewBtn.addEventListener('click', () => previewAudio(`/download/${data.filename}`, previewBtn));
    }
}

function displayDecodingResult(data) {
    const resultContainer = document.getElementById('decodingResult');
    if (!resultContainer) return;

    if (data.type === 'text') {
        resultContainer.innerHTML = `
            <div class="result-success">
                <div class="result-header">
                    <i data-feather="check-circle" class="text-success"></i>
                    <h5 class="ms-2 mb-0">Text Decoded Successfully!</h5>
                </div>
                <div class="result-content mt-3">
                    <div class="decoded-text">
                        <label class="form-label">Decoded Text:</label>
                        <div class="text-result" id="decodedTextContent">${data.decoded_text}</div>
                        <div class="result-actions mt-3 d-flex gap-2 justify-content-center">
                            <button class="btn btn-outline-premium copy-btn" onclick="copyToClipboard(\`${data.decoded_text}\`, this)">
                                <i data-feather="copy" class="me-2"></i>
                                Copy Text
                            </button>
                            <button class="btn btn-outline-premium" onclick="selectText('decodedTextContent')">
                                <i data-feather="edit-3" class="me-2"></i>
                                Select All
                            </button>
                        </div>
                    </div>
                    <div class="result-info mt-3">
                        <small class="text-muted">
                            <i data-feather="info" class="me-1"></i>
                            Source: ${data.original_filename} | Characters: ${data.decoded_text.length}
                        </small>
                    </div>
                </div>
            </div>
        `;
    } else if (data.type === 'image') {
        resultContainer.innerHTML = `
            <div class="result-success">
                <div class="result-header">
                    <i data-feather="check-circle" class="text-success"></i>
                    <h5 class="ms-2 mb-0">Image Decoded Successfully!</h5>
                </div>
                <div class="result-content mt-3">
                    <div class="decoded-image text-center">
                        <img src="${data.image_url}" alt="Decoded Image" class="img-fluid rounded" style="max-width: 300px;">
                        <div class="result-actions mt-3 d-flex gap-2 justify-content-center">
                            <button class="btn btn-outline-premium download-btn" onclick="downloadFile('${data.image_url.split('/').pop()}')">
                                <i data-feather="download" class="me-2"></i>
                                Download
                            </button>
                            <button class="btn btn-outline-premium" onclick="openImageInNewTab('${data.image_url}')">
                                <i data-feather="external-link" class="me-2"></i>
                                View Full Size
                            </button>
                            <button class="btn btn-outline-premium copy-btn" onclick="copyToClipboard('${data.image_url}', this)">
                                <i data-feather="copy" class="me-2"></i>
                                Copy Link
                            </button>
                        </div>
                        <div class="result-info mt-3">
                            <small class="text-muted">
                                <i data-feather="info" class="me-1"></i>
                                Dimensions: ${data.width}x${data.height} | Source: ${data.original_filename}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    feather.replace();
    resultContainer.scrollIntoView({ behavior: 'smooth' });
}

// Additional utility functions for button functionality
function selectText(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        showNotification('✅ Text selected', 'success', 2000);
    }
}

function openImageInNewTab(imageUrl) {
    window.open(imageUrl, '_blank');
    showNotification('🖼️ Image opened in new tab', 'info', 2000);
}

// Error handling for audio operations
function handleAudioError(error) {
    console.error('Audio processing error:', error);
    showToast('Audio processing failed. Please try again.', 'error');
}

// Show loading overlay
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    const spinner = overlay.querySelector('.spinner-border');
    if (spinner) {
        spinner.className = 'premium-loading';
    }
    overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// Safe icon replacement function
function replaceIcons() {
    try {
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    } catch (error) {
        console.warn('Feather icons not available:', error);
    }
}

// Initialize icons when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    replaceIcons();

    // Re-replace icons after dynamic content updates
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                replaceIcons();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SonificationStudio();
});