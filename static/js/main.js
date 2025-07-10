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

        // File inputs
        const audioUpload = document.getElementById('audioUpload');
        if (audioUpload) {
            audioUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        const imageUpload = document.getElementById('imageUpload');
        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        }

        // Frequency range controls
        const minFreq = document.getElementById('minFreq');
        const maxFreq = document.getElementById('maxFreq');
        if (minFreq) minFreq.addEventListener('input', () => this.updateFrequencyRange());
        if (maxFreq) maxFreq.addEventListener('input', () => this.updateFrequencyRange());

        // Text upload
        const textUpload = document.getElementById('textUpload');
        if (textUpload) {
            textUpload.addEventListener('change', (e) => this.handleTextUpload(e));
        }
    }

    setupDragAndDrop() {
        const dropZones = document.querySelectorAll('.drop-zone');

        dropZones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });

            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });

            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');

                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleDroppedFile(files[0], zone);
                }
            });
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
        // Simple animation for hero section
        const heroElements = document.querySelectorAll('.hero-content > *');
        heroElements.forEach((el, index) => {
            el.style.animationDelay = `${index * 0.1}s`;
            el.classList.add('fade-in-up');
        });
    }

    updateModeUI() {
        const textSection = document.getElementById('textSection');
        const imageSection = document.getElementById('imageSection');

        if (textSection && imageSection) {
            if (this.currentMode === 'text') {
                textSection.style.display = 'block';
                imageSection.style.display = 'none';
            } else {
                textSection.style.display = 'none';
                imageSection.style.display = 'block';
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
        const textInput = document.getElementById('textInput');
        if (!textInput || !textInput.value.trim()) {
            throw new Error('Please enter some text to encode');
        }

        const frequencyRange = this.getFrequencyRange();

        const response = await fetch('/api/encode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mode: 'text',
                text: textInput.value.trim(),
                frequency_range: frequencyRange
            })
        });

        const result = await response.json();

        if (result.success) {
            this.showResult(result);
        } else {
            throw new Error(result.error || 'Encoding failed');
        }
    }

    async encodeImage() {
        const imageUpload = document.getElementById('imageUpload');
        if (!imageUpload || !imageUpload.files[0]) {
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
            this.showResult(result);
        } else {
            throw new Error(result.error || 'Image encoding failed');
        }
    }

    async handleDecode() {
        const audioUpload = document.getElementById('audioUpload');
        if (!audioUpload || !audioUpload.files[0]) {
            this.showAlert('Please select an audio file to decode', 'warning');
            return;
        }

        try {
            this.showLoading(true);

            const formData = new FormData();
            formData.append('file', audioUpload.files[0]);
            formData.append('decode_mode', this.currentMode);

            if (this.currentMode === 'image') {
                const width = document.getElementById('imageWidth')?.value || 100;
                const height = document.getElementById('imageHeight')?.value || 100;
                formData.append('width', width);
                formData.append('height', height);
            }

            const response = await fetch('/api/decode', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                this.showDecodeResult(result);
            } else {
                throw new Error(result.error || 'Decoding failed');
            }
        } catch (error) {
            console.error('Decoding error:', error);
            this.showAlert('Decoding failed: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.currentFile = file;
            this.showAlert(`File selected: ${file.name}`, 'success');
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    async handleTextUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload-text', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const textInput = document.getElementById('textInput');
                if (textInput) {
                    textInput.value = result.content;
                }
                this.showAlert(`Text loaded from ${result.filename}`, 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.showAlert('Failed to load text file: ' + error.message, 'error');
        }
    }

    handleDroppedFile(file, zone) {
        const fileType = file.type;

        if (fileType.startsWith('text/')) {
            // Handle text file
            const textUpload = document.getElementById('textUpload');
            if (textUpload) {
                textUpload.files = file;
                this.handleTextUpload({ target: { files: [file] } });
            }
        } else if (fileType.startsWith('image/')) {
            // Handle image file
            const imageUpload = document.getElementById('imageUpload');
            if (imageUpload) {
                const dt = new DataTransfer();
                dt.items.add(file);
                imageUpload.files = dt.files;
                this.handleImageUpload({ target: { files: [file] } });
            }
        } else if (fileType.startsWith('audio/')) {
            // Handle audio file
            const audioUpload = document.getElementById('audioUpload');
            if (audioUpload) {
                const dt = new DataTransfer();
                dt.items.add(file);
                audioUpload.files = dt.files;
                this.handleFileUpload({ target: { files: [file] } });
            }
        }
    }

    showResult(result) {
        const resultSection = document.getElementById('resultSection');
        if (!resultSection) return;

        resultSection.innerHTML = `
            <div class="alert alert-success">
                <h5>Encoding Complete!</h5>
                <p>Your audio file has been generated successfully.</p>
                <a href="${result.download_url}" class="btn btn-primary" download>
                    <i data-feather="download"></i> Download Audio
                </a>
            </div>
        `;

        resultSection.style.display = 'block';

        // Refresh feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    showDecodeResult(result) {
        const resultSection = document.getElementById('resultSection');
        if (!resultSection) return;

        if (result.type === 'text') {
            resultSection.innerHTML = `
                <div class="alert alert-success">
                    <h5>Decoding Complete!</h5>
                    <p><strong>Decoded text:</strong></p>
                    <div class="bg-light p-3 rounded">
                        <code>${result.decoded_text}</code>
                    </div>
                </div>
            `;
        } else if (result.type === 'image') {
            resultSection.innerHTML = `
                <div class="alert alert-success">
                    <h5>Image Decoding Complete!</h5>
                    <p>Decoded image (${result.width}x${result.height}):</p>
                    <img src="${result.image_url}" alt="Decoded Image" class="img-fluid mb-3" style="max-width: 300px;">
                    <br>
                    <a href="${result.image_url}" class="btn btn-primary" download>
                        <i data-feather="download"></i> Download Image
                    </a>
                </div>
            `;
        }

        resultSection.style.display = 'block';

        // Refresh feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }

    showAlert(message, type = 'info') {
        const alertsContainer = document.getElementById('alertsContainer') || document.body;

        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        alertsContainer.appendChild(alertDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    getFrequencyRange() {
        return {
            min: parseInt(document.getElementById('minFreq')?.value) || 800,
            max: parseInt(document.getElementById('maxFreq')?.value) || 3000
        };
    }

    updateFrequencyRange() {
        const minFreq = document.getElementById('minFreq')?.value;
        const maxFreq = document.getElementById('maxFreq')?.value;

        // Update frequency picker if exists
        if (this.frequencyPicker) {
            this.frequencyPicker.updateRange({ min: minFreq, max: maxFreq });
        }

        // Update display
        const minDisplay = document.getElementById('minFreqDisplay');
        const maxDisplay = document.getElementById('maxFreqDisplay');

        if (minDisplay) minDisplay.textContent = minFreq + ' Hz';
        if (maxDisplay) maxDisplay.textContent = maxFreq + ' Hz';
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function setFrequencyPreset(min, max) {
    document.getElementById('minFreq').value = min;
    document.getElementById('maxFreq').value = max;
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