import argparse
from broadcast_core import encode_to_sound, decode_from_sound
import whisper
import os

model = whisper.load_model("base")

def transcribe(file):
    print(f"[~] Transcribing {file}...")
    result = model.transcribe(file)
    print("[✓] Transcript:")
    print(result["text"])
    return result["text"]

def main():
    parser = argparse.ArgumentParser(description="Broadcast AI Sound CLI")
    parser.add_argument("action", choices=["encode", "decode", "transcribe"], help="Choose an action")
    parser.add_argument("-i", "--input", required=True, help="Input text, WAV file, or audio for transcription")
    parser.add_argument("-o", "--output", help="Output file (WAV for encode, TXT for others)")

    args = parser.parse_args()

    if args.action == "encode":
        output_file = args.output if args.output else "broadcast.wav"
        encode_to_sound(args.input, output_file)

    elif args.action == "decode":
        result = decode_from_sound(args.input)
        print("[✓] Message:", result)
        if args.output:
            with open(args.output, 'w', encoding="utf-8") as f:
                f.write(result)
            print(f"[✓] Saved to {args.output}")

    elif args.action == "transcribe":
        transcript = transcribe(args.input)
        if args.output:
            with open(args.output, 'w', encoding="utf-8") as f:
                f.write(transcript)
            print(f"[✓] Transcript saved to {args.output}")

if __name__ == "__main__":
    main()
