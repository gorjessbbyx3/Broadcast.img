import argparse
from broadcast_core import encode_to_sound, decode_from_sound

try:
    import whisper
    model = whisper.load_model("base")
except ImportError:
    model = None

def main():
    parser = argparse.ArgumentParser(description="Broadcast AI Sound CLI")
    subparsers = parser.add_subparsers(dest="action", required=True)

    # Encode
    encode_parser = subparsers.add_parser("encode", help="Encode text into sound")
    encode_parser.add_argument("-i", "--input", required=True, help="Input text string or path to .txt file")
    encode_parser.add_argument("-o", "--output", default="broadcast.wav", help="Output WAV file")

    # Decode
    decode_parser = subparsers.add_parser("decode", help="Decode sound into text")
    decode_parser.add_argument("-i", "--input", required=True, help="Input WAV file")
    decode_parser.add_argument("-o", "--output", help="Optional output text file")

    # Transcribe
    transcribe_parser = subparsers.add_parser("transcribe", help="Transcribe speech from a WAV file")
    transcribe_parser.add_argument("-i", "--input", required=True, help="Input WAV file with speech")

    args = parser.parse_args()

    if args.action == "encode":
        if args.input.lower().endswith(".txt"):
            with open(args.input, "r", encoding="utf-8") as f:
                text = f.read()
        else:
            text = args.input
        encode_to_sound(text, args.output)

    elif args.action == "decode":
        result = decode_from_sound(args.input)
        print("[✓] Message:", result)
        if args.output:
            with open(args.output, 'w', encoding="utf-8") as f:
                f.write(result)
            print(f"[✓] Saved to {args.output}")

    elif args.action == "transcribe":
        if not model:
            print("[!] Whisper is not installed. Install with: pip install openai-whisper")
            return
        print("[…] Transcribing using Whisper...")
        result = model.transcribe(args.input)
        print("[✓] Transcript:", result.get("text", "<No transcription>"))

if __name__ == "__main__":
    main()
