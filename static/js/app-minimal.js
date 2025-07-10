// Minimal Sonification App - Professional Audio Processing
class SonificationApp {
    constructor() {
        this.audioContext = null;
        this.recorder = null;
        this.isRecording = false;
        this.currentFile = null;
        this.initializeApp();
    }
    
    initializeApp() {
        this.setupTheme();
        this.setupEventListeners();
        this.initializeAudio();
        
        // Initialize feather icons
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
    }
    
    setupTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const currentTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', currentTheme);
            
            themeToggle.addEventListener('click', () => {
                const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', newTheme);
                localStorage.setItem('theme', newTheme);
            });
        }
    }
    
    setupEventListeners() {
        // Text encoding
        const encodeTextBtn = document.getElementById('encodeTextBtn');
        if (encodeTextBtn) {
            encodeTextBtn.addEventListener('click', () => this.encodeText());
        }
        
        // Image encoding
        const encodeImageBtn = document.getElementById('encodeImageBtn');
        if (encodeImageBtn) {
            encodeImageBtn.addEventListener('click', () => this.encodeImage());
        }
        
        // Audio decoding
        const decodeAudioBtn = document.getElementById('decodeAudioBtn');
        if (decodeAudioBtn) {
            decodeAudioBtn.addEventListener('click', () => this.decodeAudio());
        }
        
        // Audio transcription
        const transcribeBtn = document.getElementById('transcribeBtn');
        if (transcribeBtn) {
            transcribeBtn.addEventListener('click', () => this.transcribeAudio());
        }
        
        // Audio visualization
        const visualizeBtn = document.getElementById('visualizeBtn');
        if (visualizeBtn) {
            visualizeBtn.addEventListener('click', () => this.visualizeAudio());
        }
        
        // File input handlers
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.currentFile = e.target.files[0];
                }
            });
        });
    }
    
    showLoading(message = 'Processing...') {
        const loadingDiv = document.getElementById('loadingOverlay');
        if (loadingDiv) {
            const messageEl = loadingDiv.querySelector('p');
            if (messageEl) {
                messageEl.textContent = message;
            }
            loadingDiv.style.display = 'flex';
        }
    }
    
    hideLoading() {
        const loadingDiv = document.getElementById('loadingOverlay');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toastHtml = `
            <div class="toast align-items-center text-bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'}" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        // Add to toast container
        let toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toastContainer';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = toastHtml;
        const toastElement = tempDiv.firstElementChild;
        toastContainer.appendChild(toastElement);
        
        // Show toast
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Remove after hiding
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
    
    async encodeText() {
        const textInput = document.getElementById('textInput');
        const text = textInput ? textInput.value.trim() : '';
        
        if (!text) {
            this.showToast('Please enter some text to encode', 'error');
            return;
        }
        
        this.showLoading('Encoding text to audio...');
        
        try {
            const response = await fetch('/api/encode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mode: 'text',
                    text: text,
                    frequency_range: { min: 800, max: 3000 }
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.loadAudio(result.download_url);
                this.showToast('Text encoded successfully!', 'success');
            } else {
                this.showToast(result.error || 'Encoding failed', 'error');
            }
        } catch (error) {
            console.error('Text encoding error:', error);
            this.showToast('Network error occurred', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async encodeImage() {
        const fileInput = document.getElementById('imageFileInput');
        const file = fileInput ? fileInput.files[0] : null;
        
        if (!file) {
            this.showToast('Please select an image file', 'error');
            return;
        }
        
        this.showLoading('Encoding image to audio...');
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('mode', 'image');
            
            const response = await fetch('/api/encode', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            encodeImageBtn.addEventListener('click', () => this.encodeImage());
        }
        
        // Audio decoding
        const decodeAudioBtn = document.getElementById('decodeAudioBtn');
        if (decodeAudioBtn) {
            decodeAudioBtn.addEventListener('click', () => this.decodeAudio());
        }
        
        // File inputs
        const imageFileInput = document.getElementById('imageFileInput');
        if (imageFileInput) {
            imageFileInput.addEventListener('change', (e) => this.handleImageUpload(e));
        }
        
        const audioFileInput = document.getElementById('audioFileInput');
        if (audioFileInput) {
            audioFileInput.addEventListener('change', (e) => this.handleAudioUpload(e));
        }
    }
    
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Audio context not supported:', error);
        }
    }
    
    async encodeText() {
        const textInput = document.getElementById('textInput');
        if (!textInput || !textInput.value.trim()) {
            this.showToast('Please enter some text to encode', 'error');
            return;
        }
        
        this.showLoading('Encoding text to audio...');
        
        try {
            const formData = new FormData();
            formData.append('mode', 'text');
            formData.append('text', textInput.value);
            formData.append('frequency_range', JSON.stringify({min: 800, max: 3000}));
            
            const response = await fetch('/api/encode', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.loadAudio(result.download_url);
                this.showToast('Text encoded successfully!', 'success');
            } else {
                this.showToast(result.error || 'Encoding failed', 'error');
            }
        } catch (error) {
            console.error('Encoding error:', error);
            this.showToast('Network error occurred', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async encodeImage() {
        const fileInput = document.getElementById('imageFileInput');
        const file = fileInput ? fileInput.files[0] : null;
        
        if (!file) {
            this.showToast('Please select an image file', 'error');
            return;
        }
        
        this.showLoading('Encoding image to audio...');
        
        try {
            const formData = new FormData();
            formData.append('mode', 'image');
            formData.append('file', file);
            
            const response = await fetch('/api/encode', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.loadAudio(result.download_url);
                this.showToast('Image encoded successfully!', 'success');
            } else {
                this.showToast(result.error || 'Encoding failed', 'error');
            }
        } catch (error) {
            console.error('Image encoding error:', error);
            this.showToast('Network error occurred', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async decodeAudio() {
        const fileInput = document.getElementById('audioFileInput');
        const file = fileInput ? fileInput.files[0] : null;
        
        if (!file) {
            this.showToast('Please select an audio file', 'error');
            return;
        }
        
        this.showLoading('Decoding audio...');
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('decode_mode', 'text');
            
            const response = await fetch('/api/decode', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                const resultDiv = document.getElementById('decodedResult');
                if (resultDiv) {
                    resultDiv.textContent = result.decoded_text || 'Decoded successfully';
                }
                this.showToast('Audio decoded successfully!', 'success');
            } else {
                this.showToast(result.error || 'Decoding failed', 'error');
            }
        } catch (error) {
            console.error('Audio decoding error:', error);
            this.showToast('Network error occurred', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async transcribeAudio() {
        const fileInput = document.getElementById('transcribeFileInput');
        const file = fileInput ? fileInput.files[0] : null;
        
        if (!file) {
            this.showToast('Please select an audio file', 'error');
            return;
        }
        
        this.showLoading('Transcribing audio...');
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                const resultDiv = document.getElementById('transcribeResult');
                if (resultDiv) {
                    resultDiv.textContent = result.transcript || 'Transcription completed';
                }
                this.showToast('Audio transcribed successfully!', 'success');
            } else {
                this.showToast(result.error || 'Transcription failed', 'error');
            }
        } catch (error) {
            console.error('Transcription error:', error);
            this.showToast('Network error occurred', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async visualizeAudio() {
        const fileInput = document.getElementById('visualizeFileInput');
        const file = fileInput ? fileInput.files[0] : null;
        
        if (!file) {
            this.showToast('Please select an audio file', 'error');
            return;
        }
        
        this.showLoading('Generating visualization...');
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/visualize', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.displayVisualization(result);
                this.showToast('Visualization generated successfully!', 'success');
            } else {
                this.showToast(result.error || 'Visualization failed', 'error');
            }
        } catch (error) {
            console.error('Visualization error:', error);
            this.showToast('Network error occurred', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    loadAudio(audioUrl) {
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) {
            audioPlayer.src = audioUrl;
            audioPlayer.style.display = 'block';
        }
        
        // Also create download link
        const downloadLink = document.getElementById('downloadLink');
        if (downloadLink) {
            downloadLink.href = audioUrl;
            downloadLink.style.display = 'inline-block';
        }
    }
    
    displayVisualization(data) {
        // Display waveform
        const waveformCanvas = document.getElementById('waveformCanvas');
        if (waveformCanvas && data.waveform) {
            this.drawWaveform(waveformCanvas, data.waveform);
        }
        
        // Display spectrum
        const spectrumCanvas = document.getElementById('spectrumCanvas');
        if (spectrumCanvas && data.spectrum) {
            this.drawSpectrum(spectrumCanvas, data.spectrum);
        }
    }
    
    drawWaveform(canvas, waveformData) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        const step = width / waveformData.amplitude.length;
        
        for (let i = 0; i < waveformData.amplitude.length; i++) {
            const x = i * step;
            const y = height / 2 + (waveformData.amplitude[i] * height / 4);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }
    
    drawSpectrum(canvas, spectrumData) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#28a745';
        
        const barWidth = width / spectrumData.magnitude.length;
        
        for (let i = 0; i < spectrumData.magnitude.length; i++) {
            const barHeight = (spectrumData.magnitude[i] / Math.max(...spectrumData.magnitude)) * height;
            const x = i * barWidth;
            const y = height - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        }
    }
    
    initializeAudio() {
        // Initialize audio context if needed
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not available:', error);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SonificationApp();
                this.showToast('Audio decoded successfully!', 'success');
            } else {
                this.showToast(result.error || 'Decoding failed', 'error');
            }
        } catch (error) {
            console.error('Decoding error:', error);
            this.showToast('Network error occurred', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                if (preview) {
                    preview.innerHTML = `<img src="${e.target.result}" class="img-fluid rounded" alt="Preview">`;
                }
            };
            reader.readAsDataURL(file);
        }
    }
    
    handleAudioUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            this.loadAudio(url);
        }
    }
    
    loadAudio(url) {
        const audioPlayer = document.getElementById('audioPlayer');
        if (audioPlayer) {
            audioPlayer.src = url;
            audioPlayer.style.display = 'block';
            this.currentFile = url;
        }
    }
    
    showLoading(message) {
        const loadingDiv = document.getElementById('loadingIndicator');
        if (loadingDiv) {
            loadingDiv.textContent = message;
            loadingDiv.style.display = 'block';
        }
    }
    
    hideLoading() {
        const loadingDiv = document.getElementById('loadingIndicator');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Set background color based on type
        switch (type) {
            case 'success':
                toast.style.backgroundColor = '#10b981';
                break;
            case 'error':
                toast.style.backgroundColor = '#ef4444';
                break;
            case 'warning':
                toast.style.backgroundColor = '#f59e0b';
                break;
            default:
                toast.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function setFrequencyPreset(min, max) {
    const minFreq = document.getElementById('minFreq');
    const maxFreq = document.getElementById('maxFreq');
    
    if (minFreq && maxFreq) {
        minFreq.value = min;
        maxFreq.value = max;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    new SonificationApp();
});