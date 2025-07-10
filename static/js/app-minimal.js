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