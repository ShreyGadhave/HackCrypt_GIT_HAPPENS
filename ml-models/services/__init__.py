# Services Package
# Export all service classes for easy importing

from .gps_service import GPSManager
from .face_service import FaceVerifier
from .ocr_service import IDCardExtractor

__all__ = ["GPSManager", "FaceVerifier", "IDCardExtractor"]
