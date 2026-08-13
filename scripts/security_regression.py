import requests
import urllib3
import json
import time
import os

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
BASE_URL = "http://localhost:8000/api/v1"

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
        safe_title = "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;&lt;img src=x onerror=alert(1)&gt;"
        if item["title"] == safe_title:
             return print_result("XSS Injection in Title", xss_payload, "Properly HTML escaped string", resp.status_code, item["title"], True)
        else:
             return print_result("XSS Injection in Title", xss_payload, "Properly HTML escaped string", resp.status_code, item["title"], False)
    else:
        return print_result("XSS Injection", xss_payload, "HTTP 201 Created", resp.status_code, resp.text, False)

def test_500_error():
    print("\n## 3. Generic Error Handling (Leakage Check)")
    # Send malformed JSON to trigger 422 or send bad auth header
    # Ensure stack trace is not leaked
    resp = requests.post(f"{BASE_URL}/auth/login", data="this is not json", headers={"Content-Type": "application/json"}, verify=False)
    
    if "Traceback" not in resp.text and "Exception" not in resp.text:
        return print_result("Error Leakage Protection", "Malformed JSON payload", "No stack trace in response", resp.status_code, resp.text, True)
    else:
        return print_result("Error Leakage Protection", "Malformed JSON payload", "No stack trace in response", resp.status_code, resp.text, False)

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
        passed = print_result("MIME/Content Type Bypass", "Upload PHP script as JPG", "HTTP 400 Bad Request", resp.status_code, resp.json(), True)
    else:
        passed = print_result("MIME/Content Type Bypass", "Upload PHP script as JPG", "HTTP 400 Bad Request", resp.status_code, resp.text, False)
        
    os.remove("shell.php.jpg")
    return passed
    
def test_jwt_and_rbac():
    print("\n## 5. JWT & RBAC Security Tests")
    
    # 1. Login to get token
    resp = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@cloudfind.com", "password": "securepassword123"}, verify=False)
    
    passed = True
    if resp.status_code == 200:
        token = resp.json()["access_token"]
        
        # 2. Tamper with token
        tampered = token[:-5] + "aaaaa"
        tampered_resp = requests.get(f"{BASE_URL}/admin/stats", headers={"Authorization": f"Bearer {tampered}"}, verify=False)
        if tampered_resp.status_code in [401, 403]:
            print_result("JWT Tampering Protection", "Send altered signature", "HTTP 401 Unauthorized", tampered_resp.status_code, tampered_resp.json(), True)
        else:
            passed = print_result("JWT Tampering Protection", "Send altered signature", "HTTP 401 Unauthorized", tampered_resp.status_code, tampered_resp.text, False)
            
        # 3. RBAC Vertical Escalation (Student trying to access Admin)
        resp_student_login = requests.post(f"{BASE_URL}/auth/login", json={"email": "test@student.edu", "password": "Password123!"}, verify=False)
        if resp_student_login.status_code == 200:
            student_token = resp_student_login.json()["access_token"]
            resp_student = requests.get(f"{BASE_URL}/admin/stats", headers={"Authorization": f"Bearer {student_token}"}, verify=False)
            if resp_student.status_code in [401, 403]:
                print_result("Vertical Privilege Escalation (RBAC)", "Student calls /admin", "HTTP 403 Forbidden", resp_student.status_code, resp_student.json(), True)
            else:
                passed = print_result("Vertical Privilege Escalation (RBAC)", "Student calls /admin", "HTTP 403 Forbidden", resp_student.status_code, resp_student.text, False)
        else:
            print("Failed to login as student for RBAC test")
            passed = False
        
    else:
        print("Failed to login for JWT tests (Admin account missing?)")
        passed = False
    return passed

def run_all():
    print("# Security Regression Test Results")
    results = []
    results.append(test_jwt_and_rbac())
    results.append(test_xss())
    results.append(test_500_error())
    results.append(test_file_upload())
    results.append(test_rate_limiting())
    
    if all(results):
        print("\n🎉 ALL SECURITY REGRESSION TESTS PASSED.")
        import sys
        sys.exit(0)
    else:
        print("\n❌ SOME SECURITY TESTS FAILED.")
        import sys
        sys.exit(1)

if __name__ == "__main__":
    run_all()

