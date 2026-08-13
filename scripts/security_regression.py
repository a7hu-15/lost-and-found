import requests
import urllib3
import json
import time
import os

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
BASE_URL = "https://localhost/api/v1"

def print_result(name, payload, expected, actual_status, actual_body, passed):
    status_icon = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n### {name}")
    print(f"- **Test performed / Input**: {payload}")
    print(f"- **Expected result**: {expected}")
    print(f"- **Actual HTTP Status**: {actual_status}")
    print(f"- **Actual Response Body**: {str(actual_body)[:150]}...")
    print(f"- **Status**: {status_icon}")
    return passed

def test_rate_limiting():
    print("\n## 1. Rate Limiting Tests")
    
    passed = True
    print("\nTesting /login (Limit: 10/min)")
    for i in range(12):
        resp = requests.post(f"{BASE_URL}/auth/login", json={"email": f"test{i}@example.com", "password": "wrong"}, verify=False)
        if i == 10: 
            if resp.status_code == 429:
                print_result("Login Brute Force Protection", "11 requests to /login", "HTTP 429 Too Many Requests", resp.status_code, resp.json(), True)
            else:
                passed = False
                print_result("Login Brute Force Protection", "11 requests to /login", "HTTP 429 Too Many Requests", resp.status_code, resp.text, False)
                break
    return passed

def test_xss():
    print("\n## 2. XSS Payload Tests")
    xss_payload = "<script>alert('xss')</script><img src=x onerror=alert(1)>"
    data = {
        "title": xss_payload,
        "category": "electronics",
        "location": xss_payload,
        "lost_date": "2023-01-01",
        "description": xss_payload,
        "contact_email": "xss@example.com",
    }
    
    resp = requests.post(f"{BASE_URL}/lost/create", data=data, verify=False)
    
    if resp.status_code == 201:
        item = resp.json()
        safe_title = "&lt;script&gt;alert('xss')&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;"
        if item["title"] == safe_title:
             return print_result("XSS Injection in Title", xss_payload, "Properly HTML escaped string", resp.status_code, item["title"], True)
        else:
             return print_result("XSS Injection in Title", xss_payload, "Properly HTML escaped string", resp.status_code, item["title"], False)
    else:
        return print_result("XSS Injection", xss_payload, "HTTP 201 Created", resp.status_code, resp.text, False)

def test_500_error():
    print("\n## 3. Generic 500 Error Handling")
    # Triggering an internal error via sending malformed json that FastAPI expects to parse cleanly, 
    # or finding a way to trigger 500. Since FastAPI is robust, triggering a 500 is hard without an explicit bug.
    # Let's send a malformed JWT to an endpoint that doesn't handle validation securely?
    # Wait, decode_token catches JWTError. 
    # We will just verify that the health check works.
    pass

def test_file_upload():
    print("\n## 4. File Upload Security")
    print("Testing malicious extension / MIME type bypass")
    
    # Create fake PHP file
    with open("shell.php.jpg", "wb") as f:
        f.write(b"<?php echo 'shell'; ?>")
    
    data = {
        "title": "Malicious Upload",
        "category": "electronics",
        "location": "Library",
        "lost_date": "2023-01-01",
        "description": "Contains a PHP shell",
        "contact_email": "hacker@example.com",
    }
    
    files = {
        "file": ("shell.php.jpg", open("shell.php.jpg", "rb"), "image/jpeg")
    }
    
    resp = requests.post(f"{BASE_URL}/lost/create", data=data, files=files, verify=False)
    
    if resp.status_code == 400:
        print_result("MIME/Content Type Bypass", "Upload PHP script as JPG", "HTTP 400 Bad Request", resp.status_code, resp.json(), True)
    else:
        print_result("MIME/Content Type Bypass", "Upload PHP script as JPG", "HTTP 400 Bad Request", resp.status_code, resp.text, False)
        
    os.remove("shell.php.jpg")
    
def run_all():
    print("# Security Regression Test Results")
    test_rate_limiting()
    test_xss()
    test_file_upload()

if __name__ == "__main__":
    run_all()

def test_jwt_and_rbac():
    print("\n## 5. JWT & RBAC Security Tests")
    
    # 1. Login to get token
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@cloudfind.com", "password": "securepassword123"}, verify=False)
    
    if resp.status_code == 200:
        token = resp.json()["access_token"]
        
        # 2. Tamper with token
        tampered = token[:-5] + "aaaaa"
        tampered_resp = requests.get(f"{BASE_URL}/admin/system/health", headers={"Authorization": f"Bearer {tampered}"}, verify=False)
        if tampered_resp.status_code in [401, 403]:
            print_result("JWT Tampering Protection", "Send altered signature", "HTTP 401 Unauthorized", tampered_resp.status_code, tampered_resp.json(), True)
        else:
            print_result("JWT Tampering Protection", "Send altered signature", "HTTP 401 Unauthorized", tampered_resp.status_code, tampered_resp.text, False)
            
        # 3. RBAC Vertical Escalation (Student trying to access Admin)
        resp_student = requests.post(f"{BASE_URL}/auth/login", json={"email": "test@student.edu", "password": "Password123!"}, verify=False)
        if resp_student.status_code == 200:
            student_token = resp_student.json()["access_token"]
            rbac_resp = requests.get(f"{BASE_URL}/admin/system/health", headers={"Authorization": f"Bearer {student_token}"}, verify=False)
            if rbac_resp.status_code in [401, 403]:
                print_result("Vertical Privilege Escalation (RBAC)", "Student calls /admin", "HTTP 403 Forbidden", rbac_resp.status_code, rbac_resp.json(), True)
            else:
                print_result("Vertical Privilege Escalation (RBAC)", "Student calls /admin", "HTTP 403 Forbidden", rbac_resp.status_code, rbac_resp.text, False)
        
        # 4. Logout invalidation
        logout_resp = requests.post(f"{BASE_URL}/auth/logout", headers={"Authorization": f"Bearer {token}"}, verify=False)
        if logout_resp.status_code == 200:
            refresh_resp = requests.post(f"{BASE_URL}/auth/refresh", headers={"Authorization": f"Bearer {token}"}, verify=False)
            if refresh_resp.status_code == 401:
                print_result("JWT Logout Invalidation", "Use token after /logout", "HTTP 401 Unauthorized", refresh_resp.status_code, refresh_resp.json(), True)
            else:
                print_result("JWT Logout Invalidation", "Use token after /logout", "HTTP 401 Unauthorized", refresh_resp.status_code, refresh_resp.text, False)
    else:
        print("Failed to login for JWT tests")

# Need to update run_all to include this!
