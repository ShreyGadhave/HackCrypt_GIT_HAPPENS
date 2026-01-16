"""
GPS Service Module
===================
Handles GPS-based location fetching and proximity validation for attendance.

This module provides:
- IP-based approximate location detection for teachers
- Geodesic distance calculation between teacher and student coordinates
- Proximity validation within a configurable radius
"""

import logging
import requests
from geopy.distance import geodesic
from typing import Dict, Any, Optional, Tuple

# Configure module-level logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class GPSManager:
    """
    Manages GPS-related operations for the Smart Attendance System.
    
    This class provides methods to:
    1. Fetch the teacher's approximate location using IP-based geolocation
    2. Validate if a student is within a specified radius of the teacher
    
    Attributes:
        ip_api_url (str): The URL for the IP-based geolocation API
    """
    
    def __init__(self, ip_api_url: str = "https://ipapi.co/json/"):
        """
        Initialize the GPSManager.
        
        Args:
            ip_api_url: URL for IP-based geolocation service (default: ipapi.co)
        """
        self.ip_api_url = ip_api_url
        logger.info("GPSManager initialized with IP API: %s", ip_api_url)
    
    def get_teacher_location_ip(self) -> Dict[str, Any]:
        """
        Fetches the teacher's approximate location using IP-based geolocation.
        
        This method makes a request to an IP geolocation service to determine
        the approximate geographic coordinates of the server/teacher's location.
        
        Returns:
            dict: A dictionary containing:
                - success (bool): Whether the location was successfully fetched
                - latitude (float|None): The latitude coordinate
                - longitude (float|None): The longitude coordinate
                - city (str|None): The city name
                - region (str|None): The region/state name
                - country (str|None): The country name
                - ip (str|None): The public IP address
                - error (str|None): Error message if request failed
        
        Example:
            >>> gps = GPSManager()
            >>> location = gps.get_teacher_location_ip()
            >>> print(location)
            {'success': True, 'latitude': 41.26194, 'longitude': -95.86083, ...}
        """
        try:
            logger.info("Fetching teacher location via IP...")
            response = requests.get(self.ip_api_url, timeout=10)
            response.raise_for_status()  # Raise exception for bad status codes
            
            data = response.json()
            
            # Extract relevant fields from the API response
            result = {
                "success": True,
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "city": data.get("city"),
                "region": data.get("region"),
                "country": data.get("country_name"),
                "ip": data.get("ip"),
                "timezone": data.get("timezone"),
                "error": None
            }
            
            logger.info("Location fetched successfully: %s, %s (%s)", 
                       result["latitude"], result["longitude"], result["city"])
            return result
            
        except requests.exceptions.Timeout:
            error_msg = "Request timed out while fetching location"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
            
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error while fetching location: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
            
        except Exception as e:
            error_msg = f"Unexpected error while fetching location: {str(e)}"
            logger.error(error_msg)
            return {"success": False, "error": error_msg}
    
    def validate_proximity(
        self,
        teacher_lat: float,
        teacher_lon: float,
        student_lat: float,
        student_lon: float,
        radius: float = 50.0
    ) -> Dict[str, Any]:
        """
        Validates if a student is within the allowed radius of the teacher.
        
        This method calculates the geodesic distance (shortest distance on Earth's surface)
        between the teacher and student coordinates, then determines if the student
        is within the specified attendance radius.
        
        Args:
            teacher_lat: Teacher's latitude coordinate
            teacher_lon: Teacher's longitude coordinate
            student_lat: Student's latitude coordinate
            student_lon: Student's longitude coordinate
            radius: Maximum allowed distance in meters (default: 50.0)
        
        Returns:
            dict: A dictionary containing:
                - allowed (bool): Whether the student is within the radius
                - distance (float): Actual distance in meters between locations
                - radius (float): The radius threshold used for validation
                - message (str): Human-readable status message
        
        Example:
            >>> gps = GPSManager()
            >>> result = gps.validate_proximity(41.26194, -95.86083, 41.26199, -95.86088, 50.0)
            >>> print(result)
            {'allowed': True, 'distance': 7.86, 'radius': 50.0, 'message': '✅ SUCCESS: Student is within range'}
        """
        try:
            # Create coordinate tuples for geopy
            teacher_coords = (teacher_lat, teacher_lon)
            student_coords = (student_lat, student_lon)
            
            # Calculate geodesic distance (accounts for Earth's curvature)
            distance_meters = geodesic(teacher_coords, student_coords).meters
            
            # Round to 2 decimal places for cleaner output
            distance_meters = round(distance_meters, 2)
            
            # Determine if student is within the allowed radius
            is_allowed = distance_meters <= radius
            
            if is_allowed:
                message = f"✅ SUCCESS: Student is within range ({distance_meters}m / {radius}m)"
                logger.info(message)
            else:
                overage = round(distance_meters - radius, 2)
                message = f"❌ FAILED: Student is {overage}m outside the allowed radius"
                logger.warning(message)
            
            return {
                "allowed": is_allowed,
                "distance": distance_meters,
                "radius": radius,
                "message": message
            }
            
        except Exception as e:
            error_msg = f"Error validating proximity: {str(e)}"
            logger.error(error_msg)
            return {
                "allowed": False,
                "distance": -1.0,
                "radius": radius,
                "message": f"❌ ERROR: {error_msg}"
            }
    
    def get_distance(
        self,
        lat1: float,
        lon1: float,
        lat2: float,
        lon2: float
    ) -> Optional[float]:
        """
        Calculates the geodesic distance between two coordinates.
        
        This is a simple utility method for getting just the distance value.
        
        Args:
            lat1: First point latitude
            lon1: First point longitude
            lat2: Second point latitude
            lon2: Second point longitude
        
        Returns:
            float: Distance in meters, or None if calculation fails
        """
        try:
            return round(geodesic((lat1, lon1), (lat2, lon2)).meters, 2)
        except Exception as e:
            logger.error("Error calculating distance: %s", str(e))
            return None


# Dummy data for testing (will be replaced with MongoDB later)
DUMMY_TEACHERS = {
    "teacher_001": {
        "name": "Dr. Sharma",
        "subject": "Computer Science",
        "default_lat": 41.26194,
        "default_lon": -95.86083,
        "radius": 50.0
    },
    "teacher_002": {
        "name": "Prof. Patel",
        "subject": "Mathematics",
        "default_lat": 19.0760,
        "default_lon": 72.8777,
        "radius": 100.0
    }
}


def get_dummy_teacher(teacher_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves dummy teacher data for testing.
    
    Args:
        teacher_id: The teacher's unique identifier
    
    Returns:
        dict: Teacher data or None if not found
    """
    return DUMMY_TEACHERS.get(teacher_id)


# Module test
if __name__ == "__main__":
    print("--- GPS Service Module Test ---\n")
    
    gps = GPSManager()
    
    # Test 1: Get location via IP
    print("Test 1: Fetching location via IP...")
    location = gps.get_teacher_location_ip()
    print(f"Result: {location}\n")
    
    # Test 2: Validate proximity (close student)
    print("Test 2: Validating proximity (close student)...")
    result = gps.validate_proximity(41.26194, -95.86083, 41.26199, -95.86088, 50.0)
    print(f"Result: {result}\n")
    
    # Test 3: Validate proximity (far student)
    print("Test 3: Validating proximity (far student)...")
    result = gps.validate_proximity(41.26194, -95.86083, 19.0765, 72.8778, 50.0)
    print(f"Result: {result}\n")
