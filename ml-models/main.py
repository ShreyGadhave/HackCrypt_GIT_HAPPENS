"""
Smart Attendance System - FastAPI Server
=========================================
Main entry point for the Modular AI Microservice.

This server provides endpoints for:
- GPS-based teacher location detection
- Proximity validation for attendance
- Face verification between selfie and ID card
- OCR extraction from college student ID cards
- Complete attendance verification workflow

Author: Smart Attendance Team
Version: 1.0.0
"""

import os
import uuid
import json
import logging
import shutil
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Import our service modules
from services.gps_service import GPSManager, get_dummy_teacher, DUMMY_TEACHERS
from services.face_service import FaceVerifier, get_dummy_student, DUMMY_STUDENTS
from services.ocr_service import IDCardExtractor, get_dummy_ocr_result
from services.bluetooth_service import (
    BluetoothProximityService, 
    register_beacon, 
    get_beacon, 
    get_dummy_beacon,
    DEFAULT_RSSI_THRESHOLD
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(name)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Directory for temporary file uploads
TEMP_DIR = "./temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)


# ============================================================================
# Pydantic Models for Request/Response Validation
# ============================================================================

class GPSValidationRequest(BaseModel):
    """Request model for GPS proximity validation."""
    teacher_lat: float = Field(..., description="Teacher's latitude coordinate")
    teacher_lon: float = Field(..., description="Teacher's longitude coordinate")
    student_lat: float = Field(..., description="Student's latitude coordinate")
    student_lon: float = Field(..., description="Student's longitude coordinate")
    radius: float = Field(default=50.0, description="Allowed radius in meters")


class GPSValidationData(BaseModel):
    """Data model for GPS proximity validation."""
    allowed: bool
    distance: float
    radius: float
    message: str


class GPSValidationResponse(BaseModel):
    """Standard API Response model for GPS validation."""
    success: bool
    data: GPSValidationData
    message: Optional[str] = None


class AttendanceVerifyResponse(BaseModel):
    """Response model for complete attendance verification."""
    status: str
    timestamp: str
    gps_check: dict
    bluetooth_check: dict  # NEW: Bluetooth proximity verification
    face_verification: dict
    ocr_extraction: dict
    overall_verified: bool


# --- Bluetooth Proximity Models ---

class BeaconRegistrationRequest(BaseModel):
    """Request model for teacher beacon registration."""
    session_id: str = Field(..., description="MongoDB session ObjectId")
    beacon_uuid: str = Field(..., description="BLE beacon UUID (e.g., 550e8400-e29b-41d4-a716-446655440000)")
    rssi_threshold: int = Field(default=-65, description="RSSI threshold in dBm (default: -65)")
    teacher_lat: Optional[float] = Field(None, description="Teacher's latitude")
    teacher_lon: Optional[float] = Field(None, description="Teacher's longitude")


class BluetoothProximityRequest(BaseModel):
    """Request model for student Bluetooth proximity verification."""
    session_id: str = Field(..., description="MongoDB session ObjectId")
    student_id: Optional[str] = Field(None, description="Student identifier")
    beacon_uuid: str = Field(..., description="BLE beacon UUID being scanned")
    rssi_readings: list = Field(..., description="List of RSSI readings in dBm (e.g., [-45, -42, -47])")


class BluetoothProximityData(BaseModel):
    """Data model for Bluetooth proximity verification."""
    present: bool
    rssi_mode: int
    threshold: int
    signal_quality: str
    confidence: str
    message: str


class BluetoothProximityResponse(BaseModel):
    """Standard API Response model for Bluetooth verification."""
    success: bool
    data: Optional[BluetoothProximityData] = None
    message: Optional[str] = None


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str
    timestamp: str
    services: dict


# ============================================================================
# Service Initialization
# ============================================================================

# Initialize service instances (singleton pattern)
gps_manager = GPSManager()
face_verifier = FaceVerifier(temp_dir=TEMP_DIR)
ocr_extractor = IDCardExtractor()
bluetooth_service = BluetoothProximityService()


# ============================================================================
# Application Lifecycle
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("=" * 50)
    logger.info("🚀 Smart Attendance System Starting...")
    logger.info("=" * 50)
    logger.info("Services initialized:")
    logger.info("  - GPSManager: Ready")
    logger.info("  - FaceVerifier: Ready (Model: %s)", face_verifier.model_name)
    logger.info("  - IDCardExtractor: %s", 
                "Ready" if ocr_extractor.is_configured() else "API key not configured")
    logger.info("=" * 50)
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down Smart Attendance System...")
    # Cleanup temp files
    face_verifier.cleanup_temp_files()
    logger.info("Cleanup complete. Goodbye!")


# ============================================================================
# FastAPI Application
# ============================================================================

app = FastAPI(
    title="Smart Attendance System",
    description="""
    ## 🎓 Modular AI Microservice for Smart Attendance
    
    This API provides intelligent attendance verification using:
    - **GPS Location** - Validate student proximity to teacher
    - **Face Recognition** - Verify identity using DeepFace
    - **OCR Extraction** - Extract data from college ID cards using Groq LLaMA
    
    ### Endpoints Overview
    
    | Endpoint | Method | Description |
    |----------|--------|-------------|
    | `/` | GET | Health check and service status |
    | `/teacher/gps` | GET | Get teacher's approximate location via IP |
    | `/attendance/verify` | POST | **Main** - Complete attendance verification |
    | `/gps/validate` | POST | Standalone GPS proximity check |
    | `/face/verify` | POST | Standalone face verification |
    | `/ocr/extract` | POST | Standalone OCR extraction |
    
    ### Quick Start
    
    1. Set `GROQ_API_KEY` in `.env` for OCR functionality
    2. Run: `uvicorn main:app --reload`
    3. Visit: `http://localhost:8000/docs`
    """,
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Utility Functions
# ============================================================================

def save_upload_file(upload_file: UploadFile, filename: str) -> str:
    """
    Saves an uploaded file to the temp directory.
    
    Args:
        upload_file: The FastAPI UploadFile object
        filename: Desired filename (will be prefixed with UUID)
    
    Returns:
        str: Full path to the saved file (normalized for OS)
    """
    # Generate unique filename to avoid collisions
    unique_name = f"{uuid.uuid4().hex[:8]}_{filename}"
    file_path = os.path.normpath(os.path.join(TEMP_DIR, unique_name))
    
    # Ensure temp directory exists
    os.makedirs(TEMP_DIR, exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    logger.info("Saved upload: %s -> %s", upload_file.filename, file_path)
    return file_path


def cleanup_files(*file_paths: str) -> None:
    """
    Removes temporary files.
    
    Args:
        *file_paths: Variable number of file paths to remove
    """
    for path in file_paths:
        if path and os.path.exists(path):
            try:
                os.remove(path)
                logger.debug("Cleaned up: %s", path)
            except Exception as e:
                logger.warning("Failed to cleanup %s: %s", path, str(e))


# ============================================================================
# API Endpoints
# ============================================================================

# --- Health Check ---

@app.get("/", response_model=HealthResponse, tags=["System"])
async def health_check():
    """
    Health check endpoint.
    
    Returns the status of all services and the current timestamp.
    Use this to verify the API is running and services are initialized.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "gps_manager": "active",
            "face_verifier": "active",
            "bluetooth_service": "active",
            "ocr_extractor": "active" if ocr_extractor.is_configured() else "api_key_required"
        }
    }


# --- Teacher GPS Location ---

@app.get("/teacher/gps", tags=["GPS"])
async def get_teacher_location():
    """
    Get the teacher's approximate location using IP-based geolocation.
    
    This endpoint uses the server's public IP address to determine
    an approximate geographic location. Accuracy varies based on
    the IP geolocation service.
    
    **Note:** For production, teachers should use actual device GPS.
    
    Returns:
        - `success`: Whether location was fetched successfully
        - `latitude`, `longitude`: Coordinates
        - `city`, `region`, `country`: Location details
        - `ip`: The public IP address used
    """
    logger.info("Fetching teacher location via IP...")
    result = gps_manager.get_teacher_location_ip()
    
    if not result.get("success"):
        raise HTTPException(
            status_code=503, 
            detail=result.get("error", "Failed to fetch location")
        )
    
    return result


# --- GPS Proximity Validation ---

@app.post("/gps/validate", response_model=GPSValidationResponse, tags=["GPS"])
async def validate_gps_proximity(request: GPSValidationRequest):
    """
    Validate if a student is within the allowed radius of the teacher.
    
    This endpoint calculates the geodesic distance between the teacher
    and student coordinates, then determines if attendance should be allowed.
    
    **Request Body:**
    - `teacher_lat`, `teacher_lon`: Teacher's GPS coordinates
    - `student_lat`, `student_lon`: Student's GPS coordinates
    - `radius`: Maximum allowed distance in meters (default: 50)
    
    **Response:**
    - `allowed`: Whether the student is within range
    - `distance`: Actual distance in meters
    - `message`: Human-readable status message
    """
    logger.info("Validating GPS proximity: radius=%sm", request.radius)
    
    result = gps_manager.validate_proximity(
        teacher_lat=request.teacher_lat,
        teacher_lon=request.teacher_lon,
        student_lat=request.student_lat,
        student_lon=request.student_lon,
        radius=request.radius
    )
    
    return {
        "success": True,
        "data": result,
        "message": result.get("message")
    }


# --- Bluetooth Proximity ---

@app.post("/bluetooth/register-beacon", tags=["Bluetooth"])
async def register_teacher_beacon(request: BeaconRegistrationRequest):
    """
    Register a BLE beacon for a specific attendance session.
    
    This endpoint is called by the teacher's device when starting
    a new session. It stores the beacon UUID and RSSI threshold
    for subsequent student verification.
    
    **Request Body:**
    - `session_id`: The MongoDB ID of the session
    - `beacon_uuid`: The UUID being broadcasted by the teacher
    - `rssi_threshold`: Cutoff for attendance (e.g., -65 dBm)
    - `teacher_lat`, `teacher_lon`: Teacher's current coordinates
    """
    logger.info("Registering beacon for session %s: UUID=%s", 
               request.session_id, request.beacon_uuid)
    
    result = register_beacon(
        session_id=request.session_id,
        beacon_uuid=request.beacon_uuid,
        rssi_threshold=request.rssi_threshold,
        teacher_lat=request.teacher_lat,
        teacher_lon=request.teacher_lon
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error"))
        
    return result


@app.post("/bluetooth/verify-proximity", response_model=BluetoothProximityResponse, tags=["Bluetooth"])
async def verify_bluetooth_proximity(request: BluetoothProximityRequest):
    """
    Standalone validation of student proximity using Bluetooth RSSI.
    
    The student's device scans for the teacher's beacon and sends
    multiple RSSI readings. This endpoint calculates the mode and
    compares it against the registered session threshold.
    
    **Request Body:**
    - `session_id`: The ID of the session
    - `beacon_uuid`: The UUID scanned by the student
    - `rssi_readings`: List of recent RSSI values (e.g., [-45, -48, -45])
    """
    beacon_info = get_beacon(request.session_id)
    
    if not beacon_info:
        # Instead of 404, return success=False so client can handle it gracefully
        return {
            "success": False,
            "data": None,
            "message": f"No active beacon found for session {request.session_id}. Please ask teacher to start beacon."
        }
    
    # Verify the UUID matches what the teacher registered
    if request.beacon_uuid.lower() != beacon_info["uuid"].lower():
        return {
            "success": False,
            "data": None,
            "message": "Beacon UUID mismatch. You are scanning the wrong device."
        }
    
    try:
        result = bluetooth_service.validate_proximity(
            rssi_readings=request.rssi_readings,
            threshold=beacon_info["threshold"]
        )
        return {
            "success": True,
            "data": result.to_dict(),
            "message": result.message
        }
    except ValueError as e:
        return {
            "success": False,
            "data": None,
            "message": str(e)
        }


# --- Face Verification ---

@app.post("/face/verify", tags=["Face Recognition"])
async def verify_face(
    selfie: UploadFile = File(..., description="Live selfie image"),
    id_card: UploadFile = File(..., description="User profile photo (legacy name for compatibility)"),
    preprocess: bool = Query(False, description="Document preprocessing (always disabled for profiles)")
):
    """
    Verify face match between live selfie and stored profile photo.
    
    **IMPORTANT:** This endpoint compares:
    - Live selfie (captured at runtime)
    - User profile photo (from database)
    
    Profile photos are NOT documents and should NEVER be preprocessed.
    Document preprocessing is disabled by default and forced off if detected.
    
    **Request:**
    - `selfie`: Live camera capture
    - `id_card`: User profile photo (field name kept for API compatibility)
    - `preprocess`: Ignored for profile images (always False)
    
    **Response:**
    - `success`: Whether verification completed
    - `verified`: Whether faces match
    - `confidence`: Match confidence percentage
    - `match_quality`: Human-readable quality rating
    - `distance`: Face embedding distance
    - `threshold`: Threshold used
    - `model`: DeepFace model name
    """
    selfie_path = None
    profile_image_path = None

    try:
        # Save selfie image
        selfie_path = save_upload_file(selfie, "selfie.jpg")
        
        # Save profile image (second image is always a user profile photo, never a document)
        profile_image_path = save_upload_file(id_card, "profile.jpg")
        
        # Force preprocessing OFF - profile photos must never be preprocessed
        preprocess = False
        
        logger.info(
            "Starting face verification: selfie=%s, profile=%s",
            selfie.filename,
            id_card.filename
        )

        # Perform face verification
        result = face_verifier.verify_identity(
            selfie_path=selfie_path,
            profile_image_path=profile_image_path,
            preprocess=preprocess
        )

        return result

    except Exception as e:
        logger.error("Face verification error: %s", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cleanup_files(selfie_path, profile_image_path)


# --- OCR Extraction ---

@app.post("/ocr/extract", tags=["OCR"])
async def extract_id_card(
    id_card: UploadFile = File(..., description="College student ID card image")
):
    """
    Extract text information from a college student ID card.
    
    This endpoint uses Groq LLaMA-4-Scout Vision API to analyze the ID card
    and extract structured data like student name and branch/department.
    
    **Extracted Fields:**
    - Student Name
    - Branch / Department
    
    **Response:**
    - `document_type`: "College ID Card"
    - `name`: Student's full name
    - `branch`: Branch/Department
    - `success`: Whether extraction succeeded
    
    **Requires:** `GROQ_API_KEY` in `.env` file
    """
    if not ocr_extractor.is_configured():
        raise HTTPException(
            status_code=503,
            detail="OCR service not configured. Please set GROQ_API_KEY in .env file."
        )
    
    id_card_path = None
    
    try:
        # Save uploaded file temporarily
        id_card_path = save_upload_file(id_card, "id_card_ocr.jpg")
        
        # Normalize path for Windows compatibility
        id_card_path = os.path.normpath(id_card_path)
        
        logger.info("Extracting text from ID card: %s (saved to: %s)", id_card.filename, id_card_path)
        
        # Verify file exists before OCR
        if not os.path.exists(id_card_path):
            raise HTTPException(status_code=500, detail=f"Failed to save uploaded file")
        
        # Perform OCR extraction
        result = ocr_extractor.extract_details(id_card_path)
        
        # Cleanup after successful extraction
        cleanup_files(id_card_path)
        
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions
        cleanup_files(id_card_path)
        raise
        
    except Exception as e:
        logger.error("OCR extraction error: %s", str(e))
        cleanup_files(id_card_path)
        raise HTTPException(status_code=500, detail=str(e))


# --- Main Attendance Verification (Complete Workflow) ---

@app.post("/attendance/verify", response_model=AttendanceVerifyResponse, tags=["Attendance"])
async def verify_attendance(
    teacher_lat: float = Form(..., description="Teacher's latitude"),
    teacher_lon: float = Form(..., description="Teacher's longitude"),
    student_lat: float = Form(..., description="Student's latitude"),
    student_lon: float = Form(..., description="Student's longitude"),
    radius: float = Form(default=50.0, description="Allowed radius in meters"),
    session_id: Optional[str] = Form(None, description="MongoDB session ID for Bluetooth check"),
    beacon_uuid: Optional[str] = Form(None, description="Scanned beacon UUID"),
    rssi_readings: Optional[str] = Form(None, description="JSON string of RSSI readings (e.g. '[-45, -48, -45]')"),
    live_image: UploadFile = File(..., description="Live selfie image"),
    profile_image: UploadFile = File(..., description="User profile photo")
):
    """
    🎯 **Main Attendance Verification Endpoint**
    
    Performs complete attendance verification in one request:
    
    1. **GPS Check** - Verifies student is within radius of teacher
       - If FAIL: Returns immediately without processing images
    
    2. **Face Verification** - Compares selfie with profile photo
       - Uses DeepFace VGG-Face model
       - Profile photos are NEVER preprocessed
    
    3. **OCR Extraction** - Extracts name/branch from the college ID
       - Requires Groq API key
       - Uses LLaMA-4-Scout Vision model
    
    4. **Cleanup** - Removes all temporary files
    
    5. **Response** - Returns comprehensive verification result
    
    ---
    
    **Form Data Required:**
    - `teacher_lat`, `teacher_lon`: Teacher's GPS coordinates
    - `student_lat`, `student_lon`: Student's GPS coordinates
    - `radius`: Maximum distance in meters (default: 50)
    - `session_id`: (Optional) The session being marked
    - `beacon_uuid`: (Optional) The scanned BLE UUID
    - `rssi_readings`: (Optional) JSON array of RSSI values
    
    **Files Required:**
    - `live_image`: Live selfie photo
    - `profile_image`: User profile photo from database
    
    ---
    
    **Response:**
    - `overall_verified`: Final pass/fail status
    - `gps_check`: GPS validation result
    - `face_verification`: Face match result
    - `ocr_extraction`: Extracted document data
    """
    timestamp = datetime.now().isoformat()
    live_image_path = None
    profile_image_path = None
    
    # Initialize response structure
    response = {
        "status": "processing",
        "timestamp": timestamp,
        "gps_check": {},
        "bluetooth_check": {"status": "skipped", "reason": "Not provided"},
        "face_verification": {},
        "ocr_extraction": {},
        "overall_verified": False
    }
    
    try:
        # ================================================================
        # STEP 1: GPS PROXIMITY CHECK (Fail-fast)
        # ================================================================
        logger.info("Step 1: GPS proximity check...")
        
        gps_result = gps_manager.validate_proximity(
            teacher_lat=teacher_lat,
            teacher_lon=teacher_lon,
            student_lat=student_lat,
            student_lon=student_lon,
            radius=radius
        )
        
        response["gps_check"] = gps_result
        
        # If GPS check fails, return immediately without processing images
        if not gps_result.get("allowed"):
            response["status"] = "failed"
            response["bluetooth_check"] = {"skipped": True, "reason": "GPS check failed"}
            response["face_verification"] = {"skipped": True, "reason": "GPS check failed"}
            response["ocr_extraction"] = {"skipped": True, "reason": "GPS check failed"}
            logger.warning("GPS check failed. Skipping further processing.")
            return response
        
        logger.info("GPS check passed. Distance: %sm", gps_result.get("distance"))
        
        # ================================================================
        # STEP 1.5: BLUETOOTH PROXIMITY CHECK (Optional/Dynamic)
        # ================================================================
        bluetooth_passed = True # Default if not used
        
        if session_id:
            beacon_info = get_beacon(session_id)
            if beacon_info and beacon_info.get("is_active"):
                logger.info("Step 1.5: Bluetooth proximity check required for session %s...", session_id)
                
                if not rssi_readings:
                    bluetooth_passed = False
                    response["bluetooth_check"] = {
                        "status": "failed", 
                        "reason": "Bluetooth verification required but RSSI readings not provided"
                    }
                else:
                    try:
                        # Parse RSSI readings if they come as a JSON string
                        readings = json.loads(rssi_readings) if isinstance(rssi_readings, str) else rssi_readings
                        
                        bt_result = bluetooth_service.validate_proximity(
                            rssi_readings=readings,
                            threshold=beacon_info.get("threshold", -65)
                        )
                        
                        response["bluetooth_check"] = bt_result.to_dict()
                        bluetooth_passed = bt_result.present
                        
                        if not bluetooth_passed:
                            logger.warning("Bluetooth proximity check failed: %s", bt_result.message)
                        else:
                            logger.info("Bluetooth check passed. Quality: %s", bt_result.signal_quality)
                            
                    except Exception as e:
                        logger.error("Error parsing/validating Bluetooth data: %s", str(e))
                        bluetooth_passed = False
                        response["bluetooth_check"] = {"status": "error", "reason": str(e)}
            else:
                response["bluetooth_check"] = {"status": "skipped", "reason": "No active beacon for session"}
        
        # If Bluetooth check was required and failed, fail-fast
        if not bluetooth_passed:
            response["status"] = "failed"
            response["face_verification"] = {"skipped": True, "reason": "Bluetooth check failed"}
            response["ocr_extraction"] = {"skipped": True, "reason": "Bluetooth check failed"}
            return response

        # ================================================================
        # STEP 2: FILE HANDLING - Save uploaded images
        # ================================================================
        logger.info("Step 2: Saving uploaded images...")
        
        live_image_path = save_upload_file(live_image, "selfie.jpg")
        profile_image_path = save_upload_file(profile_image, "profile.jpg")
        
        logger.info("Images saved: selfie=%s, profile=%s", 
                   live_image.filename, profile_image.filename)
        
        # ================================================================
        # STEP 3: FACE VERIFICATION
        # ================================================================
        logger.info("Step 3: Face verification...")
        
        face_result = face_verifier.verify_identity(
            selfie_path=live_image_path,
            profile_image_path=profile_image_path,
            preprocess=False  # Profile photos are never preprocessed
        )
        
        response["face_verification"] = face_result
        
        if not face_result.get("verified", False):
            logger.warning("Face verification failed: %s", 
                          face_result.get("error", "Faces don't match"))
        else:
            logger.info("Face verification passed. Distance: %s", 
                       face_result.get("distance"))
        
        # ================================================================
        # STEP 4: OCR EXTRACTION (Optional - requires actual ID card)
        # ================================================================
        logger.info("Step 4: OCR extraction (skipped for profile-based verification)...")
        
        # Note: In profile-based verification, we don't have an ID card image
        # OCR extraction is only available when using the full attendance/verify endpoint
        # with a separate ID card image
        response["ocr_extraction"] = {
            "skipped": True,
            "reason": "Profile-based verification does not include ID card"
        }
        logger.info("OCR extraction skipped (no ID card in profile verification)")
        
        # ================================================================
        # STEP 5: DETERMINE OVERALL STATUS
        # ================================================================
        gps_passed = gps_result.get("allowed", False)
        face_passed = face_result.get("verified", False)
        # bluetooth_passed is already calculated above
        
        if gps_passed and bluetooth_passed and face_passed:
            response["status"] = "verified"
            response["overall_verified"] = True
            logger.info("✅ Attendance verification PASSED")
        else:
            response["status"] = "failed"
            response["overall_verified"] = False
            logger.warning("❌ Attendance verification FAILED")
        
        return response
        
    except Exception as e:
        logger.error("Attendance verification error: %s", str(e))
        response["status"] = "error"
        response["error"] = str(e)
        return response
        
    finally:
        # ================================================================
        # STEP 6: CLEANUP - Remove temporary files
        # ================================================================
        logger.info("Step 6: Cleaning up temporary files...")
        cleanup_files(live_image_path, profile_image_path)


# --- Dummy Data Endpoints (For Testing) ---

@app.get("/dummy/teachers", tags=["Testing"])
async def get_dummy_teachers():
    """
    Get all dummy teacher data for testing.
    
    This endpoint is for development/testing purposes only.
    Will be replaced with MongoDB integration later.
    """
    return {"teachers": DUMMY_TEACHERS}


@app.get("/dummy/students", tags=["Testing"])
async def get_dummy_students():
    """
    Get all dummy student data for testing.
    
    This endpoint is for development/testing purposes only.
    Will be replaced with MongoDB integration later.
    """
    return {"students": DUMMY_STUDENTS}


@app.get("/dummy/ocr/{student_id}", tags=["Testing"])
async def get_dummy_ocr(student_id: str = "college_id_1"):
    """
    Get dummy OCR result for testing.
    
    Args:
        student_id: ID key ("college_id_1", "college_id_2", "college_id_3")
    
    This endpoint is for development/testing purposes only.
    Will be replaced with real OCR results later.
    """
    return get_dummy_ocr_result(student_id)


# ============================================================================
# Main Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment or default to 8000
    port = int(os.getenv("PORT", 8000))
    
    print("=" * 60)
    print("🚀 Starting Smart Attendance System")
    print("=" * 60)
    print(f"   Server:  http://localhost:{port}")
    print(f"   Docs:    http://localhost:{port}/docs")
    print(f"   ReDoc:   http://localhost:{port}/redoc")
    print("=" * 60)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )