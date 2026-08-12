import asyncio
import httpx
import sys

BASE_URL = "https://127.0.0.1:4444/api/v1"

async def create_record():
    async with httpx.AsyncClient(verify=False) as client:
        # Create a report
        data = {
            "title": "K8s Persistence Test Item",
            "description": "This is to test DB and MinIO persistence across pod restarts",
            "location": "Kubernetes Cluster",
            "category": "Electronics",
            "lost_date": "2026-08-12",
            "contact_email": "test@kubernetes.local",
        }
        headers = {"Host": "cloudfind.local"}
        files = {'file': ('test.png', b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82', 'image/png')}
        resp = await client.post(f"{BASE_URL}/lost/create", data=data, files=files, headers=headers)
        if resp.status_code != 201:
            print("Failed to create report:", resp.text)
            return None
        
        report = resp.json()
        report_id = report['id']
        print(f"Created report {report_id} with image")
        
        return report_id

async def verify_record(report_id):
    async with httpx.AsyncClient(verify=False) as client:
        headers = {"Host": "cloudfind.local"}
        resp = await client.get(f"{BASE_URL}/lost/{report_id}", headers=headers)
        if resp.status_code == 200:
            report = resp.json()
            print(f"Verified report {report_id} exists. Title: {report['title']}")
            if report.get("images"):
                image_url = report["images"][0]["image_url"]
                # In Minikube we might need to replace cloudfind-minio with the localhost or minikube ip if accessing externally, 
                # but the API returns the public URL. In this setup, S3_ENDPOINT is internal to K8s.
                print(f"Image URL: {image_url}")
                return True
        else:
            print(f"Report {report_id} not found!")
            return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        asyncio.run(verify_record(sys.argv[2]))
    else:
        report_id = asyncio.run(create_record())
        with open("test_report_id.txt", "w") as f:
            f.write(str(report_id))
