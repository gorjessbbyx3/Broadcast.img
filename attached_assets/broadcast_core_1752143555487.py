import numpy as np
from scipy.io.wavfile import write, read
from scipy.signal import find_peaks

SAMPLE_RATE = 44100
DURATION = 0.08

def char_to_freq(char):
    return 800 + (ord(char) * 10)

def freq_to_char(freq):
    return chr(round((freq - 800) / 10))

def generate_tone(freq, duration=DURATION):
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)
    return (0.5 * np.iinfo(np.int16).max * np.sin(2 * np.pi * freq * t)).astype(np.int16)

def encode_to_sound(text, filename="broadcast.wav"):
    audio = np.concatenate([generate_tone(char_to_freq(c)) for c in text])
    write(filename, SAMPLE_RATE, audio)
    print(f"[✓] Broadcast-ready sound saved to {filename}")

def decode_from_sound(filename="broadcast.wav"):
    sr, data = read(filename)
    if len(data.shape) > 1:
        data = data[:, 0]

    chunk_size = int(SAMPLE_RATE * DURATION)
    decoded = ""
    for i in range(0, len(data), chunk_size):
        chunk = data[i:i + chunk_size]
        if len(chunk) < chunk_size: break

        yf = np.abs(np.fft.fft(chunk))
        xf = np.fft.fftfreq(len(chunk), 1 / sr)
        xf = xf[xf >= 0]
        yf = yf[:len(xf)]

        peaks, _ = find_peaks(yf, height=np.max(yf) * 0.5)
        if len(peaks):
            dom_freq = xf[peaks[np.argmax(yf[peaks])]]
            decoded += freq_to_char(dom_freq)
        else:
            decoded += "?"

    print(f"[✓] Decoded Message: {decoded}")
    return decoded
