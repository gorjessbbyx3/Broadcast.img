// Global variables
let isProcessing = false;
let currentAudioUrl = null;

// Notification system
function showNotification(message, type = 'info', duration = 3000) {
    const toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) return;

    const toast = document.getElementById('toast');
    const toastBody = toast.querySelector('.toast-body');

    toastBody.textContent = message;
    toast.className = `toast text-bg-${type}`;

    const toastBootstrap = new bootstrap.Toast(toast);
    toastBootstrap.show();

    setTimeout(() => {
        toastBootstrap.hide();
    }, duration);
}

// Event listeners setup
function setupEventListeners() {
    // Generate buttons (both hero and workspace)
    const generateBtn = document.getElementById('generateBtn');
    const workspaceGenerateBtn = document.getElementById('workspaceGenerateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerate);
    }
    if (workspaceGenerateBtn) {
        workspaceGenerateBtn.addEventListener('click', handleGenerate);
    }

    // Decode button
    const decodeBtn = document.getElementById('decodeBtn');
    if (decodeBtn) {
        decodeBtn.addEventListener('click', decodeAudio);
    }

    // Input mode radio buttons
    const inputModes = document.querySelectorAll('input[name="inputMode"]');
    inputModes.forEach(radio => {
        radio.addEventListener('change', handleInputModeChange);
    });

    // Text input character counter
    const textInput = document.getElementById('textInput');
    if (textInput) {
        textInput.addEventListener('input', updateCharCount);
    }

    // Frequency inputs
    const minFreq = document.getElementById('minFreq');
    const maxFreq = document.getElementById('maxFreq');
    if (minFreq) minFreq.addEventListener('change', validateFrequency);
    if (maxFreq) maxFreq.addEventListener('change', validateFrequency);
}

// File upload handlers
function setupFileUploads() {
    // Image upload
    const imageUploadZone = document.getElementById('imageUploadZone');
    const imageFileInput = document.getElementById('imageFileInput');

    if (imageUploadZone && imageFileInput) {
        imageUploadZone.addEventListener('click', () => imageFileInput.click());
        imageUploadZone.addEventListener('dragover', handleDragOver);
        imageUploadZone.addEventListener('drop', handleImageDrop);
        imageFileInput.addEventListener('change', handleImageSelect);
    }

    // Audio upload
    const audioUploadZone = document.getElementById('audioUploadZone');
    const audioFileInput = document.getElementById('audioFileInput');

    if (audioUploadZone && audioFileInput) {
        audioUploadZone.addEventListener('click', () => audioFileInput.click());
        audioUploadZone.addEventListener('dragover', handleDragOver);
        audioUploadZone.addEventListener('drop', handleAudioDrop);
        audioFileInput.addEventListener('change', handleAudioSelect);
    }
}

// Input mode handling
function handleInputModeChange(event) {
    const textSection = document.getElementById('textInputSection');
    const imageSection = document.getElementById('imageInputSection');

    if (event.target.value === 'text') {
        textSection.style.display = 'block';
        imageSection.style.display = 'none';
    } else {
        textSection.style.display = 'none';
        imageSection.style.display = 'block';
    }
}

// Character count update
function updateCharCount() {
    const textInput = document.getElementById('textInput');
    const charCount = document.getElementById('charCount');
    if (textInput && charCount) {
        charCount.textContent = textInput.value.length;
    }
}

// Frequency validation
function validateFrequency() {
    const minFreq = parseInt(document.getElementById('minFreq').value);
    const maxFreq = parseInt(document.getElementById('maxFreq').value);

    if (minFreq >= maxFreq) {
        showNotification('⚠️ Min frequency must be less than max frequency', 'warning');
        document.getElementById('minFreq').value = 800;
        document.getElementById('maxFreq').value = 3000;
    }
}

// Frequency presets
function setFrequencyRange(min, max) {
    const minFreq = document.getElementById('minFreq');
    const maxFreq = document.getElementById('maxFreq');

    if (minFreq) minFreq.value = min;
    if (maxFreq) maxFreq.value = max;

    showNotification(`🎵 Frequency set: ${min}-${max}Hz`, 'info', 2000);
}

// Drag and drop handlers
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

function handleImageDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            handleImageFile(file);
        } else {
            showNotification('❌ Please upload a valid image file', 'error');
        }
    }
}

function handleAudioDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('audio/')) {
            handleAudioFile(file);
        } else {
            showNotification('❌ Please upload a valid audio file', 'error');
        }
    }
}

function handleImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleImageFile(file);
    }
}

function handleAudioSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleAudioFile(file);
    }
}

function handleImageFile(file) {
    const preview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const imageInfo = document.getElementById('imageInfo');

    if (preview && previewImg && imageInfo) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            imageInfo.textContent = `${file.name} (${(file.size/1024).toFixed(1)} KB)`;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    showNotification('📷 Image uploaded successfully', 'success', 2000);
}

function handleAudioFile(file) {
    const decodeBtn = document.getElementById('decodeBtn');
    if (decodeBtn) {
        decodeBtn.disabled = false;
    }
    showNotification('🎵 Audio file ready for decoding', 'success', 2000);
}

// Main generation handler
function handleGenerate() {
    const inputMode = document.querySelector('input[name="inputMode"]:checked').value;

    if (inputMode === 'text') {
        encodeText();
    } else {
        encodeImage();
    }
}

// Encoding functions
function encodeText() {
    const textInput = document.getElementById('textInput');
    if (!textInput || !textInput.value.trim()) {
        showNotification('❌ Please enter some text', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('text', textInput.value);
    formData.append('min_freq', document.getElementById('minFreq')?.value || '800');
    formData.append('max_freq', document.getElementById('maxFreq')?.value || '3000');

    makeAudioRequest('/encode_text', formData, 'Text encoding');
}

function encodeImage() {
    const fileInput = document.getElementById('imageFileInput');
    if (!fileInput || !fileInput.files[0]) {
        showNotification('❌ Please select an image', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('image', fileInput.files[0]);
    formData.append('min_freq', document.getElementById('minFreq')?.value || '800');
    formData.append('max_freq', document.getElementById('maxFreq')?.value || '3000');

    makeAudioRequest('/encode_image', formData, 'Image encoding');
}

function decodeAudio() {
    const fileInput = document.getElementById('audioFileInput');
    if (!fileInput || !fileInput.files[0]) {
        showNotification('❌ Please select an audio file', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('audio', fileInput.files[0]);

    makeDecodeRequest('/decode_audio', formData, 'Audio decoding');
}

// Request handling
function makeAudioRequest(url, formData, operation) {
    if (isProcessing) return;

    isProcessing = true;
    const heroBtn = document.getElementById('generateBtn');
    const workspaceBtn = document.getElementById('workspaceGenerateBtn');
    
    const heroOriginalText = heroBtn ? heroBtn.innerHTML : '';
    const workspaceOriginalText = workspaceBtn ? workspaceBtn.innerHTML : '';

    // Update both buttons to processing state
    if (heroBtn) {
        heroBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing...';
        heroBtn.disabled = true;
    }
    if (workspaceBtn) {
        workspaceBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing...';
        workspaceBtn.disabled = true;
    }

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadAudioPlayer(data.audio_url);
            showNotification(`✅ ${operation} successful!`, 'success');
        } else {
            showNotification(`❌ ${data.error || operation + ' failed'}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification(`❌ ${operation} failed`, 'error');
    })
    .finally(() => {
        // Restore both buttons to original state
        if (heroBtn) {
            heroBtn.innerHTML = heroOriginalText;
            heroBtn.disabled = false;
        }
        if (workspaceBtn) {
            workspaceBtn.innerHTML = workspaceOriginalText;
            workspaceBtn.disabled = false;
        }
        isProcessing = false;
    });
}

function makeDecodeRequest(url, formData, operation) {
    if (isProcessing) return;

    isProcessing = true;
    const btn = document.getElementById('decodeBtn');
    const originalText = btn.innerHTML;

    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Processing...';
    btn.disabled = true;

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayResult(data.decoded_text || data.result);
            showNotification(`✅ ${operation} successful!`, 'success');
        } else {
            showNotification(`❌ ${data.error || operation + ' failed'}`, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification(`❌ ${operation} failed`, 'error');
    })
    .finally(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        isProcessing = false;
    });
}

// Audio player functions
function loadAudioPlayer(audioUrl) {
    const resultSection = document.getElementById('encodingResult');
    const player = document.getElementById('audioPlayer');
    const placeholder = document.getElementById('audioPlaceholder');
    const controls = document.getElementById('audioControls');

    if (resultSection) resultSection.style.display = 'block';
    if (player) {
        player.src = audioUrl;
        player.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (controls) controls.style.display = 'block';

    currentAudioUrl = audioUrl;
}

function downloadAudio() {
    if (currentAudioUrl) {
        const a = document.createElement('a');
        a.href = currentAudioUrl;
        a.download = 'generated_audio.wav';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showNotification('📥 Download started', 'info', 2000);
    } else {
        showNotification('❌ No audio to download', 'warning');
    }
}

function clearAudio() {
    const player = document.getElementById('audioPlayer');
    const placeholder = document.getElementById('audioPlaceholder');
    const controls = document.getElementById('audioControls');

    if (player) {
        player.src = '';
        player.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'block';
    if (controls) controls.style.display = 'none';

    currentAudioUrl = null;
    showNotification('🧹 Audio cleared', 'info', 2000);
}

function displayResult(result) {
    const container = document.getElementById('resultContainer');
    const decodedResults = document.getElementById('decodedResults');

    if (container && decodedResults) {
        container.innerHTML = `<div class="text-result p-3 bg-dark rounded">${result}</div>`;
        decodedResults.style.display = 'block';
    }
}

// Workspace functions
function resetWorkspace() {
    document.getElementById('textInput').value = '';
    document.getElementById('imageFileInput').value = '';
    document.getElementById('audioFileInput').value = '';
    updateCharCount();
    clearAudio();

    const imagePreview = document.getElementById('imagePreview');
    const decodedResults = document.getElementById('decodedResults');
    const encodingResult = document.getElementById('encodingResult');

    if (imagePreview) imagePreview.style.display = 'none';
    if (decodedResults) decodedResults.style.display = 'none';
    if (encodingResult) encodingResult.style.display = 'none';

    showNotification('🧹 Workspace reset', 'info', 2000);
}

function clearAllInputs() {
    resetWorkspace();
}

function downloadLastFile() {
    downloadAudio();
}

function showSettings() {
    showNotification('⚙️ Settings panel coming soon', 'info');
}

function showHelp() {
    showNotification('❓ Help documentation available in the docs', 'info');
}

// Real-time visualizations
function initializeVisualizations() {
    const waveformCanvas = document.getElementById('realtimeWaveform');
    const spectrumCanvas = document.getElementById('spectrumAnalyzer');

    if (waveformCanvas) {
        const ctx = waveformCanvas.getContext('2d');
        drawWaveform(ctx, waveformCanvas.width, waveformCanvas.height);
    }

    if (spectrumCanvas) {
        const ctx = spectrumCanvas.getContext('2d');
        drawSpectrum(ctx, spectrumCanvas.width, spectrumCanvas.height);
    }
}

function drawWaveform(ctx, width, height) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#00ff41';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let x = 0; x < width; x++) {
        const y = height / 2 + Math.sin(x * 0.1 + Date.now() * 0.01) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }

    ctx.stroke();
}

function drawSpectrum(ctx, width, height) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00ff41';

    for (let i = 0; i < 50; i++) {
        const barHeight = Math.random() * height * 0.8;
        const x = (i / 50) * width;
        const barWidth = width / 50 - 1;

        ctx.fillRect(x, height - barHeight, barWidth, barHeight);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();

    // Setup event listeners
    setupEventListeners();
    setupFileUploads();

    // Initialize visualizations
    initializeVisualizations();
    setInterval(initializeVisualizations, 100);

    showNotification('🎵 Sonification Studio Ready', 'success', 3000);
});