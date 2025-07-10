
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

        // Encode button
        const encodeBtn = document.getElementById('encodeBtn');
        if (encodeBtn) {
            encodeBtn.addEventListener('click', () => this.handleEncode());
        }

        // Decode button
        const decodeBtn = document.getElementById('decodeBtn');
        if (decodeBtn) {
            decodeBtn.addEventListener('click', () => this.handleDecode());
        }

        // File upload handlers
        const fileUpload = document.getElementById('fileUpload');
        if (fileUpload) {
            fileUpload.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageSelect(e));
        }

        // Recording controls
        const startRecordBtn = document.getElementById('startRecord');
        const stopRecordBtn = document.getElementById('stopRecord');
        
        if (startRecordBtn) {
            startRecordBtn.addEventListener('click', () => this.startRecording());
        }
        
        if (stopRecordBtn) {
            stopRecordBtn.addEventListener('click', () => this.stopRecording());
        }

        // Frequency range controls
        const minFreq = document.getElementById('minFreqRange');
        const maxFreq = document.getElementById('maxFreqRange');
        
        if (minFreq) {
            minFreq.addEventListener('input', () => this.updateFrequencyRange());
        }
        
        if (maxFreq) {
            maxFreq.addEventListener('input', () => this.updateFrequencyRange());
        }
    }

    setupDragAndDrop() {
        const dropZone = document.getElementById('dropZone');
        if (!dropZone) return;

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleDroppedFile(files[0]);
            }
        });
    }

    async initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not available:', error);
        }
    }

    setupHeroAnimation() {
        const canvas = document.getElementById('hero-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        this.animateHeroCanvas(ctx, canvas);
    }

    animateHeroCanvas(ctx, canvas) {
        const waves = [];
        for (let i = 0; i < 3; i++) {
            waves.push({
                amplitude: 30 + i * 10,
                frequency: 0.02 + i * 0.01,
                phase: i * Math.PI / 3,
                speed: 1 + i * 0.5
            });
        }

        let time = 0;

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const centerY = canvas.height / 2;
            
            waves.forEach((wave, index) => {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(102, 126, 234, ${0.3 + index * 0.2})`;
                ctx.lineWidth = 2 + index;
                
                for (let x = 0; x < canvas.width; x++) {
                    const y = centerY + Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
                    
                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                
                ctx.stroke();
            });
            
            time += 0.02;
            requestAnimationFrame(animate);
        };

        animate();
    }

    updateModeUI() {
        const textModeSection = document.getElementById('textModeSection');
        const imageModeSection = document.getElementById('imageModeSection');
        
        if (textModeSection && imageModeSection) {
            if (this.currentMode === 'text') {
                textModeSection.style.display = 'block';
                imageModeSection.style.display = 'none';
            } else {
                textModeSection.style.display = 'none';
                imageModeSection.style.display = 'block';
            }
        }
    }

    async handleEncode() {
        try {
            this.showLoading(true);
            
            if (this.currentMode === 'text') {
                await this.encodeText();
            } else if (this.currentMode === 'image') {
                await this.encodeImage();
            }
        } catch (error) {
            console.error('Encoding error:', error);
            this.showAlert('Encoding failed: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async encodeText() {
        const textInput = document.getElementById('textInput').value;
        const minFreq = parseInt(document.getElementById('minFreqRange').value);
        const maxFreq = parseInt(document.getElementById('maxFreqRange').value);
        
        if (!textInput.trim()) {
            throw new Error('Please enter some text to encode');
        }

        const response = await fetch('/api/encode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: 'text',
                text: textInput,
                frequency_range: { min: minFreq, max: maxFreq }
            })
        });

        const result = await response.json();
        
        if (result.success) {
            this.displayResult('audio', result);
        } else {
            throw new Error(result.error);
        }
    }

    async encodeImage() {
        const imageUpload = document.getElementById('imageUpload');
        
        if (!imageUpload.files[0]) {
            throw new Error('Please select an image to encode');
        }

        const formData = new FormData();
        formData.append('file', imageUpload.files[0]);

        const response = await fetch('/api/encode-image', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        
        if (result.success) {
            this.displayResult('audio', result);
        } else {
            throw new Error(result.error);
        }
    }

    async handleDecode() {
        try {
            this.showLoading(true);
            
            const fileUpload = document.getElementById('fileUpload');
            
            if (!fileUpload.files[0]) {
                throw new Error('Please select an audio file to decode');
            }

            const formData = new FormData();
            formData.append('file', fileUpload.files[0]);
            formData.append('decode_mode', 'text');

            const response = await fetch('/api/decode', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.displayResult(result.type, result);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Decoding error:', error);
            this.showAlert('Decoding failed: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    displayResult(type, data) {
        const outputContainer = document.getElementById('outputContainer');
        
        if (type === 'audio') {
            outputContainer.innerHTML = `
                <div class="audio-result">
                    <h6>Generated Audio</h6>
                    <audio controls class="w-100 mb-3">
                        <source src="${data.download_url}" type="audio/wav">
                        Your browser does not support the audio element.
                    </audio>
                    <a href="${data.download_url}" class="btn btn-outline-primary btn-sm">
                        <i data-feather="download" class="me-1"></i>
                        Download
                    </a>
                </div>
            `;
        } else if (type === 'text') {
            outputContainer.innerHTML = `
                <div class="text-result">
                    <h6>Decoded Text</h6>
                    <div class="decoded-text p-3 border rounded">
                        ${data.decoded_text}
                    </div>
                </div>
            `;
        }

        // Refresh feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    showAlert(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastBody = toast.querySelector('.toast-body');
        
        toastBody.textContent = message;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    updateFrequencyRange() {
        const minFreq = parseInt(document.getElementById('minFreqRange').value);
        const maxFreq = parseInt(document.getElementById('maxFreqRange').value);
        
        document.getElementById('minFreqValue').textContent = minFreq;
        document.getElementById('maxFreqValue').textContent = maxFreq;
    }

    handleFileSelect(event) {
        this.currentFile = event.target.files[0];
    }

    handleImageSelect(event) {
        this.currentFile = event.target.files[0];
    }

    handleDroppedFile(file) {
        // Handle dropped file based on type
        if (file.type.startsWith('audio/')) {
            document.getElementById('fileUpload').files = file;
        } else if (file.type.startsWith('image/')) {
            document.getElementById('imageUpload').files = file;
        }
    }

    async startRecording() {
        // Recording functionality would go here
        this.showAlert('Recording feature coming soon!', 'info');
    }

    stopRecording() {
        // Stop recording functionality would go here
    }
}

// Frequency presets
function setFrequencyPreset(preset) {
    let min, max;
    
    switch(preset) {
        case 'bass':
            min = 20;
            max = 250;
            break;
        case 'mid':
            min = 250;
            max = 4000;
            break;
        case 'high':
            min = 4000;
            max = 20000;
            break;
        case 'full':
            min = 20;
            max = 20000;
            break;
        default:
            min = 800;
            max = 3000;
    }
    
    document.getElementById('minFreqRange').value = min;
    document.getElementById('maxFreqRange').value = max;

    // Update frequency picker if active
    if (window.sonificationApp && window.sonificationApp.frequencyPicker) {
        window.sonificationApp.updateFrequencyRange();
    }

    // Show toast
    if (window.sonificationApp) {
        window.sonificationApp.showAlert(`Frequency range set to ${min}-${max} Hz`, 'info');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.sonificationApp = new SonificationApp();
});

// Export for global access
window.SonificationApp = SonificationApp;
