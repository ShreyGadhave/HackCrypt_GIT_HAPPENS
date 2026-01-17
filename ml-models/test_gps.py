import requests
import json

url = "http://127.0.0.1:8000/gps/validate"
payload = {
    "teacher_lat": 19.0,
    "teacher_lon": 73.0,
    "student_lat": 19.0,
    "student_lon": 73.0,
    "radius": 50
}
headers = {
    "Content-Type": "application/json"
}

try:
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print("Response Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
