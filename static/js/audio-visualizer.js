// Audio Visualization Class
class AudioVisualizer {
    constructor() {
        this.colors = {
            waveform: '#667eea',
            spectrum: '#f093fb',
            background: 'rgba(255, 255, 255, 0.1)',
            grid: 'rgba(255, 255, 255, 0.2)'
        };
    }
    
    drawWaveform(canvasId, waveformData) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set up styling
        ctx.strokeStyle = this.colors.waveform;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        
        // Draw background
        this.drawBackground(ctx, canvas.width, canvas.height);
        
        // Draw grid
        this.drawGrid(ctx, canvas.width, canvas.height);
        
        // Draw waveform
        if (waveformData && waveformData.amplitude && waveformData.amplitude.length > 0) {
            this.drawWaveformPath(ctx, waveformData.amplitude, canvas.width, canvas.height);
        }
        
        // Draw labels
        this.drawWaveformLabels(ctx, canvas.width, canvas.height);
    }
    
    drawSpectrum(canvasId, spectrumData) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        this.drawBackground(ctx, canvas.width, canvas.height);
        
        // Draw grid
        this.drawGrid(ctx, canvas.width, canvas.height);
        
        // Draw spectrum
        if (spectrumData && spectrumData.frequency && spectrumData.magnitude) {
            this.drawSpectrumBars(ctx, spectrumData, canvas.width, canvas.height);
        }
        
        // Draw labels
        this.drawSpectrumLabels(ctx, canvas.width, canvas.height);
    }
    
    drawBackground(ctx, width, height) {
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, width, height);
    }
    
    drawGrid(ctx, width, height) {
        ctx.strokeStyle = this.colors.grid;
        ctx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Vertical lines
        for (let i = 0; i <= 8; i++) {
            const x = (width / 8) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }
    
    drawWaveformPath(ctx, amplitudeData, width, height) {
        const centerY = height / 2;
        const maxAmplitude = Math.max(...amplitudeData.map(Math.abs));
        
        ctx.beginPath();
        ctx.strokeStyle = this.colors.waveform;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < amplitudeData.length; i++) {
            const x = (i / amplitudeData.length) * width;
            const y = centerY - (amplitudeData[i] / maxAmplitude) * (height / 2 - 20);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
    }
    
    drawSpectrumBars(ctx, spectrumData, width, height) {
        const frequencies = spectrumData.frequency;
        const magnitudes = spectrumData.magnitude;
        
        if (frequencies.length === 0 || magnitudes.length === 0) return;
        
        const maxMagnitude = Math.max(...magnitudes);
        const barWidth = width / frequencies.length;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#f093fb');
        
        ctx.fillStyle = gradient;
        
        for (let i = 0; i < frequencies.length; i++) {
            const barHeight = (magnitudes[i] / maxMagnitude) * (height - 20);
            const x = i * barWidth;
            const y = height - barHeight;
            
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
    }
    
    drawWaveformLabels(ctx, width, height) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        
        // Time labels
        ctx.fillText('Time', 10, height - 10);
        ctx.fillText('Amplitude', 10, 20);
    }
    
    drawSpectrumLabels(ctx, width, height) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        
        // Frequency labels
        ctx.fillText('Frequency (Hz)', 10, height - 10);
        ctx.fillText('Magnitude', 10, 20);
    }
    
    // Real-time audio visualization
    setupRealTimeVisualization(audioElement, canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        
        // Create audio context and analyzer
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audioElement);
        const analyzer = audioContext.createAnalyser();
        
        // Configure analyzer
        analyzer.fftSize = 2048;
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Connect audio nodes
        source.connect(analyzer);
        analyzer.connect(audioContext.destination);
        
        // Animation loop
        const animate = () => {
            analyzer.getByteFrequencyData(dataArray);
            
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw background
            this.drawBackground(ctx, canvas.width, canvas.height);
            
            // Draw real-time spectrum
            this.drawRealTimeSpectrum(ctx, dataArray, canvas.width, canvas.height);
            
            requestAnimationFrame(animate);
        };
        
        // Start animation when audio plays
        audioElement.addEventListener('play', () => {
            audioContext.resume().then(() => {
                animate();
            });
        });
    }
    
    drawRealTimeSpectrum(ctx, dataArray, width, height) {
        const barWidth = width / dataArray.length;
        
        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
        
        ctx.fillStyle = gradient;
        
        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * height;
            const x = i * barWidth;
            const y = height - barHeight;
            
            ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
    }
    
    // Export visualization as image
    exportVisualization(canvasId, filename = 'visualization.png') {
        const canvas = document.getElementById(canvasId);
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL();
        link.click();
    }
    
    // Update colors based on theme
    updateColors(theme) {
        if (theme === 'dark') {
            this.colors = {
                waveform: '#667eea',
                spectrum: '#f093fb',
                background: 'rgba(15, 20, 25, 0.8)',
                grid: 'rgba(255, 255, 255, 0.1)'
            };
        } else {
            this.colors = {
                waveform: '#667eea',
                spectrum: '#f093fb',
                background: 'rgba(255, 255, 255, 0.1)',
                grid: 'rgba(255, 255, 255, 0.2)'
            };
        }
    }
}

// Initialize real-time visualization when audio player is ready
document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audioPlayer');
    const visualizer = new AudioVisualizer();
    
    if (audioPlayer) {
        // Setup real-time visualization
        audioPlayer.addEventListener('loadedmetadata', () => {
            visualizer.setupRealTimeVisualization(audioPlayer, 'spectrumCanvas');
        });
        
        // Update colors when theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    const theme = document.documentElement.getAttribute('data-theme');
                    visualizer.updateColors(theme);
                }
            });
        });
        
        observer.observe(document.documentElement, { attributes: true });
    }
});
