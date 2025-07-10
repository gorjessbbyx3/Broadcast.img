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
        const generateBtn = document.getElementById('generateBtn');
        const mode = document.querySelector('input[name="encodingMode"]:checked').value;

        if (generateBtn) {
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<i data-feather="loader" class="me-2"></i>Processing...';
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

        } catch (error) {
            console.error('Error generating audio:', error);
            this.showError(error.message);
        } finally {
            if (generateBtn) {
                generateBtn.disabled = false;
                generateBtn.innerHTML = '<i data-feather="music" class="me-2"></i>Generate Audio';
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
        const resultSection = document.getElementById('resultSection');
        if (!resultSection) return;

        resultSection.innerHTML = `
            <div class="card glass-card">
                <div class="card-body">
                    <h5 class="card-title">
                        <i data-feather="music" class="me-2"></i>
                        Generated Audio
                    </h5>
                    <div class="mb-3">
                        <audio controls class="w-100">
                            <source src="${result.audio_url}" type="audio/wav">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                    <div class="d-flex justify-content-between">
                        <small class="text-muted">Duration: ${result.duration || 'N/A'}</small>
                        <a href="${result.audio_url}" download class="btn btn-outline-primary btn-sm">
                            <i data-feather="download" class="me-1"></i>Download
                        </a>
                    </div>
                </div>
            </div>
        `;

        resultSection.style.display = 'block';
        feather.replace();
    }

    displayDecodedResult(result) {
        const decodedResults = document.getElementById('decodedResults');
        if (!decodedResults) return;

        if (result.type === 'text') {
            decodedResults.innerHTML = `
                <div class="decoded-text">
                    <h6>Decoded Text:</h6>
                    <div class="text-result">${result.content}</div>
                </div>
            `;
        } else if (result.type === 'image') {
            decodedResults.innerHTML = `
                <div class="decoded-image">
                    <h6>Decoded Image:</h6>
                    <img src="${result.image_url}" class="img-fluid rounded" alt="Decoded Image">
                </div>
            `;
        } else if (result.type === 'transcription') {
            decodedResults.innerHTML = `
                <div class="transcription">
                    <h6>Transcription:</h6>
                    <div class="text-result">${result.content}</div>
                </div>
            `;
        }
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
    }

    setupAudioVisualization() {
        // Placeholder for audio visualization setup
        if (this.waveformCanvas) {
            this.drawPlaceholderWaveform();
        }
        if (this.spectrumCanvas) {
            this.drawPlaceholderSpectrum();
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
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SonificationStudio();
});