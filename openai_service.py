import os
import logging
import requests
import json
import subprocess
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

def transcribe_audio_file(audio_file_path):
    """Transcribe audio file using Replit AI or local processing"""
    try:
        if not os.path.exists(audio_file_path):
            logger.error(f"Audio file not found: {audio_file_path}")
            return None
        
        # Try using Replit AI first
        transcript = transcribe_with_replit_ai(audio_file_path)
        
        if transcript:
            logger.info(f"Successfully transcribed audio file using Replit AI: {audio_file_path}")
            return transcript
        
        # Fallback to local processing
        transcript = transcribe_with_local_processing(audio_file_path)
        
        if transcript:
            logger.info(f"Successfully transcribed audio file using local processing: {audio_file_path}")
            return transcript
        
        return "Transcription service unavailable. Please try again later."
        
    except Exception as e:
        logger.error(f"Error transcribing audio file: {str(e)}")
        return f"Transcription failed: {str(e)}"

def transcribe_with_replit_ai(audio_file_path):
    """Transcribe using Replit AI capabilities"""
    try:
        # Check if we can use Replit's AI API
        replit_api_url = os.environ.get("REPLIT_API_URL")
        replit_token = os.environ.get("REPLIT_TOKEN")
        
        if not replit_api_url or not replit_token:
            logger.info("Replit AI API not configured, skipping")
            return None
        
        # Prepare the request
        headers = {
            "Authorization": f"Bearer {replit_token}",
            "Content-Type": "multipart/form-data"
        }
        
        with open(audio_file_path, "rb") as audio_file:
            files = {"audio": audio_file}
            data = {"task": "transcribe"}
            
            response = requests.post(
                f"{replit_api_url}/ai/audio/transcribe",
                headers=headers,
                files=files,
                data=data,
                timeout=30
            )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("transcript", "")
        else:
            logger.warning(f"Replit AI API returned status {response.status_code}")
            return None
            
    except Exception as e:
        logger.warning(f"Replit AI transcription failed: {str(e)}")
        return None

def transcribe_with_local_processing(audio_file_path):
    """Transcribe using local speech recognition"""
    try:
        # Try to use system speech recognition
        import speech_recognition as sr
        
        r = sr.Recognizer()
        
        # Convert WAV to the format expected by speech_recognition
        with sr.AudioFile(audio_file_path) as source:
            audio = r.record(source)
        
        # Try different recognition engines
        try:
            # Try Google Speech Recognition (free)
            text = r.recognize_google(audio)
            return text
        except sr.UnknownValueError:
            return "Could not understand audio"
        except sr.RequestError:
            # Try offline recognition
            try:
                text = r.recognize_sphinx(audio)
                return text
            except (sr.UnknownValueError, sr.RequestError):
                return "Speech recognition unavailable"
                
    except ImportError:
        logger.info("Speech recognition library not available")
        return None
    except Exception as e:
        logger.warning(f"Local transcription failed: {str(e)}")
        return None

def analyze_audio_content(transcript):
    """Analyze transcribed audio content using Replit AI"""
    try:
        if not transcript or transcript.strip() == "":
            return "No transcript to analyze"
        
        # Try Replit AI first
        analysis = analyze_with_replit_ai(transcript)
        
        if analysis:
            logger.info("Successfully analyzed audio content using Replit AI")
            return analysis
        
        # Fallback to basic analysis
        analysis = analyze_with_basic_processing(transcript)
        logger.info("Successfully analyzed audio content using basic processing")
        return analysis
        
    except Exception as e:
        logger.error(f"Error analyzing audio content: {str(e)}")
        return f"Analysis failed: {str(e)}"

def analyze_with_replit_ai(transcript):
    """Analyze content using Replit AI"""
    try:
        replit_api_url = os.environ.get("REPLIT_API_URL")
        replit_token = os.environ.get("REPLIT_TOKEN")
        
        if not replit_api_url or not replit_token:
            return None
        
        headers = {
            "Authorization": f"Bearer {replit_token}",
            "Content-Type": "application/json"
        }
        
        data = {
            "prompt": f"Analyze this transcript and provide insights about content, tone, and key themes: {transcript}",
            "model": "replit-code-v1",
            "max_tokens": 500
        }
        
        response = requests.post(
            f"{replit_api_url}/ai/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get("choices", [{}])[0].get("message", {}).get("content", "")
        
        return None
        
    except Exception as e:
        logger.warning(f"Replit AI analysis failed: {str(e)}")
        return None

def analyze_with_basic_processing(transcript):
    """Basic text analysis without AI"""
    try:
        words = transcript.split()
        sentences = transcript.split('.')
        
        # Basic metrics
        word_count = len(words)
        sentence_count = len([s for s in sentences if s.strip()])
        avg_words_per_sentence = word_count / max(sentence_count, 1)
        
        # Simple keyword extraction
        common_words = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']
        
        word_freq = {}
        for word in words:
            word_lower = word.lower().strip('.,!?;:"')
            if word_lower not in common_words and len(word_lower) > 2:
                word_freq[word_lower] = word_freq.get(word_lower, 0) + 1
        
        # Get top keywords
        top_keywords = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
        
        # Simple sentiment analysis
        positive_words = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied']
        negative_words = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry', 'disappointed', 'frustrated', 'annoyed']
        
        positive_count = sum(1 for word in words if word.lower() in positive_words)
        negative_count = sum(1 for word in words if word.lower() in negative_words)
        
        if positive_count > negative_count:
            sentiment = "Positive"
        elif negative_count > positive_count:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"
        
        # Build analysis
        analysis = f"""
**Basic Content Analysis:**

**Statistics:**
- Word count: {word_count}
- Sentence count: {sentence_count}
- Average words per sentence: {avg_words_per_sentence:.1f}

**Key Topics:**
{', '.join([word for word, count in top_keywords]) if top_keywords else 'No specific topics identified'}

**Sentiment:** {sentiment}

**Content Preview:**
{transcript[:200]}{'...' if len(transcript) > 200 else ''}

*Note: This is a basic analysis. For more detailed insights, AI-powered analysis would provide better results.*
        """
        
        return analysis.strip()
        
    except Exception as e:
        logger.error(f"Basic analysis failed: {str(e)}")
        return f"Basic analysis completed but with errors: {str(e)}"
