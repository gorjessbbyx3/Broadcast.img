import numpy as np
import soundfile as sf
from scipy.io.wavfile import write, read
from scipy.signal import find_peaks
import logging
import os

logger = logging.getLogger(__name__)

class AudioProcessor:
    def __init__(self):
        self.sample_rate = 44100
        self.duration = 0.1  # Duration per character in seconds (increased for better AI recognition)
        self.base_frequency = 800  # Base frequency for encoding
        self.separator_freq = 100  # Separator frequency between characters
        self.separator_duration = 0.02  # Short silence between characters
        
        # Enhanced encoding parameters for AI compatibility
        self.amplitude = 0.7  # Higher amplitude for clearer signals
        self.fade_samples = int(self.sample_rate * 0.005)  # 5ms fade to prevent clicks
        
    def char_to_freq(self, char, frequency_range=None):
        """Convert character to frequency within specified range"""
        if frequency_range is None:
            frequency_range = {'min': 800, 'max': 3000}
        
        # Map character to frequency range
        char_code = ord(char)
        # ASCII printable characters range from 32 to 126
        normalized = (char_code - 32) / (126 - 32)
        frequency = frequency_range['min'] + normalized * (frequency_range['max'] - frequency_range['min'])
        return frequency
    
    def freq_to_char(self, freq, frequency_range=None):
        """Convert frequency back to character"""
        if frequency_range is None:
            frequency_range = {'min': 800, 'max': 3000}
        
        # Map frequency back to character
        normalized = (freq - frequency_range['min']) / (frequency_range['max'] - frequency_range['min'])
        char_code = int(32 + normalized * (126 - 32))
        char_code = max(32, min(126, char_code))  # Clamp to valid range
        return chr(char_code)
    
    def generate_tone(self, frequency, duration=None):
        """Generate a sine wave tone at specified frequency with enhanced AI compatibility"""
        if duration is None:
            duration = self.duration
        
        samples = int(self.sample_rate * duration)
        t = np.linspace(0, duration, samples, endpoint=False)
        
        # Generate pure sine wave for better AI recognition
        tone = np.sin(2 * np.pi * frequency * t)
        
        # Enhanced envelope with proper fade-in/fade-out
        envelope = np.ones(samples)
        
        # Apply fading to prevent clicks and improve AI detection
        if self.fade_samples > 0:
            fade_in = np.linspace(0, 1, self.fade_samples)
            fade_out = np.linspace(1, 0, self.fade_samples)
            envelope[:self.fade_samples] = fade_in
            envelope[-self.fade_samples:] = fade_out
        
        # Apply envelope with consistent amplitude
        tone = tone * envelope * self.amplitude
        
        return (tone * 32767).astype(np.int16)
    
    def generate_separator(self):
        """Generate a separator tone between characters for better AI parsing"""
        samples = int(self.sample_rate * self.separator_duration)
        # Use low frequency separator that's easy for AI to distinguish
        t = np.linspace(0, self.separator_duration, samples, endpoint=False)
        separator = np.sin(2 * np.pi * self.separator_freq * t) * 0.3
        return (separator * 32767).astype(np.int16)
    
    def encode_text_to_audio(self, text, output_file, frequency_range=None):
        """Encode text string to audio file with AI-friendly format"""
        try:
            if not text:
                return False
            
            # Generate audio for each character with separators
            audio_segments = []
            separator = self.generate_separator()
            
            for i, char in enumerate(text):
                freq = self.char_to_freq(char, frequency_range)
                tone = self.generate_tone(freq)
                audio_segments.append(tone)
                
                # Add separator between characters (except last one)
                if i < len(text) - 1:
                    audio_segments.append(separator)
            
            # Concatenate all segments
            audio_data = np.concatenate(audio_segments)
            
            # Normalize audio to prevent clipping
            audio_data = audio_data / np.max(np.abs(audio_data)) * 0.8
            
            # Save as WAV file
            sf.write(output_file, audio_data, self.sample_rate)
            
            logger.info(f"Successfully encoded text to audio: {output_file}")
            return True
            
        except Exception as e:
            logger.error(f"Error encoding text to audio: {str(e)}")
            return False
    
    def decode_audio_to_text(self, audio_file, frequency_range=None):
        """Decode audio file back to text"""
        try:
            # Read audio file
            audio_data, sample_rate = sf.read(audio_file)
            
            # Handle stereo audio
            if len(audio_data.shape) > 1:
                audio_data = audio_data[:, 0]
            
            # Calculate chunk size based on duration
            chunk_size = int(sample_rate * self.duration)
            decoded_text = ""
            
            # Process each chunk
            for i in range(0, len(audio_data), chunk_size):
                chunk = audio_data[i:i + chunk_size]
                if len(chunk) < chunk_size // 2:  # Skip incomplete chunks
                    break
                
                # Perform FFT to find dominant frequency
                fft_data = np.abs(np.fft.fft(chunk))
                frequencies = np.fft.fftfreq(len(chunk), 1 / sample_rate)
                
                # Only consider positive frequencies
                positive_freq_mask = frequencies >= 0
                fft_data = fft_data[positive_freq_mask]
                frequencies = frequencies[positive_freq_mask]
                
                # Find peaks in the frequency spectrum
                peaks, _ = find_peaks(fft_data, height=np.max(fft_data) * 0.3)
                
                if len(peaks) > 0:
                    # Get the dominant frequency
                    dominant_freq = frequencies[peaks[np.argmax(fft_data[peaks])]]
                    char = self.freq_to_char(dominant_freq, frequency_range)
                    decoded_text += char
                else:
                    decoded_text += "?"
            
            logger.info(f"Successfully decoded audio to text: {decoded_text}")
            return decoded_text
            
        except Exception as e:
            logger.error(f"Error decoding audio to text: {str(e)}")
            return None
    
    def decode_audio_to_frequencies(self, audio_file):
        """Decode audio file to frequency data for image reconstruction"""
        try:
            # Read audio file
            audio_data, sample_rate = sf.read(audio_file)
            
            # Handle stereo audio
            if len(audio_data.shape) > 1:
                audio_data = audio_data[:, 0]
            
            # Calculate chunk size based on duration
            chunk_size = int(sample_rate * self.duration)
            frequencies = []
            
            # Process each chunk
            for i in range(0, len(audio_data), chunk_size):
                chunk = audio_data[i:i + chunk_size]
                if len(chunk) < chunk_size // 2:  # Skip incomplete chunks
                    break
                
                # Perform FFT to find dominant frequency
                fft_data = np.abs(np.fft.fft(chunk))
                freq_bins = np.fft.fftfreq(len(chunk), 1 / sample_rate)
                
                # Only consider positive frequencies
                positive_freq_mask = freq_bins >= 0
                fft_data = fft_data[positive_freq_mask]
                freq_bins = freq_bins[positive_freq_mask]
                
                # Find peaks in the frequency spectrum
                peaks, _ = find_peaks(fft_data, height=np.max(fft_data) * 0.3)
                
                if len(peaks) > 0:
                    # Get the dominant frequency
                    dominant_freq = freq_bins[peaks[np.argmax(fft_data[peaks])]]
                    frequencies.append(dominant_freq)
                else:
                    frequencies.append(0)  # Default frequency for silence
            
            logger.info(f"Successfully decoded {len(frequencies)} frequency values from audio")
            return frequencies
            
        except Exception as e:
            logger.error(f"Error decoding audio to frequencies: {str(e)}")
            return []
    
    def encode_frequencies_to_audio(self, frequency_data, output_file):
        """Encode frequency data to audio file"""
        try:
            audio_segments = []
            for freq in frequency_data:
                tone = self.generate_tone(freq)
                audio_segments.append(tone)
            
            # Concatenate all segments
            audio_data = np.concatenate(audio_segments)
            
            # Save as WAV file
            sf.write(output_file, audio_data, self.sample_rate)
            
            logger.info(f"Successfully encoded frequencies to audio: {output_file}")
            return True
            
        except Exception as e:
            logger.error(f"Error encoding frequencies to audio: {str(e)}")
            return False
    
    def get_visualization_data(self, audio_file):
        """Get waveform and spectrum data for visualization"""
        try:
            # Read audio file
            audio_data, sample_rate = sf.read(audio_file)
            
            # Handle stereo audio
            if len(audio_data.shape) > 1:
                audio_data = audio_data[:, 0]
            
            # Calculate time axis
            duration = len(audio_data) / sample_rate
            time_axis = np.linspace(0, duration, len(audio_data))
            
            # Downsample for visualization if needed
            max_points = 2000
            if len(audio_data) > max_points:
                step = len(audio_data) // max_points
                audio_data = audio_data[::step]
                time_axis = time_axis[::step]
            
            # Calculate frequency spectrum
            fft_data = np.abs(np.fft.fft(audio_data))
            frequencies = np.fft.fftfreq(len(audio_data), 1 / sample_rate)
            
            # Only keep positive frequencies
            positive_freq_mask = frequencies >= 0
            fft_data = fft_data[positive_freq_mask]
            frequencies = frequencies[positive_freq_mask]
            
            # Limit frequency range for visualization
            freq_mask = frequencies <= 5000  # Show up to 5kHz
            fft_data = fft_data[freq_mask]
            frequencies = frequencies[freq_mask]
            
            return {
                'waveform': {
                    'time': time_axis.tolist(),
                    'amplitude': audio_data.tolist()
                },
                'spectrum': {
                    'frequency': frequencies.tolist(),
                    'magnitude': fft_data.tolist()
                },
                'sample_rate': sample_rate,
                'duration': duration
            }
            
        except Exception as e:
            logger.error(f"Error generating visualization data: {str(e)}")
            return None
