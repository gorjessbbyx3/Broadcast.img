from app import db
from datetime import datetime

class AudioFile(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)  # 'text', 'image', 'audio'
    encoding_mode = db.Column(db.String(50), nullable=False)  # 'text', 'image', 'custom'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    file_size = db.Column(db.Integer)
    duration = db.Column(db.Float)  # duration in seconds
    sample_rate = db.Column(db.Integer, default=44100)
    
class ProcessingJob(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_type = db.Column(db.String(50), nullable=False)  # 'encode', 'decode', 'transcribe'
    status = db.Column(db.String(50), default='pending')  # 'pending', 'processing', 'completed', 'failed'
    input_file = db.Column(db.String(255))
    output_file = db.Column(db.String(255))
    progress = db.Column(db.Integer, default=0)
    error_message = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
