import pytest
import asyncio
import io
import os
from datetime import date, timedelta
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, MagicMock

from app.main import app
from app.database.session import AsyncSessionLocal
from app.models.found_item import FoundItem
from app.models.lost_item import LostItem, ItemStatus
from app.models.match import MatchScore
from sqlalchemy import select, delete

@pytest.fixture(autouse=True)
async def cleanup():
    # Cleanup any items created during tests
    yield
    async with AsyncSessionLocal() as db:
        await db.execute(delete(MatchScore))
        await db.execute(delete(FoundItem).where(FoundItem.contact_email.like("%test%@srm.edu%")))
        await db.execute(delete(LostItem).where(LostItem.contact_email.like("%test%@srm.edu%")))
        await db.commit()

@pytest.mark.asyncio
async def test_found_item_form_validation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Missing required field (title)
        payload = {
            "category": "Electronics",
            "location": "Library",
            "found_date": str(date.today()),
            "description": "Found a laptop",
            "contact_email": "test.valid@srm.edu"
        }
        res = await ac.post("/api/v1/found/create", data=payload)
        assert res.status_code == 422
        
        # 2. Future date
        payload["title"] = "Laptop"
        payload["found_date"] = str(date.today() + timedelta(days=1))
        res = await ac.post("/api/v1/found/create", data=payload)
        assert res.status_code == 400
        assert "future" in res.json()["detail"].lower()
        
        # 3. Title too long
        payload["found_date"] = str(date.today())
        payload["title"] = "A" * 101
        res = await ac.post("/api/v1/found/create", data=payload)
        assert res.status_code == 400
        assert "exceed 100" in res.json()["detail"]
        
        # 4. Invalid Indian phone number
        payload["title"] = "Laptop"
        payload["contact_phone"] = "12345"
        res = await ac.post("/api/v1/found/create", data=payload)
        assert res.status_code == 400
        assert "valid indian mobile number" in res.json()["detail"].lower()

@pytest.mark.asyncio
async def test_found_item_image_handling():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "title": "Phone",
            "category": "Electronics",
            "location": "Cafeteria",
            "found_date": str(date.today()),
            "description": "Found a phone",
            "contact_email": "test.image@srm.edu"
        }
        
        # 1. Valid image
        fixture_path = os.path.join(os.path.dirname(__file__), "..", "..", "fixtures", "test_item.jpg")
        with open(fixture_path, "rb") as f:
            files = {"file": ("test_item.jpg", f, "image/jpeg")}
            res = await ac.post("/api/v1/found/create", data=payload, files=files)
        assert res.status_code == 201
        assert res.json()["image_url"] is not None
        assert res.json()["thumbnail_url"] is not None

        # 2. Unsupported file type (txt)
        payload["contact_email"] = "test.image2@srm.edu"
        txt_file = io.BytesIO(b"Hello world")
        files = {"file": ("test.txt", txt_file, "text/plain")}
        res = await ac.post("/api/v1/found/create", data=payload, files=files)
        assert res.status_code == 400
        assert "invalid image format" in res.json()["detail"].lower()
        
        # 3. Oversized file (mock read)
        payload["contact_email"] = "test.image3@srm.edu"
        large_file = io.BytesIO(b"0" * (11 * 1024 * 1024)) # 11MB
        files = {"file": ("large.jpg", large_file, "image/jpeg")}
        res = await ac.post("/api/v1/found/create", data=payload, files=files)
        assert res.status_code == 400
        assert "size exceeds 10 mb" in res.json()["detail"].lower()
        
        # 4. Corrupted/Malicious image
        payload["contact_email"] = "test.image4@srm.edu"
        corrupted = io.BytesIO(b"This is not a real image but has a jpg extension")
        files = {"file": ("corrupt.jpg", corrupted, "image/jpeg")}
        res = await ac.post("/api/v1/found/create", data=payload, files=files)
        assert res.status_code == 400
        assert "failed to process image" in res.json()["detail"].lower()

@pytest.mark.asyncio
async def test_found_item_creation_and_tracking():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "title": "Blue Umbrella",
            "category": "Accessories",
            "location": "Main Gate",
            "found_date": str(date.today()),
            "description": "Found a blue umbrella",
            "contact_email": "test.track@srm.edu"
        }
        
        # Creation
        res = await ac.post("/api/v1/found/create", data=payload)
        assert res.status_code == 201
        data = res.json()
        report_id = data["report_id"]
        access_token = data["access_token"]
        
        # Tracking
        res_track = await ac.get(f"/api/v1/found/{report_id}")
        assert res_track.status_code == 200
        assert res_track.json()["status"] == "REPORTED"
        assert res_track.json()["title"] == "Blue Umbrella"
        
        # Tracking invalid ID
        res_invalid = await ac.get("/api/v1/found/INVALID123")
        assert res_invalid.status_code == 404

@pytest.mark.asyncio
async def test_found_item_matching_scenarios():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create a LOST item first
        async with AsyncSessionLocal() as db:
            lost = LostItem(
                report_id="LOST-111",
                access_token="tok1",
                title="MacBook Air M2",
                category="Electronics",
                brand="Apple",
                color="Silver",
                location="Tech Park",
                lost_date=date.today() - timedelta(days=2),
                description="Lost my macbook",
                contact_email="test.loser@srm.edu",
                status=ItemStatus.REPORTED
            )
            db.add(lost)
            await db.commit()
            
        # 1. High match candidate
        payload_match = {
            "title": "MacBook Air M2",
            "category": "Electronics",
            "brand": "Apple",
            "color": "Silver",
            "location": "Tech Park",
            "found_date": str(date.today()),
            "description": "Found a macbook air",
            "contact_email": "test.finder1@srm.edu"
        }
        with patch("app.api.v1.found_items.send_report_confirmation_email"):
            with patch("app.api.v1.found_items.calculate_item_similarity", return_value=(95.0, {})):
                res = await ac.post("/api/v1/found/create", data=payload_match)
                assert res.status_code == 201
                found_data = res.json()
            
        # Verify match created
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(MatchScore).where(MatchScore.found_item_id == found_data["id"], MatchScore.lost_item_id == lost.id))
            match = result.scalar_one_or_none()
            assert match is not None
            assert match.similarity_score >= 80.0
            
            # Verify status updated
            found_db = await db.execute(select(FoundItem).where(FoundItem.id == found_data["id"]))
            assert found_db.scalar_one().status == ItemStatus.MATCHED
            
            lost_db = await db.execute(select(LostItem).where(LostItem.id == lost.id))
            assert lost_db.scalar_one().status == ItemStatus.REPORTED # Backend keeps lost item as REPORTED for auto-matches

        # 2. Low match candidate (completely different category)
        payload_no_match = {
            "title": "Black Wallet",
            "category": "Accessories",
            "location": "Library",
            "found_date": str(date.today()),
            "description": "Found a wallet",
            "contact_email": "test.finder2@srm.edu"
        }
        with patch("app.api.v1.found_items.send_report_confirmation_email"):
            with patch("app.api.v1.found_items.calculate_item_similarity", return_value=(20.0, {})):
                res2 = await ac.post("/api/v1/found/create", data=payload_no_match)
                assert res2.status_code == 201
                found2_data = res2.json()
            
        async with AsyncSessionLocal() as db:
            result = await db.execute(select(MatchScore).where(MatchScore.found_item_id == found2_data["id"]))
            match2 = result.scalar_one_or_none()
            assert match2 is None # No match formed

@pytest.mark.asyncio
async def test_found_item_email_privacy(mock_send_email):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "title": "Keys",
            "category": "Accessories",
            "location": "Library",
            "found_date": str(date.today()),
            "description": "Car keys",
            "contact_email": "test.privacy@srm.edu"
        }
        res = await ac.post("/api/v1/found/create", data=payload)
        assert res.status_code == 201
        
        # Verify exactly one email was sent (Confirmation to test.privacy@srm.edu)
        assert mock_send_email.call_count == 1
        args, kwargs = mock_send_email.call_args
        to_email = kwargs.get("to_email") if "to_email" in kwargs else args[0]
        subject = kwargs.get("subject") if "subject" in kwargs else args[1]
        
        assert to_email == "test.privacy@srm.edu"
        assert "Confirmation" in subject or "Found" in subject

@pytest.mark.asyncio
async def test_found_item_duplicate_submission():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "title": "Water Bottle",
            "category": "Accessories",
            "location": "Gym",
            "found_date": str(date.today()),
            "description": "Milton water bottle",
            "contact_email": "test.duplicate@srm.edu"
        }
        
        # Rapid double-click simulation
        res1 = await ac.post("/api/v1/found/create", data=payload)
        res2 = await ac.post("/api/v1/found/create", data=payload)
        
        # Exactly one should succeed, the other should be a 409 Conflict
        statuses = [res1.status_code, res2.status_code]
        assert 201 in statuses
        assert (409 in statuses or 429 in statuses), f"Expected one duplicate rejection, got {statuses}"

@pytest.mark.asyncio
async def test_found_item_security_payloads():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. XSS in title
        payload_xss = {
            "title": "<script>alert('XSS')</script>",
            "category": "Accessories",
            "location": "Gym",
            "found_date": str(date.today()),
            "description": "Milton water bottle",
            "contact_email": "test.xss@srm.edu"
        }
        # The backend might accept it but we should check that the API doesn't crash 
        res = await ac.post("/api/v1/found/create", data=payload_xss)
        assert res.status_code == 201
        
        # 2. Oversized payload data (simulating DOS on text)
        payload_dos = payload_xss.copy()
        # Create a giant string to trip the max length (we'll implement 2000 chars limit)
        payload_dos["description"] = "A" * 3000
        res_dos = await ac.post("/api/v1/found/create", data=payload_dos)
        assert res_dos.status_code == 400

@pytest.mark.asyncio
async def test_found_item_failure_recovery():
    # Use raise_app_exceptions=False to let FastAPI return the 500 cleanly
    async with AsyncClient(transport=ASGITransport(app=app, raise_app_exceptions=False), base_url="http://test") as ac:
        payload = {
            "title": "Failing item",
            "category": "Accessories",
            "location": "Gym",
            "found_date": str(date.today()),
            "description": "Milton water bottle",
            "contact_email": "test.fail@srm.edu"
        }
        
        # 1. DB Commit failure
        with patch("sqlalchemy.ext.asyncio.AsyncSession.commit", side_effect=Exception("DB Failure")):
            res = await ac.post("/api/v1/found/create", data=payload)
            assert res.status_code == 500
            
        # 2. Email failure after DB commit
        with patch("app.notifications.service.send_email", side_effect=ConnectionRefusedError("SMTP down")):
            payload["contact_email"] = "test.fail2@srm.edu"
            res = await ac.post("/api/v1/found/create", data=payload)
            # Item is created, but email fails. In a robust system, this returns 201 or 500 depending on sync/async email.
            # But the requirement says: "User receives a sensible error rather than a stack trace".
            # If email fails, the app usually returns 201 but logs the error, or returns 500 but it's handled. 
            assert res.status_code in [201, 500]
            if res.status_code == 500:
                assert "internal server error" in res.text.lower() or "email" in res.text.lower()
