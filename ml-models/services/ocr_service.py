"""
OCR Service Module
===================
Handles college ID card text extraction using Groq LLaMA-4-Scout Vision API.

This module provides:
- Groq API configuration and initialization
- College ID card OCR for extracting student name and branch
- Structured JSON output with parsed document fields
"""

import os
import base64
import json
import re
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Configure module-level logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Try to import Groq SDK
try:
    from groq import Groq
    GROQ_AVAILABLE = True
    logger.info("✅ Groq SDK loaded successfully")
except ImportError as e:
    GROQ_AVAILABLE = False
    logger.warning("⚠️ Groq SDK not available: %s", str(e))


class IDCardExtractor:
    """
    Extracts text information from college student ID cards using Groq LLaMA-4-Scout.
    
    This class provides methods to:
    1. Initialize and configure the Groq API
    2. Extract structured data from student ID cards
    3. Parse and validate the extracted information
    
    Extracted Fields:
    - Student Name
    - Branch / Department
    
    Attributes:
        model_name (str): The LLaMA model to use for vision tasks
        api_key (str): Groq API key for authentication
        client: The initialized Groq client instance
    """
    
    # OCR prompt for college ID card extraction
    DEFAULT_PROMPT = """
You are given an image of a college student ID card.

Task:
- Extract the student's full name
- Extract the branch / department

Rules:
- Ignore background text
- Ignore addresses, dates, phone numbers, fees, receipts
- Focus ONLY on identity information
- If a field is missing, return null

Return ONLY valid JSON in this exact format:
{
  "name": "...",
  "branch": "..."
}
"""
    
    def __init__(self, api_key: Optional[str] = None, model_name: str = "meta-llama/llama-4-scout-17b-16e-instruct"):
        """
        Initialize the IDCardExtractor with Groq API.
        
        Args:
            api_key: Groq API key (if None, reads from GROQ_API_KEY env var)
            model_name: LLaMA model name for vision tasks
        
        Raises:
            ValueError: If no API key is provided or found in environment
        """
        self.model_name = model_name
        self.client = None
        self.api_configured = False
        
        # Get API key from argument or environment
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        
        if not GROQ_AVAILABLE:
            logger.warning("Groq SDK not installed. OCR will not work.")
            return
        
        if not self.api_key:
            logger.warning("GROQ_API_KEY not found. OCR functionality will be limited.")
            return
        
        # Configure the Groq client
        try:
            self.client = Groq(api_key=self.api_key)
            self.api_configured = True
            logger.info("✅ Groq API configured successfully with model: %s", model_name)
        except Exception as e:
            logger.error("❌ Failed to configure Groq API: %s", str(e))
    
    @staticmethod
    def image_to_base64(image_path: str) -> str:
        """
        Converts an image file to base64 encoded string.
        
        Args:
            image_path: Path to the image file
        
        Returns:
            str: Base64 encoded image string
        """
        with open(image_path, "rb") as img:
            return base64.b64encode(img.read()).decode("utf-8")
    
    @staticmethod
    def safe_json_parse(text: str) -> Dict[str, Any]:
        """
        Safely extracts the first JSON object from LLM output.
        
        This handles cases where the model includes extra text
        before or after the JSON object.
        
        Args:
            text: Raw text output from the model
        
        Returns:
            dict: Parsed JSON object
        
        Raises:
            ValueError: If no valid JSON object is found
        """
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError(f"No JSON object found in model output:\n{text}")
        return json.loads(match.group())
    
    def extract_details(self, image_path: str, custom_prompt: Optional[str] = None) -> Dict[str, Any]:
        """
        Extracts text details from a college ID card image using Groq LLaMA-4-Scout.
        
        This method:
        1. Opens and validates the image file
        2. Converts image to base64
        3. Sends the image to LLaMA-4-Scout with an OCR prompt
        4. Parses the response as JSON
        5. Returns structured document data
        
        Args:
            image_path: Path to the ID card image file
            custom_prompt: Optional custom prompt to override the default
        
        Returns:
            dict: Extracted document data containing:
                - name (str): Student's full name
                - branch (str): Branch/Department
                - success (bool): Whether extraction succeeded
                - error (str|None): Error message if extraction failed
        
        Example:
            >>> extractor = IDCardExtractor()
            >>> result = extractor.extract_details("student_id.jpg")
            >>> print(result)
            {'name': 'Rahul Kumar', 'branch': 'Computer Science', 'success': True}
        """
        # Check if API is configured
        if not self.api_configured:
            return {
                "success": False,
                "error": "Groq API is not configured. Please set GROQ_API_KEY in .env file."
            }
        
        # Validate image file exists
        if not os.path.exists(image_path):
            return {
                "success": False,
                "error": f"Image file not found: {image_path}"
            }
        
        try:
            logger.info("Extracting text from: %s", os.path.basename(image_path))
            
            # Convert image to base64
            image_b64 = self.image_to_base64(image_path)
            
            # Use custom prompt or default
            prompt = custom_prompt or self.DEFAULT_PROMPT
            
            # Call Groq API with LLaMA-4-Scout vision model
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_b64}"
                                }
                            }
                        ]
                    }
                ],
                temperature=0,
                max_tokens=300
            )
            
            # Get raw output from model
            raw_output = response.choices[0].message.content
            logger.debug("Raw model output: %s", raw_output)
            
            # Safely parse JSON from output
            extracted_data = self.safe_json_parse(raw_output)
            
            # Add success flag and document type
            extracted_data["success"] = True
            extracted_data["document_type"] = "College ID Card"
            extracted_data["error"] = None
            
            logger.info("✅ Successfully extracted: Name=%s, Branch=%s", 
                       extracted_data.get("name"), extracted_data.get("branch"))
            return extracted_data
            
        except json.JSONDecodeError as e:
            logger.error("Failed to parse JSON response: %s", str(e))
            return {
                "success": False,
                "error": f"Failed to parse extracted data: {str(e)}",
                "raw_response": raw_output if 'raw_output' in locals() else None
            }
            
        except ValueError as e:
            logger.error("JSON extraction error: %s", str(e))
            return {
                "success": False,
                "error": str(e)
            }
            
        except Exception as e:
            logger.error("Error during document extraction: %s", str(e))
            return {
                "success": False,
                "error": f"Extraction failed: {str(e)}"
            }
    
    def extract_name_only(self, image_path: str) -> Optional[str]:
        """
        Quickly extracts just the name from a college ID card.
        
        Args:
            image_path: Path to the ID card image
        
        Returns:
            str: The extracted name, or None if extraction failed
        """
        prompt = """
Look at this college student ID card image.
Extract ONLY the student's full name.
Return just the name, nothing else. No JSON, no explanation.
"""
        
        if not self.api_configured:
            return None
        
        try:
            image_b64 = self.image_to_base64(image_path)
            
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": prompt},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_b64}"
                                }
                            }
                        ]
                    }
                ],
                temperature=0,
                max_tokens=100
            )
            
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error("Error extracting name: %s", str(e))
            return None
    
    def is_configured(self) -> bool:
        """
        Checks if the OCR service is properly configured.
        
        Returns:
            bool: True if API is configured and ready
        """
        return self.api_configured


# Dummy OCR results for testing (will be replaced with actual OCR later)
DUMMY_OCR_RESULTS = {
    "college_id_1": {
        "document_type": "College ID Card",
        "name": "Rahul Kumar",
        "branch": "Computer Science",
        "success": True
    },
    "college_id_2": {
        "document_type": "College ID Card",
        "name": "Priya Singh",
        "branch": "Electronics Engineering",
        "success": True
    },
    "college_id_3": {
        "document_type": "College ID Card",
        "name": "Amit Sharma",
        "branch": "Mechanical Engineering",
        "success": True
    }
}


def get_dummy_ocr_result(student_id: str = "college_id_1") -> Dict[str, Any]:
    """
    Returns dummy OCR result for testing.
    
    Args:
        student_id: ID key for dummy data ("college_id_1", "college_id_2", "college_id_3")
    
    Returns:
        dict: Dummy OCR result data
    """
    return DUMMY_OCR_RESULTS.get(student_id, DUMMY_OCR_RESULTS["college_id_1"])


# Module test
if __name__ == "__main__":
    print("--- OCR Service Module Test ---\n")
    
    extractor = IDCardExtractor()
    
    print(f"Groq SDK available: {GROQ_AVAILABLE}")
    print(f"API configured: {extractor.is_configured()}")
    print(f"Model: {extractor.model_name}")
    
    print("\n--- Dummy OCR Results ---")
    for student_id in ["college_id_1", "college_id_2", "college_id_3"]:
        result = get_dummy_ocr_result(student_id)
        print(f"\n{student_id}:")
        print(json.dumps(result, indent=2))
    
    if extractor.is_configured():
        print("\nTo test real OCR, run:")
        print('  result = extractor.extract_details("student_id_card.jpg")')
    else:
        print("\n⚠️ Set GROQ_API_KEY in .env to enable real OCR functionality")
