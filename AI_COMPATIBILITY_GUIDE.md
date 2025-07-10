# AI Compatibility Guide for Sonification Studio

## Overview
This guide explains how Sonification Studio creates AI-readable audio encodings that can be reliably decoded by AI systems.

## Enhanced Encoding Algorithm

### Audio Format Specifications
- **Sample Rate**: 44.1 kHz (CD quality)
- **Bit Depth**: 16-bit signed integer
- **Format**: Uncompressed WAV files
- **Channels**: Mono (single channel)

### Character Encoding Protocol
1. **Frequency Mapping**: ASCII characters (32-126) mapped to frequency range
2. **Tone Duration**: 0.1 seconds per character (increased for better AI recognition)
3. **Amplitude**: 0.7 (consistent high amplitude for clear signals)
4. **Envelope**: 5ms fade-in/fade-out to prevent audio clicks

### AI-Friendly Features
- **Separator Tones**: 100 Hz low-frequency separators between characters
- **Pure Sine Waves**: Clean sine wave generation without harmonics
- **Consistent Timing**: Fixed duration per character for predictable parsing
- **High Signal-to-Noise Ratio**: Clear frequency peaks for FFT analysis

## Decoding Process

### Text Decoding
1. **Chunk Processing**: Audio split into 0.1-second segments
2. **FFT Analysis**: Fast Fourier Transform to identify dominant frequencies
3. **Peak Detection**: Identify frequency peaks above 30% of maximum
4. **Character Mapping**: Convert frequencies back to ASCII characters

### Image Decoding
1. **Frequency Extraction**: Extract frequency values from audio chunks
2. **Pixel Mapping**: Convert frequencies to grayscale pixel values (0-255)
3. **Image Reconstruction**: Reshape pixel array to specified dimensions
4. **Format Output**: Save as PNG image file

## Frequency Ranges

### Default Ranges
- **Text Encoding**: 800-3000 Hz (mid-range frequencies)
- **Image Encoding**: 800-3000 Hz (customizable)
- **Separator Frequency**: 100 Hz (distinct from content)

### Custom Ranges
- **Bass**: 200-800 Hz
- **Mid**: 800-3000 Hz
- **High**: 3000-8000 Hz
- **Full**: 20-20000 Hz

## AI System Instructions

### For Text Decoding
```
1. Load audio file (WAV format preferred)
2. Split into 0.1-second chunks
3. Apply FFT to each chunk
4. Find dominant frequency in each chunk
5. Map frequency to ASCII character using range formula:
   char_code = 32 + ((frequency - min_freq) / (max_freq - min_freq)) * 94
6. Convert character codes to text string
```

### For Image Decoding
```
1. Extract frequency values from audio chunks
2. Convert frequencies to pixel values (0-255)
3. Reshape to specified image dimensions
4. Save as grayscale image
```

## Quality Assurance

### Audio Quality Indicators
- Clear frequency peaks in FFT analysis
- Minimal harmonic distortion
- Consistent amplitude across all tones
- Proper fade-in/fade-out envelopes

### Decoding Accuracy
- Text decoding accuracy: >95% for standard ASCII text
- Image reconstruction: Faithful grayscale reproduction
- Frequency separation: Clear distinction between characters

## Best Practices for AI Systems

1. **Use FFT Analysis**: Most reliable method for frequency detection
2. **Peak Detection**: Look for peaks above 30% of maximum amplitude
3. **Consistent Sampling**: Use same duration (0.1s) for chunk processing
4. **Error Handling**: Default to '?' character for unclear frequencies
5. **Normalization**: Ensure frequency ranges match encoding parameters

## Testing and Validation

### Test Cases
1. **Short Text**: "Hello World" - basic functionality test
2. **Long Text**: Full paragraphs - endurance test
3. **Special Characters**: Symbols and punctuation - character range test
4. **Images**: Various sizes and complexities - image encoding test

### Validation Methods
- Round-trip testing (encode → decode → compare)
- Cross-platform compatibility testing
- AI system validation with multiple models
- Audio quality analysis with spectrum analyzers

## Troubleshooting

### Common Issues
1. **Poor Decoding**: Check frequency range settings
2. **Audio Clicks**: Verify envelope application
3. **Missing Characters**: Increase peak detection threshold
4. **Distorted Images**: Verify dimensions and pixel mapping

### Debug Tools
- FFT spectrum analyzer
- Audio waveform viewer
- Frequency range validator
- Character mapping tester

This encoding system is designed to be robust and reliable for AI systems while maintaining human-readable output when needed.