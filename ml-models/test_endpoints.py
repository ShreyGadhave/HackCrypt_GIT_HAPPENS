import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_gps():
    print("\n--- Testing GPS Validation ---")
    url = f"{BASE_URL}/gps/validate"
    payload = {
        "teacher_lat": 19.0760,
        "teacher_lon": 72.8777,
        "student_lat": 19.0760,
        "student_lon": 72.8777,
        "radius": 50
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

def test_bluetooth():
    print("\n--- Testing Bluetooth Validation ---")
    url = f"{BASE_URL}/bluetooth/verify-proximity"
    # Note: This requires a valid session_id and registered beacon to pass, 
    # but we just want to see if the endpoint exists (i.e., not 404).
    # We'll send dummy data that might fail validation but should hit the endpoint.
    payload = {
        "session_id": "dummy_session_id",
        "student_id": "dummy_student_id",
        "beacon_uuid": "test-beacon-uuid",
        "rssi_readings": ["-55", "-60"]
    }
    try:
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_gps()
    test_bluetooth()
