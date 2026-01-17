import logging
from typing import List, Dict, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# In-memory storage for active beacons (mock database)
# Format: {session_id: {uuid, threshold, teacher_lat, teacher_lon, is_active}}
ACTIVE_BEACONS = {}

DEFAULT_RSSI_THRESHOLD = -65

def register_beacon(session_id: str, beacon_uuid: str, rssi_threshold: int = -65, teacher_lat: float = None, teacher_lon: float = None) -> Dict:
    """
    Register a beacon for a session.
    """
    try:
        ACTIVE_BEACONS[session_id] = {
            "uuid": beacon_uuid,
            "threshold": rssi_threshold,
            "teacher_lat": teacher_lat,
            "teacher_lon": teacher_lon,
            "is_active": True,
            "created_at": datetime.now().isoformat()
        }
        logger.info(f"Beacon registered for session {session_id}: {beacon_uuid}")
        return {"success": True, "message": "Beacon registered successfully"}
    except Exception as e:
        logger.error(f"Error registering beacon: {str(e)}")
        return {"success": False, "error": str(e)}

def get_beacon(session_id: str) -> Optional[Dict]:
    """
    Get beacon details for a session.
    """
    return ACTIVE_BEACONS.get(session_id)

def get_dummy_beacon() -> Dict:
    """
    Get a dummy beacon for testing.
    """
    return {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "threshold": -65
    }

class BluetoothProximityResponse:
    def __init__(self, present: bool, rssi_mode: int, threshold: int, signal_quality: str, confidence: str, message: str):
        self.present = present
        self.rssi_mode = rssi_mode
        self.threshold = threshold
        self.signal_quality = signal_quality
        self.confidence = confidence
        self.message = message

    def to_dict(self):
        return {
            "present": self.present,
            "rssi_mode": self.rssi_mode,
            "threshold": self.threshold,
            "signal_quality": self.signal_quality,
            "confidence": self.confidence,
            "message": self.message
        }

class BluetoothProximityService:
    def __init__(self):
        pass

    def validate_proximity(self, rssi_readings: List[int], threshold: int = DEFAULT_RSSI_THRESHOLD) -> BluetoothProximityResponse:
        """
        Validate proximity based on RSSI readings.
        """
        if not rssi_readings:
            raise ValueError("No RSSI readings provided")

        # Calculate mode (most frequent RSSI value) or average
        # Using average for simplicity if mode is ambiguous, but mode is better for stability
        try:
            from statistics import mode
            rssi_mode = mode(rssi_readings)
        except:
            rssi_mode = int(sum(rssi_readings) / len(rssi_readings))

        present = rssi_mode >= threshold
        
        # Determine signal quality
        if rssi_mode >= -50:
            quality = "Excellent"
        elif rssi_mode >= -65:
            quality = "Good"
        elif rssi_mode >= -80:
            quality = "Fair"
        else:
            quality = "Poor"

        # Determine confidence
        confidence = "High" if len(rssi_readings) >= 5 else "Medium" if len(rssi_readings) >= 3 else "Low"

        message = "Student is within range" if present else "Student is too far or signal blocked"

        return BluetoothProximityResponse(
            present=present,
            rssi_mode=rssi_mode,
            threshold=threshold,
            signal_quality=quality,
            confidence=confidence,
            message=message
        )
