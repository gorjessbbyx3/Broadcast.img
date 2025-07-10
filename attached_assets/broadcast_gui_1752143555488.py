import tkinter as tk
from tkinter import filedialog, messagebox
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from broadcast_core import encode_to_sound, decode_from_sound
import sounddevice as sd
import soundfile as sf
import numpy as np
import whisper
import os

SAMPLE_RATE = 44100
DURATION = 5
model = whisper.load_model("base")

class BroadcastGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("AI Broadcast Sonification")
        self.root.geometry("700x700")

        self.text_input = tk.Text(root, height=5, width=60)
        self.text_input.pack(pady=10)

        self.btn_frame = tk.Frame(root)
        self.btn_frame.pack()

        tk.Button(self.btn_frame, text="Encode & Save", command=self.encode).grid(row=0, column=0, padx=10)
        tk.Button(self.btn_frame, text="Load WAV & Decode", command=self.decode).grid(row=0, column=1, padx=10)
        tk.Button(self.btn_frame, text="Mic Record & Decode", command=self.record_and_decode).grid(row=0, column=2, padx=10)
        tk.Button(self.btn_frame, text="Upload Text File to Encode", command=self.upload_and_encode).grid(row=1, column=0, columnspan=3, pady=10)
        tk.Button(self.btn_frame, text="Transcribe Speech to Text", command=self.transcribe_audio).grid(row=2, column=0, columnspan=3, pady=10)

        self.output_label = tk.Label(root, text="", wraplength=650, justify="left")
        self.output_label.pack(pady=10)

        self.fig, (self.ax1, self.ax2) = plt.subplots(2, 1, figsize=(7, 4))
        self.canvas = FigureCanvasTkAgg(self.fig, master=root)
        self.canvas.get_tk_widget().pack()

    def encode(self):
        text = self.text_input.get("1.0", tk.END).strip()
        if not text:
            messagebox.showerror("Error", "Please enter some text.")
            return
        file = filedialog.asksaveasfilename(defaultextension=".wav")
        if file:
            encode_to_sound(text, file)
            messagebox.showinfo("Success", f"Audio saved to {file}")

    def decode(self):
        file = filedialog.askopenfilename(filetypes=[("WAV Files", "*.wav")])
        if file:
            self.visualize_audio(file)
            message = decode_from_sound(file)
            self.output_label.config(text=f"Decoded: {message}")

    def record_and_decode(self):
        messagebox.showinfo("Recording", "Recording from microphone for 5 seconds...")
        audio = sd.rec(int(DURATION * SAMPLE_RATE), samplerate=SAMPLE_RATE, channels=1, dtype='int16')
        sd.wait()
        file = "mic_broadcast.wav"
        sf.write(file, audio, SAMPLE_RATE)
        self.visualize_audio(file)
        message = decode_from_sound(file)
        self.output_label.config(text=f"Decoded from Mic: {message}")

    def upload_and_encode(self):
        filepath = filedialog.askopenfilename(filetypes=[("Text Files", "*.txt")])
        if not filepath:
            return
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read().strip()
            output_path = filedialog.asksaveasfilename(defaultextension=".wav")
            if output_path:
                encode_to_sound(content, output_path)
                messagebox.showinfo("Success", f"Encoded audio saved to {output_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to read file: {str(e)}")

    def transcribe_audio(self):
        file = filedialog.askopenfilename(filetypes=[("WAV Files", "*.wav")])
        if not file:
            return
        try:
            result = model.transcribe(file)
            transcript = result.get("text", "<No transcription available>")
            self.output_label.config(text=f"Transcription: {transcript}")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to transcribe: {str(e)}")

    def visualize_audio(self, filepath):
        data, samplerate = sf.read(filepath)
        if len(data.shape) > 1:
            data = data[:, 0]
        time = np.linspace(0, len(data) / samplerate, num=len(data))
        self.ax1.clear()
        self.ax1.plot(time, data, color='blue')
        self.ax1.set_title("Waveform")

        yf = np.abs(np.fft.fft(data))
        xf = np.fft.fftfreq(len(data), 1 / samplerate)
        mask = xf >= 0
        self.ax2.clear()
        self.ax2.plot(xf[mask], yf[mask], color='green')
        self.ax2.set_title("Frequency Spectrum")
        self.fig.tight_layout()
        self.canvas.draw()

if __name__ == "__main__":
    root = tk.Tk()
    app = BroadcastGUI(root)
    root.mainloop()
