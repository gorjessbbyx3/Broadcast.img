// Main application JavaScript
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
                this.showEncodingPanel(this.currentMode);
            });
        });
        
        // Text encoding
        document.getElementById('encodeTextBtn').addEventListener('click', () => {
            this.encodeText();
        });
        
        // Image encoding
        document.getElementById('encodeImageBtn').addEventListener('click', () => {
            this.encodeImage();
        });
        
        // Audio decoding
        document.getElementById('decodeAudioBtn').addEventListener('click', () => {
            this.decodeAudio();
        });
        
        // Transcription
        document.getElementById('transcribeBtn').addEventListener('click', () => {
            this.transcribeAudio();
        });
        
        // Recording controls
        document.getElementById('recordBtn').addEventListener('click', () => {
            this.startRecording();
        });
        
        document.getElementById('stopRecordBtn').addEventListener('click', () => {
            this.stopRecording();
        });
        
        // File inputs
        document.getElementById('textFileInput').addEventListener('change', (e) => {
            this.handleTextFileUpload(e);
        });
        
        document.getElementById('imageFileInput').addEventListener('change', (e) => {
            this.handleImageFileUpload(e);
        });
        
        document.getElementById('audioFileInput').addEventListener('change', (e) => {
            this.handleAudioFileUpload(e);
        });
        
        // Audio controls
        document.getElementById('downloadBtn').addEventListener('click', () => {
            this.downloadAudio();
        });
        
        document.getElementById('clearAudioBtn').addEventListener('click', () => {
            this.clearAudio();
        });
        
        // Frequency controls - sliders and inputs
        document.getElementById('minFreq').addEventListener('input', (e) => {
            document.getElementById('minFreqRange').value = e.target.value;
            this.updateFrequencyRange();
        });
        
        document.getElementById('maxFreq').addEventListener('input', (e) => {
            document.getElementById('maxFreqRange').value = e.target.value;
            this.updateFrequencyRange();
        });
        
        document.getElementById('minFreqRange').addEventListener('input', (e) => {
            document.getElementById('minFreq').value = e.target.value;
            this.updateFrequencyRange();
        });
        
        document.getElementById('maxFreqRange').addEventListener('input', (e) => {
            document.getElementById('maxFreq').value = e.target.value;
            this.updateFrequencyRange();
        });
        
        // Custom frequency generation
        document.getElementById('generateCustomBtn').addEventListener('click', () => {
            this.generateCustomFrequency();
        });
    }
    
    setupDragAndDrop() {
        // Image upload area
        const imageUploadArea = document.getElementById('imageUploadArea');
        const imageFileInput = document.getElementById('imageFileInput');
        
        imageUploadArea.addEventListener('click', () => {
            imageFileInput.click();
        });
        
        imageUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            imageUploadArea.classList.add('dragover');
        });
        
        imageUploadArea.addEventListener('dragleave', () => {
            imageUploadArea.classList.remove('dragover');
        });
        
        imageUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            imageUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleImageDrop(files[0]);
            }
        });
        
        // Audio upload area
        const audioUploadArea = document.getElementById('audioUploadArea');
        const audioFileInput = document.getElementById('audioFileInput');
        
        audioUploadArea.addEventListener('click', () => {
            audioFileInput.click();
        });
        
        audioUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            audioUploadArea.classList.add('dragover');
        });
        
        audioUploadArea.addEventListener('dragleave', () => {
            audioUploadArea.classList.remove('dragover');
        });
        
        audioUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            audioUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleAudioDrop(files[0]);
            }
        });
    }
    
    initializeAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Audio context not supported:', error);
            this.showToast('Audio not supported in this browser', 'error');
        }
    }
    
    setupHeroAnimation() {
        // Create professional animated visual elements without canvas
        this.createFloatingElements();
        this.initializeParticleSystem();
    }
    
    createFloatingElements() {
        const heroSection = document.querySelector('.enterprise-header');
        if (!heroSection) return;
        
        // Create floating geometric shapes
        for (let i = 0; i < 8; i++) {
            const shape = document.createElement('div');
            shape.className = 'floating-shape';
            shape.style.cssText = `
                position: absolute;
                width: ${Math.random() * 80 + 20}px;
                height: ${Math.random() * 80 + 20}px;
                background: linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                border-radius: ${Math.random() > 0.5 ? '50%' : '8px'};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 5}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                pointer-events: none;
                z-index: 1;
            `;
            heroSection.appendChild(shape);
        }
    }
    
    initializeParticleSystem() {
        // Create DOM-based particle system
        const container = document.querySelector('.enterprise-header .container');
        if (!container) return;
        
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 2;
        `;
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                animation: particleFloat ${Math.random() * 20 + 10}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
                left: ${Math.random() * 100}%;
                top: 100%;
            `;
            particleContainer.appendChild(particle);
        }
        
        container.style.position = 'relative';
        container.appendChild(particleContainer);
    }
    
    showEncodingPanel(mode) {
        // Hide all panels
        document.getElementById('textInputPanel').style.display = 'none';
        document.getElementById('imageInputPanel').style.display = 'none';
        document.getElementById('customFrequencyPanel').style.display = 'none';
        
        // Show selected panel
        switch (mode) {
            case 'text':
                document.getElementById('textInputPanel').style.display = 'block';
                break;
            case 'image':
                document.getElementById('imageInputPanel').style.display = 'block';
                break;
            case 'custom':
                document.getElementById('customFrequencyPanel').style.display = 'block';
                if (!this.frequencyPicker) {
                    this.frequencyPicker = new FrequencyPicker('frequencyPicker');
                }
                break;
        }
    }
    
    async encodeText() {
        const textInput = document.getElementById('textInput').value.trim();
        
        if (!textInput) {
            this.showToast('Please enter some text to encode', 'error');
            return;
        }
        
        this.showLoading('Encoding text to audio...');
        
        try {
            const formData = new FormData();
            formData.append('mode', 'text');
            formData.append('text', textInput);
            formData.append('frequency_range', JSON.stringify(this.getFrequencyRange()));
            
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
        const file = fileInput.files[0];
        
        if (!file) {
            this.showToast('Please select an image file', 'error');
            return;
        }
        
        this.showLoading('Encoding image to audio...');
        
        try {
            const formData = new FormData();
            formData.append('mode', 'image');
            formData.append('file', file);
            formData.append('frequency_range', JSON.stringify(this.getFrequencyRange()));
            
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
        const file = fileInput.files[0];
        
        if (!file) {
            this.showToast('Please select an audio file', 'error');
            return;
        }
        
        this.showLoading('Decoding audio file...');
        
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
                if (result.type === 'text') {
                    document.getElementById('decodedResult').textContent = result.decoded_text;
                    this.showToast('Audio decoded successfully!', 'success');
                } else if (result.type === 'image') {
                    document.getElementById('decodedResult').innerHTML = `<img src="${result.image_url}" class="img-fluid" alt="Decoded image">`;
                    this.showToast('Image decoded successfully!', 'success');
                }
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
    
    async transcribeAudio() {
        const fileInput = document.getElementById('audioFileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            this.showToast('Please select an audio file', 'error');
            return;
        }
        
        this.showLoading('Transcribing audio with AI...');
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('transcriptionResult').textContent = result.transcription;
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
    
    async generateCustomFrequency() {
        if (!this.frequencyPicker) {
            this.showToast('Please select custom frequency mode first', 'error');
            return;
        }
        
        const frequencyData = this.frequencyPicker.getFrequencyData();
        
        if (frequencyData.length === 0) {
            this.showToast('Please add some frequency points', 'error');
            return;
        }
        
        this.showLoading('Generating custom frequency audio...');
        
        try {
            const response = await fetch('/api/generate-custom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    frequency_data: frequencyData
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.loadAudio(result.download_url);
                this.showToast('Custom frequency audio generated!', 'success');
            } else {
                this.showToast(result.error || 'Generation failed', 'error');
            }
        } catch (error) {
            console.error('Custom generation error:', error);
            this.showToast('Network error occurred', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    // Audio recording functions
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recorder = new MediaRecorder(stream);
            this.recordedChunks = [];
            
            this.recorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            });
            
            this.recorder.start();
            this.isRecording = true;
            
            document.getElementById('recordBtn').style.display = 'none';
            document.getElementById('stopRecordBtn').style.display = 'inline-block';
            
            this.showToast('Recording started', 'info');
        } catch (error) {
            console.error('Recording error:', error);
            this.showToast('Could not start recording', 'error');
        }
    }
    
    stopRecording() {
        if (this.recorder && this.isRecording) {
            this.recorder.stop();
            this.isRecording = false;
            
            document.getElementById('recordBtn').style.display = 'inline-block';
            document.getElementById('stopRecordBtn').style.display = 'none';
            
            this.recorder.addEventListener('stop', () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/wav' });
                const url = URL.createObjectURL(blob);
                this.loadAudio(url);
                this.showToast('Recording complete', 'success');
            });
        }
    }
    
    // File handling functions
    handleTextFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('textInput').value = e.target.result;
                this.showToast('Text file loaded', 'success');
            };
            reader.readAsText(file);
        } else {
            this.showToast('Please select a text file', 'error');
        }
    }
    
    handleImageFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                preview.innerHTML = `<img src="${e.target.result}" class="img-fluid rounded" alt="Preview">`;
                this.showToast('Image file loaded', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            this.showToast('Please select an image file', 'error');
        }
    }
    
    handleAudioFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type.startsWith('audio/')) {
            const url = URL.createObjectURL(file);
            this.loadAudio(url);
            this.showToast('Audio file loaded', 'success');
        } else {
            this.showToast('Please select an audio file', 'error');
        }
    }
    
    handleAudioDrop(file) {
        if (file.type === 'audio/wav') {
            const url = URL.createObjectURL(file);
            this.loadAudio(url);
            this.showToast('Audio file loaded', 'success');
        } else {
            this.showToast('Please drop a WAV audio file', 'error');
        }
    }
    
    // Audio playback functions
    loadAudio(url) {
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = url;
        audioPlayer.style.display = 'block';
        
        // Enable audio controls
        document.getElementById('audioControls').style.display = 'block';
        
        // Initialize visualizer if not already done
        if (!this.audioVisualizer) {
            this.audioVisualizer = new AudioVisualizer();
        }
        
        // Setup real-time visualization
        this.audioVisualizer.setupRealTimeVisualization(audioPlayer, 'realtimeVisualization');
        
        this.currentFile = url;
    }
    
    downloadAudio() {
        if (this.currentFile) {
            const a = document.createElement('a');
            a.href = this.currentFile;
            a.download = 'sonified_audio.wav';
            a.click();
        } else {
            this.showToast('No audio file to download', 'error');
        }
    }
    
    clearAudio() {
        const audioPlayer = document.getElementById('audioPlayer');
        audioPlayer.src = '';
        audioPlayer.style.display = 'none';
        
        document.getElementById('audioControls').style.display = 'none';
        document.getElementById('realtimeVisualization').innerHTML = '';
        
        this.currentFile = null;
        this.showToast('Audio cleared', 'info');
    }
    
    // Utility functions
    getFrequencyRange() {
        return {
            min: parseInt(document.getElementById('minFreq').value) || 800,
            max: parseInt(document.getElementById('maxFreq').value) || 3000
        };
    }
    
    updateFrequencyRange() {
        const minFreq = document.getElementById('minFreq').value;
        const maxFreq = document.getElementById('maxFreq').value;
        
        // Update frequency picker if exists
        if (this.frequencyPicker) {
            this.frequencyPicker.updateRange({ min: minFreq, max: maxFreq });
        }
        
        // Update preset buttons
        document.querySelectorAll('.freq-preset').forEach(btn => {
            btn.classList.remove('active');
        });
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
        // Create toast element
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
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

// Global functions for inline event handlers
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
    
    // Update preset buttons
    document.querySelectorAll('.freq-preset').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function initializeApp() {
    // Initialize the app when DOM is loaded
    const app = new SonificationApp();
    return app;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);
            
            const result = await response.json();
            
            if (result.success) {
                if (result.type === 'image') {
                    this.showImageOutput('Decoded Image', result.image_url, result.width, result.height);
                } else {
                    this.showOutput('Decoded Text', result.decoded_text);
                }
                this.showToast(`Audio decoded to ${result.type} successfully!`, 'success');
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
    
    async transcribeAudio() {
        const fileInput = document.getElementById('audioFileInput');
        const file = fileInput.files[0];
        
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
                this.showOutput('Transcription', result.transcript);
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
    
    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.recorder = new MediaRecorder(stream);
            
            const chunks = [];
            this.recorder.ondataavailable = (event) => {
                chunks.push(event.data);
            };
            
            this.recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                this.handleRecordedAudio(blob);
            };
            
            this.recorder.start();
            this.isRecording = true;
            
            // Update UI
            document.getElementById('recordBtn').disabled = true;
            document.getElementById('stopRecordBtn').disabled = false;
            document.getElementById('recordingStatus').style.display = 'block';
            
            this.showToast('Recording started', 'info');
        } catch (error) {
            console.error('Recording error:', error);
            this.showToast('Failed to start recording', 'error');
        }
    }
    
    stopRecording() {
        if (this.recorder && this.isRecording) {
            this.recorder.stop();
            this.isRecording = false;
            
            // Update UI
            document.getElementById('recordBtn').disabled = false;
            document.getElementById('stopRecordBtn').disabled = true;
            document.getElementById('recordingStatus').style.display = 'none';
            
            this.showToast('Recording stopped', 'info');
        }
    }
    
    handleRecordedAudio(blob) {
        // Create a temporary file input to simulate file upload
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        
        // Set the file to the audio file input
        const audioFileInput = document.getElementById('audioFileInput');
        const dt = new DataTransfer();
        dt.items.add(file);
        audioFileInput.files = dt.files;
        
        // Enable decode buttons
        document.getElementById('decodeAudioBtn').disabled = false;
        document.getElementById('transcribeBtn').disabled = false;
        
        this.showToast('Recording ready for processing', 'success');
    }
    
    handleTextFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('textInput').value = e.target.result;
                this.showToast('Text file loaded successfully', 'success');
            };
            reader.readAsText(file);
        }
    }
    
    handleImageFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleImageDrop(file);
        }
    }
    
    handleImageDrop(file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('imagePreview');
                const previewImage = document.getElementById('previewImage');
                
                previewImage.src = e.target.result;
                preview.style.display = 'block';
                
                document.getElementById('encodeImageBtn').disabled = false;
                this.showToast('Image loaded successfully', 'success');
            };
            reader.readAsDataURL(file);
        } else {
            this.showToast('Please select a valid image file', 'error');
        }
    }
    
    handleAudioFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleAudioDrop(file);
        }
    }
    
    handleAudioDrop(file) {
        if (file.type === 'audio/wav') {
            document.getElementById('decodeAudioBtn').disabled = false;
            document.getElementById('transcribeBtn').disabled = false;
            this.showToast('Audio file loaded successfully', 'success');
        } else {
            this.showToast('Please select a valid WAV audio file', 'error');
        }
    }
    
    loadAudio(url) {
        const audioPlayer = document.getElementById('audioPlayer');
        const audioPlaceholder = document.getElementById('audioPlaceholder');
        const audioControls = document.getElementById('audioControls');
        
        audioPlayer.src = url;
        audioPlayer.style.display = 'block';
        audioPlaceholder.style.display = 'none';
        audioControls.style.display = 'block';
        
        this.currentFile = url;
        
        // Load audio visualization
        this.loadAudioVisualization(url);
    }
    
    async loadAudioVisualization(url) {
        try {
            const formData = new FormData();
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], 'audio.wav', { type: 'audio/wav' });
            
            formData.append('file', file);
            
            const vizResponse = await fetch('/api/visualize', {
                method: 'POST',
                body: formData
            });
            
            const result = await vizResponse.json();
            
            if (result.success) {
                this.updateVisualization(result);
            }
        } catch (error) {
            console.error('Visualization error:', error);
        }
    }
    
    updateVisualization(data) {
        if (!this.audioVisualizer) {
            this.audioVisualizer = new AudioVisualizer();
        }
        
        this.audioVisualizer.drawWaveform('waveformCanvas', data.waveform);
        this.audioVisualizer.drawSpectrum('spectrumCanvas', data.spectrum);
    }
    
    downloadAudio() {
        if (this.currentFile) {
            const link = document.createElement('a');
            link.href = this.currentFile;
            link.download = 'sonification.wav';
            link.click();
        }
    }
    
    clearAudio() {
        const audioPlayer = document.getElementById('audioPlayer');
        const audioPlaceholder = document.getElementById('audioPlaceholder');
        const audioControls = document.getElementById('audioControls');
        
        audioPlayer.src = '';
        audioPlayer.style.display = 'none';
        audioPlaceholder.style.display = 'block';
        audioControls.style.display = 'none';
        
        this.currentFile = null;
        
        // Clear visualizations
        this.clearVisualization();
    }
    
    clearVisualization() {
        const waveformCanvas = document.getElementById('waveformCanvas');
        const spectrumCanvas = document.getElementById('spectrumCanvas');
        
        const waveformCtx = waveformCanvas.getContext('2d');
        const spectrumCtx = spectrumCanvas.getContext('2d');
        
        waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
        spectrumCtx.clearRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
    }
    
    showOutput(title, content) {
        const outputContainer = document.getElementById('outputContainer');
        outputContainer.innerHTML = `
            <div class="output-result">
                <h6 class="fw-bold mb-2">${title}</h6>
                <div class="output-content p-3 bg-light rounded">
                    <pre class="mb-0">${content}</pre>
                </div>
                <div class="mt-3">
                    <button class="btn btn-sm btn-outline-primary" onclick="navigator.clipboard.writeText('${content}')">
                        <i data-feather="copy" class="me-1"></i>
                        Copy
                    </button>
                </div>
            </div>
        `;
        
        // Re-initialize feather icons
        feather.replace();
    }
    
    showImageOutput(title, imageUrl, width, height) {
        const outputContainer = document.getElementById('outputContainer');
        outputContainer.innerHTML = `
            <div class="output-result">
                <h6 class="fw-bold mb-2">${title}</h6>
                <div class="output-content p-3 bg-light rounded text-center">
                    <img src="${imageUrl}" alt="Decoded Image" class="img-fluid mb-3" style="max-width: 300px; border: 1px solid #dee2e6;">
                    <div class="text-muted small">
                        Dimensions: ${width} × ${height} pixels
                    </div>
                </div>
                <div class="mt-3">
                    <a href="${imageUrl}" download="decoded_image.png" class="btn btn-sm btn-outline-primary me-2">
                        <i data-feather="download" class="me-1"></i>
                        Download Image
                    </a>
                    <button class="btn btn-sm btn-outline-primary" onclick="navigator.clipboard.writeText('${imageUrl}')">
                        <i data-feather="copy" class="me-1"></i>
                        Copy URL
                    </button>
                </div>
            </div>
        `;
        
        // Re-initialize feather icons
        feather.replace();
    }
    
    getFrequencyRange() {
        const minFreq = parseInt(document.getElementById('minFreq').value) || 800;
        const maxFreq = parseInt(document.getElementById('maxFreq').value) || 3000;
        return { min: minFreq, max: maxFreq };
    }
    
    updateFrequencyRange() {
        if (this.frequencyPicker) {
            this.frequencyPicker.updateRange(this.getFrequencyRange());
        }
    }
    
    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loading-overlay');
        overlay.querySelector('.loading-spinner h5').textContent = message;
        overlay.style.display = 'flex';
    }
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = 'none';
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastBody = toast.querySelector('.toast-body');
        const toastIcon = toast.querySelector('[data-feather]');
        
        toastBody.textContent = message;
        
        // Update icon based on type
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        
        toastIcon.setAttribute('data-feather', icons[type] || 'info');
        feather.replace();
        
        // Update toast colors
        toast.className = `toast show bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'primary'} text-white`;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
    
    async generateCustomFrequency() {
        if (!this.frequencyPicker) {
            this.showToast('Please select custom mode first', 'warning');
            return;
        }
        
        const frequencyData = this.frequencyPicker.getFrequencyData();
        if (frequencyData.length === 0) {
            this.showToast('Please draw frequency patterns first', 'warning');
            return;
        }
        
        this.showLoading('Generating custom frequency audio...');
        
        try {
            // Generate audio from frequency picker data
            const audioBuffer = await this.frequencyPicker.generateAudio();
            
            // Convert audio buffer to WAV and upload
            const blob = await this.audioBufferToBlob(audioBuffer);
            const formData = new FormData();
            formData.append('frequencies', JSON.stringify(frequencyData));
            formData.append('frequency_range', JSON.stringify(this.getFrequencyRange()));
            
            const response = await fetch('/api/generate-custom', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.loadAudio(result.download_url);
                this.showToast('Custom frequency audio generated!', 'success');
            } else {
                this.showToast(result.error || 'Custom generation failed', 'error');
            }
        } catch (error) {
            console.error('Custom generation error:', error);
            this.showToast('Custom generation failed', 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    async audioBufferToBlob(audioBuffer) {
        const offlineContext = new OfflineAudioContext(
            audioBuffer.numberOfChannels,
            audioBuffer.length,
            audioBuffer.sampleRate
        );
        
        const source = offlineContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();
        
        const renderedBuffer = await offlineContext.startRendering();
        
        // Convert to WAV blob
        const arrayBuffer = this.audioBufferToWav(renderedBuffer);
        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }
    
    audioBufferToWav(buffer) {
        const length = buffer.length;
        const arrayBuffer = new ArrayBuffer(44 + length * 2);
        const view = new DataView(arrayBuffer);
        const channels = buffer.numberOfChannels;
        const sampleRate = buffer.sampleRate;
        
        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };
        
        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * 2, true);
        
        // Audio data
        const channelData = buffer.getChannelData(0);
        let offset = 44;
        for (let i = 0; i < length; i++) {
            const sample = Math.max(-1, Math.min(1, channelData[i]));
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
        
        return arrayBuffer;
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
    if (window.app && window.app.frequencyPicker) {
        window.app.updateFrequencyRange();
    }
    
    // Show toast
    if (window.app) {
        window.app.showToast(`Frequency range set to ${min}-${max} Hz`, 'info');
    }
}

function initializeApp() {
    window.sonificationApp = new SonificationApp();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
