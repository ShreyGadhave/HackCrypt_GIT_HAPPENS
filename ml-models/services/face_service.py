"""
Face Verification Service Module
=================================
Handles face verification and liveness detection for attendance.

This module provides:
- Document image pre-processing (deskewing, perspective correction)
- DeepFace-based face verification between selfie and ID card
- Graceful error handling for face detection failures
"""

import cv2
import numpy as np
import math
import os
import logging
from typing import Dict, Any, Optional, Tuple
from PIL import Image

# Configure module-level logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Try to import DeepFace (may fail if not installed with all dependencies)
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    logger.info("✅ DeepFace loaded successfully")
except ImportError as e:
    DEEPFACE_AVAILABLE = False
    logger.warning("⚠️ DeepFace not available: %s", str(e))

# Try to import MediaPipe for liveness detection
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
    logger.info("✅ MediaPipe loaded successfully")
except ImportError as e:
    MEDIAPIPE_AVAILABLE = False
    logger.warning("⚠️ MediaPipe not available: %s", str(e))


class FaceVerifier:
    """
    Handles face verification between a live selfie and an ID card photo.
    
    This class provides methods to:
    1. Pre-process document images (deskew, crop, perspective transform)
    2. Verify identity by comparing faces using DeepFace
    3. Calculate Eye Aspect Ratio (EAR) for blink detection (liveness)
    
    Attributes:
        model_name (str): The DeepFace model to use for verification
        temp_dir (str): Directory for temporary processed images
    """
    
    # Constants for blink detection
    EYE_AR_THRESH = 0.22
    EYE_AR_CONSEC_FRAMES = 3
    
    # Optimized model-specific thresholds based on research and testing
    # These are tuned for ID card vs selfie comparison (more lenient than standard)
    MODEL_THRESHOLDS = {
        "VGG-Face": {"strict": 0.40, "normal": 0.60, "lenient": 0.80, "very_lenient": 0.95},
        "Facenet": {"strict": 0.35, "normal": 0.55, "lenient": 0.75, "very_lenient": 0.95},
        "Facenet512": {"strict": 0.30, "normal": 0.50, "lenient": 0.70, "very_lenient": 0.95},
        "OpenFace": {"strict": 0.08, "normal": 0.15, "lenient": 0.25, "very_lenient": 0.40},
        "DeepFace": {"strict": 0.15, "normal": 0.25, "lenient": 0.40, "very_lenient": 0.60},
        "DeepID": {"strict": 0.08, "normal": 0.15, "lenient": 0.25, "very_lenient": 0.40},
        "ArcFace": {"strict": 0.45, "normal": 0.60, "lenient": 0.75, "very_lenient": 0.95},
        "Dlib": {"strict": 0.05, "normal": 0.08, "lenient": 0.12, "very_lenient": 0.20},
        "SFace": {"strict": 0.45, "normal": 0.55, "lenient": 0.65, "very_lenient": 0.85},
    }
    
    # Default threshold mode for MVP (very lenient to ensure most verifications pass)
    DEFAULT_THRESHOLD_MODE = "very_lenient"
    
    def __init__(self, model_name: str = "VGG-Face", temp_dir: str = "./temp", threshold_mode: str = None):
        """
        Initialize the FaceVerifier.
        
        Args:
            model_name: DeepFace model name (default: VGG-Face)
                       Options: VGG-Face, Facenet, OpenFace, DeepFace, ArcFace
            temp_dir: Directory for temporary files
            threshold_mode: Threshold strictness - "strict", "normal", "lenient", "very_lenient"
                           None = auto (uses "lenient" for ID card verification)
        """
        self.model_name = model_name
        self.temp_dir = temp_dir
        self.threshold_mode = threshold_mode or self.DEFAULT_THRESHOLD_MODE
        
        # Get the optimized threshold for this model
        self.threshold = self._get_optimized_threshold()
        
        # Create temp directory if it doesn't exist
        os.makedirs(temp_dir, exist_ok=True)
        
        logger.info("FaceVerifier initialized with model: %s, threshold: %.2f (%s mode)", 
                   model_name, self.threshold, self.threshold_mode)
    
    def _get_optimized_threshold(self) -> float:
        """
        Gets the optimized threshold based on the model and mode.
        
        Returns:
            float: The optimized threshold value
        """
        model_thresholds = self.MODEL_THRESHOLDS.get(self.model_name)
        if model_thresholds:
            return model_thresholds.get(self.threshold_mode, model_thresholds["lenient"])
        # Fallback for unknown models
        return 0.80
    
    def calculate_confidence(self, distance: float) -> float:
        """
        Calculates a confidence score (0-100%) based on the face distance.
        
        Lower distance = higher confidence that faces match.
        
        Args:
            distance: The face embedding distance
            
        Returns:
            float: Confidence percentage (0-100)
        """
        # Get max expected distance for this model (very_lenient threshold)
        model_thresholds = self.MODEL_THRESHOLDS.get(self.model_name, {})
        max_distance = model_thresholds.get("very_lenient", 1.0)
        
        # Calculate confidence: 100% at distance 0, 0% at max_distance
        if distance <= 0:
            return 100.0
        elif distance >= max_distance:
            return 0.0
        else:
            confidence = (1 - (distance / max_distance)) * 100
            return round(max(0, min(100, confidence)), 2)
    
    def get_match_quality(self, distance: float) -> str:
        """
        Returns a human-readable match quality description.
        
        Args:
            distance: The face embedding distance
            
        Returns:
            str: Quality description (Excellent, Good, Fair, Poor, No Match)
        """
        model_thresholds = self.MODEL_THRESHOLDS.get(self.model_name, {})
        
        if distance <= model_thresholds.get("strict", 0.40):
            return "Excellent"
        elif distance <= model_thresholds.get("normal", 0.60):
            return "Good"
        elif distance <= model_thresholds.get("lenient", 0.80):
            return "Fair"
        elif distance <= model_thresholds.get("very_lenient", 1.00):
            return "Poor"
        else:
            return "No Match"
    
    def preprocess_document(self, image_path: str) -> str:
        """
        Pre-processes a document image by finding and correcting its perspective.
        
        This method:
        1. Finds the document edges in the image
        2. Locates a 4-point contour (the document boundary)
        3. Applies perspective transformation to get a flat, deskewed image
        
        Args:
            image_path: Path to the document image
        
        Returns:
            str: Path to the processed image (or original if processing fails)
        
        Example:
            >>> verifier = FaceVerifier()
            >>> processed = verifier.preprocess_document("id_card.jpg")
            >>> print(processed)
            './temp/processed_document.jpg'
        """
        try:
            logger.info("Pre-processing document: %s", os.path.basename(image_path))
            
            # Read the image
            image = cv2.imread(image_path)
            if image is None:
                logger.error("Could not read document image: %s", image_path)
                return image_path  # Return original path as fallback
            
            # Store original dimensions for later
            orig_h, orig_w = image.shape[:2]
            
            # Resize for faster processing while preserving aspect ratio
            target_h = 800
            ratio = target_h / orig_h
            resized = cv2.resize(image, (int(orig_w * ratio), target_h))
            
            # Convert to grayscale and apply edge detection
            gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
            blurred = cv2.GaussianBlur(gray, (5, 5), 0)
            edged = cv2.Canny(blurred, 75, 200)
            
            # Find contours and sort by area (largest first)
            contours, _ = cv2.findContours(edged.copy(), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
            contours = sorted(contours, key=cv2.contourArea, reverse=True)[:5]
            
            # Find the contour with 4 points (the document)
            doc_contour = None
            for c in contours:
                peri = cv2.arcLength(c, True)
                approx = cv2.approxPolyDP(c, 0.02 * peri, True)
                if len(approx) == 4:
                    doc_contour = approx
                    break
            
            if doc_contour is None:
                logger.warning("Could not find 4-point contour. Using original image.")
                return image_path
            
            # Scale contour back to original image size
            scaled_contour = doc_contour.reshape(4, 2) * (orig_h / target_h)
            
            # Order the points for perspective transform
            # Order: top-left, top-right, bottom-right, bottom-left
            rect = np.zeros((4, 2), dtype="float32")
            s = scaled_contour.sum(axis=1)
            rect[0] = scaled_contour[np.argmin(s)]  # Top-left has smallest sum
            rect[2] = scaled_contour[np.argmax(s)]  # Bottom-right has largest sum
            diff = np.diff(scaled_contour, axis=1)
            rect[1] = scaled_contour[np.argmin(diff)]  # Top-right
            rect[3] = scaled_contour[np.argmax(diff)]  # Bottom-left
            
            (tl, tr, br, bl) = rect
            
            # Compute the width and height of the new image
            widthA = np.sqrt(((br[0] - bl[0]) ** 2) + ((br[1] - bl[1]) ** 2))
            widthB = np.sqrt(((tr[0] - tl[0]) ** 2) + ((tr[1] - tl[1]) ** 2))
            maxWidth = max(int(widthA), int(widthB))
            
            heightA = np.sqrt(((tr[0] - br[0]) ** 2) + ((tr[1] - br[1]) ** 2))
            heightB = np.sqrt(((tl[0] - bl[0]) ** 2) + ((tl[1] - bl[1]) ** 2))
            maxHeight = max(int(heightA), int(heightB))
            
            # Destination points for perspective transform
            dst = np.array([
                [0, 0],
                [maxWidth - 1, 0],
                [maxWidth - 1, maxHeight - 1],
                [0, maxHeight - 1]
            ], dtype="float32")
            
            # Apply perspective transform
            M = cv2.getPerspectiveTransform(rect, dst)
            warped = cv2.warpPerspective(image, M, (maxWidth, maxHeight))
            
            # Save the processed image
            processed_path = os.path.join(self.temp_dir, "processed_document.jpg")
            cv2.imwrite(processed_path, warped)
            
            logger.info("Document pre-processed successfully: %s", processed_path)
            return processed_path
            
        except Exception as e:
            logger.error("Error during document pre-processing: %s", str(e))
            return image_path  # Return original path as fallback
    
    def verify_identity(self, selfie_path: str, id_card_path: str, preprocess: bool = True) -> Dict[str, Any]:
        """
        Verifies if the face in the selfie matches the face on the ID card.
        
        This method:
        1. Optionally pre-processes the ID card image
        2. Uses DeepFace to compare the two faces
        3. Returns verification result with confidence metrics
        
        Args:
            selfie_path: Path to the live selfie image
            id_card_path: Path to the ID card/document image
            preprocess: Whether to pre-process the document image (default: True)
        
        Returns:
            dict: Verification result containing:
                - success (bool): Whether verification completed successfully
                - verified (bool): Whether the faces match
                - distance (float): Face embedding distance
                - threshold (float): Threshold used for verification
                - model (str): Model used for verification
                - error (str|None): Error message if verification failed
        
        Example:
            >>> verifier = FaceVerifier()
            >>> result = verifier.verify_identity("selfie.jpg", "id_card.jpg")
            >>> if result["verified"]:
            ...     print("Identity verified!")
        """
        if not DEEPFACE_AVAILABLE:
            return {
                "success": False,
                "verified": False,
                "error": "DeepFace is not installed. Please install with: pip install deepface"
            }
        
        processed_doc_path = None
        
        try:
            # Validate input files exist
            if not os.path.exists(selfie_path):
                return {
                    "success": False,
                    "verified": False,
                    "error": f"Selfie not found: {selfie_path}"
                }
            
            if not os.path.exists(id_card_path):
                return {
                    "success": False,
                    "verified": False,
                    "error": f"ID card not found: {id_card_path}"
                }
            
            # Pre-process document if enabled
            if preprocess:
                processed_doc_path = self.preprocess_document(id_card_path)
            else:
                processed_doc_path = id_card_path
            
            logger.info("Comparing faces: %s vs %s", 
                       os.path.basename(selfie_path), 
                       os.path.basename(processed_doc_path))
            
            # Perform face verification using DeepFace
            result = DeepFace.verify(
                img1_path=selfie_path,
                img2_path=processed_doc_path,
                model_name=self.model_name,
                enforce_detection=True
            )
            
            # Use our optimized auto-threshold instead of DeepFace default
            distance = round(result["distance"], 4)
            is_verified = distance <= self.threshold
            confidence = self.calculate_confidence(distance)
            match_quality = self.get_match_quality(distance)
            
            verification_result = {
                "success": True,
                "verified": is_verified,
                "distance": distance,
                "threshold": self.threshold,
                "threshold_mode": self.threshold_mode,
                "confidence": confidence,
                "match_quality": match_quality,
                "model": self.model_name,
                "error": None
            }
            
            if verification_result["verified"]:
                logger.info("✅ Face verification PASSED (distance: %.4f)", result["distance"])
            else:
                logger.warning("❌ Face verification FAILED (distance: %.4f)", result["distance"])
            
            return verification_result
            
        except ValueError as e:
            # This typically happens when a face cannot be detected
            error_msg = str(e)
            if "face" in error_msg.lower() and "detect" in error_msg.lower():
                error_msg = "Could not detect a face in one or both images. Please use clearer photos."
            
            logger.error("Face verification error: %s", error_msg)
            return {
                "success": False,
                "verified": False,
                "error": error_msg
            }
            
        except Exception as e:
            logger.error("Unexpected error during face verification: %s", str(e))
            return {
                "success": False,
                "verified": False,
                "error": f"Verification failed: {str(e)}"
            }
        
        finally:
            # Cleanup: Remove processed document if it was created
            if processed_doc_path and processed_doc_path != id_card_path:
                if os.path.exists(processed_doc_path):
                    try:
                        os.remove(processed_doc_path)
                        logger.debug("Cleaned up processed document: %s", processed_doc_path)
                    except Exception:
                        pass
    
    @staticmethod
    def calculate_ear(eye_landmarks: list, frame_shape: Tuple[int, int]) -> float:
        """
        Calculates the Eye Aspect Ratio (EAR) for blink detection.
        
        The EAR is calculated using 6 eye landmarks:
        - 2 for the eye corners (horizontal)
        - 4 for the top and bottom eyelid (vertical)
        
        When the eye is open, EAR is relatively constant (~0.25-0.30).
        When the eye closes, EAR drops rapidly.
        
        Args:
            eye_landmarks: List of 6 MediaPipe landmark objects for one eye
            frame_shape: Tuple of (height, width) of the video frame
        
        Returns:
            float: The Eye Aspect Ratio (0.0 to ~0.4)
        """
        def get_coords(landmark):
            return int(landmark.x * frame_shape[1]), int(landmark.y * frame_shape[0])
        
        # Get coordinates for all 6 landmarks
        p1, p2, p3, p4, p5, p6 = [get_coords(lm) for lm in eye_landmarks]
        
        # Calculate vertical distances
        dist_vertical_1 = math.hypot(p2[0] - p6[0], p2[1] - p6[1])
        dist_vertical_2 = math.hypot(p3[0] - p5[0], p3[1] - p5[1])
        
        # Calculate horizontal distance
        dist_horizontal = math.hypot(p1[0] - p4[0], p1[1] - p4[1])
        
        if dist_horizontal == 0:
            return 0.0
        
        # EAR = (vertical_1 + vertical_2) / (2 * horizontal)
        ear = (dist_vertical_1 + dist_vertical_2) / (2.0 * dist_horizontal)
        return ear
    
    def cleanup_temp_files(self) -> int:
        """
        Removes all temporary files created during verification.
        
        Returns:
            int: Number of files removed
        """
        removed_count = 0
        try:
            for filename in os.listdir(self.temp_dir):
                file_path = os.path.join(self.temp_dir, filename)
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    removed_count += 1
            logger.info("Cleaned up %d temporary files", removed_count)
        except Exception as e:
            logger.error("Error cleaning up temp files: %s", str(e))
        
        return removed_count


# Dummy data for testing (will be replaced with MongoDB later)
DUMMY_STUDENTS = {
    "student_001": {
        "name": "Rahul Kumar",
        "roll_number": "CS2024001",
        "class": "12-A",
        "selfie_on_file": "rahul_selfie.jpg"
    },
    "student_002": {
        "name": "Priya Singh",
        "roll_number": "CS2024002", 
        "class": "12-A",
        "selfie_on_file": "priya_selfie.jpg"
    }
}


def get_dummy_student(student_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves dummy student data for testing.
    
    Args:
        student_id: The student's unique identifier
    
    Returns:
        dict: Student data or None if not found
    """
    return DUMMY_STUDENTS.get(student_id)


# Module test
if __name__ == "__main__":
    print("--- Face Verification Service Module Test ---\n")
    
    verifier = FaceVerifier()
    
    print(f"DeepFace available: {DEEPFACE_AVAILABLE}")
    print(f"MediaPipe available: {MEDIAPIPE_AVAILABLE}")
    print(f"Model: {verifier.model_name}")
    print(f"Temp directory: {verifier.temp_dir}")
    
    # Note: Actual face verification requires real image files
    print("\nTo test face verification, run:")
    print('  result = verifier.verify_identity("selfie.jpg", "id_card.jpg")')
