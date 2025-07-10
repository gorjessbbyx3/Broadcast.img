// Frequency Picker Class
class FrequencyPicker {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.frequencyRange = { min: 800, max: 3000 };
        this.selectedFrequencies = [];
        this.isDrawing = false;
        this.lastDrawTime = 0;
        
        this.setupEventListeners();
        this.draw();
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.addFrequency(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) {
                const now = Date.now();
                if (now - this.lastDrawTime > 50) { // Throttle to 20fps
                    this.addFrequency(e);
                    this.lastDrawTime = now;
                }
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
        });
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDrawing = true;
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.addFrequency(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
                this.addFrequency(mouseEvent);
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.isDrawing = false;
        });
        
        // Double-click to clear
        this.canvas.addEventListener('dblclick', () => {
            this.clearFrequencies();
        });
    }
    
    addFrequency(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert canvas coordinates to frequency and time
        const frequency = this.yToFrequency(y);
        const time = this.xToTime(x);
        
        // Add to selected frequencies
        this.selectedFrequencies.push({
            frequency: frequency,
            time: time,
            x: x,
            y: y
        });
        
        this.draw();
    }
    
    xToTime(x) {
        return (x / this.canvas.width) * 5; // 5 seconds max
    }
    
    yToFrequency(y) {
        const normalizedY = 1 - (y / this.canvas.height);
        return this.frequencyRange.min + normalizedY * (this.frequencyRange.max - this.frequencyRange.min);
    }
    
    frequencyToY(frequency) {
        const normalizedFreq = (frequency - this.frequencyRange.min) / (this.frequencyRange.max - this.frequencyRange.min);
        return this.canvas.height * (1 - normalizedFreq);
    }
    
    timeToX(time) {
        return (time / 5) * this.canvas.width;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw grid
        this.drawGrid();
        
        // Draw frequency lines
        this.drawFrequencyLines();
        
        // Draw selected frequencies
        this.drawSelectedFrequencies();
        
        // Draw labels
        this.drawLabels();
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.1)');
        gradient.addColorStop(1, 'rgba(240, 147, 251, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Horizontal lines (frequency)
        for (let i = 0; i <= 10; i++) {
            const y = (this.canvas.height / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Vertical lines (time)
        for (let i = 0; i <= 10; i++) {
            const x = (this.canvas.width / 10) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
    }
    
    drawFrequencyLines() {
        // Draw some reference frequency lines
        const referenceFreqs = [1000, 1500, 2000, 2500];
        
        this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        
        referenceFreqs.forEach(freq => {
            if (freq >= this.frequencyRange.min && freq <= this.frequencyRange.max) {
                const y = this.frequencyToY(freq);
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
        });
        
        this.ctx.setLineDash([]);
    }
    
    drawSelectedFrequencies() {
        if (this.selectedFrequencies.length === 0) return;
        
        // Draw connection lines
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.ctx.beginPath();
        
        // Sort by time for proper line drawing
        const sortedFreqs = [...this.selectedFrequencies].sort((a, b) => a.time - b.time);
        
        sortedFreqs.forEach((freq, index) => {
            if (index === 0) {
                this.ctx.moveTo(freq.x, freq.y);
            } else {
                this.ctx.lineTo(freq.x, freq.y);
            }
        });
        
        this.ctx.stroke();
        
        // Draw frequency points
        this.ctx.fillStyle = '#f093fb';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        this.selectedFrequencies.forEach(freq => {
            this.ctx.beginPath();
            this.ctx.arc(freq.x, freq.y, 6, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }
    
    drawLabels() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'left';
        
        // Frequency labels
        this.ctx.fillText(`${this.frequencyRange.max}Hz`, 10, 20);
        this.ctx.fillText(`${this.frequencyRange.min}Hz`, 10, this.canvas.height - 10);
        
        // Time labels
        this.ctx.textAlign = 'center';
        this.ctx.fillText('0s', 0, this.canvas.height - 10);
        this.ctx.fillText('5s', this.canvas.width, this.canvas.height - 10);
        
        // Instructions
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '14px Inter, sans-serif';
        
        if (this.selectedFrequencies.length === 0) {
            this.ctx.fillText('Click and drag to draw frequency patterns', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText('Double-click to clear', this.canvas.width / 2, this.canvas.height / 2 + 20);
        } else {
            this.ctx.fillText(`${this.selectedFrequencies.length} frequency points`, this.canvas.width / 2, 30);
        }
    }
    
    updateRange(newRange) {
        this.frequencyRange = newRange;
        this.draw();
    }
    
    clearFrequencies() {
        this.selectedFrequencies = [];
        this.draw();
    }
    
    getFrequencyData() {
        return this.selectedFrequencies.map(freq => ({
            frequency: freq.frequency,
            time: freq.time
        }));
    }
    
    exportPattern() {
        const data = {
            frequencyRange: this.frequencyRange,
            frequencies: this.getFrequencyData(),
            duration: 5
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'frequency-pattern.json';
        link.click();
        URL.revokeObjectURL(url);
    }
    
    importPattern(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.frequencyRange = data.frequencyRange;
            this.selectedFrequencies = data.frequencies.map(freq => ({
                frequency: freq.frequency,
                time: freq.time,
                x: this.timeToX(freq.time),
                y: this.frequencyToY(freq.frequency)
            }));
            this.draw();
        } catch (error) {
            console.error('Error importing pattern:', error);
        }
    }
    
    // Generate audio from selected frequencies
    async generateAudio() {
        if (this.selectedFrequencies.length === 0) {
            throw new Error('No frequencies selected');
        }
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const duration = 5; // 5 seconds
        const sampleRate = audioContext.sampleRate;
        const length = sampleRate * duration;
        
        // Create audio buffer
        const buffer = audioContext.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate audio data
        for (let i = 0; i < length; i++) {
            const time = i / sampleRate;
            let amplitude = 0;
            
            // Find the frequency at this time point
            const freq = this.interpolateFrequency(time);
            if (freq > 0) {
                amplitude = 0.3 * Math.sin(2 * Math.PI * freq * time);
            }
            
            data[i] = amplitude;
        }
        
        return buffer;
    }
    
    interpolateFrequency(time) {
        if (this.selectedFrequencies.length === 0) return 0;
        
        // Sort frequencies by time
        const sortedFreqs = [...this.selectedFrequencies].sort((a, b) => a.time - b.time);
        
        // Find the two closest time points
        let before = null;
        let after = null;
        
        for (let i = 0; i < sortedFreqs.length; i++) {
            if (sortedFreqs[i].time <= time) {
                before = sortedFreqs[i];
            }
            if (sortedFreqs[i].time >= time && !after) {
                after = sortedFreqs[i];
            }
        }
        
        if (!before && !after) return 0;
        if (!before) return after.frequency;
        if (!after) return before.frequency;
        if (before === after) return before.frequency;
        
        // Linear interpolation
        const ratio = (time - before.time) / (after.time - before.time);
        return before.frequency + ratio * (after.frequency - before.frequency);
    }
}

// Export for use in other scripts
window.FrequencyPicker = FrequencyPicker;
