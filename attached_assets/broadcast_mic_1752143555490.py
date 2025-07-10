import sounddevice as sd
import soundfile as sf
from broadcast_core import decode_from_sound

SAMPLE_RATE = 44100
DURATION = 5  # seconds

def record_and_decode():
    print("[*] Recording from microphone for 5 seconds...")
    audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16')
    sd.wait()
    temp_wav = "mic_input.wav"
    sf.write(temp_wav, audio, SAMPLE_RATE)
    print(f"[✓] Saved to {temp_wav}")
    print("[*] Decoding audio...")
    decode_from_sound(temp_wav)

if __name__ == "__main__":
    record_and_decode()
