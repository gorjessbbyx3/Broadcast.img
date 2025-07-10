# Sonification Studio

## Overview

Sonification Studio is a Flask-based web application that transforms text, images, and audio into sound frequencies and back. It features a premium interface with audio visualization, custom frequency controls, and AI-powered transcription capabilities using OpenAI's Whisper.

## User Preferences

Preferred communication style: Simple, everyday language.
Professional appearance: Remove competition references, maintain enterprise quality.
Code integrity: All components must have proper API endpoints and error handling.

## System Architecture

### Backend Architecture
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: SQLite by default (configurable via DATABASE_URL environment variable)
- **API Structure**: RESTful endpoints for encoding, decoding, and file operations
- **File Handling**: Configurable upload and temporary directories with 16MB file size limit

### Frontend Architecture
- **Template Engine**: Jinja2 templates with Bootstrap 5 for responsive design
- **JavaScript Libraries**: Chart.js for visualizations, Tone.js for audio processing
- **UI Components**: Glass-morphism design with dark/light theme support
- **Interactive Elements**: Drag-and-drop file uploads, real-time audio visualization

### Audio Processing Engine
- **Core Library**: Custom AudioProcessor class using NumPy and SciPy
- **Frequency Mapping**: Characters mapped to frequency range (800-3000 Hz by default)
- **Tone Generation**: Sine wave synthesis with exponential decay envelope
- **Sample Rate**: 44.1 kHz standard audio quality

## Key Components

### Models (models.py)
- **AudioFile**: Stores metadata for processed audio files including filename, type, encoding mode, duration, and sample rate
- **ProcessingJob**: Tracks async processing tasks with status, progress, and error handling

### Audio Processing (audio_processor.py)
- **Character-to-Frequency Mapping**: ASCII characters (32-126) mapped to configurable frequency range
- **Tone Generation**: Pure sine wave tones with anti-click envelopes
- **Encoding/Decoding**: Bidirectional text-to-audio conversion with peak detection

### Image Processing (image_processor.py)
- **Pixel-to-Frequency Conversion**: Grayscale image pixels mapped to audio frequencies
- **Image Optimization**: Automatic resizing to prevent excessively long audio files
- **Format Support**: PIL-based processing for multiple image formats

### OpenAI Integration (openai_service.py)
- **Whisper Transcription**: Audio-to-text conversion using OpenAI's Whisper API
- **GPT Analysis**: Content analysis using GPT-4o model
- **API Key Management**: Environment variable configuration for OpenAI services

### Web Interface (routes.py)
- **File Upload Handling**: Secure filename processing with extension validation
- **RESTful API**: JSON endpoints for encoding, decoding, and transcription
- **Session Management**: Flash messages and user feedback

## Data Flow

1. **Input Processing**: User uploads text, image, or audio files through web interface
2. **Format Validation**: Server validates file types and sizes
3. **Audio Encoding**: Text/images converted to frequency data using character/pixel mapping
4. **Tone Generation**: Frequencies converted to audio waveforms with proper envelopes
5. **File Storage**: Generated audio saved to temporary directory with database metadata
6. **Playback/Download**: Client can play audio in browser or download WAV files
7. **Decoding**: Reverse process extracts original data from audio using peak detection

## External Dependencies

### Required Python Packages
- **Flask + SQLAlchemy**: Web framework and ORM
- **NumPy + SciPy**: Scientific computing and signal processing
- **Pillow**: Image processing capabilities
- **SoundFile**: Audio file I/O operations
- **OpenAI**: API client for Whisper transcription and GPT analysis

### Frontend Dependencies
- **Bootstrap 5**: Responsive UI framework
- **Chart.js**: Audio visualization and waveform display
- **Tone.js**: Browser-based audio synthesis
- **Feather Icons**: Lightweight icon library

### Environment Variables
- **DATABASE_URL**: Database connection string (defaults to SQLite)
- **SESSION_SECRET**: Flask session encryption key
- **OPENAI_API_KEY**: Required for transcription and analysis features

## Deployment Strategy

### Local Development
- **Development Server**: Flask built-in server with debug mode
- **Hot Reload**: Automatic restart on file changes
- **SQLite Database**: File-based database for simple setup

### Production Considerations
- **WSGI Server**: Gunicorn or uWSGI recommended for production
- **Reverse Proxy**: Nginx for static file serving and load balancing
- **Database**: PostgreSQL or MySQL for production workloads
- **File Storage**: Consider cloud storage for uploaded files in scaled deployments
- **Environment**: All secrets managed via environment variables

### Container Deployment
- **Docker Ready**: Application structure supports containerization
- **Volume Mounts**: Upload and temp directories should be persistent volumes
- **Health Checks**: Database connectivity and file system access verification

The system is designed to be self-contained with minimal external dependencies, making it suitable for both local development and cloud deployment scenarios.