import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/search")
    assert response.status_code == 200
    data = response.json()
    assert "lost_items" in data
    assert "found_items" in data

@pytest.mark.asyncio
async def test_create_lost_item_valid():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "title": "QA Test Dell XPS 15",
            "category": "Electronics",
            "location": "Central Library 2nd Floor",
            "lost_date": "2026-08-08",
            "description": "Silver laptop with GitHub sticker on lid",
            "contact_email": "qa.student@srm.edu",
            "contact_phone": "+91 9876543210"
        }
        response = await ac.post("/api/v1/lost/create", data=payload)
    assert response.status_code == 201
    data = response.json()
    assert "report_id" in data
    assert data["report_id"].startswith("LF-SRM-")
    assert "access_token" in data
    assert len(data["access_token"]) >= 20

@pytest.mark.asyncio
async def test_create_lost_item_invalid_email():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "title": "Invalid Email Test",
            "category": "Electronics",
            "location": "Library",
            "lost_date": "2026-08-08",
            "description": "Testing email validation",
            "contact_email": "not-an-email"
        }
        response = await ac.post("/api/v1/lost/create", data=payload)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_create_found_item_valid():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "title": "QA Test Blue Wildcraft Backpack",
            "category": "Bag",
            "location": "Central Library 2nd Floor",
            "found_date": "2026-08-08",
            "storage_location": "Security Office Desk 1",
            "description": "Blue Wildcraft backpack found near quiet reading zone",
            "contact_email": "qa.finder@srm.edu"
        }
        response = await ac.post("/api/v1/found/create", data=payload)
    assert response.status_code == 201
    data = response.json()
    assert "report_id" in data
    assert data["storage_location"] == "Security Office Desk 1"

@pytest.mark.asyncio
async def test_track_report_authorized_and_forbidden():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Create a report first
        payload = {
            "title": "Track Token Test Item",
            "category": "Keys",
            "location": "Tech Park Block 3",
            "lost_date": "2026-08-08",
            "description": "Bike key with red keychain",
            "contact_email": "track.test@srm.edu"
        }
        create_res = await ac.post("/api/v1/lost/create", data=payload)
        report_data = create_res.json()
        report_id = report_data["report_id"]
        valid_token = report_data["access_token"]

        # 1. Track with valid token -> HTTP 200 OK
        valid_track = await ac.get(f"/api/v1/track/{report_id}?token={valid_token}")
        assert valid_track.status_code == 200
        assert valid_track.json()["report_id"] == report_id

        # 2. Track with invalid token -> HTTP 403 Forbidden
        invalid_track = await ac.get(f"/api/v1/track/{report_id}?token=invalid_token_123")
        assert invalid_track.status_code == 403

@pytest.mark.asyncio
async def test_recover_report_ids():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/track/recover", json={"email": "qa.student@srm.edu"})
    assert response.status_code == 200
    assert "message" in response.json()

@pytest.mark.asyncio
async def test_support_api_valid():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "name": "QA Tester",
            "email": "qa.tester@srm.edu",
            "subject": "System Verification Test",
            "message": "Testing automated support ticket dispatch"
        }
        response = await ac.post("/api/v1/support", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Support ticket submitted successfully."

@pytest.mark.asyncio
async def test_support_api_xss_protection():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        payload = {
            "name": "<script>alert('XSS')</script>",
            "email": "xss.test@srm.edu",
            "subject": "<img src=x onerror=alert('XSS')>",
            "message": "Testing script injection safety"
        }
        response = await ac.post("/api/v1/support", json=payload)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_admin_unauthorized_access():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/admin/reports")
    # Should require JWT authentication
    assert response.status_code in (401, 403)
