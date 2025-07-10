from PIL import Image
import numpy as np
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    def __init__(self):
        self.min_frequency = 800
        self.max_frequency = 3000
        
    def image_to_frequencies(self, image_path):
        """Convert image pixels to frequency data"""
        try:
            # Open and process image
            image = Image.open(image_path)
            
            # Convert to grayscale
            if image.mode != 'L':
                image = image.convert('L')
            
            # Resize image to reasonable size for audio conversion
            max_size = 100  # Limit to prevent very long audio files
            image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Convert to numpy array
            pixel_array = np.array(image)
            
            # Flatten the image to 1D array
            pixels = pixel_array.flatten()
            
            # Convert pixel values (0-255) to frequencies
            frequencies = []
            for pixel in pixels:
                # Normalize pixel value to 0-1 range
                normalized = pixel / 255.0
                # Map to frequency range
                frequency = self.min_frequency + normalized * (self.max_frequency - self.min_frequency)
                frequencies.append(frequency)
            
            logger.info(f"Successfully converted image to {len(frequencies)} frequencies")
            return frequencies
            
        except Exception as e:
            logger.error(f"Error converting image to frequencies: {str(e)}")
            return []
    
    def frequencies_to_image(self, frequencies, width, height):
        """Convert frequency data back to image"""
        try:
            # Convert frequencies back to pixel values
            pixels = []
            for freq in frequencies:
                # Normalize frequency to 0-1 range
                normalized = (freq - self.min_frequency) / (self.max_frequency - self.min_frequency)
                # Convert to pixel value (0-255)
                pixel_value = int(normalized * 255)
                pixel_value = max(0, min(255, pixel_value))  # Clamp to valid range
                pixels.append(pixel_value)
            
            # Reshape to image dimensions
            expected_size = width * height
            if len(pixels) != expected_size:
                # Pad or trim to expected size
                if len(pixels) < expected_size:
                    pixels.extend([0] * (expected_size - len(pixels)))
                else:
                    pixels = pixels[:expected_size]
            
            # Convert to numpy array and reshape
            pixel_array = np.array(pixels, dtype=np.uint8).reshape((height, width))
            
            # Create image
            image = Image.fromarray(pixel_array, mode='L')
            
            logger.info(f"Successfully converted frequencies to image ({width}x{height})")
            return image
            
        except Exception as e:
            logger.error(f"Error converting frequencies to image: {str(e)}")
            return None
    
    def get_image_info(self, image_path):
        """Get basic information about an image"""
        try:
            image = Image.open(image_path)
            return {
                'width': image.width,
                'height': image.height,
                'mode': image.mode,
                'format': image.format,
                'size': image.width * image.height
            }
        except Exception as e:
            logger.error(f"Error getting image info: {str(e)}")
            return None
    
    def save_image_array(self, image_array, output_path):
        """Save numpy array or PIL Image as image file"""
        try:
            # Handle PIL Image objects
            if isinstance(image_array, Image.Image):
                image_array.save(output_path)
                logger.info(f"Successfully saved PIL image to {output_path}")
                return True
            
            # Handle numpy arrays
            if isinstance(image_array, np.ndarray):
                # Ensure array is in correct range and type
                if image_array.dtype != np.uint8:
                    # Normalize to 0-255 range
                    image_array = ((image_array - image_array.min()) / (image_array.max() - image_array.min()) * 255).astype(np.uint8)
                
                # Create PIL Image from array
                if len(image_array.shape) == 2:
                    # Grayscale image
                    img = Image.fromarray(image_array, mode='L')
                elif len(image_array.shape) == 3:
                    # RGB image
                    img = Image.fromarray(image_array, mode='RGB')
                else:
                    raise ValueError(f"Invalid image array shape: {image_array.shape}")
                
                # Save image
                img.save(output_path)
                logger.info(f"Successfully saved numpy array as image to {output_path}")
                return True
            
            raise ValueError("Input must be PIL Image or numpy array")
            
        except Exception as e:
            logger.error(f"Error saving image: {str(e)}")
            return False
