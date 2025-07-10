
class SonificationApp {
    constructor() {
        this.audioContext = null;
        this.recorder = null;
        this.isRecording = false;
        this.currentMode = 'text';
        this.currentFile = null;
        this.audioVisualizer = null;
        this.frequencyPicker = null;

        this.initializeApp();
    }

    initializeApp() {
        this.setupTheme();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.initializeAudio();
        this.setupHeroAnimation();

        // Initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (!themeToggle) return;

        const currentTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);

        themeToggle.addEventListener('click', () => {
            const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    setupEventListeners() {
        // Encoding mode selector
        document.querySelectorAll('input[name="encodingMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentMode = e.target.value;
                this.updateModeUI();
            });
        });

        // Text encoding
        const encodeTextBtn = document.getElementById('encodeTextBtn');
        if (encodeTextBtn) {
            encodeTextBtn.addEventListener('click', () => this.handleEncode());
        }

        // Image encoding
        const encodeImageBtn = document.getElementById('encodeImageBtn');
        if (encodeImageBtn) {
            encodeImageBtn.addEventListener('click', () => this.handleImageEncode());
        }

        // File uploads
        const textFileInput = document.getElementById('textFileInput');
        if (textFileInput) {
            textFileInput.addEventListener('change', (e) => this.handleTextFileUpload(e));
        }

        const imageFileInput = document.getElementById('imageFileInput');
        if (imageFileInput) {
            imageFileInput.addEventListener('change', (e) => this.handleImageFileUpload(e));
        }

        // Audio decoding
        const decodeAudioBtn = document.getElementById('decodeAudioBtn');
        if (decodeAudioBtn) {
            decodeAudioBtn.addEventListener('click', () => this.handleDecode());
        }

        // Transcription
        const transcribeBtn = document.getElementById('transcribeBtn');
        if (transcribeBtn) {
            transcribeBtn.addEventListener('click', () => this.handleTranscribe());
        }

        // Download
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadCurrentFile());
        }

        // Clear audio
        const clearAudioBtn = document.getElementById('clearAudioBtn');
        if (clearAudioBtn) {
            clearAudioBtn.addEventListener('click', () => this.clearAudio());
        }
    }

    setupDragAndDrop() {
        // Setup drag and drop for various upload areas
        const uploadAreas = ['imageUploadArea', 'audioUploadArea'];
        
        uploadAreas.forEach(areaId => {
            const area = document.getElementById(areaId);
            if (!area) return;

            area.addEventListener('dragover', (e) => {
                e.preventDefault();
                area.classList.add('drag-over');
            });

            area.addEventListener('dragleave', () => {
                area.classList.remove('drag-over');
            });

            area.addEventListener('drop', (e) => {
                e.preventDefault();
                area.classList.remove('drag-over');
                this.handleFileDrop(e, areaId);
            });

            area.addEventListener('click', () => {
                const fileInput = area.querySelector('input[type="file"]');
                if (fileInput) fileInput.click();
            });
        });
    }

    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    setupHeroAnimation() {
        // Add any hero section animations here
        const heroElements = document.querySelectorAll('.hero-content > *');
        heroElements.forEach((element, index) => {
            element.style.animationDelay = `${index * 0.1}s`;
            element.classList.add('fade-in-up');
        });
    }

    updateModeUI() {
        // Hide all panels
        document.getElementById('textInputPanel').style.display = 'none';
        document.getElementById('imageInputPanel').style.display = 'none';
        document.getElementById('customFrequencyPanel').style.display = 'none';

        // Show selected panel
        switch (this.currentMode) {
            case 'text':
                document.getElementById('textInputPanel').style.display = 'block';
                break;
            case 'image':
                document.getElementById('imageInputPanel').style.display = 'block';
                break;
            case 'custom':
                document.getElementById('customFrequencyPanel').style.display = 'block';
                this.initializeFrequencyPicker();
                break;
        }
    }

    initializeFrequencyPicker() {
        const canvas = document.getElementById('frequencyPicker');
        if (!canvas) return;

        // Initialize frequency picker visualization
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#333';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Click to draw frequency pattern', canvas.width / 2, canvas.height / 2);
        }
    }

    async handleEncode() {
        try {
            this.showLoading(true);
            
            const textInput = document.getElementById('textInput');
            const text = textInput ? textInput.value.trim() : '';
            
            if (!text) {
                throw new Error('Please enter some text to encode');
            }

            const minFreq = document.getElementById('minFreq')?.value || 800;
            const maxFreq = document.getElementById('maxFreq')?.value || 3000;

            const response = await fetch('/api/encode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode: 'text',
                    text: text,
                    frequency_range: {
                        min: parseInt(minFreq),
                        max: parseInt(maxFreq)
                    }
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayResult('audio', result);
                this.showAlert('Text encoded successfully!', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Encoding error:', error);
            this.showAlert(error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async handleImageEncode() {
        try {
            this.showLoading(true);
            
            const imageFileInput = document.getElementById('imageFileInput');
            
            if (!imageFileInput?.files[0]) {
                throw new Error('Please select an image to encode');
            }

            const formData = new FormData();
            formData.append('file', imageFileInput.files[0]);

            const response = await fetch('/api/encode-image', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayResult('audio', result);
                this.showAlert('Image encoded successfully!', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Image encoding error:', error);
            this.showAlert(error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async handleDecode() {
        try {
            this.showLoading(true);
            
            const audioFileInput = document.getElementById('audioFileInput');
            
            if (!audioFileInput?.files[0]) {
                throw new Error('Please select an audio file to decode');
            }

            const formData = new FormData();
            formData.append('file', audioFileInput.files[0]);
            formData.append('decode_mode', 'text');

            const response = await fetch('/api/decode', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayResult('text', result);
                this.showAlert('Audio decoded successfully!', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Decoding error:', error);
            this.showAlert(error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    async handleTranscribe() {
        try {
            this.showLoading(true);
            
            const audioFileInput = document.getElementById('audioFileInput');
            
            if (!audioFileInput?.files[0]) {
                throw new Error('Please select an audio file to transcribe');
            }

            const formData = new FormData();
            formData.append('file', audioFileInput.files[0]);

            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayResult('transcript', result);
                this.showAlert('Audio transcribed successfully!', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Transcription error:', error);
            this.showAlert(error.message, 'danger');
        } finally {
            this.showLoading(false);
        }
    }

    handleTextFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const textInput = document.getElementById('textInput');
            if (textInput) {
                textInput.value = e.target.result;
            }
        };
        reader.readAsText(file);
    }

    handleImageFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('imagePreview');
            const previewImage = document.getElementById('previewImage');
            const encodeBtn = document.getElementById('encodeImageBtn');
            
            if (preview && previewImage) {
                previewImage.src = e.target.result;
                preview.style.display = 'block';
            }
            
            if (encodeBtn) {
                encodeBtn.disabled = false;
            }
        };
        reader.readAsDataURL(file);
    }

    handleFileDrop(event, areaId) {
        const files = event.dataTransfer.files;
        if (files.length === 0) return;

        const fileInput = document.querySelector(`#${areaId} input[type="file"]`);
        if (fileInput) {
            fileInput.files = files;
            fileInput.dispatchEvent(new Event('change'));
        }
    }

    displayResult(type, result) {
        const outputContainer = document.getElementById('outputContainer');
        if (!outputContainer) return;

        let content = '';
        
        switch (type) {
            case 'audio':
                this.loadAudio(result.download_url);
                content = `
                    <div class="alert alert-success">
                        <h6><i data-feather="music" class="me-2"></i>Audio Generated</h6>
                        <p>File: ${result.filename}</p>
                        <button class="btn btn-sm btn-primary" onclick="window.open('${result.download_url}')">
                            <i data-feather="download" class="me-1"></i>Download
                        </button>
                    </div>
                `;
                break;
            case 'text':
                content = `
                    <div class="alert alert-info">
                        <h6><i data-feather="file-text" class="me-2"></i>Decoded Text</h6>
                        <div class="decoded-text-content">
                            <pre>${result.decoded_text}</pre>
                        </div>
                    </div>
                `;
                break;
            case 'transcript':
                content = `
                    <div class="alert alert-info">
                        <h6><i data-feather="mic" class="me-2"></i>Transcription</h6>
                        <div class="transcript-content">
                            <p>${result.transcript}</p>
                        </div>
                    </div>
                `;
                break;
        }
        
        outputContainer.innerHTML = content;
        
        // Re-initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    loadAudio(url) {
        const audioPlayer = document.getElementById('audioPlayer');
        const audioPlaceholder = document.getElementById('audioPlaceholder');
        const audioControls = document.getElementById('audioControls');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (audioPlayer && audioPlaceholder && audioControls) {
            audioPlayer.src = url;
            audioPlayer.style.display = 'block';
            audioPlaceholder.style.display = 'none';
            audioControls.style.display = 'block';
            
            this.currentFile = url;
            
            if (downloadBtn) {
                downloadBtn.onclick = () => window.open(url);
            }
        }
    }

    clearAudio() {
        const audioPlayer = document.getElementById('audioPlayer');
        const audioPlaceholder = document.getElementById('audioPlaceholder');
        const audioControls = document.getElementById('audioControls');
        
        if (audioPlayer && audioPlaceholder && audioControls) {
            audioPlayer.src = '';
            audioPlayer.style.display = 'none';
            audioPlaceholder.style.display = 'block';
            audioControls.style.display = 'none';
            
            this.currentFile = null;
        }
    }

    downloadCurrentFile() {
        if (this.currentFile) {
            window.open(this.currentFile);
        }
    }

    showAlert(message, type = 'info') {
        const alertsContainer = document.getElementById('alertsContainer');
        if (!alertsContainer) return;

        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        alertsContainer.appendChild(alert);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }
}

// Utility functions
function setFrequencyPreset(min, max) {
    const minFreqRange = document.getElementById('minFreqRange');
    const maxFreqRange = document.getElementById('maxFreqRange');
    const minFreq = document.getElementById('minFreq');
    const maxFreq = document.getElementById('maxFreq');
    
    if (minFreqRange && maxFreqRange && minFreq && maxFreq) {
        minFreqRange.value = min;
        maxFreqRange.value = max;
        minFreq.value = min;
        maxFreq.value = max;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sonificationApp = new SonificationApp();
});
