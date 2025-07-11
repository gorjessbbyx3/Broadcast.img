// Sonification Studio - Minimal Application JavaScript
// Fixed to avoid class syntax errors

// Global variables
let currentAudioUrl = null;
let isProcessing = false;

// Notification system
function showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, duration);
}

// Scroll to section function
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Frequency preset function
function setFrequencyPreset(min, max) {
    const minFreq = document.getElementById('minFreq');
    const maxFreq = document.getElementById('maxFreq');
    const minDisplay = document.getElementById('minFreqDisplay');
    const maxDisplay = document.getElementById('maxFreqDisplay');

    if (minFreq) minFreq.value = min;
    if (maxFreq) maxFreq.value = max;
    if (minDisplay) minDisplay.textContent = min + ' Hz';
    if (maxDisplay) maxDisplay.textContent = max + ' Hz';

    showNotification(`🎵 Frequency set: ${min}-${max}Hz`, 'info', 2000);
}

// File upload handlers
function handleTextFileUpload(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const textInput = document.getElementById('textInput');
        if (textInput) {
            textInput.value = e.target.result;
            showNotification('📝 Text file loaded', 'success', 2000);
        }
    };
    reader.readAsText(file);
}

function handleImageFileUpload(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showNotification('❌ Please select a valid image file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImg');
        const btn = document.getElementById('encodeImageBtn');

        if (img) img.src = e.target.result;
        if (preview) preview.style.display = 'block';
        if (btn) btn.disabled = false;

        showNotification('🖼️ Image loaded', 'success', 2000);
    };
    reader.readAsDataURL(file);
}

// Audio processing functions
function encodeText() {
    const textInput = document.getElementById('textInput');
    if (!textInput || !textInput.value.trim()) {
        showNotification('❌ Please enter some text', 'warning');
        return;
    }

    const formData = new FormData();
    formData.append('text', textInput.value.trim());
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
    const fileInput = document.getElementById('audioUpload');
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
    const btn = event.target;
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
        btn.innerHTML = originalText;
        btn.disabled = false;
        isProcessing = false;
    });
}

function makeDecodeRequest(url, formData, operation) {
    if (isProcessing) return;

    isProcessing = true;
    const btn = event.target;
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
    const player = document.getElementById('audioPlayer');
    const placeholder = document.getElementById('audioPlaceholder');
    const controls = document.getElementById('audioControls');

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
    if (container) {
        container.innerHTML = `<div class="text-result">${result}</div>`;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    feather.replace();

    // Setup event listeners
    setupEventListeners();
    setupFileUploads();
    setupFrequencyControls();

    showNotification('🎵 Sonification Studio ready!', 'info', 3000);
});

function setupEventListeners() {
    // Text encoding button
    const encodeTextBtn = document.getElementById('encodeTextBtn');
    if (encodeTextBtn) {
        encodeTextBtn.addEventListener('click', encodeText);
    }

    // Image encoding button
    const encodeImageBtn = document.getElementById('encodeImageBtn');
    if (encodeImageBtn) {
        encodeImageBtn.addEventListener('click', encodeImage);
    }

    // Decode button
    const decodeBtn = document.getElementById('decodeBtn');
    if (decodeBtn) {
        decodeBtn.addEventListener('click', decodeAudio);
    }

    // Audio control buttons
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadAudio);
    }

    const clearAudioBtn = document.getElementById('clearAudioBtn');
    if (clearAudioBtn) {
        clearAudioBtn.addEventListener('click', clearAudio);
    }
}

function setupFileUploads() {
    // Text file input
    const textFileInput = document.getElementById('textFileInput');
    if (textFileInput) {
        textFileInput.addEventListener('change', function(e) {
            handleTextFileUpload(e.target.files[0]);
        });
    }

    // Image upload zone
    const imageUploadZone = document.getElementById('imageUploadZone');
    const imageFileInput = document.getElementById('imageFileInput');

    if (imageUploadZone && imageFileInput) {
        imageUploadZone.addEventListener('click', function() {
            imageFileInput.click();
        });

        imageFileInput.addEventListener('change', function(e) {
            handleImageFileUpload(e.target.files[0]);
        });

        // Drag and drop for image upload
        imageUploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            imageUploadZone.classList.add('dragover');
        });

        imageUploadZone.addEventListener('dragleave', function() {
            imageUploadZone.classList.remove('dragover');
        });

        imageUploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            imageUploadZone.classList.remove('dragover');
            handleImageFileUpload(e.dataTransfer.files[0]);
        });
    }
}

function setupFrequencyControls() {
    const minFreq = document.getElementById('minFreq');
    const maxFreq = document.getElementById('maxFreq');
    const minDisplay = document.getElementById('minFreqDisplay');
    const maxDisplay = document.getElementById('maxFreqDisplay');

    if (minFreq && minDisplay) {
        minFreq.addEventListener('input', function(e) {
            minDisplay.textContent = e.target.value + ' Hz';
        });
    }

    if (maxFreq && maxDisplay) {
        maxFreq.addEventListener('input', function(e) {
            maxDisplay.textContent = e.target.value + ' Hz';
        });
    }
}